<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { PickDemandController, PickResourceApplyController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { post } from '@/common/http/request'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import PickDocCompleteApplyDetail from './pickDocCompleteApplyDetail.vue'
import CommonApproval from '@/views/pages/components/common/common-approval.vue'
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

const rejectReason = ref('')
const agreeReason = ref('')

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
  decisionTime: undefined,
  decisionDocs: '[]',
})

// 各类文件列表
const bidDocFileList = ref<ANY_OBJECT[]>([])
const selectionRequestFormFileList = ref<ANY_OBJECT[]>([])
const partnerSelectionRequirementFileList = ref<ANY_OBJECT[]>([])
const selectionReviewPlanFileList = ref<ANY_OBJECT[]>([])
const technicalSpecificationFileList = ref<ANY_OBJECT[]>([])
const contractMainTermsFileList = ref<ANY_OBJECT[]>([])
const decisionMeetingFileList = ref<ANY_OBJECT[]>([])
const decisionDocFileList = ref<ANY_OBJECT[]>([])

function onCancel() {
  appBack()
  // router.back()
}

function onReject() {
  rejectReason.value = ''
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
        bidDocs: convertFileList(bidDocFileList.value),
        // schemeDocs: convertFileList(pickDemandFileList.value),
        decisionMeetings: convertFileList(decisionMeetingFileList.value),
        resultDecisionFiles: convertFileList(decisionDocFileList.value),
      },
    };
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${processDefinitionKey.value}`, params);
    showToast('已驳回')
    submitLoading.value = false
    rejectDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    submitLoading.value = false
    // showToast('操作失败')
    console.error(e)
  }
  finally {
    submitLoading.value = false
  }
}

function onAgree() {
  agreeReason.value = ''
  agreeDialogVisible.value = true
}

const confirmAgree = async (text:string) =>{
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
        bidDocs: convertFileList(bidDocFileList.value),
        decisionMeetings: convertFileList(decisionMeetingFileList.value),
        resultDecisionFiles: convertFileList(decisionDocFileList.value),
      },
    };
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${processDefinitionKey.value}`, params);
    showToast('审批通过')
    submitLoading.value = false
    agreeDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    // showToast('操作失败')
    submitLoading.value = false
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

function loadDetail() {
  const businessKey = route.query.businessKey as string || route.query.demandNumber as string
  if (!businessKey) {
    showToast('缺少需求编号参数')
    return
  }

  let demandNumber = businessKey
  const isSplit = businessKey.includes('-')
  if (isSplit) {
    const parts = businessKey.split('-')
    if (parts.length >= 2) {
      demandNumber = parts[1]
    }
  }

  const queryPromise = isSplit
    ? PickDemandController.queryFirstReviewTimeDemand({ demandNumber })
    : PickDemandController.queryDemand({ demandNumber })

  queryPromise
    .then(async (res: ANY_OBJECT) => {
      if (res.data) {
        if (res.data.pickDemand) {
          Object.assign(formData, res.data.pickDemand)
        }

        if (res.data.pickScheme) {
          Object.assign(schemeFormData, res.data.pickScheme)
        }

        if (res.data.pickDecision) {
          decisionFormData.decisionTime = res.data.pickDecision.decisionTime
        }
      }
    })
    .catch((e: any) => {
      showToast('加载详情失败')
      console.error(e)
    })

  // 加载文件数据
  loadResourceApplyFiles(demandNumber)
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
      <PickDocCompleteApplyDetail
        :flow-entry-name="flowEntryName"
        :task-name="taskName || '资料补传审批'"
        :flow-task-comment-list="flowTaskCommentList"
        :form-data="formData"
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
