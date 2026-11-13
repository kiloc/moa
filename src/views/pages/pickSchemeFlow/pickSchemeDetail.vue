<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PickDemandController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { DictionaryController } from '@/api/system'
import { get } from '@/common/http/request'
import { downloadAppFile } from '@/common/utils'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import PartnerList from '@/views/pages/components/partnerList/indexDemand.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'

interface Props {
  flowEntryName: string
  demandNumber?: string
  hideHeader?: boolean
  hideBack?: boolean
  demandDetail?: boolean
  flowTaskCommentList?: any[]
  disabled?: string[]
  detailData?: ANY_OBJECT
  taskName: string
}

const props = withDefaults(defineProps<Props>(), {
  flowEntryName: '',
  taskName: '甄选方案三级经理审批',
  demandNumber: '',
  hideHeader: true,
  hideBack: true,
  demandDetail: false,
  flowTaskCommentList: () => [],
  disabled: () => [],
  detailData: () => ({}),
})

const router = useRouter()
const route = useRoute()

const activeName = ref('1')
const isDownload = ref(false)

const regionValue = ref<number[]>([])
const regionOptions = ref<ANY_OBJECT[]>([])

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
  pickBidFlag: '',
  demandIndustry: '',
  industryField: '',
  demandArea: '',
  servicePackageFlag: '',
  servicePackageAmount: '',
  bidPackageFlag: '',
  openTime: '',
  projectLevel: '',
  expertArea: '',
  consistentFlag: '',
  hasSecret: '',
  pickType: '',
  pickTypeReason: '',
  hasTemporaryFile: '',
  bidDoc: undefined,
  selectionRequestForm: undefined,
  partnerSelectionRequirement: undefined,
  selectionReviewPlan: undefined,
  technicalSpecification: undefined,
  contractMainTerms: undefined,
})

const schemeFormData = reactive<ANY_OBJECT>({
  schemeName: '',
  schemeNumber: '',
  replyEndTime: '',
  schemeMethod: '',
  schemeOrganization: '',
  agencyName: '',
  projectManager: '',
  schemeDesc: '',
  decisionLevel: '',
  decisionTime: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
  createUserCityName: '',
  hasTemporaryFile: '',
})

const bidPackageList = ref<ANY_OBJECT[]>([])
const noBidPackagePartners = ref<ANY_OBJECT[]>([])
const schemeDocFileList = ref<ANY_OBJECT[]>([])
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

const demandIndustryName = computed(() => {
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

const regionValueName = computed(() => {
  if (!regionValue.value || regionValue.value.length === 0)
    return '-'
  const path = findNodePath(regionOptions.value, regionValue.value)
  return path || '-'
})


function initDetailData(data: ANY_OBJECT) {
  if (data.pickDemand) {
    Object.assign(formData, data.pickDemand)
    regionValue.value = formData.demandArea ? formData.demandArea.split(',').map((item: string) => Number(item)) : []
    scenceRelChildrenFn(formData.demandIndustry, 'portalRealm')
    scenceRelChildrenFn('', 'portalIndustry')

    if (data.pickDemand.bidDocs) {
      bidDocFileList.value = Array.isArray(data.pickDemand.bidDocs) ? data.pickDemand.bidDocs : [data.pickDemand.bidDocs]
    }
    if (data.pickDemand.selectionRequestForm) {
      pickDemandFileList.value = Array.isArray(data.pickDemand.selectionRequestForm) ? data.pickDemand.selectionRequestForm : [data.pickDemand.selectionRequestForm]
    }
    if (data.pickDemand.partnerSelectionRequirement) {
      partnerDemandFileList.value = Array.isArray(data.pickDemand.partnerSelectionRequirement) ? data.pickDemand.partnerSelectionRequirement : [data.pickDemand.partnerSelectionRequirement]
    }
    if (data.pickDemand.selectionReviewPlan) {
      reviewPlanFileList.value = Array.isArray(data.pickDemand.selectionReviewPlan) ? data.pickDemand.selectionReviewPlan : [data.pickDemand.selectionReviewPlan]
    }
    if (data.pickDemand.technicalSpecification) {
      techStandardFileList.value = Array.isArray(data.pickDemand.technicalSpecification) ? data.pickDemand.technicalSpecification : [data.pickDemand.technicalSpecification]
    }
    if (data.pickDemand.contractMainTerms) {
      contractClauseFileList.value = Array.isArray(data.pickDemand.contractMainTerms) ? data.pickDemand.contractMainTerms : [data.pickDemand.contractMainTerms]
    }
  }

  if (data.pickOpportunity) {
    Object.assign(formData, {
      oppoName: data.pickOpportunity.oppoName,
      oppoCode: data.pickOpportunity.oppoCode,
      oppoOrg: data.pickOpportunity.oppoOrg,
      oppoIndustry: data.pickOpportunity.oppoIndustry,
      oppoSignedAmount: data.pickOpportunity.oppoSignedAmount,
      customerName: data.pickOpportunity.customerName,
    })
  }

  if (data.pickScheme) {
    Object.assign(schemeFormData, data.pickDemand, data.pickScheme);
    if (data.pickScheme.schemeDocs && Array.isArray(data.pickScheme.schemeDocs)) {
      schemeDocFileList.value = data.pickScheme.schemeDocs
    }
    if (data.pickScheme.decisionMeetings && Array.isArray(data.pickScheme.decisionMeetings)) {
      decisionMeetingFileList.value = data.pickScheme.decisionMeetings
    }
  }

  if (data.pickBidPackages && data.pickBidPackages.length > 0) {
    if (formData.bidPackageFlag === '0') {
      const firstPackage = data.pickBidPackages[0]
      formData.pickTypeReason = firstPackage.pickTypeReason
      noBidPackagePartners.value = firstPackage.pickPartners || []
    }
    else {
      bidPackageList.value = data.pickBidPackages.map((pkg: ANY_OBJECT) => ({
        ...pkg,
        bidPackageDocs: pkg.bidPackageDocs || [],
      }))
    }
  }
}

watch(() => props.detailData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    initDetailData(newData)
  }
}, { immediate: true })

function scenceRelChildrenFn(parentCodeId: string, type: string) {
  const parame = parentCodeId
    ? {
        typeCode: type,
        parentCodeId,
      }
    : {
        typeCode: type,
      }
  DictionaryController.scenceRelChildren(parame)
    .then((resp) => {
      const res = resp as any
      if (res && res.data) {
        res.data.forEach((item: ANY_OBJECT) => {
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
    .catch(() => {})
}

async function queryRegionList() {
  const res = await get(`${API_CONTEXT}/manage/area/selectCascadeByPid`, {})
  regionOptions.value = res.data
}

function fieldVisible(_fieldName: string) {
  return true
}

onMounted(() => {
  queryRegionList()
})
</script>

<template>
  <div class="mobile-detail">
    <div class="mobile-detail-content-wrapper">
      <div class="page-title">
        {{ flowEntryName }}{{ taskName ? `-${taskName}` : '' }}
      </div>
      <InfoHeader
        :create-user-name="schemeFormData.createUserName"
        :create-user-phone="schemeFormData.createUserPhone"
        :create-time="schemeFormData.createTime"
        :create-user-org="schemeFormData.createUserOrg"
        :create-user-city-name="schemeFormData.createUserCityName"
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
              <van-field label="甄选含税预算金额(万)">
                <template #input>
                  <span>{{ formData.budgetAmountTax ?? '-' }}</span>
                </template>
              </van-field>
              <van-field label="甄选不含税预算金额(万)">
                <template #input>
                  <span>{{ formData.budgetAmount ?? '-' }}</span>
                </template>
              </van-field>
              <van-field label="是否标后甄选">
                <template #input>
                  <span>{{ formData.pickBidFlag === '1' ? '是' : '否' }}</span>
                </template>
              </van-field>
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
              <van-field label="是否划分标包">
                <template #input>
                  <span>{{ formData.bidPackageFlag === '1' ? '是' : '否' }}</span>
                </template>
              </van-field>
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
            </div>

            <div class="section">
              <div class="section-subtitle">
                甄选方案基本信息
              </div>
              <van-field v-model="schemeFormData.schemeName" label="甄选方案名称" readonly />
              <van-field v-model="schemeFormData.schemeNumber" label="甄选方案编码" readonly />
              <van-field v-model="schemeFormData.replyEndTime" label="应答截止时间" readonly />
              <van-field label="执行甄选办法">
                <template #input>
                  <span>{{ schemeFormData.schemeMethod === '1' ? '竞价法' : schemeFormData.schemeMethod === '2' ? '综合评审法' : '-' }}</span>
                </template>
              </van-field>
              <van-field label="甄选组织方式">
                <template #input>
                  <span>{{ schemeFormData.schemeOrganization === '1' ? '自行组织' : schemeFormData.schemeOrganization === '2' ? '委托代理' : '-' }}</span>
                </template>
              </van-field>
              <van-field v-model="schemeFormData.agencyName" label="代理机构名称" readonly />
              <van-field v-model="schemeFormData.projectManager" label="项目经理" readonly />
              <van-field v-model="schemeFormData.schemeDesc" label="甄选方案描述" readonly type="textarea" autosize />

              <template v-if="formData.bidPackageFlag === '0'">
                <van-field v-model="formData.pickTypeReason" label="甄选方式理由" readonly type="textarea" autosize />
                <PartnerList
                  v-if="fieldVisible('合作伙伴列表')"
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
                  <!-- <van-cell title="最低应标数量" :value="pkg.minBidCount ?? '-'" /> -->
                  <van-cell title="标段金额不含税(万)" :value="pkg.bidPackage ?? '-'" />
                  <van-cell title="标段金额含税(万)" :value="pkg.bidPackageTax ?? '-'" />
                  <van-cell title="甄选方式理由" :value="pkg.pickTypeReason || '-'" />
                  <van-cell title="标段信息描述" :value="pkg.bidPackageDesc || '-'" />
                  <PartnerList
                    v-model:demandNumber="formData.demandNumber"
                    :bidPackageFlag="'1'"
                    v-model:data="bidPackageList[index]"
                    v-model:partners="bidPackageList[index].pickPartners"
                    :industry="formData.demandIndustry"
                    readOnly
                  />
                </div>
              </template>
            </div>

            <div class="section">
              <div class="section-subtitle">
                甄选方案决策信息
              </div>
              <van-field label="决策层级">
                <template #input>
                  <span>
                    {{ schemeFormData.decisionLevel === '1' ? '政企部部务会'
                      : schemeFormData.decisionLevel === '2' ? '跨部门评审'
                        : schemeFormData.decisionLevel === '3' ? '分管领导专题办公会'
                          : schemeFormData.decisionLevel === '4' ? '总经理办公会' : '-' }}
                  </span>
                </template>
              </van-field>
              <van-field v-model="schemeFormData.decisionTime" label="方案决策时间" readonly />
              <van-field label="附件文档中是否存在临时文件">
                <template #input>
                  <span>{{ schemeFormData.hasTemporaryFile === '1' ? '是' : '否' }}</span>
                </template>
              </van-field>
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

            <div class="section">
              <div class="section-subtitle">
                甄选方案基本信息
              </div>
              <van-cell title="甄选方案">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in schemeDocFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'schemeDoc', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!schemeDocFileList.length">-</span>
                  </div>
                </template>
              </van-cell>
            </div>

            <div class="section">
              <div class="section-subtitle">
                甄选方案决策信息
              </div>
              <van-cell title="方案决策会议纪要">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in decisionMeetingFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'decisionMeeting', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!decisionMeetingFileList.length">-</span>
                  </div>
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
