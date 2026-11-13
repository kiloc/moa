<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">合作伙伴资质</div>
    <div v-if="cooperationList.length" class="qual-list">
      <div v-for="(item, index) in cooperationList" :key="index" class="qual-card">
        <div class="qual-card__header">
          <span class="qual-card__index">{{ index + 1 }}</span>
          <span class="qual-card__name">{{ item.qualificationName || '未命名资质' }}</span>
        </div>
        <div class="qual-card__body">
          <div class="qual-row">
            <span class="qual-row__label">资质名称</span>
            <span class="qual-row__value">{{ item.qualificationName || '-' }}</span>
          </div>
          <div class="qual-row"  v-if="item.qualificationFlag !== '0'">
            <span class="qual-row__label">证书编号</span>
            <span class="qual-row__value">{{ item.certificateNumber || '-' }}</span>
          </div>
          <div class="qual-row" v-if="item.qualificationFlag !== '0'">
            <span class="qual-row__label" >有效期限</span>
            <span class="qual-row__value">{{ item.contractValidityPeriod || '-' }}</span>
          </div>
          <div class="qual-row">
            <span class="qual-row__label">附件</span>
            <div class="qual-row__value qual-row__files">
              <div v-if="item.qualificationFiles.length">
                <div v-for="f in item.qualificationFiles" :key="f.fileName" :class="disableFileDownload ? 'file-text' : 'file-link'" @click="downloadAppFile(f.name || f.originalName, 'qualificationFiles', f.filename||f.fileName)">
                  {{ f.originalName }}
                </div>
              </div>
              <span v-else>-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="qual-empty">暂无数据</div>
  </van-cell-group>
</template>

<script setup lang="ts">
import { downloadAppFile } from '@/common/utils';

const props = defineProps({
  disableFileDownload: {
    type: Boolean,
    default: false,
  },
});

const currentType = ref('add');

const cooperationList = ref([]) as any;

const showData = (data: any, type: string) => {
  currentType.value = type;
  cooperationList.value = [];
  data.qualificationList.forEach((item: any) => {
    cooperationList.value.push({
      ...item,
    });
  });
};


const handleSubmit = () => {
  return Promise.resolve(cooperationList.value);
};

defineExpose({ handleSubmit, showData });
</script>

<style lang="scss" scoped>
.card-section {
  margin: 12px 0 !important;

  &__title {
    padding: 14px 16px 6px;
    font-size: 15px;
    font-weight: 600;
    color: #323233;
  }
}

.qual-list {
  padding: 0 12px;
}

.qual-card {
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #ebedf0;
  }

  &__index {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #4A90E5;
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-left: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__body {
    padding: 10px 12px;
  }
}

.qual-row {
  display: flex;
  padding: 4px 0;
  font-size: 13px;

  &__label {
    color: #969799;
    width: 64px;
    flex-shrink: 0;
  }

  &__value {
    color: #323233;
    flex: 1;
    word-break: break-all;
  }

  &__files {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.qual-empty {
  font-size: 13px;
  color: #969799;
  text-align: center;
  padding: 12px 0;
}

.file-link {
  color: #4A90E5;
  font-size: 13px;
  padding: 2px 0;
  cursor: pointer;
}

.file-text {
  font-size: 13px;
  padding: 2px 0;
  color: #4A90E5;
}
</style>
