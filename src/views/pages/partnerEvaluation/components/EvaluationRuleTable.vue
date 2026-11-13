<script setup lang="ts">
import { computed } from 'vue'
import type { ANY_OBJECT } from '@/types/generic'

const props = defineProps<{
  isHide?: Boolean
  modelValue: ANY_OBJECT[]
}>()

const groupedData = computed(() => {
  const groups: Record<string, ANY_OBJECT[]> = {}
    props.modelValue.forEach((item: any) => {
    const name = item.name || '未分类'
    if (!groups[name]) {
      groups[name] = []
    }
    groups[name].push(item)
  })
  return groups
})
</script>

<template>
  <div class="section">
    <div class="section-subtitle">评估规则</div>
    <van-empty v-if="modelValue.length === 0" description="暂无评估规则" />
    <template v-else>
      <div v-for="(items, name) in groupedData" :key="name" class="rule-group">
        <van-cell :title="name" class="group-header" />
        <van-cell
          v-for="(item, index) in items"
          :key="index"
          class="rule-item"
        >
          <template #title>
            <span class="item-name">{{ item.subItemName || '--' }}</span>
          </template>
          <template #label>
            <span class="item-label">子项分值：{{ item.maxScore ?? '--' }}</span>
            <span class="item-label">得分规则：{{ item.scoringRule || '--' }}</span>
            <span v-if="item.description && !props.isHide" class="item-label">考核指标说明：{{ item.description }}</span>
            <span v-if="item.score !== undefined && !props.isHide" class="item-label">评分：{{ item.score ?? '--' }}</span>
          </template>
        </van-cell>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.rule-group {
  .group-header {
    background-color: #f2f3f5;
    font-weight: 500;
    font-size: 15px;
    padding: 10px 16px;
    --van-cell-horizontal-padding: 16px;
  }

  .rule-item {
    padding: 12px 16px;
    border-bottom: 1px solid #ebedf0;

    .item-name {
      font-size: 14px;
      color: #323233;
      font-weight: 500;
    }

    .item-label {
      font-size: 12px;
      color: #969799;
      margin-right: 12px;

      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
}
</style>