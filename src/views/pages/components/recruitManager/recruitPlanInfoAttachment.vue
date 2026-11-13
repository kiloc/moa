<template>
  <div class="section">
    <div class="section-subtitle">招募方案基本信息</div>
    <van-cell title="招募方案附件">
      <template #value>
        <div class="file-list">
          <div
            v-for="file in props.fileList"
            :key="file.fileName"
            class="file-item"
            @click="downloadAppFile(file.name || file.originalName, 'recruitmentFiles', file.filename||file.fileName)"
          >
            <span>{{ file.originalName }}</span>
          </div>
          <span v-if="!fileList.length">-</span>
        </div>
      </template>
    </van-cell>
  </div>
</template>

<script setup lang="ts">
import { downloadAppFile } from '@/common/utils'

const props = defineProps({
  fileList: {
    type: Array,
    default: () => []
  }
})


</script>

<style scoped lang="scss">
.section {
  margin-bottom: 16px;
}
.section-subtitle {
  font-weight: 500;
  color: #333333;
  margin-bottom: 10px;
  padding-left: 7px;
  border-left: 3px solid #4a90e5;
}
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.file-item {
  font-size: 14px;
  color: #4a90e5;
  cursor: pointer;
  text-decoration: underline;
}
</style>