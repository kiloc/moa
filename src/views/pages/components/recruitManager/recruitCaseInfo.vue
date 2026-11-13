<template>
  <div class="section">
    <div class="section-subtitle">招募方案信息</div>
    <van-field
      :model-value="formData.name"
      label="招募方案名称"
      readonly
    />
    <van-field
      :model-value="formData.planCode"
      label="招募方案编码"
      readonly
    />
    <van-field
      :model-value="formData.createUserName"
      label="发起人"
      readonly
    />
    <van-field
      :model-value="formData.createUserOrg"
      label="发起单位/部门"
      readonly
    />
    <van-field
      :model-value="formData.createTime"
      label="发起时间"
      readonly
    />
    <van-field
      :model-value="formData.createUserPhone"
      label="发起人联系方式"
      readonly
    />
    <van-field
      :model-value="formData.createUserCityName"
      label="地市"
      readonly
    />
    <!-- <van-field
      :model-value="formData.recruitmentStatusText"
      label="方案状态"
      readonly
    /> -->
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

// 方案状态映射
const statusMap: Record<number, string> = {
  0: '未应答',
  1: '应答中',
  2: '评审中',
  3: '结果公示中',
  4: '已完成',
}

// 表单数据
const formData = reactive({
  name: '',
  planCode: '',
  createUserName: '',
  createUserOrg: '',
  createUserPhone: '',
  createUserCityName: '',
  createTime: '',
  recruitmentStatus: 0,
  recruitmentStatusText: '',
})

const currentType = ref('add')

// 回显数据
const showData = (data: any, type: string) => {
  currentType.value = type
  const safeData = data || {}
  formData.name = safeData.name || ''
  formData.planCode = safeData.planCode || ''
  formData.createUserName = safeData.createUserName || ''
  formData.createUserOrg = safeData.createUserOrg || ''
  formData.createUserPhone = safeData.createUserPhone || ''
  formData.createUserCityName = safeData.createUserCityName || ''
  formData.createTime = safeData.createTime || ''
  formData.recruitmentStatus = safeData.recruitmentStatus ?? 0
  formData.recruitmentStatusText = statusMap[formData.recruitmentStatus] || ''
}

// 提交（只读场景无需实际校验，直接返回数据）
const handleSubmit = () => {
  return new Promise((resolve) => {
    resolve(formData)
  })
}

defineExpose({
  handleSubmit,
  showData,
})
</script>

<style scoped lang="scss">
</style>