<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">续约</div>
    <van-form>
      <van-field label="续约行业">
      </van-field>
      <div v-if="industryList.length" class="industry-list">
        <div v-for="(item, index) in industryList" :key="item.industryCode" class="industry-card">
          <div class="industry-card__header">
            <span class="industry-card__index">{{ index + 1 }}</span>
            <span class="industry-card__name">{{ item.industryName || '-' }}</span>
            <span class="industry-card__tag" :class="{ 'industry-card__tag--expired': isExpired(item) }">
              {{ isExpired(item) ? '已过期' : '正常' }}
            </span>
          </div>
          <div class="industry-card__body">
            <div class="industry-card__row">
              <span class="industry-card__label">合约时间</span>
              <span class="industry-card__value">{{ formatDate(item.joinTime) }} 至 {{ getEndDate(item) }}</span>
            </div>
            <div class="industry-card__row">
              <span class="industry-card__label">合作年限</span>
              <span class="industry-card__value">{{ item.coopValidityPeriod || '-' }} 年</span>
            </div>
          </div>
        </div>
      </div>
      <van-field label="续约年限">
        <template #input>
          <span class="plain-text">{{ num }} 年</span>
        </template>
      </van-field>
<!--      <van-field label="入库依据" required>-->
<!--        <template #input>-->
<!--          <van-uploader-->
<!--            v-if="currentType === 'add' || currentType === 'edit'"-->
<!--            v-model="vantFiles"-->
<!--            :max-count="10"-->
<!--            :after-read="onAnnounceFileUploadSuccess"-->
<!--            @delete="onAnnounceFileRemove"-->
<!--          />-->
<!--          <div v-else>-->
<!--            <div v-for="item in formData.inboundFiles" :key="item.fileName" class="file-link" @click="downloadFile('inboundFiles', item.fileName, item.originalName)">-->
<!--              {{ item.originalName }}-->
<!--            </div>-->
<!--          </div>-->
<!--        </template>-->
<!--      </van-field>-->
      <van-field label="申请说明">
        <template #input>
          <span class="plain-text">{{ formData.outRemark || '-' }}</span>
        </template>
      </van-field>
    </van-form>
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { showToast } from 'vant';
import { getToken } from '@/common/utils';
import { API_CONTEXT } from '@/api/config';
import { AUTH_SIGN } from '@/common/http/config';
import { useLoginStore } from '@/store';

const loginStore = useLoginStore();
const userInfo = computed(() => loginStore.userInfo || {}) as any;

const currentType = ref('add');
const num = ref(1);
const industry = ref<string[]>([]);
const industryList = ref<any[]>([]);
const vantFiles = ref<any[]>([]);

const formData = reactive({
  renewalInfoHisDtoList: [] as any[],
  inboundFiles: [] as any[],
  partnerCode: '',
  outRemark: '',
});

const getTime = (item: any) => {
  let str = '';
  let type = '正常';
  try {
    str = item.industryName + '：当前合约时间 ' + item.joinTime?.split(' ')[0];
    const endDate = new Date(new Date(item.joinTime).getTime() + item.coopValidityPeriod * 365 * 24 * 60 * 60 * 1000);
    str += ' 至 ' + endDate.toISOString().split('T')[0];
    if (endDate.getTime() < Date.now()) type = '过期';
    str += '(' + type + ')';
  } catch {}
  return str;
};

const formatDate = (dateStr: string) => {
  try {
    return dateStr?.split(' ')[0] || '-';
  } catch {
    return '-';
  }
};

const getEndDate = (item: any) => {
  try {
    const endDate = new Date(new Date(item.joinTime).getTime() + item.coopValidityPeriod * 365 * 24 * 60 * 60 * 1000);
    return endDate.toISOString().split('T')[0];
  } catch {
    return '-';
  }
};

const isExpired = (item: any) => {
  try {
    const endDate = new Date(new Date(item.joinTime).getTime() + item.coopValidityPeriod * 365 * 24 * 60 * 60 * 1000);
    return endDate.getTime() < Date.now();
  } catch {
    return false;
  }
};

const showData = (data: any, type: string) => {
  currentType.value = type;
  if (data.inboundFile || data.inboundFiles) {
    const files = Array.isArray(data.inboundFiles) ? data.inboundFiles : data.inboundFiles ? [data.inboundFiles] : [];
    files.forEach((item: any) => { item.name = item.originalName; });
    formData.inboundFiles = files;
    vantFiles.value = files.map((f: any) => ({ ...f, url: '', name: f.originalName }));
  }
  formData.outRemark = data.remark;
  industryList.value = data.detailsInfoVoList?.length ? data.detailsInfoVoList : data.industryDetailsInfoList || [];
  industry.value = [];
  industryList.value.forEach((item: any) => {
    if (item.add === true) industry.value.push(item.industryCode);
  });
};

const downloadFile = (fieldName: string, filename: string, displayName: string) => {
  const token = getToken();
  const url = `${API_CONTEXT}/manage/file/download?fieldName=${encodeURIComponent(fieldName)}&filename=${encodeURIComponent(filename)}&asImage=false&Authorization=${encodeURIComponent(token || '')}`;
  window.open(url, '_blank');
};

const onAnnounceFileUploadSuccess = async (file: any) => {
  file.status = 'uploading';
  const fd = new FormData();
  fd.append('uploadFile', file.file);
  fd.append('fieldName', 'inboundFiles');
  fd.append('asImage', 'false');
  fd.append('businessId', '');
  fd.append('kind', '');
  try {
    const token = getToken();
    const res = await fetch(`${API_CONTEXT}/manage/file/upload`, {
      method: 'POST',
      headers: { Authorization: token || '', 'Auth-Sign': AUTH_SIGN, Sourcesystem: 'moa' },
      body: fd,
    });
    const response = await res.json();
    if (response.data) {
      formData.inboundFiles.push({
        fileName: response.data.filename,
        originalName: response.data.originalName,
        downloadUri: response.data.downloadUri,
        uploadPath: response.data.uploadPath,
      });
      file.status = 'done';
      showToast('文件上传成功');
    }
  } catch {
    file.status = 'failed';
  }
};

const onAnnounceFileRemove = (file: any) => {
  const index = formData.inboundFiles.findIndex((item: any) => item.originalName === file.name || item.originalName === file.originalName);
  if (index > -1) formData.inboundFiles.splice(index, 1);
};

const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.inboundFiles?.length) {
      showToast('请上传文件');
      reject();
      return;
    }
    if (!industry.value.length) {
      showToast('请选择续约行业');
      reject();
      return;
    }
    const params = { ...formData };
    const arr: any[] = [];
    industry.value.forEach(item => {
      arr.push({ industryCode: item, renewalPeriod: num.value, outRemark: params.outRemark });
    });
    params.renewalInfoHisDtoList = arr;
    resolve(params);
  });
};

defineExpose({ handleSubmit, showData });

onActivated(() => {
  formData.renewalInfoHisDtoList = [];
  formData.inboundFiles = [];
  formData.partnerCode = '';
  formData.outRemark = '';
  vantFiles.value = [];
});
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

.file-link {
  color: #4A90E5;
  font-size: 13px;
  padding: 2px 0;
}

.plain-text {
  font-size: 14px;
  color: #323233;
  line-height: 1.5;
  word-break: break-all;
}

.industry-list {
  padding: 0 16px 12px;
}

.industry-card {
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
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

  &__tag {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 10px;
    background: #e8f7e8;
    color: #07c160;
    flex-shrink: 0;
    margin-left: 8px;

    &--expired {
      background: #fef0f0;
      color: #ee0a24;
    }
  }

  &__body {
    padding: 0 12px 10px 42px;
  }

  &__row {
    display: flex;
    align-items: center;
    padding: 3px 0;
    font-size: 13px;
  }

  &__label {
    color: #969799;
    width: 56px;
    flex-shrink: 0;
  }

  &__value {
    color: #323233;
    flex: 1;
    word-break: break-all;
  }
}
</style>
