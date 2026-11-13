<template>
  <van-popup
    v-model:show="visible"
    round
    closeable
    close-icon-position="top-right"
    position="bottom"
    safe-area-inset-bottom
    destroy-on-close
    :style="{ maxHeight: '85%' }"
  >
    <div class="gray-detail-popup">
      <div class="popup-title">查看</div>

      <div v-if="loading" class="popup-loading">
        <van-loading type="spinner">加载中...</van-loading>
      </div>

      <div v-else class="popup-content">
        <van-cell-group inset>
          <van-cell title="合作伙伴名称" :value="displayEmpty(currentRow?.partnerName)" />
          <van-cell title="统一社会信用代码" :value="displayEmpty(currentRow?.creditCode)" />
          <van-cell title="管控原因" :value="displayEmpty(currentRow?.controlReason)" />
          <van-cell title="管控依据">
            <template #value>
              <div v-if="controlFiles.length" class="file-links">
                <span
                  v-for="file in controlFiles"
                  :key="file.businessId || file.fileName"
                  class="file-link"
                  @click="downloadGrayFile(file, 'controlEvidenceFiles')"
                >
                  {{ file.originalName || file.fileName }}
                </span>
              </div>
              <span v-else>—</span>
            </template>
          </van-cell>
          <van-cell title="状态" :value="getStatusName(currentRow?.status)" />
          <van-cell title="发起人" :value="displayEmpty(currentRow?.initiatorName)" />
          <van-cell title="纳管时间" :value="displayEmpty(currentRow?.manageTime)" />
          <van-cell title="解除原因" :value="displayEmpty(currentRow?.releaseReason)" />
          <van-cell title="解除依据">
            <template #value>
              <div v-if="removeFiles.length" class="file-links">
                <span
                  v-for="file in removeFiles"
                  :key="file.businessId || file.fileName"
                  class="file-link"
                  @click="downloadGrayFile(file, 'removeEvidenceFiles')"
                >
                  {{ file.originalName || file.fileName }}
                </span>
              </div>
              <span v-else>—</span>
            </template>
          </van-cell>
          <van-cell title="解除人" :value="displayEmpty(currentRow?.releaseUserName)" />
          <van-cell title="解除时间" :value="displayEmpty(currentRow?.releaseTime)" />
        </van-cell-group>
      </div>

      <div class="popup-footer">
        <van-button block type="primary" @click="visible = false">关闭</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts">
export default {
  name: 'GreyListDetailDialog',
};
</script>

<script setup lang="ts">
import { showToast } from 'vant';
import 'vant/es/toast/style';
import { PartnerGrayListController } from '@/api/generated';
import { downloadAppFile } from '@/common/utils';
import type { ANY_OBJECT } from '@/types/generic';

const GRAY_STATUS_NAME: Record<number, string> = {
  0: '待纳管',
  1: '管控中',
  2: '已解除',
};

interface GrayFile {
  businessId?: string | number;
  fileName?: string;
  filename?: string;
  originalName?: string;
  name?: string;
  fieldName?: string;
}

interface GreyListItem {
  id?: number | string;
  partnerName?: string;
  creditCode?: string;
  controlReason?: string;
  status?: number;
  initiatorName?: string;
  manageTime?: string;
  releaseReason?: string;
  releaseUserName?: string;
  releaseTime?: string;
  controlEvidenceFiles?: GrayFile[];
  removeEvidenceFiles?: GrayFile[];
}

function sortGrayFiles(files?: GrayFile[]) {
  if (!Array.isArray(files))
    return [];
  return [...files];
}

function mapGrayListItem(data: ANY_OBJECT = {}): GreyListItem {
  return {
    id: data.id,
    partnerName: data.partnerName,
    creditCode: data.creditCode || data.uscc,
    controlReason: data.controlReason,
    status: data.status,
    initiatorName: data.controlUserName,
    manageTime: data.controlTime,
    releaseReason: data.removeReason,
    releaseUserName: data.removeUserName,
    releaseTime: data.removeTime,
    controlEvidenceFiles: sortGrayFiles(data.controlEvidenceFiles),
    removeEvidenceFiles: sortGrayFiles(data.removeEvidenceFiles),
  };
}

function downloadGrayFile(file: GrayFile, fieldName = 'controlEvidenceFiles') {
  downloadAppFile(
    file.originalName || file.name || file.fileName || '附件',
    file.fieldName || fieldName,
    file.filename || file.fileName || '',
  );
}

const props = defineProps<{
  modelValue: boolean;
  recordId?: number | string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const loading = ref(false);
const currentRow = ref<GreyListItem | null>(null);

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const displayEmpty = (value?: string | number | null) => (value === undefined || value === null || value === '' ? '—' : String(value));
const getStatusName = (status?: number) => GRAY_STATUS_NAME[Number(status)] || displayEmpty(status as unknown as string);
const controlFiles = computed(() => sortGrayFiles(currentRow.value?.controlEvidenceFiles));
const removeFiles = computed(() => sortGrayFiles(currentRow.value?.removeEvidenceFiles));

const loadDetail = (id?: number | string | null) => {
  if (!id) {
    currentRow.value = null;
    return;
  }
  loading.value = true;
  PartnerGrayListController.getDetail({ id }, { showMask: false })
    .then(res => {
      currentRow.value = mapGrayListItem(res.data || {});
    })
    .catch(e => {
      console.error(e);
      showToast('加载详情失败');
    })
    .finally(() => {
      loading.value = false;
    });
};

watch(
  () => [props.modelValue, props.recordId] as const,
  ([open, id]) => {
    if (open) {
      loadDetail(id);
    } else {
      currentRow.value = null;
    }
  },
);
</script>

<style scoped lang="scss">
.gray-detail-popup {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 16px;
  color: #323233;
  border-bottom: 1px solid #ebedf0;
}

.popup-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0 8px;
  -webkit-overflow-scrolling: touch;
}

:deep(.van-cell__title) {
  flex: none;
  width: 110px;
  color: #646566;
}

:deep(.van-cell__value) {
  text-align: left;
  color: #323233;
  word-break: break-all;
}

.file-links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.file-link {
  color: #1989fa;
  word-break: break-all;
}

.popup-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebedf0;
  background: #ffffff;
}
</style>
