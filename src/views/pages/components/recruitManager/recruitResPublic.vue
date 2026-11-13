<template>
  <div class="section">
    <div class="section-subtitle">招募公示信息</div>

    <van-field :model-value="displayData.title" label="公示标题" type="textarea" readonly />
    <van-field label="公示截止时间">
      <template #input>
        <span>{{ displayData.deadline || '-' }}</span>
      </template>
    </van-field>

    <van-field label="公示正文">
      <template #input>
        <div class="rich-text" v-html="displayData.content || '-'" />
      </template>
    </van-field>

    <!-- <van-cell title="公示文件">
      <template #value>
        <div class="file-list">
          <div
            v-for="file in displayData.attachmentFiles"
            :key="file.fileName"
            class="file-item"
            @click="downloadFile(file)"
          >
            <span>{{ file.originalName }}</span>
          </div>
          <span v-if="!displayData.attachmentFiles.length">-</span>
        </div>
      </template>
    </van-cell> -->
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { getToken } from '@/common/utils'
import { API_CONTEXT } from '@/api/config'

// 展示数据
const displayData = reactive({
  title: '',
  deadline: '',
  content: '',
  attachmentFiles: [] as any[],
})

// 文件下载
const downloadFile = (file: any) => {
  const token = getToken()
  const url = `${API_CONTEXT}/manage/file/download?fieldName=attachmentFiles&filename=${encodeURIComponent(file.fileName)}&asImage=false&Authorization=${encodeURIComponent(token || '')}`
  window.open(url, '_blank')
}

// 数据回显
const showData = (data: any, type?: string) => {
  // 兼容多种数据结构
  const publicity = data.recruitmentPublicity || data
  displayData.title = publicity.title || publicity.noticeTitle || ''
  displayData.deadline = publicity.deadline || ''
  displayData.content = publicity.content || publicity.notice || ''

  // 处理附件
  const files = data.publicityFiles || publicity.attachmentFiles || []
  const fileList = Array.isArray(files) ? files : [files]
  displayData.attachmentFiles = fileList.map((item: any) => ({
    fileName: item.fileName || item.filename,
    originalName: item.originalName,
    downloadUri: item.downloadUri,
  }))
}

// 提交（只读组件直接返回数据，无需校验）
const handleSubmit = () => {
  return Promise.resolve({ ...displayData })
}

defineExpose({
  showData,
  handleSubmit,
})
</script>

<style scoped lang="scss">
.rich-text {
  word-break: break-word;
  white-space: pre-wrap;
  color: #333;
  line-height: 1.6;
}

</style>