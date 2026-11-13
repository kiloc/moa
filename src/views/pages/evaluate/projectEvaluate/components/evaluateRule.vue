<template>
  <div class="section">
    <div class="section-subtitle">评估规则</div>
    <van-empty v-if="groupedList.length === 0" description="暂无评估规则" />
    <template v-else>
      <div v-for="group in groupedList" :key="group.parentId" class="rule-group">
        <van-cell :title="group.parentName" class="group-header" />
        <van-cell
          v-for="child in group.children"
          :key="child.childId"
          class="rule-item"
        >
          <template #title>
            <span class="item-name">{{ child.childName }}</span>
          </template>
          <template #label>
            <span class="item-label">子项分值：{{ child.maxScore }}</span>
            <span class="item-label">得分规则：{{ child.scoringRule }}</span>
          </template>
        </van-cell>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const currentType = ref('view')

// 分组数据结构
interface RuleChild {
  childId: string
  childName: string
  maxScore: number
  scoringRule: string
}

interface RuleGroup {
  parentId: string
  parentName: string
  children: RuleChild[]
}

const groupedList = ref<RuleGroup[]>([])
// 存储原始层级数据，供提交使用
const rawData = ref<any>(null)

// 将后端层级数据转换为分组列表
const transformToGroupedList = (data: any[]): RuleGroup[] => {
  if (!Array.isArray(data) || data.length === 0) return []
  return data.map(parent => ({
    parentId: parent.id,
    parentName: parent.name,
    children: (parent.subItemList || []).map((child: any) => ({
      childId: child.id,
      childName: child.name,
      maxScore: child.maxScore,
      scoringRule: child.scoringRule
    }))
  }))
}

// 供父组件调用：传入数据及类型（view/edit等）
const showData = (data: any, type: string = 'view') => {
  currentType.value = type
  rawData.value = data
  groupedList.value = transformToGroupedList(data)
}

// 供父组件调用：提交时返回原始层级数据
const handleSubmit = () => {
  return Promise.resolve(rawData.value)
}

defineExpose({
  showData,
  handleSubmit
})

// 如果父组件通过 prop 传入 data，自动显示
const props = defineProps<{
  data?: any
}>()

watch(
  () => props.data,
  (newVal) => {
    if (newVal) {
      showData(newVal, 'view')
    }
  },
  { immediate: true, deep: true }
)
</script>

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