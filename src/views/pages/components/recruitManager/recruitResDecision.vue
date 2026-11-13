<script setup lang="ts">
import { reactive, ref } from 'vue'
import { API_CONTEXT } from '@/api/config'
import { downloadAppFile } from '@/common/utils'

const props = withDefaults(
  defineProps<{
    data: any
  }>(),
  {
    data: () => {},
  },
)

interface UploadedFileInfo {
  fileName: string
  originalName: string
  downloadUri: string
  uploadPath: string
  remark: string
}

const formData = reactive({
  createTime: '',
  meetingMinutesFileName: '',
})

const inboundFiles = ref<UploadedFileInfo[]>([])
const isDownload = ref(false)


function showData(data: any) {
  formData.createTime = data.recruitmentDecision?.decisionTime || data.createTime || data.meetingDecisionTime || ''
  formData.meetingMinutesFileName = data.meetingMinutesFileName || ''

  const filesData = data.minutesFiles || data.minutesFileDto
  if (filesData && Array.isArray(filesData)) {
    inboundFiles.value = filesData.map((file: any) => ({
      fileName: file.fileName,
      originalName: file.originalName,
      downloadUri: file.downloadUri,
      uploadPath: file.uploadPath,
      remark: file.remark || '会议纪要',
    }))
  }
  else {
    inboundFiles.value = []
  }
}

function handleSubmit() {
  return new Promise((resolve) => {
    resolve({
      createTime: formData.createTime,
      meetingMinutesFileName: formData.meetingMinutesFileName,
      inboundFiles: inboundFiles.value,
    })
  })
}

watch(() => props.data, (newVal) => {
  showData(newVal || {})
}, {
  immediate: true,
})
</script>

<template>
  <div class="section">
    <div class="section-subtitle">
      招募结果决策信息
    </div>

    <van-cell title="会议决策时间" :value="formData.createTime" />

    <van-cell title="结果决策会议纪要">
      <template #value>
        <div class="file-list">
          <div
            v-for="(file, index) in inboundFiles"
            :key="index"
            class="file-item"
            @click="downloadAppFile(file.name || file.originalName, 'inboundFiles', file.filename||file.fileName)"
          >
            <span>{{ file.originalName }}</span>
          </div>
          <span v-if="!inboundFiles.length">-</span>
        </div>
      </template>
    </van-cell>
  </div>
</template>

<style scoped lang="scss">
</style>
