<template>
  <div class="section">
    <div class="section-subtitle">招募需求信息</div>

    <van-field :model-value="displayData.name" type="textarea" label="招募需求名称" readonly />
    <van-field :model-value="displayData.demandCode" label="招募需求编号" readonly />
    <van-field label="是否划分标包">
      <template #input>
        <span>{{ displayData.isDividePackage === 1 ? '是' : '否' }}</span>
      </template>
    </van-field>

    <template v-if="displayData.isDividePackage === 0">
      <van-field label="入围行业">
        <template #input>
          <span>{{ displayData.industryCodeName }}</span>
        </template>
      </van-field>
      <van-field label="行业领域">
        <template #input>
          <span>{{ displayData.fieldCode }}</span>
        </template>
      </van-field>
      <van-field label="场景子库">
        <template #input>
          <span>{{ displayData.sceneCode }}</span>
        </template>
      </van-field>
      <van-field label="招募类型">
        <template #input>
          <span>{{ displayData.recruitmentType === 1 ? '定向招募' : '公开招募' }}</span>
        </template>
      </van-field>
    </template>

    <van-field label="招募结束时间">
      <template #input>
        <span>{{ displayData.endTime }}</span>
      </template>
    </van-field>
    <van-field v-model="displayData.cityName" label="地市" readonly />
    <van-field v-model="displayData.description" label="招募需求说明" type="textarea" readonly />
    <van-field v-model="displayData.content" label="招募内容" type="textarea" readonly rows="2" autosize />

    <template v-if="displayData.recruitmentType === 1 && displayData.isDividePackage === 0 && !isRecruitToPlan">
      <PartnerList :list-data="displayData.directedPartners || []" label="合作伙伴列表" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import PartnerList from '@/views/pages/components/common/partner-list.vue'
import { RecruitDemandManagerController } from '@/api/recruitManager/recruitDemandManager'

// 展示数据
const displayData = reactive({
  name: '',
  demandCode: '',
  isDividePackage: 0,
  endTime: '',
  cityName: '',
  description: '',
  content: '',
  industryCodeName: '',
  fieldCode: '',
  sceneCode: '',
  recruitmentType: 0,
  directedPartners: [] as any[],
})

const isRecruitToPlan = ref(false)

// 辅助函数
const toOptions = (list: any[] = []) =>
  (list || []).map((item: any) => ({
    id: item.codeId,
    name: item.codeName,
  }))

const uniqueById = (list: any[] = []) => {
  const map = new Map<string, any>()
  list.forEach((it) => {
    if (it && it.id != null && !map.has(String(it.id))) {
      map.set(String(it.id), it)
    }
  })
  return Array.from(map.values())
}

// 核心数据处理逻辑（原 PC 组件的 showData 核心）
const processData = (data: any, type: string, recruitToPlan: string) => {
  if (recruitToPlan === 'recruitToPlan') {
    isRecruitToPlan.value = true
  }

  // 基础字段赋值
  displayData.name = data.name || ''
  displayData.demandCode = data.demandCode || ''
  displayData.isDividePackage = data.isDividePackage ?? 0
  displayData.endTime = data.endTime || ''
  displayData.cityName = data.cityName || data.initiatorInfo?.createUserCityName || ''
  displayData.description = data.description || ''
  displayData.content = data.content || ''
  displayData.recruitmentType = data.recruitmentType ?? 0
  displayData.directedPartners = data.directedPartners || []

  // 处理 sceneRels 生成行业/领域/场景展示文本
  const sceneRels = data.sceneRels || []
  const industryCodeSet = new Set()
  const industryNameSet = new Set()
  const fieldNameMap = new Map() // fieldName -> { industryCode -> fieldCode }
  const sceneNameMap = new Map() // sceneName -> { industryCode -> sceneCode }
  const fieldNameList: any[] = []
  const sceneNameList: any[] = []

  sceneRels.forEach((item: any) => {
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
    displayData.fieldCode = uniqueFields.map(f => f.id).join('、')
    displayData.sceneCode = uniqueScenes.map(s => s.id).join('、')
  } else {
    const fieldName = fieldNameList[0]?.name
    displayData.fieldCode = fieldName || ''

    const sceneNames = Array.from(new Set(sceneNameList.map(s => s.name)))
    displayData.sceneCode = sceneNames.join('、')
  }
}

// 对外暴露的 showData 方法
const showData = (data: any, type: string, recruitToPlan?: string) => {
  processData(data, type, recruitToPlan || '')
}

defineExpose({ showData })
</script>

<style scoped lang="scss">
.section {
  margin-bottom: 16px;
}
.section-subtitle {
  font-weight: 500;
  color: #333333;
  margin-bottom: 10px;
  padding-left: 7px;
  border-left: 3px solid #4a90e5;
}
</style>