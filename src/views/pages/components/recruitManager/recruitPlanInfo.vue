<template>
  <div class="recruit-plan-basic">
    <!-- 方案基本信息 -->
    <div class="section">
      <div class="section-subtitle">招募方案基本信息</div>
      <van-field :model-value="displayData.name" type="textarea" label="招募方案名称" readonly />
      <van-field :model-value="displayData.planCode" label="招募方案编号" readonly />
      <van-field label="是否划分标包">
        <template #input>
          <span>{{ displayData.isDividePackage === 1 ? '是' : '否' }}</span>
        </template>
      </van-field>

      <template v-if="displayData.isDividePackage === 0">
        <van-field label="入围行业">
          <template #input>
            <span>{{ displayData.industryCodeName || '' }}</span>
          </template>
        </van-field>
        <van-field label="行业领域">
          <template #input>
            <span>{{ displayData.fieldCode || '' }}</span>
          </template>
        </van-field>
        <van-field label="场景子库">
          <template #input>
            <span>{{ displayData.sceneCode || '' }}</span>
          </template>
        </van-field>
        <van-field label="招募类型">
          <template #input>
            <span>{{ displayData.recruitmentType === 1 ? '定向招募' : '公开招募' }}</span>
          </template>
        </van-field>
      </template>

      <van-field label="应答截止时间" v-if="props.isShow">
        <template #input>
          <span>{{ displayData.endTime || '' }}</span>
        </template>
      </van-field>
      <van-field label="入围有效期">
        <template #input>
          <span>{{ validityPeriodText }}</span>
        </template>
      </van-field>
      <van-field label="代理机构名称">
        <template #input>
          <span>{{ agencyName }}</span>
        </template>
      </van-field>
      <van-field label="招标代理">
        <template #input>
          <span>{{ agentName }}</span>
        </template>
      </van-field>
      <van-field :model-value="displayData.description" label="招募方案描述" type="textarea" readonly rows="2" autosize />
    </div>

    <!-- 资质要求（仅未划分标包时显示） -->
    <div class="section" v-if="displayData.isDividePackage === 0 && qualificationList.length">
      <div style="margin-bottom: 10px;">资质要求</div>
      <div class="qualification-table">
        <div class="qualification-row header">
          <div class="col-name">资质名称</div>
          <div class="col-level">备注</div>
        </div>
        <div class="qualification-row" v-for="(item, idx) in displayFieldQualificationRels(qualificationList)" :key="idx">
          <div class="col-name">{{ item.qualificationName || '-' }}</div>
          <div class="col-level">{{ item.qualificationLevel || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- 合作伙伴列表（定向招募且未划分标包时） -->
    <div class="section" v-if="displayData.recruitmentType === 1 && displayData.isDividePackage === 0">
      <!-- <div class="section-subtitle">合作伙伴列表</div> -->
      <PartnerList :list-data="displayData.directedPartners || []" label="合作伙伴列表" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, defineProps } from 'vue'
import { getToken } from '@/common/utils'
import { API_CONTEXT } from '@/api/config'
import PartnerList from '@/views/pages/components/common/partner-list.vue'
import { RecruitPlanManagerController } from '@/api/recruitManager/recruitPlanManager'
import { SysUserController } from '@/api/generated'
import { useDictMapStore } from '@/store'

// 展示数据
const displayData = reactive({
  name: '',
  planCode: '',
  isDividePackage: 0,
  recruitmentType: 0,
  endTime: '',
  validityPeriod: 2,
  agencyId: '',
  agentId: '',
  description: '',
  recruitmentPlanFiles: [] as any[],
  industryCodeName: '',
  fieldCode: '',
  sceneCode: '',
  directedPartners: [] as any[],
})

const props = defineProps<{
  isShow?: boolean
}>()

const qualificationList = ref<any[]>([])
const agencyName = ref('')
const agentName = ref('')
const validityPeriodText = computed(() => (displayData.validityPeriod ? `${displayData.validityPeriod}年` : ''))

// 工具函数
const uniqueById = (list: any[] = []) => {
  const map = new Map<string, any>()
  list.forEach(it => {
    if (it && it.id != null && !map.has(String(it.id))) map.set(String(it.id), it)
  })
  return Array.from(map.values())
}

// 处理 sceneRels → 展示行业/领域/场景文本
const processSceneRels = (sceneRels: any[]) => {
  if (!sceneRels?.length) {
    displayData.industryCodeName = ''
    displayData.fieldCode = ''
    displayData.sceneCode = ''
    return
  }

  const industryNameSet = new Set()
  const industryCodeSet = new Set()
  const fieldNameMap = new Map() // fieldName -> { industryCode -> fieldCode }
  const sceneNameMap = new Map() // sceneName -> { industryCode -> sceneCode }
  const fieldNameList: any[] = []
  const sceneNameList: any[] = []

  sceneRels.forEach(item => {
    industryCodeSet.add(item.industryCode)
    industryNameSet.add(item.industryName)

    const fieldName = item.fieldName || item.fieldCode
    const sceneName = item.sceneName || item.sceneCode

    if (fieldName) {
      if (!fieldNameMap.has(fieldName)) fieldNameMap.set(fieldName, {})
      fieldNameMap.get(fieldName)[item.industryCode] = item.fieldCode
      fieldNameList.push({ id: fieldName, name: fieldName })
    }
    if (sceneName) {
      if (!sceneNameMap.has(sceneName)) sceneNameMap.set(sceneName, {})
      sceneNameMap.get(sceneName)[item.industryCode] = item.sceneCode
      sceneNameList.push({ id: sceneName, name: sceneName })
    }
  })

  const industryCodes = Array.from(industryCodeSet) as string[]
  const isMultiIndustry = industryCodes.length > 1

  displayData.industryCodeName = Array.from(industryNameSet).join('、')

  if (isMultiIndustry) {
    const uniqueFields = uniqueById(fieldNameList)
    const uniqueScenes = uniqueById(sceneNameList)
    displayData.fieldCode = uniqueFields.map(f => f.name).join('、')
    displayData.sceneCode = uniqueScenes.map(s => s.name).join('、')
  } else {
    const onlyIndustry = industryCodes[0]
    displayData.fieldCode = fieldNameList.map(f => f.name).join('、')

    const sceneNames = sceneNameList.map(s => s.name)
    displayData.sceneCode = Array.from(new Set(sceneNames)).join('、')
  }
}

// 获取资质要求
const getFieldQualificationRels = (fieldCode: string) => {
  if (!fieldCode) return
  RecruitPlanManagerController.selectByFieldCode({ fieldCode })
    .then(resp => {
      const res = resp as any
      if (res?.data) {
        qualificationList.value = res.data.map((item: any) => {
          delete item.id
          return item
        })
      }
    })
    .catch(() => {})
}

const displayFieldQualificationRels = (fieldQualificationRels: any[]) => {
  const qlNames = new Set<string>()
  return fieldQualificationRels.filter((item) => {
    if (qlNames.has(item.qualificationName)) {
      return false
    }
    qlNames.add(item.qualificationName)
    return true
  })
}

// 加载代理机构和招标代理名称
const dictMapStore = useDictMapStore()
const loadAgencyAndAgent = async () => {
  if (displayData.agencyId) {
    const agencyList = dictMapStore.dictMap['agencyName'] || []
    const agency = agencyList.find((a: any) => String(a.id) === String(displayData.agencyId))
    agencyName.value = agency?.name || ''
  }
  if (displayData.agentId) {
    try {
      const res = await SysUserController.getSysUserListByDeptIds({ deptIds: displayData.agencyId })
      const agent = (res.data || []).find((u: any) => u.loginName === displayData.agentId)
      agentName.value = agent?.showName || ''
    } catch (e) {}
  }
}

// 文件下载
const downloadFile = (file: any) => {
  const token = getToken()
  const url = `${API_CONTEXT}/manage/file/download?fieldName=recruitmentPlanFiles&filename=${encodeURIComponent(file.fileName)}&asImage=false&Authorization=${encodeURIComponent(token || '')}`
  window.open(url, '_blank')
}

// 对外暴露的 showData 方法（接收原始数据，自动渲染）
const showData = (data: any, type?: string) => {
  // 方案基础信息
  const plan = data.recruitmentPlan || {}
  Object.assign(displayData, {
    name: plan.name || '',
    planCode: plan.planCode || '',
    isDividePackage: plan.isDividePackage ?? 0,
    recruitmentType: plan.recruitmentType ?? 0,
    endTime: plan.endTime || '',
    validityPeriod: plan.validityPeriod ?? 2,
    agencyId: plan.agencyId || '',
    agentId: plan.agentId || '',
    description: plan.description || '',
    recruitmentPlanFiles: plan.recruitmentPlanFiles || [],
  })
  displayData.directedPartners = data.directedPartners || plan.directedPartners || []
  
  if (displayData.recruitmentType === 1 && data.recruitmentDemandDetail?.directedPartners) {
    displayData.directedPartners = data.recruitmentDemandDetail.directedPartners
  }

  // 场景关联处理
  let sceneRels = data.sceneRels || []
  if (data.recruitmentDemandDetail?.sceneRels) {
    sceneRels = data.recruitmentDemandDetail.sceneRels
  }
  processSceneRels(sceneRels)

  // 资质要求（优先使用外部传入，否则根据领域编码获取）
  if (data.fieldQualificationRels && data.fieldQualificationRels.length) {
    qualificationList.value = data.fieldQualificationRels
  } else if (displayData.fieldCode) {
    getFieldQualificationRels(displayData.fieldCode)
  } else if (sceneRels[0]?.fieldCode) {
    getFieldQualificationRels(sceneRels[0].fieldCode)
  }

  // 代理机构/招标代理名称
  loadAgencyAndAgent()
}

defineExpose({ showData })
</script>

<style scoped lang="scss">
// .recruit-plan-basic {
//   background-color: #f5f5f5;
//   padding: 12px;
// }

// .section {
//   background-color: #fff;
//   border-radius: 8px;
//   margin-bottom: 16px;
//   overflow: hidden;
// }

// .section-subtitle {
//   font-weight: 500;
//   font-size: 16px;
//   color: #333;
//   padding: 12px 16px 8px;
//   border-left: 3px solid #4a90e5;
//   margin-left: 12px;
// }

// .qualification-table {
//   margin: 0 12px 12px;
//   border: 1px solid #ebedf0;
//   border-radius: 6px;
//   overflow: hidden;
//   .qualification-row {
//     display: flex;
//     border-bottom: 1px solid #ebedf0;
//     &:last-child {
//       border-bottom: none;
//     }
//     &.header {
//       background-color: #f7f8fa;
//       font-weight: 500;
//       color: #323233;
//     }
//     .col-name {
//       flex: 2;
//       padding: 10px 12px;
//       word-break: break-word;
//     }
//     .col-level {
//       flex: 1.5;
//       padding: 10px 12px;
//       word-break: break-word;
//       border-left: 1px solid #ebedf0;
//     }
//   }
// }

// .file-list {
//   padding: 0 12px 12px;
//   .file-item {
//     font-size: 14px;
//     color: #4a90e5;
//     cursor: pointer;
//     text-decoration: underline;
//     margin-bottom: 6px;
//   }
// }

// :deep(.van-field) {
//   background-color: #fff;
//   .van-field__label {
//     color: #666;
//   }
//   .van-field__value {
//     color: #333;
//   }
// }
</style>