<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_CONTEXT } from '@/api/config'
import { FlowOperationController } from '@/api/flow'
import { PickDemandController, PickResourceApplyController } from '@/api/generated'
import { SelectionTableController } from '@/api/selection'
import { post } from '@/common/http/request'
import { appBack } from '@/common/utils'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import CommonApproval from '@/views/pages/components/common/common-approval.vue'
import DataCompletionDetail from './dataCompletionDetail.vue'
import 'vant/es/toast/style'

const submitLoading = ref(false)
const router = useRouter()
const route = useRoute()
const processInstanceId = computed(() => route.query.processInstanceId as string)
const taskId = computed(() => route.query.taskId as string)
const flowEntryName = computed(() => route.meta.commonTitle as string)
const taskName = computed(() => route.query.taskName as string)
const processDefinitionKey = computed(() => route.query.processDefinitionKey as string || 'ResourceApply')
const isInfo = computed(() => route.query.isInfo === 'true')

const flowTaskCommentList = ref<ANY_OBJECT[]>([])

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)

// 存储从 queryDemand 获取的 noticeId
const noticeId = ref<number>(0)

// 存储从 queryDemand 获取的标包信息（包含合作伙伴列表）
const bidPackagesFromDemand = ref<ANY_OBJECT[]>([])

// 存储是否为分割的 demandNumber
const isSplitDemandNumber = ref<boolean>(false)

// 决策会议记录文件列表
const decisionDocFileList = ref<any[]>([])

// 合同/价格审批文件列表
const contractPriceReviewFileList = ref<any[]>([])
// 公告信息
const noticeData = reactive<ANY_OBJECT>({
  id: undefined,
  noticeNumber: '',
  noticeTitle: '',
})

// 标包列表
const bidPackageList = ref<ANY_OBJECT[]>([])
// 不划分标包时的合作伙伴列表
const noBidPackagePartners = ref<ANY_OBJECT[]>([])

// 甄选结果表单数据（不划分标包时使用）
const resultFormData = reactive<ANY_OBJECT>({
  bidPackageId: undefined, // 标包id
  noticeId: undefined, // 公告id
  pickResult: '', // 甄选结果;1.成功0失败
  auditStartTime: '', // 评审开始日期
  auditEndTime: '', // 评审结束日期
  // 失败时的字段
  failedReason: '', // 失败原因
  // 成功时的字段
  bidPartnerId: undefined, // 中标合作伙伴id
  bidPartnerName: '', // 中标合作伙伴名称
  score: undefined, // 得分
  quotePriceTax: undefined, // 报价含税（万元）
  quotePrice: undefined, // 报价不含税（万元）
  auditReports: undefined as string | undefined, // 评审报告
})

// 加载甄选评审失败信息（用于分割的 demandNumber）
async function loadBidResultData(demandNumber: string, noticeId: number) {
  try {
    const res = await PickDemandController.queryBidResult({
      demandNumber,
      noticeId,
      successFlag: 0, // 写死为0，查询失败的信息
    })

    if (res.data) {
      // 填充甄选评审失败信息
      if (res.data.pickBidPackages && Array.isArray(res.data.pickBidPackages)) {
        // 合并 queryBidResult 的数据和 queryDemand 的合作伙伴列表
        const resultPackages = res.data.pickBidPackages.map((resultPkg: ANY_OBJECT) => {
          // 从 bidPackagesFromDemand 中找到对应的标包（通过 id 或其他标识匹配）
          const demandPkg = bidPackagesFromDemand.value.find(
            (pkg: ANY_OBJECT) =>
              pkg.id === resultPkg.bidPackageId
              || pkg.bidPackageNumber === resultPkg.bidPackageNumber,
          )

          return {
            ...resultPkg,
            pickPartners: demandPkg?.pickPartners || resultPkg.pickPartners || [],
            resultData: {
              bidPackageId: resultPkg.bidPackageId || resultPkg.id,
              noticeId,
              pickResult: '',
              auditStartTime: '',
              auditEndTime: '',
              failedReason: '',
              bidPartnerId: undefined,
              bidPartnerName: '',
              score: undefined,
              quotePriceTax: undefined,
              quotePrice: undefined,
              auditReports: undefined,
              fileList: [],
            },
          }
        })

        // 根据是否划分标包，填充不同的数据
        if (formData.bidPackageFlag === '0') {
          // 不划分标包时，正常带出失败信息
          if (resultPackages.length > 0) {
            const firstPackage = resultPackages[0]
            formData.pickType = firstPackage.pickType
            formData.pickTypeReason = firstPackage.pickTypeReason
            noBidPackagePartners.value = firstPackage.pickPartners || []
            resultFormData.bidPackageId = firstPackage.bidPackageId || firstPackage.id
          }
        }
        else {
          // 划分标包时，仅带出失败的标包
          bidPackageList.value = resultPackages
        }
      }
    }
  }
  catch (e: any) {
    showToast('加载标包信息失败')
    console.error(e)
  }
}
const infoDecisionId = ref('')
// 甄选需求表单数据
const formData = reactive<ANY_OBJECT>({
  demandId: undefined,
  demandNumber: '',
  demandName: '',
  createUserId: undefined,
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
  createUserCityName: '',
  bidPackageFlag: '',
  pickType: '',
  pickTypeReason: '',
  hasTemporaryFile: 0,
})

// 甄选方案表单数据
const schemeFormData = reactive<ANY_OBJECT>({
  schemeName: '',
  schemeNumber: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
  createUserDeptId: '',
})

// 甄选结果决策表单数据
const decisionFormData = reactive<ANY_OBJECT>({
  decisionTime: undefined, // 决策时间
  decisionDocs: '[]', // 甄选决策会议记录文件
  contractPriceReviewFiles: '[]', // 合同/价格审批文件
})

// 各类文件列表
const bidDocFileList = ref<ANY_OBJECT[]>([])
const selectionRequestFormFileList = ref<ANY_OBJECT[]>([])
const partnerSelectionRequirementFileList = ref<ANY_OBJECT[]>([])
const selectionReviewPlanFileList = ref<ANY_OBJECT[]>([])
const technicalSpecificationFileList = ref<ANY_OBJECT[]>([])
const contractMainTermsFileList = ref<ANY_OBJECT[]>([])
const decisionMeetingFileList = ref<ANY_OBJECT[]>([])

function onCancel() {
  appBack()
  // router.back()
}

function onReject() {
  rejectDialogVisible.value = true
}

function convertFileList(fileList: ANY_OBJECT[]) {
  return fileList.map((item: any) => ({
    fileName: item.filename || '',
    originalName: item.originalName || item.name,
    downloadUri: item.downloadUri || '',
    uploadFailed: '0',
    uploadPath: item.uploadPath || '',
  }))
}

async function confirmReject(text: string) {
  submitLoading.value = true
  try {
    const params = {
      processInstanceId: route.query.processInstanceId as string,
      taskId: route.query.taskId as string,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: text,
      },
      taskVariableData: {
        // bidDocs: convertFileList(bidDocFileList.value),
        // schemeDocs: convertFileList(pickDemandFileList.value),
        // decisionMeetings: convertFileList(decisionMeetingFileList.value),
        resultDecisionFiles: convertFileList(decisionDocFileList.value),
      },
    }

    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${processDefinitionKey.value}`, params)
    showToast('已驳回')
    rejectDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    // showToast('操作失败')
    console.error(e)
  }
  finally {
    submitLoading.value = false
  }
}

function onAgree() {
  agreeDialogVisible.value = true
}

async function confirmAgree(text: string) {
  // let roleId = ''
  // if (userInfo.value.area == 1) {
  //   roleId = '2032682362805948416';
  // }
  // if (userInfo.value.area == 2) {
  //   roleId = '2032682417046687744';
  // }
  // if (userInfo.value.area == 3) {
  //   roleId = '2032682417046687744';
  // }
  submitLoading.value = true
  try {
    const params = {
      processInstanceId: route.query.processInstanceId as string,
      taskId: route.query.taskId as string,
      flowTaskCommentDto: {
        approvalType: 'agree',
        taskComment: text,
      },
      taskVariableData: {
        appointedAssignee: '',
        // bidDocs: convertFileList(bidDocFileList.value),
        // schemeDocs: convertFileList(pickDemandFileList.value),
        // decisionMeetings: convertFileList(decisionMeetingFileList.value),
        resultDecisionFiles: convertFileList(decisionDocFileList.value),
      },
    }

    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${processDefinitionKey.value}`, params)
    showToast('审批通过')
    agreeDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    // showToast('操作失败')
    console.error(e)
  }
  finally {
    submitLoading.value = false
  }
}

function convertToUploadFile(files: any[]): ANY_OBJECT[] {
  if (!files || !Array.isArray(files))
    return []
  return files.map((file, index) => ({
    name: file.originalName || file.filename || file.fileName || '未知文件',
    url: file.downloadUri,
    uid: Date.now() + index,
    status: 'success',
    downloadUri: file.downloadUri,
    filename: file.filename || file.fileName,
    originalName: file.originalName,
    uploadPath: file.uploadPath,
  }))
}

async function loadResourceApplyFiles(demandNumber: string) {
  try {
    const res = await PickResourceApplyController.queryResourceApplyStatus({
      businessId: demandNumber,
    })
    if (res.data) {
      if (res.data.bidDocs)
        bidDocFileList.value = convertToUploadFile(res.data.bidDocs)
      if (res.data.selectionRequestForm)
        selectionRequestFormFileList.value = convertToUploadFile(res.data.selectionRequestForm)
      if (res.data.partnerSelectionRequirement)
        partnerSelectionRequirementFileList.value = convertToUploadFile(res.data.partnerSelectionRequirement)
      if (res.data.selectionReviewPlan)
        selectionReviewPlanFileList.value = convertToUploadFile(res.data.selectionReviewPlan)
      if (res.data.technicalSpecification)
        technicalSpecificationFileList.value = convertToUploadFile(res.data.technicalSpecification)
      if (res.data.contractMainTerms)
        contractMainTermsFileList.value = convertToUploadFile(res.data.contractMainTerms)
      if (res.data.decisionMeetings)
        decisionMeetingFileList.value = convertToUploadFile(res.data.decisionMeetings)
      if (res.data.resultDecisionFiles)
        decisionDocFileList.value = convertToUploadFile(res.data.resultDecisionFiles)
    }
  }
  catch (error) {
    console.error('加载文件数据失败：', error)
  }
}

// 加载详情数据
function loadDetail() {
  // 从路由参数获取 businessKey 作为需求编号或方案编号
  let businessKey = route.query.businessKey as string
  if (!businessKey) {
    showToast('缺少业务编号参数')
    appBack()
    // router.back()
    return
  }

  // 判断 demandNumber 是否包含分隔符（分割的情况）
  const isSplit = businessKey.includes('-')
  let demandNumber = businessKey

  // demandNumber 包含分隔符时，提取中间的部分
  // 例如：repickflow-2008063029324812288 或 repick-xxx-xxx，提取中间的数字部分
  if (isSplit) {
    const parts = businessKey.split('-')
    if (parts.length >= 2) {
      demandNumber = parts[1] // 提取中间的 demandNumber
    }
  }

  // 根据是否分割选择不同的接口
  let obj = {
    demandNumber,
  }
  let obj2 = {
    demandNumber,
  }
  // if(currentType.value === 'auth' || currentType.value === 'info'){
  //   obj2.queryType = 'pending_review'
  // }
  const queryBidResultData = SelectionTableController.queryBidResult(obj)
  const queryPromise = PickDemandController.queryDemand(obj2)
  //   isSplit
  // ? SelectionTableController.queryBidResult({ demandNumber })
  // : PickDemandController.queryDemand({ demandNumber });

  //   isSplit
  // ? PickDemandController.queryFirstReviewTimeDemand({ demandNumber })
  // : PickDemandController.queryDemand({ demandNumber });

  queryPromise
    .then(async (res) => {
      if (res.data) {
        // 填充甄选需求数据
        if (res.data.pickDemand) {
          Object.assign(formData, res.data.pickDemand)
          // formData.demandId = res.data.pickDemand.id;
          // formData.demandNumber = res.data.pickDemand.demandNumber;
          // formData.demandName = res.data.pickDemand.demandName;
          // formData.createUserId = res.data.pickDemand.createUserId; // 保存创建人ID
          // formData.createUserName = res.data.pickDemand.createUserName;
          // formData.createUserOrg = res.data.pickDemand.createUserOrg;
          // formData.createTime = res.data.pickDemand.createTime;
          // formData.createUserPhone = res.data.pickDemand.createUserPhone;
          // formData.bidPackageFlag = res.data.pickDemand.bidPackageFlag;
          // 回显决策会议记录文件
          // if (res.data.pickDemand.decisionFiles && Array.isArray(res.data.pickDemand.decisionFiles)) {
          //   decisionFiles.value = res.data.pickDemand.decisionFiles;
          // }
          // if (res.data.pickDemand.contractPriceApproval && Array.isArray(res.data.pickDemand.contractPriceApproval)) {
          //   contractPriceReviewFiles.value = res.data.pickDemand.contractPriceApproval;
          // }
        }
        // 填充商机数据
        if (res.data.pickOpportunity) {
          // 不再需要保存 reviewTime
        }

        // 如果有方案数据，填充方案信息
        if (res.data.pickScheme) {
          Object.assign(schemeFormData, res.data.pickScheme)
        }

        // 保存标包信息（包含合作伙伴列表）
        if (res.data.pickBidPackages && Array.isArray(res.data.pickBidPackages)) {
          bidPackagesFromDemand.value = res.data.pickBidPackages
        }
        // 判断是否是分割的 demandNumber
        if (isSplit) {
          // 分割的情况：使用 queryBidResult 获取标包信息
          if (noticeId.value) {
            await loadBidResultData(demandNumber, noticeId.value)
          }
          else {
            // 如果没有公告信息，正常加载标包数据
            if (res.data.pickBidPackages && res.data.pickBidPackages.length > 0) {
              if (formData.bidPackageFlag === '0') {
                const firstPackage = res.data.pickBidPackages[0]
                formData.pickType = firstPackage.pickType
                formData.pickTypeReason = firstPackage.pickTypeReason
                noBidPackagePartners.value = firstPackage.pickPartners || []
                resultFormData.bidPackageId = firstPackage.id
              }
              else {
                bidPackageList.value = res.data.pickBidPackages.map((pkg: any) => ({
                  ...pkg,
                  resultData: {
                    bidPackageId: pkg.id,
                    noticeId: noticeId.value,
                    pickResult: '',
                    auditStartTime: '',
                    auditEndTime: '',
                    failedReason: '',
                    bidPartnerId: undefined,
                    bidPartnerName: '',
                    score: undefined,
                    quotePriceTax: undefined,
                    quotePrice: undefined,
                    auditReports: undefined,
                    fileList: [],
                  },
                }))
              }
            }
          }
        }
        else {
          // 普通情况：直接使用 queryDemand 返回的标包数据
          if (res.data.pickBidPackages && Array.isArray(res.data.pickBidPackages)) {
            // 判断是否划分标包
            if (formData.bidPackageFlag === '1') {
              // 划分标包：显示标包列表，并为每个标包初始化结果数据
              bidPackageList.value = res.data.pickBidPackages.map(pkg => ({
                ...pkg,
                resultData: {
                  bidPackageId: pkg.id,
                  noticeId: noticeId.value,
                  pickResult: '',
                  auditStartTime: '',
                  auditEndTime: '',
                  failedReason: '',
                  bidPartnerId: undefined,
                  bidPartnerName: '',
                  score: undefined,
                  quotePriceTax: undefined,
                  quotePrice: undefined,
                  auditReports: undefined,
                  fileList: [],
                },
              }))
            }
            else if (formData.bidPackageFlag === '0' && res.data.pickBidPackages.length > 0) {
              // 不划分标包：从第一个标包中获取甄选方式、理由和合作伙伴
              const firstPackage = res.data.pickBidPackages[0]
              formData.pickType = firstPackage.pickType
              formData.pickTypeReason = firstPackage.pickTypeReason
              noBidPackagePartners.value = firstPackage.pickPartners || []
              // 初始化结果数据的标包ID
              resultFormData.bidPackageId = firstPackage.id
            }
          }
        }
      }
    })
    .catch((e) => {
      console.error('加载数据失败', e)
      showToast('加载数据失败')
    })
  queryBidResultData
    .then(async (res) => {
      if (res.data) {
        // 甄选决策信息
        if (res.data.pickDecision) {
          console.log(888888, res.data.pickDecision)
          infoDecisionId.value = res.data.pickDecision.id
          const decision = res.data.pickDecision
          decisionFormData.decisionTime = decision.decisionTime
          decisionFormData.hasTemporaryFile = decision.hasTemporaryFile
          // // 回显决策会议记录文件
          // if (decision.decisionFiles && Array.isArray(decision.decisionFiles)) {
          //   decisionFiles.value = decision.decisionFiles;
          // }
          // if (decision.decisionMissingFiles && Array.isArray(decision.decisionMissingFiles)) {
          //   decisionFormData.decisionDocs = JSON.stringify(decisionDocFileList.value);
          //   decisionDocFileList.value = decision.decisionMissingFiles.map(
          //     (file: any, index: number) =>
          //       ({
          //         name: file.originalName || file.filename,
          //         url: file.downloadUri,
          //         uid: Date.now() + index + 1000,
          //         status: 'success',
          //         response: { data: file },
          //         downloadUri: file.downloadUri,
          //         filename: file.fileName || file.filename,
          //         uploadPath: file.uploadPath,
          //       } as UploadFile),
          //   );
          // }
          // if (decision.contractPriceReviewFiles && Array.isArray(decision.contractPriceReviewFiles)) {
          //   decisionFormData.contractPriceReviewFiles = JSON.stringify(contractPriceReviewFileList.value);
          //   contractPriceReviewFileList.value = decision.contractPriceReviewFiles.map(
          //     (file: any, index: number) =>
          //       ({
          //         name: file.originalName || file.filename,
          //         url: file.downloadUri,
          //         uid: Date.now() + index + 1000,
          //         status: 'success',
          //         response: { data: file },
          //         downloadUri: file.downloadUri,
          //         filename: file.fileName || file.filename,
          //         uploadPath: file.uploadPath,
          //       } as UploadFile),
          //   );
          // }
        }
      }
    })
    .catch((e) => {
      console.error('加载数据失败', e)
      showToast('加载数据失败')
    })
  // 加载文件数据
  loadResourceApplyFiles(demandNumber as string)
}

function loadFlowTaskCommentList() {
  if (!processInstanceId.value)
    return
  FlowOperationController.listFlowTaskComment({
    processInstanceId: processInstanceId.value,
  })
    .then((res: ANY_OBJECT) => {
      flowTaskCommentList.value = res.data || []
    })
    .catch((e: unknown) => console.error(e))
}

onMounted(() => {
  loadDetail()
  loadFlowTaskCommentList()
})
</script>

<template>
  <div class="mobile-detail-manager">
    <div class="content-wrapper">
      <DataCompletionDetail
        :flow-entry-name="flowEntryName"
        :task-name="taskName || '资料补传审批'"
        :flow-task-comment-list="flowTaskCommentList"
        :form-data="formData"
        :scheme-form-data="schemeFormData"
        :bid-doc-file-list="bidDocFileList"
        :selection-request-form-file-list="selectionRequestFormFileList"
        :partner-selection-requirement-file-list="partnerSelectionRequirementFileList"
        :selection-review-plan-file-list="selectionReviewPlanFileList"
        :technical-specification-file-list="technicalSpecificationFileList"
        :contract-main-terms-file-list="contractMainTermsFileList"
        :decision-meeting-file-list="decisionMeetingFileList"
        :decision-doc-file-list="decisionDocFileList"
        :decision-form-data="decisionFormData"
        :has-temporary-file="formData.hasTemporaryFile"
        :isShow="false"
      />
    </div>

    <BottomActionBar
      v-if="!isInfo"
      :submit-loading="submitLoading"
      @cancel="onCancel"
      @reject="onReject"
      @agree="onAgree"
    />

    <BottomActionBar
      v-else
      :submit-loading="submitLoading"
      @cancel="onCancel"
    />

    <CommonApproval
      v-model:visible="rejectDialogVisible"
      title="驳回"
      confirm-type="danger"
      :loading="submitLoading"
      placeholder="请输入驳回意见"
      @confirm="confirmReject"
    />

    <CommonApproval
      v-model:visible="agreeDialogVisible"
      title="同意"
      confirm-type="primary"
      :loading="submitLoading"
      placeholder="请输入审批意见"
      @confirm="confirmAgree"
    />
  </div>
</template>

<style scoped>
</style>
