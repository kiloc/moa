<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">退库申请</div>
    <van-form ref="formRef">
      <van-field label="退库行业">
        <template #input>
          <van-checkbox-group v-model="formData.industryDetailIds" :disabled="currentType === 'auth' || currentType === 'info'" direction="horizontal">
            <van-checkbox v-for="item in portalIndustryList" :key="item.id" :name="item.id">
              {{ item.name }}
            </van-checkbox>
          </van-checkbox-group>
        </template>
      </van-field>
      <van-field label="退库时间">
        <template #input>
          <div class="time-field">
            <van-radio-group v-model="formData.outType" direction="horizontal" :disabled="currentType === 'auth' || currentType === 'info'">
              <van-radio name="1">永久退库</van-radio>
              <van-radio name="2">指定时间</van-radio>
            </van-radio-group>
            <div v-if="formData.outType === '2'" class="time-range">
              <div class="time-range__item">
                <span class="time-range__value">{{ formData.outStartTime || '-' }}</span>
              </div>
              <span>至</span>
              <div class="time-range__item">
                <span class="time-range__value">{{ formData.outEndTime || '-' }}</span>
              </div>
            </div>
          </div>
        </template>
      </van-field>
      <van-field
        v-model="formData.outRemark"
        label="退库说明"
        type="textarea"
        rows="4"
        autosize
        readonly
      />
      <van-field label="附件">
        <template #input>
          <van-uploader
            v-if="currentType === 'add' || currentType === 'edit'"
            v-model="outStorageFiles"
            :max-count="10"
            :after-read="onAnnounceFileUploadSuccess"
            @delete="onAnnounceFileRemove"
          />
          <div v-else>
            <div v-for="item in formData.outStorageFiles" :key="item.fileName" class="file-link" @click="downloadAppFile(item.name || item.originalName, 'outStorageFiles', item.filename||item.fileName)">
              {{ item.originalName }}
            </div>
          </div>
        </template>
      </van-field>
    </van-form>

    <van-popup v-model:show="showDatePicker" round position="bottom">
      <van-date-picker
        v-model="datePickerValue"
        title="选择日期"
        @confirm="onDatePickerConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </van-cell-group>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { downloadAppFile } from '@/common/utils';
import { API_CONTEXT } from '@/api/config';
import { AUTH_SIGN } from '@/common/http/config';
import { useDictMapStore } from '@/store';

const dictMapStore = useDictMapStore();

interface ReturnFormData {
  industryDetailIds: any[];
  outType: string;
  outStartTime: string | null;
  outEndTime: string | null;
  outRemark: string;
  outStorageFiles: any[];
}

const formData = reactive<ReturnFormData>({
  industryDetailIds: [],
  outType: '1',
  outStartTime: null,
  outEndTime: null,
  outRemark: '',
  outStorageFiles: [],
});

const formRef = ref();
const portalIndustryList = ref([] as any[]);
const currentType = ref('add');
const outStorageFiles = ref<any[]>([]);
const showDatePicker = ref(false);
const datePickerType = ref('start');
const datePickerValue = ref(['2025', '01', '01']);

const openDatePicker = (type: string) => {
  datePickerType.value = type;
  showDatePicker.value = true;
};

const onDatePickerConfirm = ({ selectedValues }: any) => {
  const val = selectedValues.join('-');
  if (datePickerType.value === 'start') {
    formData.outStartTime = val;
  } else {
    formData.outEndTime = val;
  }
  showDatePicker.value = false;
};

const showData = (data: any, type: string) => {
  currentType.value = type;
  formData.outType = data.outType;
  formData.outStartTime = data.outStartTime;
  formData.outEndTime = data.outEndTime;
  formData.outRemark = data.outRemark;

  if (data.outStorageFiles && data.outStorageFiles.length) {
    data.outStorageFiles.forEach((item: any) => { item.name = item.originalName; });
  }
  if (data.outStorageFiles) {
    formData.outStorageFiles = data.outStorageFiles;
    outStorageFiles.value = [...data.outStorageFiles];
  }

  formData.industryDetailIds = [];
  portalIndustryList.value = [];

  if (data.outIndustryList && data.outIndustryList.length) {
    data.outIndustryList.forEach((item: any) => { formData.industryDetailIds.push(item.id); });
    dictMapStore.getDictMap.portalIndustryList.forEach((item: any) => {
      data.outIndustryList.forEach((val: any) => {
        if (item.id == val.industryCode) {
          portalIndustryList.value.push({ name: item.name, id: val.id });
        }
      });
    });
  }
  if (data.industryList && data.industryList.length) {
    dictMapStore.getDictMap.portalIndustryList.forEach((item: any) => {
      data.industryList.forEach((val: any) => {
        if (item.id == val.industryCode) {
          portalIndustryList.value.push({ name: item.name, id: val.id });
        }
      });
    });
  }
  if (currentType.value !== 'add' && data.industryList && data.industryList.length) {
    data.industryList.forEach((val: any) => {
      formData.industryDetailIds.push(val.id);
      formData.outType = val.outType;
      formData.outStartTime = val.outStartTime;
      formData.outEndTime = val.outEndTime;
    });
    formData.outRemark = data.partnerInfo?.outRemark || data.outRemark;
  }
};

const changeOutType = () => {
  formData.outStartTime = '';
  formData.outEndTime = '';
};


const onAnnounceFileUploadSuccess = async (file: any) => {
  file.status = 'uploading';
  const fd = new FormData();
  fd.append('uploadFile', file.file);
  fd.append('fieldName', 'outStorageFiles');
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
      formData.outStorageFiles.push({
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
  const index = formData.outStorageFiles.findIndex((item: any) => item.originalName === file.name || item.originalName === file.originalName);
  if (index > -1) {
    formData.outStorageFiles.splice(index, 1);
  }
};

const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.industryDetailIds.length) {
      showToast('请选择退库行业');
      reject();
      return;
    }
    if (!formData.outRemark) {
      showToast('请输入退库说明');
      reject();
      return;
    }
    resolve(formData);
  });
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

.time-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-range {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 10px 12px;

  &__item {
    flex: 1;
  }

  &__label {
    font-size: 12px;
    color: #969799;
    display: block;
    margin-bottom: 4px;
  }

  &__value {
    font-size: 14px;
    color: #323233;
    display: block;
  }

  &__separator {
    color: #969799;
    font-size: 14px;
    padding-top: 20px;
    flex-shrink: 0;
  }
}

.file-link {
  color: #4A90E5;
  font-size: 13px;
  padding: 2px 0;
}
</style>
