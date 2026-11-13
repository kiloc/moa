<template>
  <div class="section">
    <div class="section-subtitle">招募方案决策信息</div>
    <van-cell title="决策层级">
      <span>{{ decisionLevelText }}</span>
    </van-cell>
    <van-cell title="决策时间">
      <span>{{ props.decisionTime }}</span>
    </van-cell>
    <van-cell title="方案决策会议纪要">
      <template #value>
        <div class="file-list">
          <div
            v-for="file in props.fileList"
            :key="file.fileName"
            class="file-item"
            @click="downloadAppFile(file.name || file.originalName, 'recruitmentPlanDecisionFiles', file.filename||file.fileName)"
          >
            <span>{{ file.originalName }}</span>
          </div>
          <span v-if="!props.fileList.length">-</span>
        </div>
      </template>
    </van-cell>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { downloadAppFile } from '@/common/utils'

const props = defineProps({
  fileList: {
    type: Array,
    default: () => []
  },
  decisionTime: {
    type: String,
    default: ''
  },
  decisionLevel: {
    type: String || Number,
    default: ''
  }
})

const decisionLevelText = computed(() => {
  if (!props.decisionLevel) return ''
  const level = parseInt(props.decisionLevel)
  const levelMap: Record<number, string> = {
    1: '分管领导专题办公会',
    2: '总经理办公会',
  }
  return levelMap[level] || props.decisionLevel
})


</script>

<style scoped lang="scss">
</style>
