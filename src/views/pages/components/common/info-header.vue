<script setup lang="ts">
interface Props {
  createUserName?: string
  createUserPhone?: string
  createTime?: string
  createUserOrg?: string
  createUserCityName?: string
  title?: string
}

withDefaults(defineProps<Props>(), {
  createUserName: '',
  createUserPhone: '',
  createTime: '',
  createUserOrg: '',
  createUserCityName: '',
  title: '',
})
</script>

<template>
  <div class="info-header">
    <div v-if="title" class="page-title">
      {{ title }}
    </div>
    <div class="section">
      <div class="info-row">
        <div class="info-item">
          <span class="label">发起人：</span>
          <span class="value">{{ createUserName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">发起人联系方式：</span>
          <span class="value">{{ createUserPhone || '-' }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="label">发起时间：</span>
          <span class="value">{{ createTime || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">发起单位/部门：</span>
          <span class="value">{{ createUserOrg || '-' }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="label">地市：</span>
          <span class="value">{{ createUserCityName || '-' }}</span>
        </div>
      </div>
    </div>
    <div class="divider" />
  </div>
</template>

<style scoped>
.info-header {
  background-color: #ffffff;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20px;
}

.section {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.info-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: flex-start;
}

.label {
  font-size: 14px;
  color: #666666;
  white-space: nowrap;
  margin-right: 8px;
}

.value {
  font-size: 14px;
  color: #333333;
  word-break: break-word;
}

.divider {
  height: 1px;
  background-color: #e5e5e5;
}
</style>
