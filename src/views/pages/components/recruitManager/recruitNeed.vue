<template>
  <div class="section">
    <div class="section-subtitle">招募需求信息</div>
    <van-field
      :model-value="formData.name"
      label="招募需求名称"
      readonly
    />
    <van-field
      :model-value="formData.demandCode"
      label="招募需求编码"
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const currentType = ref('add')

const formData = reactive({
  name: '',
  demandCode: '',
  createUserName: '',
  createUserOrg: '',
  createUserPhone: '',
  createUserCityName: '',
  createTime: '',
})

const showData = (data: any, type: string) => {
  currentType.value = type
  const safeData = data || {}
  formData.name = safeData.name || ''
  formData.demandCode = safeData.demandCode || ''
  formData.createUserName = safeData.createUserName || ''
  formData.createUserOrg = safeData.createUserOrg || ''
  formData.createUserPhone = safeData.createUserPhone || ''
  formData.createUserCityName = safeData.createUserCityName || ''
  formData.createTime = safeData.createTime || ''
}

const handleSubmit = () => {
  return new Promise((resolve, reject) => {
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
