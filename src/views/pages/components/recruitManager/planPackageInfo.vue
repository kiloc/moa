<template>
  <div class="section">
    <div class="section-subtitle">方案标包划分情况</div>
    
    <div v-for="(pkg, index) in bidPackages" :key="index" class="bid-package-card">
      <div class="package-header">
        <span class="package-title">标包{{ index + 1 }}</span>
      </div>
      
      <van-field :model-value="pkg.name" label="招募标段名称" type="textarea" readonly />
      <van-field :model-value="pkg.packageCode" label="招募标段编号" readonly />
      
      <van-field label="招募类型">
        <template #input>
          <span>{{ pkg.recruitmentType === 1 ? '定向招募' : '公开招募' }}</span>
        </template>
      </van-field>
      
      <van-field label="入围行业">
        <template #input>
          <span>{{ pkg.industryCodeName || '-' }}</span>
        </template>
      </van-field>
      
      <van-field label="行业领域">
        <template #input>
          <span>{{ pkg.fieldCode || '-' }}</span>
        </template>
      </van-field>
      
      <van-field label="场景子库">
        <template #input>
          <span>{{ pkg.sceneCode || '-' }}</span>
        </template>
      </van-field>
      
      <van-field :model-value="pkg.description" label="招募需求说明" type="textarea" readonly />
      
      <div class="section" v-if="pkg.fieldQualificationRels.length">
        <div class="section-subtitle">资质要求</div>
        <div class="qualification-table">
          <div class="qualification-row header">
            <div class="col-name">资质名称</div>
            <div class="col-level">备注</div>
          </div>
          <div class="qualification-row" v-for="(item, idx) in displayFieldQualificationRels(pkg.fieldQualificationRels)" :key="idx">
            <div class="col-name">{{ item.qualificationName || '-' }}</div>
            <div class="col-level">{{ item.qualificationLevel || '-' }}</div>
          </div>
        </div>
      </div>

      <div v-if="pkg.recruitmentType === 1 && pkg.directedPartners?.length" class="partner-section">
        <PartnerList :list-data="pkg.directedPartners" label="合作伙伴列表" />
      </div>
    </div>
    
    <van-empty v-if="!bidPackages.length" description="暂无标包信息" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PartnerList from '@/views/pages/components/common/partner-list.vue'

const bidPackages = ref<any[]>([])

const showData = (data: any[], type: string) => {
  bidPackages.value = (data || []).map((bp: any) => {
    bp.sceneRels = bp.sceneRels || []
    const fieldNames = bp.sceneRels.map((x: { fieldName: any }) => x.fieldName)
    bp.fieldCode = [...new Set(fieldNames.filter(Boolean))].join('、') || '-'
    
    const sceneNames = bp.sceneRels.map((x: { sceneName: any; sceneCode: any }) => x.sceneName || x.sceneCode)
    bp.sceneCode = [...new Set(sceneNames.filter(Boolean))].join('、') || '-'
    
    const industryNames = bp.sceneRels.map((x: { industryName: any; industryCode: any }) => x.industryName || x.industryCode)
    bp.industryCodeName = [...new Set(industryNames.filter(Boolean))].join('、') || '-'
    
    bp.directedPartners = bp.directedPartners || []
    
    bp.description = bp.description || bp.bidPackage?.description || ''
    bp.name = bp.name || bp.bidPackage?.name || ''
    bp.packageCode = bp.packageCode || bp.bidPackage?.packageCode || ''
    bp.recruitmentType = bp.recruitmentType !== undefined ? bp.recruitmentType : bp.bidPackage?.recruitmentType || 0
    
    bp.fieldQualificationRels = bp.fieldQualificationRels || bp.bidPackage?.fieldQualificationRels || []
    
    return bp
  })
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

const handleSubmit = () => {
  return new Promise((resolve) => {
    resolve(bidPackages.value)
  })
}

defineExpose({
  handleSubmit,
  showData,
})
</script>

<style scoped lang="scss">
</style>
