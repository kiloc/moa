<template>
  <div class="section">
    <div class="section-subtitle">评估结果</div>
    <van-empty v-if="listData.length === 0" description="暂无评估结果" />
    <template v-else>
      <div v-for="item in listData" :key="item.partnerId || item.id" class="result-card">
        <van-cell title="合作伙伴名称" :value="item.partnerName" />
        <van-cell title="是否评分" :value="item.isValid ? '是' : '否'" />
        <van-cell v-if="item.isValid" title="评估得分" :value="item.totalScore" />
        <van-cell v-if="!props.isHideLevel" title="评估等级" :value="item.gradeName || item.grade" />
        <van-cell title="评估人员" :value="item.evaluatorName || item.evaluator || item.createUserName || item.evaluatorUserName"/>
        <van-cell title="评估人员部门" :value="item.evaluatorDeptName || item.deptName || item.createUserOrg" />
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const currentType = ref('view')
const listData = ref<any[]>([])
const rawData = ref<any[] | null>(null)
const scoreVisible = ref(false)
const currRow = ref<any>({})

// 外部传入的禁用状态
const props = defineProps<{
  isHideLevel?: boolean
  data?: any[]
  disabled?: boolean
}>()

const showScoreDetail = (row: any) => {
  currRow.value = row
  scoreVisible.value = true
}

// 供父组件调用：传入数据及类型
const showData = (data: any[], type: string = 'view') => {
  currentType.value = type
  rawData.value = data
  listData.value = Array.isArray(data) ? data : []
}

// 供父组件调用：提交时返回原始数据
const handleSubmit = () => {
  return Promise.resolve(rawData.value)
}

defineExpose({
  showData,
  handleSubmit
})

// 监听 prop data 变化
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
.result-card {
  border: 1px solid #ebedf0;
  margin-bottom: 10px;
  overflow: hidden;
  border-radius: 10px;
}
</style>