<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DictionaryController } from '@/api/system';
import { PickDemandController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { get } from '@/common/http/request'
import { downloadAppFile } from '@/common/utils'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import PartnerList from '@/views/pages/components/partnerList/indexDemand.vue'

interface Props {
  flowEntryName: string
  demandNumber?: string
  hideHeader?: boolean
  hideBack?: boolean
  flowTaskCommentList?: any[]
  disabled?: string[]
  detailData?: ANY_OBJECT
  taskName: string
}

const props = withDefaults(defineProps<Props>(), {
  flowEntryName: '',
  taskName: '甄选文件采购部门审批',
  demandNumber: '',
  hideHeader: true,
  hideBack: true,
  flowTaskCommentList: () => [],
  disabled: () => [],
  detailData: () => ({}),
})

const router = useRouter()
const route = useRoute()

const activeName = ref('1')
const isDownload = ref(false)

const formData = reactive<ANY_OBJECT>({
  demandNumber: '',
  demandName: '',
  oppoName: '',
  oppoCode: '',
  oppoOrg: '',
  oppoIndustry: '',
  oppoSignedAmount: undefined,
  customerName: '',
  completeTime: '',
  budgetAmount: undefined,
  budgetAmountTax: undefined,
  bidPackageFlag: '',
  openTime: '',
  projectLevel: '',
})

const schemeFormData = reactive<ANY_OBJECT>({
  id: undefined,
  createUserId: undefined,
  projectManagerId: undefined,
  schemeName: '',
  schemeNumber: '',
  replyEndTime: '',
  schemeMethod: '',
  schemeOrganization: '',
  agencyName: '',
  projectManager: '',
  projectManagerCode: '',
  schemeDesc: '',
  decisionLevel: '',
  decisionTime: '',
  remark: '',
})

const schemeDocFileList = ref<ANY_OBJECT[]>([])
const pickFileList = ref<ANY_OBJECT[]>([])
const selectionInvitationFileList = ref<ANY_OBJECT[]>([])
const responseFileFormatFileList = ref<ANY_OBJECT[]>([])
const respondentNoticeFileList = ref<ANY_OBJECT[]>([])

const bidPackageList = ref<ANY_OBJECT[]>([])
const noBidPackagePartners = ref<ANY_OBJECT[]>([])
const decisionMeetingFileList = ref<ANY_OBJECT[]>([])
const bidDocFileList = ref<ANY_OBJECT[]>([])
const pickDemandFileList = ref<ANY_OBJECT[]>([])
const partnerDemandFileList = ref<ANY_OBJECT[]>([])
const reviewPlanFileList = ref<ANY_OBJECT[]>([])
const techStandardFileList = ref<ANY_OBJECT[]>([])
const contractClauseFileList = ref<ANY_OBJECT[]>([])

const demandSceneWidgetDropdownList = ref<ANY_OBJECT[]>([])
const demandIndustryWidgetDropdownList = ref<ANY_OBJECT[]>([])
const industryFieldWidgetDropdownList = ref<ANY_OBJECT[]>([])
const regionOptions = ref<any>([])
const pickSchemeDeptId = ref('')
const uploadFormData = reactive({
  remark: '',
  pickFiles: undefined as string | undefined,
});


function getFileName(file: ANY_OBJECT) {
  return file.originalName || file.filename || file.fileName || '-'
}

function getFileFieldName(file: ANY_OBJECT) {
  return file.uploadPath || file.fieldName || ''
}

function initDetailData(data: ANY_OBJECT) {
  // const demandNumber = route.query.businessKey as string
  // if (!demandNumber) {
  //   showToast('缺少需求编号参数')
  //   // router.back()
  //   return
  // }


  if (data) {
    // 填充需求数据
    if (data.pickDemand) {
      Object.assign(formData, data.pickDemand)
      regionValue.value = formData.demandArea ? formData.demandArea.split(',').map((item: string) => Number(item)) : []
      if (data.pickDemand.bidDocs && Array.isArray(data.pickDemand.bidDocs)) {
        bidDocFileList.value = data.pickDemand.bidDocs
      }

      if (data.pickDemand.selectionRequestForm && Array.isArray(data.pickDemand.selectionRequestForm)) {
        pickDemandFileList.value = data.pickDemand.selectionRequestForm
      }

      if (data.pickDemand.partnerSelectionRequirement && Array.isArray(data.pickDemand.partnerSelectionRequirement)) {
        partnerDemandFileList.value = data.pickDemand.partnerSelectionRequirement
      }

      if (data.pickDemand.selectionReviewPlan && Array.isArray(data.pickDemand.selectionReviewPlan)) {
        reviewPlanFileList.value = data.pickDemand.selectionReviewPlan
      }

      if (data.pickDemand.technicalSpecification && Array.isArray(data.pickDemand.technicalSpecification)) {
        techStandardFileList.value = data.pickDemand.technicalSpecification
      }

      if (data.pickDemand.contractMainTerms && Array.isArray(data.pickDemand.contractMainTerms)) {
        contractClauseFileList.value = data.pickDemand.contractMainTerms
      }
      // 加载甲方招标文件
      // if (data.pickDemand.bidDocs && Array.isArray(data.pickDemand.bidDocs)) {
      //   bidDocFileList.value = data.pickDemand.bidDocs.map((file: any) => ({
      //     name: file.originalName || file.fileName,
      //     url: file.downloadUri,
      //     uid: Date.now() + Math.random(),
      //     status: 'success',
      //     downloadUri: file.downloadUri,
      //     filename: file.fileName,
      //     originalName: file.originalName || file.fileName,
      //     uploadPath: file.uploadPath,
      //   }))
      // }

      // // 加载甄选需求文件
      // if (data.pickDemand.pickDemands && Array.isArray(data.pickDemand.pickDemands)) {
      //   pickDemandFileList.value = data.pickDemand.pickDemands.map((file: any) => ({
      //     name: file.originalName || file.fileName,
      //     url: file.downloadUri,
      //     uid: Date.now() + Math.random(),
      //     status: 'success',
      //     downloadUri: file.downloadUri,
      //     filename: file.fileName,
      //     originalName: file.originalName || file.fileName,
      //     uploadPath: file.uploadPath,
      //   }))
      // }
      // scenceRelChildrenFn(formData.demandIndustry, 'portalRealm')
      // scenceRelChildrenFn(formData.industryField, 'partnerScence')
      scenceRelChildrenFn(formData.demandIndustry, 'portalRealm')
      scenceRelChildrenFn('', 'portalIndustry')
    }

    // 填充商机数据
    if (data.pickOpportunity) {
      formData.oppoName = data.pickOpportunity.oppoName
      formData.oppoCode = data.pickOpportunity.oppoCode
      formData.oppoOrg = data.pickOpportunity.oppoOrg
      formData.oppoIndustry = data.pickOpportunity.oppoIndustry
      formData.oppoSignedAmount = data.pickOpportunity.oppoSignedAmount
      formData.customerName = data.pickOpportunity.customerName
    }

    // 填充方案数据
    if (data.pickScheme) {
      Object.assign(schemeFormData, data.pickScheme)
      console.log(
        '方案数据已加载 - createUserId:',
        schemeFormData.createUserId,
        'projectManagerId:',
        schemeFormData.projectManagerId,
      )
      pickSchemeDeptId.value = data.pickScheme.createUserDeptId
      // 填充备注说明（remark 在 pickScheme 里）
      uploadFormData.remark = data.pickScheme.remark || ''

      // 加载甄选方案文件
      if (data.pickScheme.schemeDocs && Array.isArray(data.pickScheme.schemeDocs)) {
        schemeDocFileList.value = data.pickScheme.schemeDocs.map((file: any) => ({
          name: file.originalName || file.fileName,
          url: file.downloadUri,
          uid: Date.now() + Math.random(),
          status: 'success',
          downloadUri: file.downloadUri,
          filename: file.fileName,
          originalName: file.originalName || file.fileName,
          uploadPath: file.uploadPath,
        }))
      }

      // 加载方案决策会议纪要文件
      if (
        data.pickScheme.decisionMeetings
        && Array.isArray(data.pickScheme.decisionMeetings)
      ) {
        decisionMeetingFileList.value = data.pickScheme.decisionMeetings.map(
          (file: any) => ({
            name: file.originalName || file.fileName,
            url: file.downloadUri,
            uid: Date.now() + Math.random(),
            status: 'success',
            downloadUri: file.downloadUri,
            filename: file.fileName,
            originalName: file.originalName || file.fileName,
            uploadPath: file.uploadPath,
          }),
        )
      }
    }

    // 加载甄选文件（从 pickFiles 字段）
    if (data.pickFiles && Array.isArray(data.pickFiles)) {
      pickFileList.value = data.pickFiles.map((file: any) => ({
        name: file.originalName || file.fileName,
        url: file.downloadUri,
        uid: Date.now() + Math.random(),
        status: 'success',
        downloadUri: file.downloadUri,
        filename: file.fileName,
        originalName: file.originalName || file.fileName,
        uploadPath: file.uploadPath,
      }))
    }

    // 加载甄选邀请书文件
    if (data.selectionInvitationFiles && Array.isArray(data.selectionInvitationFiles)) {
      selectionInvitationFileList.value = data.selectionInvitationFiles.map((file: any) => ({
        name: file.originalName || file.fileName,
        url: file.downloadUri,
        uid: Date.now() + Math.random(),
        status: 'success',
        downloadUri: file.downloadUri,
        filename: file.fileName,
        originalName: file.originalName || file.fileName,
        uploadPath: file.uploadPath,
      }))
    }

    // 加载应答文件格式文件
    if (data.responseFileFormatFiles && Array.isArray(data.responseFileFormatFiles)) {
      responseFileFormatFileList.value = data.responseFileFormatFiles.map((file: any) => ({
        name: file.originalName || file.fileName,
        url: file.downloadUri,
        uid: Date.now() + Math.random(),
        status: 'success',
        downloadUri: file.downloadUri,
        filename: file.fileName,
        originalName: file.originalName || file.fileName,
        uploadPath: file.uploadPath,
      }))
    }

    // 加载应答人须知文件
    if (data.respondentNoticeFiles && Array.isArray(data.respondentNoticeFiles)) {
      respondentNoticeFileList.value = data.respondentNoticeFiles.map((file: any) => ({
        name: file.originalName || file.fileName,
        url: file.downloadUri,
        uid: Date.now() + Math.random(),
        status: 'success',
        downloadUri: file.downloadUri,
        filename: file.fileName,
        originalName: file.originalName || file.fileName,
        uploadPath: file.uploadPath,
      }))
    }

    // 填充标包数据
    if (data.pickBidPackages && data.pickBidPackages.length > 0) {
      if (formData.bidPackageFlag === '0') {
        const firstPackage = data.pickBidPackages[0]
        formData.pickTypeReason = firstPackage.pickTypeReason
        noBidPackagePartners.value = firstPackage.pickPartners || []
      }
      else {
        bidPackageList.value = data.pickBidPackages
      }
    }

  }
}

function loadDetail() {
  const demandNumber = props.demandNumber || (route.query.businessKey as string)
  if (!demandNumber) {
    showToast('缺少需求编号参数')
    return
  }

  PickDemandController.queryDemand({ demandNumber })
    .then((res) => {
      if (res.data) {
        initDetailData(res.data)
      }
    })
    .catch((e) => {
      showToast('加载详情失败')
      console.error(e)
    })
}
const regionValue = ref<number[]>([])

const scenceRelChildrenFn = (parentCodeId:string, type:string) => {
  let parame = parentCodeId
    ? {
        typeCode: type,
        parentCodeId,
      }
    : {
        typeCode: type,
      }
  DictionaryController.scenceRelChildren(parame)
    .then((resp) => {
      let res = resp as any
      if (res && res.data) {
        res.data.forEach((item: any ) => {
          item.id = item.codeId
          item.name = item.codeName
        })
      }
      if (type === 'portalIndustry') {
        demandIndustryWidgetDropdownList.value = res.data
      }
      if (type === 'portalRealm') {
        industryFieldWidgetDropdownList.value = res.data
      }
      if (type === 'partnerScence') {
        demandSceneWidgetDropdownList.value = res.data
      }
    })
    .catch((e) => {})
}
const demandIndustryName = computed(() => {
  console.log(demandIndustryWidgetDropdownList.value, 'demandIndustryWidgetDropdownList---')
  return demandIndustryWidgetDropdownList.value.find(item => item.id === formData.demandIndustry)?.name || '-'
})

const industryFieldName = computed(() => {
  return industryFieldWidgetDropdownList.value.find(item => item.id === formData.industryField)?.name || '-'
})

function findNodePath(nodes: ANY_OBJECT[], targetIds: number[], currentPath: string[] = []): string | null {
  for (const node of nodes) {
    const newPath = [...currentPath, node.areaName]
    if (targetIds.length === 0)
      return null
    if (node.id === targetIds[0]) {
      if (targetIds.length === 1) {
        return newPath.join(' / ')
      }
      if (node.children && targetIds.length > 1) {
        return findNodePath(node.children, targetIds.slice(1), newPath)
      }
    }
    if (node.children && node.children.length) {
      const result = findNodePath(node.children, targetIds, currentPath)
      if (result)
        return result
    }
  }
  return null
}
async function queryRegionList() {
  const param = {}
  const res = await get(`${API_CONTEXT}/manage/area/selectCascadeByPid`, param)
  regionOptions.value = res.data
}
const regionValueName = computed(() => {
  if (!regionValue.value || regionValue.value.length === 0)
    return '-'
  const path = findNodePath(regionOptions.value, regionValue.value)
  return path || '-'
})

watch(() => props.detailData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    initDetailData(newData)
  }
}, { immediate: true })

onMounted(() => {
  queryRegionList()
  if (!props.detailData || Object.keys(props.detailData).length === 0) {
    loadDetail()
  }
})
const fieldVisible = (fieldName: string) => {
  if (props.disabled.includes(fieldName)) {
    return false;
  }
  return true;
};
</script>

<template>
  <div class="mobile-detail">
    <div class="mobile-detail-content-wrapper">
      <div class="page-title">
        {{ flowEntryName }}{{ taskName ? `-${taskName}` : '' }}
      </div>
      <InfoHeader
        :create-user-name="formData.createUserName"
        :create-user-phone="formData.createUserPhone"
        :create-time="formData.createTime"
        :create-user-org="formData.createUserOrg"
        :create-user-city-name="formData.createUserCityName"
      />

      <van-tabs v-model:active="activeName" type="card">
        <van-tab title="业务信息" name="1">
          <div class="tab-content">
            <div class="section">
              <div class="section-subtitle">
                甄选需求信息
              </div>
              <van-field v-model="formData.demandName" label="甄选需求名称" readonly />
              <van-field v-model="formData.demandNumber" label="甄选需求编号" readonly />
              <van-field v-model="formData.oppoName" label="商机名称" readonly />
              <van-field v-model="formData.oppoCode" label="商机编码" readonly />
              <van-field v-model="formData.oppoOrg" label="归属分公司" readonly />
              <van-field v-model="formData.oppoIndustry" label="商机归属行业" readonly />
              <van-field label="商机预估签约金额">
                <template #input>
                  <span>{{ formData.oppoSignedAmount ?? '-' }}</span>
                </template>
              </van-field>
              <van-field v-model="formData.customerName" label="客户名称" readonly />
              <van-field v-model="formData.completeTime" label="要求完成时间" readonly />
              <van-field v-model="formData.budgetAmountTax" label="甄选含税预算金额(万)" readonly />
              <van-field v-model="formData.budgetAmount" label="甄选不含税预算金额(万)" readonly />
              <van-field label="行业">
                <template #input>
                  <span>{{ demandIndustryName }}</span>
                </template>
              </van-field>
              <van-field label="行业领域">
                <template #input>
                  <span>{{ industryFieldName }}</span>
                </template>
              </van-field>
              <van-field label="项目实施区域">
                <template #input>
                  <span>{{ regionValueName }}</span>
                </template>
              </van-field>
                 <van-field label="是否涉及集成服务包">
                <template #input>
                  <span>{{ formData.servicePackageFlag === '1' ? '是' : '否' }}</span>
                </template>
              </van-field>
              <van-field label="集成服务包金额含税(万)">
                <template #input>
                  <span>{{ formData.servicePackageAmount ?? '-' }}</span>
                </template>
              </van-field>
              <van-field v-model="formData.pickType" label="甄选方式" readonly />
                <van-field 
                  :model-value="formData.bidPackageFlag === '1' ? '是' : '否'"
                  label="是否划分标包"
                  readonly />
              <van-field v-model="formData.openTime" label="客户项目开标时间" readonly />
              <van-field v-model="formData.createUserName" label="需求发起人" readonly />
              <van-field v-model="formData.createUserOrg" label="发起单位/部门" readonly />
              <van-field v-model="formData.createTime" label="发起时间" readonly />
              <van-field v-model="formData.createUserPhone" label="发起人联系方式" readonly />
              <van-field v-model="formData.projectLevel" label="项目等级" readonly />
              <van-field label="上下游合同标的是否高度一致">
                <template #input>
                  <span>{{ formData.consistentFlag === '1' ? '是' : '否' }}</span>
                </template>
              </van-field>
              <van-field label="是否涉密项目">
                <template #input>
                  <span>{{ formData.hasSecret === '1' ? '是' : '否' }}</span>
                </template>
              </van-field>
              <van-field label="附件文档中是否存在临时文件">
                <template #input>
                  <span>{{ formData.hasTemporaryFile === '1' ? '是' : '否' }}</span>
                </template>
              </van-field>

              <template v-if="formData.bidPackageFlag === '0'">
                <!-- <van-field v-model="formData.pickType" label="甄选方式" readonly />
                <van-field v-model="formData.pickTypeReason" label="甄选方式理由" readonly type="textarea" autosize /> -->
                <PartnerList
                  v-if="noBidPackagePartners.length"
                  v-model:data="formData"
                  v-model:demand-number="formData.demandNumber"
                  v-model:partners="noBidPackagePartners"
                  bid-package-flag="0"
                  read-only
                />
              </template>

              <!-- 标包划分情况（仅当划分标包且存在数据时显示） -->
              <template v-if="formData.bidPackageFlag === '1' && bidPackageList.length">
                <div class="section-subtitle">
                  标包划分情况
                </div>
                <div v-for="(pkg, index) in bidPackageList" :key="index" class="package-wrapper-border">
                  <div class="package-title">
                    标包{{ index + 1 }}
                  </div>
                  <van-cell title="甄选标段标题" :value="pkg.bidPackageTitle || '-'" />
                  <van-cell title="标段标识" :value="pkg.bidPackageNumber || '-'" />
                  <!-- <van-cell title="最低应标数量" :value="pkg.minBidCount || '-'" /> -->
                  <van-cell title="标段金额不含税（万）" :value="pkg.bidPackage || '-'" />
                  <van-cell title="标段金额含税（万）" :value="pkg.bidPackageTax || '-'" />
                  <van-cell title="甄选方式理由" :value="pkg.pickTypeReason || '-'" v-if="fieldVisible('甄选方式理由')"/>
                  <van-cell title="标段信息描述" :value="pkg.bidPackageDesc || '-'" />
                  <PartnerList
                    v-model:demandNumber="formData.demandNumber"
                    :bidPackageFlag="'1'"
                    v-model:data="bidPackageList[index]"
                    v-model:partners="pkg.pickPartners"
                    :industry="formData.demandIndustry"
                    readOnly
                  />
                </div>
              </template>
            </div>

            <div class="section">
              <div class="section-subtitle">
                甄选方案基本信息
              </div>
              <van-field v-model="schemeFormData.schemeName" label="甄选方案名称" readonly />
              <van-field v-model="schemeFormData.schemeNumber" label="甄选方案编码" readonly />
              <van-field v-model="schemeFormData.replyEndTime" label="应答截止时间" readonly />
               <van-field
                :model-value="schemeFormData.schemeMethod === '1' ? '竞价法' : schemeFormData.schemeMethod === '2' ? '综合评审法' : '-'"
                label="执行甄选办法"
                readonly
              />
               <van-field
                :model-value="schemeFormData.schemeOrganization === '1' ? '自行组织' : schemeFormData.schemeOrganization === '2' ? '委托代理' : '-'"
                label="甄选组织方式"
                readonly
              />
              <van-field v-model="schemeFormData.agencyName" label="代理机构名称" readonly />
              <van-field v-model="schemeFormData.projectManager" label="项目经理" readonly />
              <van-field v-model="formData.openTime" label="开标时间" readonly />
              <van-field v-model="schemeFormData.schemeDesc" label="甄选方案描述" readonly />
              <!-- 不划分标包时显示 -->
              <template v-if="formData.bidPackageFlag === '0'">
                <van-field v-model="formData.pickTypeReason" label="甄选方式理由" readonly />
                <PartnerList
                  v-model:data="formData"
                  v-model:partners="noBidPackagePartners"
                  readOnly
                />
              </template>
            </div>
          </div>

           
        </van-tab>
        <van-tab title="流程信息" name="2">
          <div class="tab-content">
            <div class="section">
              <approvalTimeline v-if="flowTaskCommentList.length > 0" :list="flowTaskCommentList" />
              <van-empty v-else description="暂无流程信息" />
            </div>
          </div>
        </van-tab>
        <van-tab title="附件信息" name="3">
          <div class="tab-content">
            <div class="section">
              <div>
                <div class="section-subtitle">
                  甄选需求信息
                </div>
                <van-cell title="甲方招标文件">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in bidDocFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'bidDoc', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!bidDocFileList.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="合作伙伴甄选需求表">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in partnerDemandFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'partnerSelectionRequirement', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!partnerDemandFileList.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="甄选评审方案">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in reviewPlanFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'selectionReviewPlan', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!reviewPlanFileList.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="技术（服务）规范书">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in techStandardFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'technicalSpecification', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!techStandardFileList.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="合同主要条款">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in contractClauseFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'contractMainTerms', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!contractClauseFileList.length">-</span>
                    </div>
                  </template>
                </van-cell>
              </div>
            </div>
            <div v-if="formData.bidPackageFlag === '1' && schemeDocFileList.length > 0" class="section">
              <div class="section-subtitle">
                甄选方案基本信息
              </div>
              <van-cell title="甄选方案文件">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in schemeDocFileList" :key="file.filename" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'schemeDocFileList', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!schemeDocFileList.length">-</span>
                  </div>
                </template>
              </van-cell>
            </div>
            <div class="section">
              <div class="section-subtitle">
                甄选文件
              </div>
              <van-cell title="甄选文件">
                <template #value>
                  <div class="file-list" v-if="pickFileList.length > 0">
                    <div v-for="file in pickFileList" :key="file.filename" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'technicalSpecification', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                  </div>
                  <span v-else>-</span>
                </template>
              </van-cell>
              <van-cell title="甄选邀请书">
                <template #value>
                  <div class="file-list" v-if="selectionInvitationFileList.length > 0">
                    <div v-for="file in selectionInvitationFileList" :key="file.filename" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'technicalSpecification', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                  </div>
                  <span v-else>-</span>
                </template>
              </van-cell>
              <van-cell title="应答文件格式">
                <template #value>
                  <div class="file-list" v-if="responseFileFormatFileList.length > 0">
                    <div v-for="file in responseFileFormatFileList" :key="file.filename" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'technicalSpecification', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                  </div>
                  <span v-else>-</span>
                </template>
              </van-cell>
              <van-cell title="应答人须知">
                <template #value>
                  <div class="file-list" v-if="respondentNoticeFileList.length > 0">
                    <div v-for="file in respondentNoticeFileList" :key="file.filename" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'technicalSpecification', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                  </div>
                  <span v-else>-</span>
                </template>
              </van-cell>
              <van-cell title="备注">
                <template #value>
                  <span>{{ schemeFormData.remark }}</span>
                </template>
              </van-cell>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped>
</style>
