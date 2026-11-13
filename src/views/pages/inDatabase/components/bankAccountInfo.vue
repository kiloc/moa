<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">银行帐号信息列表</div>
    <div v-if="cooperationList.length" class="bank-list">
      <div v-for="(item, index) in cooperationList" :key="index" class="bank-card">
        <div class="bank-card__header">
          <span class="bank-card__index">{{ index + 1 }}</span>
          <span class="bank-card__name">{{ item.bankName || '未命名银行' }}</span>
        </div>
        <div class="bank-card__body">
          <div class="bank-row">
            <span class="bank-row__label">银行名称</span>
            <span class="bank-row__value">{{ item.bankName || '-' }}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">支行名称</span>
            <span class="bank-row__value">{{ item.subBankName || '-' }}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">银行帐户名称</span>
            <span class="bank-row__value">{{ item.bankAccountName || '-' }}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">银行帐户</span>
            <span class="bank-row__value">{{ item.bankAccount || '-' }}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">开户许可证号</span>
            <span class="bank-row__value">{{ item.permitNumber || '-' }}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">合作区域</span>
            <span class="bank-row__value">{{ item.coopAreaName || '-' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="bank-empty">暂无数据</div>
  </van-cell-group>
</template>

<script setup lang="ts">
const cooperationList = ref([]) as any;

const currentType = ref('add');

const showData = (data: any, type: string) => {
  currentType.value = type;
  cooperationList.value = [];
  data.bankAccountInfoList.forEach((item: any) => {
    cooperationList.value.push({ ...item });
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

.bank-list {
  padding: 0 12px;
}

.bank-card {
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

.bank-row {
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

.bank-empty {
  font-size: 13px;
  color: #969799;
  text-align: center;
  padding: 12px 0;
}
</style>
