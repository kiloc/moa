<script setup lang="ts">
import { reactive } from 'vue'

const formData = reactive({
  title: '',
  startTime: '',
  endTime: '',
  replyDeadline: '',
  reviewTime: '',
  reviewLocation: '',
  contactPerson: '',
  contactPhone: '',
  content: '',
})

function showData(data: any, type: string) {
  const noticeData = data.recruitmentAnnouncementDto || data.recruitmentAnnouncement || data

  formData.title = noticeData.title || ''
  formData.startTime = noticeData.startTime || ''
  formData.endTime = noticeData.endTime || ''
  formData.replyDeadline = noticeData.replyDeadline
    || (data.recruitmentPlanQueryVo?.recruitmentPlan?.endTime || '')
  formData.reviewTime = noticeData.reviewTime || ''
  formData.reviewLocation = noticeData.reviewLocation || ''
  formData.contactPerson = noticeData.contactPerson || ''
  formData.contactPhone = noticeData.contactPhone || ''
  formData.content = noticeData.content || ''
}

function handleSubmit() {
  return Promise.resolve({ ...formData })
}

defineExpose({
  handleSubmit,
  showData,
})
</script>

<template>
  <div class="section">
    <div class="section-subtitle">
      招募公告
    </div>
    <van-field label="公告标题" type="textarea" readonly>
      <template #input>
        <div class="rich-text" v-html="formData.title || '-'" />
      </template>
    </van-field>
    <van-field :model-value="formData.startTime" label="公告开始时间" readonly />
    <van-field :model-value="formData.endTime" label="公告结束时间" readonly />
    <van-field :model-value="formData.replyDeadline" label="应答截止时间" readonly />
    <van-field :model-value="formData.reviewTime" label="评标时间" readonly />
    <van-field :model-value="formData.reviewLocation" label="评标地点" readonly />
    <van-field :model-value="formData.contactPerson" label="联系人员" readonly />
    <van-field :model-value="formData.contactPhone" label="联系电话" readonly />
    <van-field label="公告正文">
      <template #input>
        <div class="rich-text" v-html="formData.content || '-'" />
      </template>
    </van-field>
  </div>
</template>

<style scoped lang="scss">
.notice-compile {
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

.rich-text {
  word-break: break-all;
  white-space: pre-wrap;
  color: #333;
  line-height: 1.6;
}

.rich-text p {
  margin-bottom: 8px;
}

.rich-text p:last-child {
  margin-bottom: 0;
}
</style>
