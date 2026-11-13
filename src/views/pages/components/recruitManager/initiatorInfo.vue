<template>
  <div class="initiator-info">
    <div class="section-subtitle">发起人信息</div>
    
    <van-cell-group>
      <van-cell title="发起人">
        <template #value>
          <span>{{ formData.showName || '-' }}</span>
        </template>
      </van-cell>
      
      <van-cell title="发起单位/部门">
        <template #value>
          <span>{{ formData.deptName || '-' }}</span>
        </template>
      </van-cell>
      
      <van-cell title="发起时间">
        <template #value>
          <span>{{ formData.createTime || '-' }}</span>
        </template>
      </van-cell>
      
      <van-cell title="发起人联系方式">
        <template #value>
          <span>{{ formData.mobile || '-' }}</span>
        </template>
      </van-cell>
      
      <van-cell title="地市">
        <template #value>
          <span>{{ formData.cityName || '-' }}</span>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const currentType = ref('add')

const formData = reactive({
  showName: '',
  deptName: '',
  createTime: '',
  mobile: '',
  cityName: '',
})

const showData = (data: any, type: string) => {
  currentType.value = type
  if (data) {
    formData.showName = data.showName || data.createUserName || ''
    formData.deptName = data.processInstanceInitiatorDeptName || data.deptName || data.createUserOrg || ''
    formData.createTime = data.processInstanceStartTime || data.createTime || data.initiatorTime || ''
    formData.mobile = data.processInstanceInitiatorMobile || data.createUserPhone || ''
    formData.cityName = data.processInstanceInitiatorCityName || data.cityName || data.createUserCityName || ''
  }
}

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
.initiator-info {
  background-color: #ffffff;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
}

.section-subtitle {
  font-weight: 500;
  font-size: 16px;
  color: #333;
  padding-left: 8px;
  border-left: 3px solid #4a90e5;
  margin-bottom: 16px;
}
</style>
