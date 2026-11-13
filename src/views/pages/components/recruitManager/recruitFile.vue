<template>
  <div class="section">
    <div class="section-subtitle">招募文件</div>
    <van-cell title="招募文件">
      <template #value>
        <div class="file-list">
          <div
            v-for="file in props.fileList"
            :key="file.fileName"
            class="file-item"
            @click="downloadAppFile((file as any).name || (file as any).originalName, 'recruitmentFiles', (file as any).filename||(file as any).fileName)"
          >
            <span>{{ file.originalName }}</span>
          </div>
          <span v-if="!props.fileList.length">-</span>
        </div>
      </template>
    </van-cell>

    <van-cell title="备注" :value="props.remark">
    </van-cell>
  </div>
</template>

<script setup lang="ts">
import { downloadAppFile } from '@/common/utils'

const props = defineProps({
  fileList: {
    type: Array,
    default: () => []
  },
  remark: {
    type: String,
    default: ''
  }
})

</script>

<style scoped lang="scss">
</style>
