<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    round
    :style="{ height: '90%' }"
    @closed="onClosed"
  >
    <div class="detail-popup-header">
      <span class="detail-popup-title">合作伙伴详情</span>
      <van-icon name="cross" size="20" @click="dialogVisible = false" />
    </div>
    <div class="detail-popup-body">
      <van-loading v-if="loading" class="page-loading" size="24px" vertical>加载中...</van-loading>
      <template v-if="detailLoaded">
        <dataBaseAccording ref="dataBaseAccordingRef" :joinType="''" />
        <partnerInfo ref="partnerInfoRef" :business="''" />
        <cooperationQualification ref="cooperationQualificationRef" />
        <supplierContactList ref="supplierContactListRef" />
        <bankAccountInfo ref="bankAccountInfoRef" />
      </template>
      <div v-else-if="!loading && loadError" class="detail-load-error">
        {{ loadError }}
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import DataBaseController from '@/api/dataBase/DataBaseController';
import dataBaseAccording from './dataBaseAccording.vue';
import partnerInfo from './partnerInfo.vue';
import cooperationQualification from './cooperationQualification.vue';
import supplierContactList from './supplierContactList.vue';
import bankAccountInfo from './bankAccountInfo.vue';
import { ANY_OBJECT } from '@/types/generic';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    partnerCode?: string;
  }>(),
  { partnerCode: '' },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const loading = ref(false);
const detailLoaded = ref(false);
const loadError = ref('');

const dataBaseAccordingRef = ref<ANY_OBJECT>();
const partnerInfoRef = ref<ANY_OBJECT>();
const cooperationQualificationRef = ref<ANY_OBJECT>();
const supplierContactListRef = ref<ANY_OBJECT>();
const bankAccountInfoRef = ref<ANY_OBJECT>();

const loadDetail = async (partnerCode: string) => {
  if (!partnerCode) {
    loadError.value = '缺少合作伙伴编码';
    return;
  }
  loading.value = true;
  loadError.value = '';
  detailLoaded.value = false;
  try {
    const res = await DataBaseController.getPartnerDetail({ partnerCode });
    const data = res.data;
    detailLoaded.value = true;
    await nextTick();
    const type = 'info';
    dataBaseAccordingRef.value?.showData(data, type);
    partnerInfoRef.value?.showData(data, type);
    cooperationQualificationRef.value?.showData(data, type);
    supplierContactListRef.value?.showData(data, type);
    bankAccountInfoRef.value?.showData(data, type);
  } catch (e) {
    console.warn(e);
    loadError.value = '加载详情失败';
    showToast('加载详情失败');
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.modelValue, props.partnerCode] as const,
  ([visible, code]) => {
    if (!visible) {
      detailLoaded.value = false;
      loadError.value = '';
      return;
    }
    const value = (code || '').trim();
    if (value) {
      loadDetail(value);
    } else {
      loading.value = false;
      detailLoaded.value = false;
      loadError.value = '缺少合作伙伴编码';
    }
  },
  { immediate: true },
);

const onClosed = () => {
  detailLoaded.value = false;
  loadError.value = '';
};
</script>

<style scoped lang="scss">
.detail-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.detail-popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.detail-popup-body {
  padding: 12px 16px 24px;
  overflow-y: auto;
  max-height: calc(90vh - 56px);
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.detail-load-error {
  color: #ee0a24;
  text-align: center;
  padding: 24px;
}
</style>
