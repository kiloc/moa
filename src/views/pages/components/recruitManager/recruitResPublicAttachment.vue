<template>
  <div class="section">
    <div class="section-subtitle">招募公示信息</div>
    <van-cell title="公示文件">
      <template #value>
        <div class="file-list">
          <div
            v-for="file in displayData.attachmentFiles"
            :key="file.fileName"
            class="file-item"
            @click="downloadAppFile(file.name || file.originalName, 'attachmentFiles', file.filename||file.fileName)"
          >
            <span>{{ file.originalName }}</span>
          </div>
          <span v-if="!displayData.attachmentFiles.length">-</span>
        </div>
      </template>
    </van-cell>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { downloadAppFile } from '@/common/utils'

const props = withDefaults(
  defineProps<{
    data: any
  }>(),
  {
    data: () => {},
  },
);

// 展示数据
const displayData = reactive({
  title: '',
  deadline: '',
  content: '',
  attachmentFiles: [] as any[],
})


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

watch(() => props.data, (newVAl) => {
  showData(newVAl || {})
}, {immediate: true})

</script>

<style scoped lang="scss">
.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  font-size: 14px;
  color: #4a90e5;
  cursor: pointer;
  text-decoration: underline;
}
</style>