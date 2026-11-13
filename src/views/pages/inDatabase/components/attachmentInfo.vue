<template>
  <div class="attachment-section">
    <div class="attachment-group">
      <div class="attachment-group__title">入库依据</div>
      <div class="attachment-group__list">
        <div v-for="f in attachmentData.inboundFiles" :key="f.fileName" class="attachment-item">
          <van-icon name="description" class="attachment-item__icon" />
          <span class="attachment-item__name" @click="downloadAppFile(f.name || f.originalName,'inboundFiles',f.filename||f.fileName)">{{ f.originalName }}</span>
        </div>
        <div v-if="!attachmentData.inboundFiles.length" class="attachment-empty">暂无文件</div>
      </div>
    </div>
    <div class="attachment-group" v-if="isShow">
      <div class="attachment-group__title">营业执照正本</div>
      <div class="attachment-group__list">
        <div v-for="f in attachmentData.licenseFiles" :key="f.fileName" class="attachment-item">
          <van-icon name="description" class="attachment-item__icon" />
          <span class="attachment-item__name" @click="downloadAppFile(f.name || f.originalName,'licenseFiles',f.filename||f.fileName)">{{ f.originalName }}</span>
        </div>
        <div v-if="!attachmentData.licenseFiles.length" class="attachment-empty">暂无文件</div>
      </div>
    </div>
    <div class="attachment-group" v-if="isShow">
      <div class="attachment-group__title">营业执照副本</div>
      <div class="attachment-group__list">
        <div v-for="f in attachmentData.licenseCopyFiles" :key="f.fileName" class="attachment-item">
          <van-icon name="description" class="attachment-item__icon" />
          <span class="attachment-item__name" @click="downloadAppFile(f.name || f.originalName,'licenseCopyFiles',f.filename||f.fileName)">{{ f.originalName }}</span>
        </div>
        <div v-if="!attachmentData.licenseCopyFiles.length" class="attachment-empty">暂无文件</div>
      </div>
    </div>
    <div class="attachment-group" v-if="isShow">
      <div class="attachment-group__title">银行帐户开户许可证</div>
      <div class="attachment-group__list">
        <div v-for="f in attachmentData.bankFiles" :key="f.fileName" class="attachment-item">
          <van-icon name="description" class="attachment-item__icon" />
          <span class="attachment-item__name" @click="downloadAppFile(f.name || f.originalName,'bankFiles',f.filename||f.fileName)">{{ f.originalName }}</span>
        </div>
        <div v-if="!attachmentData.bankFiles.length" class="attachment-empty">暂无文件</div>
      </div>
    </div>
    <div class="attachment-group" v-if="isShow">
      <div class="attachment-group__title">合作伙伴资源审查表</div>
      <div class="attachment-group__list">
        <div v-for="f in attachmentData.portalReviewFiles" :key="f.fileName" class="attachment-item">
          <van-icon name="description" class="attachment-item__icon" />
          <span class="attachment-item__name" @click="downloadAppFile(f.name || f.originalName,'portalReviewFiles',f.filename||f.fileName)">{{ f.originalName }}</span>
        </div>
        <div v-if="!attachmentData.portalReviewFiles.length" class="attachment-empty">暂无文件</div>
      </div>
    </div>
    <div class="attachment-group" v-if="isShow">
      <div class="attachment-group__title">其它附件(如业绩)</div>
      <div class="attachment-group__list">
        <div v-for="f in attachmentData.otherFiles" :key="f.fileName" class="attachment-item">
          <van-icon name="description" class="attachment-item__icon" />
          <span class="attachment-item__name" @click="downloadAppFile(f.name || f.originalName,'otherFiles',f.filename||f.fileName)">{{ f.originalName }}</span>
        </div>
        <div v-if="!attachmentData.otherFiles.length" class="attachment-empty">暂无文件</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getToken } from '@/common/utils'
import { downloadAppFile } from '@/common/utils';
import { API_CONTEXT } from '@/api/config'
const API_PREFIX = import.meta.env.VITE_API_PREFIX || ''
  defineProps({
    attachmentData: {
      type: Object,
      default: () => ({
        inboundFiles: [],
        licenseFiles: [],
        licenseCopyFiles: [],
        bankFiles: [],
        portalReviewFiles: [],
        otherFiles: [],
      }),
    },
    isShow: {
      type: Boolean,
      default: true,
    },
  });
</script>

<style scoped lang="scss">
.attachment-section {
  padding: 12px;
  margin: 12px 0;
  background: #fff;
  border-radius: 8px;
}

.attachment-group {
  margin-bottom: 16px;

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    padding: 10px 0 6px;
  }

  &__list {
    background: #f7f8fa;
    border-radius: 8px;
    padding: 4px 12px;
  }
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebedf0;

  &:last-child {
    border-bottom: none;
  }

  &__icon {
    font-size: 20px;
    color: #4A90E5;
    margin-right: 8px;
    flex-shrink: 0;
  }

  &__name {
    font-size: 14px;
    color: #4A90E5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.attachment-empty {
  font-size: 13px;
  color: #969799;
  padding: 10px 0;
  text-align: center;
}
</style>
