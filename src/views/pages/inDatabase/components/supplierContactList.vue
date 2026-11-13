<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">供应商联系人列表</div>
    <div v-if="cooperationList.length" class="contact-list">
      <div v-for="(item, index) in cooperationList" :key="index" class="contact-card">
        <div class="contact-card__header">
          <span class="contact-card__index">{{ index + 1 }}</span>
          <span class="contact-card__name">{{ item.linkName || '未命名联系人' }}</span>
        </div>
        <div class="contact-card__body">
          <div class="contact-row">
            <span class="contact-row__label">联系人姓名</span>
            <span class="contact-row__value">{{ item.linkName || '-' }}</span>
          </div>
          <div class="contact-row">
            <span class="contact-row__label">联系人电话</span>
            <span class="contact-row__value">{{ item.linkPhone || '-' }}</span>
          </div>
          <div class="contact-row">
            <span class="contact-row__label">电子邮箱</span>
            <span class="contact-row__value">{{ item.email || '-' }}</span>
          </div>
          <div class="contact-row">
            <span class="contact-row__label">合作区域</span>
            <span class="contact-row__value">{{ item.coopAreaName || '-' }}</span>
          </div>
          <div class="contact-row">
            <span class="contact-row__label">是否允许手机号登录</span>
            <span class="contact-row__value">{{ item.allowMobileLoginText || '-' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="contact-empty">暂无数据</div>
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLoginStore } from '@/store';

const loginStore = useLoginStore();
const userInfo = computed(() => loginStore.userInfo || {}) as any;

interface CooperationItem {
  coopAreaCode: string;
  coopAreaName: string;
  linkName: string;
  linkPhone: string;
  email: string;
  isMain: string;
  isMainText: string;
  allowMobileLogin: string | number;
  allowMobileLoginText: string;
}

const cooperationList = ref<CooperationItem[]>([]);

const currentType = ref('add');

const showData = (data: any, type: string) => {
  currentType.value = type;
  cooperationList.value = [];
  data.supplierContactPersonList.forEach((item: any) => {
    cooperationList.value.push({
      ...item,
      // PC 端处理：统一转字符串且不默认（0否 1是）
      isMainText: item.isMain === '1' ? '是' : '否',
      allowMobileLogin: String(item.allowMobileLogin ?? ''),
      allowMobileLoginText: String(item.allowMobileLogin ?? '') === '1' ? '是' : '否',
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

.contact-list {
  padding: 0 12px;
}

.contact-card {
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

.contact-row {
  display: flex;
  padding: 4px 0;
  font-size: 13px;

  &__label {
    color: #969799;
    width: 80px;
    flex-shrink: 0;
  }

  &__value {
    color: #323233;
    flex: 1;
    word-break: break-all;
  }
}

.contact-empty {
  font-size: 13px;
  color: #969799;
  text-align: center;
  padding: 12px 0;
}
</style>
