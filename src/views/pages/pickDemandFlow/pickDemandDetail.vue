<script setup lang="ts">
import type { DictData } from '@/common/staticDict/types'
import type { DropdownOptions, ListData } from '@/common/types/list'
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_CONTEXT } from '@/api/config'
import { PickDemandController } from '@/api/generated'
import { DictionaryController } from '@/api/system'
import { get } from '@/common/http/request'
import { appBack, downloadAppFile } from '@/common/utils'
import { useLayoutStore } from '@/store'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import PartnerList from '@/views/pages/components/partnerList/indexDemand.vue'
import 'vant/es/toast/style'

// 定义 props
interface Props {
  flowEntryName: string
  demandNumber?: string
  hideHeader?: boolean
  hideBack?: boolean
  demandDetail?: boolean
  flowTaskCommentList?: any[]
  disabled?: string[]
  taskName: string
}

const props = withDefaults(defineProps<Props>(), {
  flowEntryName: '',
  taskName: '需求三级经理审批',
  demandNumber: '',
  hideHeader: true,
  hideBack: true,
  demandDetail: false,
  flowTaskCommentList: () => [],
  disabled: () => [],
})

const activeName = ref('1')
const isDownload = ref(false)

const demandIndustryName = computed(() => {
  return demandIndustryWidgetDropdownList.value.find(item => item.id === formData.demandIndustry)?.name || '-'
})

const industryFieldName = computed(() => {
  return industryFieldWidgetDropdownList.value.find(item => item.id === formData.industryField)?.name || '-'
})

function findNodePath(nodes: any[], targetIds: number[], currentPath: string[] = []): string | null {
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

const router = useRouter()
const route = useRoute()
const layoutStore = useLayoutStore()

const isPage = computed(() => {
  if (route.path === '/pickDemandDetail') {
    return true
  }
  return false
})

function fieldVisible(fieldName: string) {
  // if (props.disabled.includes(fieldName)) {
  //   return false;
  // }
  return true
}

const regionValue = ref([])
const regionOptions = ref([])

const detailData = reactive<ANY_OBJECT>({
  pickDemand: null,
  pickOpportunity: null,
  pickBidPackages: [],
})

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
})

function getFormData() {
  return formData
}

defineExpose({
  getFormData,
})

const bidPackageList = ref<ANY_OBJECT[]>([])
const noBidPackagePartners = ref<ANY_OBJECT[]>([])
const bidDocFileList = ref<ANY_OBJECT[]>([])
const pickDemandFileList = ref<ANY_OBJECT[]>([])
const partnerDemandFileList = ref<ANY_OBJECT[]>([])
const reviewPlanFileList = ref<ANY_OBJECT[]>([])
const techStandardFileList = ref<ANY_OBJECT[]>([])
const contractClauseFileList = ref<ANY_OBJECT[]>([])

const demandIndustryDropdownList = ref<ANY_OBJECT[]>([])
const industryFieldDropdownList = ref<ANY_OBJECT[]>([])
const demandSceneDropdownList = ref<ANY_OBJECT[]>([])

function getDropdownName(list: ANY_OBJECT[], id: string) {
  if (!id || !list || list.length === 0)
    return ''
  const item = list.find((item: ANY_OBJECT) => item.id === id)
  return item ? item.name : ''
}

function loadDropdownData() {
  DictionaryController.scenceRelChildren({ typeCode: 'portalIndustry' })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item: ANY_OBJECT) => {
          item.id = item.codeId
          item.name = item.codeName
        })
        demandIndustryDropdownList.value = res.data
      }
    })
    .catch((e) => {})

  DictionaryController.scenceRelChildren({ typeCode: 'portalRealm' })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item: ANY_OBJECT) => {
          item.id = item.codeId
          item.name = item.codeName
        })
        industryFieldDropdownList.value = res.data
      }
    })
    .catch((e) => {})

  DictionaryController.scenceRelChildren({ typeCode: 'partnerScence' })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item: ANY_OBJECT) => {
          item.id = item.codeId
          item.name = item.codeName
        })
        demandSceneDropdownList.value = res.data
      }
    })
    .catch((e) => {})
}


function loadDetail() {
  const demandNumber = props.demandNumber || route.query.demandNumber || route.query.businessKey
  if (!demandNumber) {
    showToast('缺少需求编号参数')
    if (!props.hideBack) {
      appBack()
      // router.back()
    }
    return
  }

  PickDemandController.queryDemand({ demandNumber })
    .then((res) => {
      if (res.data) {
        Object.assign(detailData, res.data)

        if (res.data.pickDemand) {
          Object.assign(formData, res.data.pickDemand)

          regionValue.value = formData.demandArea ? formData.demandArea.split(',').map(item => Number(item)) : []

          if (res.data.pickDemand.bidDocs && Array.isArray(res.data.pickDemand.bidDocs)) {
            bidDocFileList.value = res.data.pickDemand.bidDocs
          }

          if (res.data.pickDemand.selectionRequestForm && Array.isArray(res.data.pickDemand.selectionRequestForm)) {
            pickDemandFileList.value = res.data.pickDemand.selectionRequestForm
          }

          if (res.data.pickDemand.partnerSelectionRequirement && Array.isArray(res.data.pickDemand.partnerSelectionRequirement)) {
            partnerDemandFileList.value = res.data.pickDemand.partnerSelectionRequirement
          }

          if (res.data.pickDemand.selectionReviewPlan && Array.isArray(res.data.pickDemand.selectionReviewPlan)) {
            reviewPlanFileList.value = res.data.pickDemand.selectionReviewPlan
          }

          if (res.data.pickDemand.technicalSpecification && Array.isArray(res.data.pickDemand.technicalSpecification)) {
            techStandardFileList.value = res.data.pickDemand.technicalSpecification
          }

          if (res.data.pickDemand.contractMainTerms && Array.isArray(res.data.pickDemand.contractMainTerms)) {
            contractClauseFileList.value = res.data.pickDemand.contractMainTerms
          }

          scenceRelChildrenFn(formData.demandIndustry, 'portalRealm')
          scenceRelChildrenFn('', 'portalIndustry')
        }

        if (res.data.pickOpportunity) {
          Object.assign(formData, {
            oppoName: res.data.pickOpportunity.oppoName,
            oppoCode: res.data.pickOpportunity.oppoCode,
            oppoOrg: res.data.pickOpportunity.oppoOrg,
            oppoIndustry: res.data.pickOpportunity.oppoIndustry,
            oppoSignedAmount: res.data.pickOpportunity.oppoSignedAmount,
            customerName: res.data.pickOpportunity.customerName,
          })
        }

        if (res.data.pickBidPackages && res.data.pickBidPackages.length > 0) {
          if (formData.bidPackageFlag === '0') {
            const firstPackage = res.data.pickBidPackages[0]
            formData.pickTypeReason = firstPackage.pickTypeReason
            noBidPackagePartners.value = firstPackage.pickPartners || []
          }
          else {
            bidPackageList.value = res.data.pickBidPackages.map((pkg: ANY_OBJECT) => ({
              ...pkg,
              bidPackageDocs: pkg.bidPackageDocs || [],
            }))
          }
        }
      }
    })
    .catch((e) => {
      showToast('加载详情失败')
      console.error(e)
    })
}

function onBack() {
  appBack()
  // router.back()
}

watch(
  () => props.demandNumber,
  (newVal) => {
    if (newVal) {
      loadDetail()
    }
  },
  { immediate: false },
)

function loadPickTypeDropdownList(): Promise<ListData<DictData>> {
  return new Promise((resolve, reject) => {
    DictionaryController.dictGlobalDict({ dictCode: 'PICK_TYPE', itemIdType: 'String' })
      .then((res) => {
        resolve({
          dataList: res.getList(),
        })
      })
      .catch((e) => {
        reject(e)
      })
  })
}

const pickTypeOptions: DropdownOptions<DictData> = {
  loadData: loadPickTypeDropdownList,
  isTree: false,
}

function scenceRelChildrenFn(parentCodeId: string, type: string) {
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
        res.data.forEach((item) => {
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

const demandSceneWidgetDropdownList = ref([])
const demandIndustryWidgetDropdownList = ref([])
const industryFieldWidgetDropdownList = ref([])

async function queryRegionList() {
  const param = {}
  const res = await get(`${API_CONTEXT}/manage/area/selectCascadeByPid`, param)
  regionOptions.value = res.data
}

onMounted(() => {
  loadDetail()
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
        :create-user-name="detailData?.pickDemand?.createUserName"
        :create-user-phone="detailData?.pickDemand?.createUserPhone"
        :create-time="detailData?.pickDemand?.createTime"
        :create-user-org="detailData?.pickDemand?.createUserOrg"
        :create-user-city-name="detailData?.pickDemand?.createUserCityName"
      />

      <van-tabs v-model:active="activeName" type="card">
        <van-tab title="业务信息" name="1">
          <div class="tab-content">
            <!-- 甄选需求信息 -->
            <div class="section">
              <div class="section-subtitle">
                甄选需求信息
              </div>
              <van-field label="甄选需求名称">
                <template #input>
                  <span>{{ formData.demandName }}</span>
                </template>
              </van-field>
              <van-field label="甄选需求编号">
                <template #input>
                  <span>{{ formData.demandNumber }}</span>
                </template>
              </van-field>
              <van-field label="商机名称">
                <template #input>
                  <span>{{ formData.oppoName }}</span>
                </template>
              </van-field>
              <van-field label="商机编码">
                <template #input>
                  <span>{{ formData.oppoCode }}</span>
                </template>
              </van-field>
              <van-field label="归属分公司">
                <template #input>
                  <span>{{ formData.oppoOrg }}</span>
                </template>
              </van-field>
              <van-field label="商机归属行业">
                <template #input>
                  <span>{{ formData.oppoIndustry }}</span>
                </template>
              </van-field>
              <van-field label="商机预估签约金额">
                <template #input>
                  <span>{{ formData.oppoSignedAmount ?? '-' }}</span>
                </template>
              </van-field>
              <van-field label="客户名称">
                <template #input>
                  <span>{{ formData.customerName }}</span>
                </template>
              </van-field>
              <van-field label="要求完成时间">
                <template #input>
                  <span>{{ formData.completeTime }}</span>
                </template>
              </van-field>
              <van-field label="甄选不含税预算金额(万)">
                <template #input>
                  <span>{{ formData.budgetAmount }}</span>
                </template>
              </van-field>
              <van-field label="甄选含税预算金额(万)">
                <template #input>
                  <span>{{ formData.budgetAmountTax }}</span>
                </template>
              </van-field>
              <van-field label="是否标后甄选">
                <template #input>
                  <span>{{ formData.pickBidFlag === '1' ? '是' : '否' }}</span>
                </template>
              </van-field>
              <van-field label="是否划分标包">
                <template #input>
                  <span>{{ formData.bidPackageFlag === '1' ? '是' : '否' }}</span>
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
              <van-field label="客户项目开标时间">
                <template #input>
                  <span>{{ formData.openTime }}</span>
                </template>
              </van-field>
              <!-- <template v-if="!demandDetail">
                <van-field v-model="formData.createUserName" label="需求发起人" readonly />
                <van-field v-model="formData.createUserOrg" label="发起单位/部门" readonly />
                <van-field v-model="formData.createTime" label="发起时间" readonly />
                <van-field v-model="formData.createUserPhone" label="发起人联系方式" readonly />
              </template> -->
              <van-field label="项目等级">
                <template #input>
                  <span>{{ formData.projectLevel }}</span>
                </template>
              </van-field>
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
              <van-field label="甄选方式">
                  <template #input>
                    <span>{{ formData.pickType }}</span>
                  </template>
                </van-field>
              <!-- 不划分标包时显示甄选方式和理由 -->
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
                <div class="section-subtitle bid-package-list">
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
                    v-model:demand-number="formData.demandNumber"
                    v-model:data="bidPackageList[index]"
                    v-model:partners="bidPackageList[index].pickPartners"
                    bid-package-flag="1"
                    :industry="formData.demandIndustry"
                    read-only
                  />
                </div>
              </template>
            </div>
          </div>
        </van-tab>
        <van-tab title="流程信息" name="2">
          <div class="tab-content">
            <div class="section">
              <approvalTimeline v-if="props.flowTaskCommentList.length > 0" :list="props.flowTaskCommentList" />
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
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
