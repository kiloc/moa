<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">合作伙伴基本信息</div>
    <van-form ref="formRef">
      <van-field
        v-model="formData.partnerName"
        label="合作伙伴名称"
        placeholder="请输入合作伙伴名称"
        maxlength="50"
        autosize
        type="textarea"
        readonly
      />
      <van-field
        v-model="formData.partnerAccount"
        label="合作伙伴账号"
        placeholder="-"
        readonly
      />
      <van-field label="标签" v-if="formData.partnerLabel">
        <template #input>
          <span class="partner-label">{{ formData.partnerLabel }}</span>
        </template>
      </van-field>
      <van-field
        v-model="dictBusiLevelText"
        readonly
        label="DICT集成库级别"
      />
      <van-field
        v-model="partnerTypeText"
        readonly
        label="合作伙伴类别"
      />
      <van-field
        v-model="formData.partnerUserName"
        label="联系人"
        placeholder="请输入联系人"
        maxlength="50"
        type="textarea"
        readonly
      />
      <van-field label="行业/领域/场景子库" v-if="isShow">
        <template #input>
          <div v-if="sceneList.length" class="scene-list">
            <div v-for="(item, index) in sceneList" :key="item.rowKey" class="scene-item">
              <div class="scene-item__summary" @click="toggleExpand(item.rowKey)">
                <span class="scene-item__index">{{ index + 1 }}</span>
                <span class="scene-item__text">{{ item.industryCodeText || '-' }} / {{ item.fieldCodeText || '-' }}</span>
                <van-icon :name="expandedKeys.has(item.rowKey) ? 'arrow-up' : 'arrow-down'" class="scene-item__arrow" />
              </div>
              <div v-if="expandedKeys.has(item.rowKey)" class="scene-item__detail">
                <div class="scene-detail-row">
                  <span class="scene-detail-row__label">行业</span>
                  <span class="scene-detail-row__value">{{ item.industryCodeText || '-' }}</span>
                </div>
                <div class="scene-detail-row">
                  <span class="scene-detail-row__label">行业领域</span>
                  <span class="scene-detail-row__value">{{ item.fieldCodeText || '-' }}</span>
                </div>
                <div class="scene-detail-row">
                  <span class="scene-detail-row__label">场景子库</span>
                  <span class="scene-detail-row__value">{{ item.scenceNames || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="scene-empty">暂无数据</div>
        </template>
      </van-field>
      <van-field
        v-model="formData.partnerMobile"
        label="联系电话"
        placeholder="接收合作伙伴门户帐号密码的手机号码"
        readonly
      />
       <van-field
        v-model="formData.partnerUserEmail"
        label="电子邮箱"
        placeholder="接收合作伙伴门户帐号密码的电子邮箱"
        readonly
      />
      <van-field v-if="props.business === 'inDatabase'" label="合作有效期">
        <template #input>
          <span style="margin-right: 8px">{{ formData.coopValidityPeriod}}</span>
          <span style="margin-left: 8px">年</span>
        </template>
      </van-field>
      <van-field
        v-model="formData.companyAddress"
        label="公司地址"
        placeholder="请输入公司地址"
        maxlength="200"
        autosize
        type="textarea"
        readonly
      />
      <van-field
        v-model="companyEstablishmentDateText"
        readonly
        label="公司成立时间"
      />
      <van-field
        v-model="formData.legalRepresentative"
        label="法定代表人"
        placeholder="请输入法定代表人"
        maxlength="20"
        readonly
      />
      <van-field
        v-model="formData.busiLicenseNo"
        label="营业执照注册号"
        placeholder="请输入营业执照注册号"
        maxlength="30"
        readonly
      />
      <van-field
        v-model="companyTypeText"
        readonly
        label="公司类型"
      />
      <van-field label="营业期限">
        <template #input>
          <div class="date-range-text">
            <span>{{ formData.businessTermStart || '-' }}</span>
            <span class="separator">至</span>
            <span>{{ formData.businessTermEnd || '-' }}</span>
          </div>
        </template>
      </van-field>
      <van-field
        v-model="isListedText"
        readonly
        label="是否上市公司"
      />
      <van-field v-model="formData.registeredCapital" label="注册资本（万）" readonly />
      <van-field
        v-model="registeredCapitalTypeText"
        readonly
        label="注册资本币种"
      />
      <van-field
        v-model="formData.uscc"
        label="统一社会信用代码"
        placeholder="请输入统一社会信用代码"
        maxlength="64"
        readonly
      />
      <van-field
        v-model="countryText"
        readonly
        label="国家"
      />
      <van-field
        v-model="provinceText"
        readonly
        label="省份"
      />
      <van-field
        v-model="taxIdentificationText"
        readonly
        label="纳税标识"
      />
      <van-field
        v-model="taxCreditLevelText"
        readonly
        label="纳税信用等级"
      />
      <van-field
        v-model="formData.taxpayerIdentificationCode"
        label="纳税人识别号"
        placeholder="请输入纳税人识别号"
        readonly
      />
      <van-field
        v-model="formData.businessScope"
        label="经营范围"
        type="textarea"
        rows="2"
        maxlength="2000"
        placeholder="请输入经营范围"
        readonly
      />
      <van-field
        v-model="formData.remark"
        label="备注"
        type="textarea"
        rows="2"
        maxlength="500"
        placeholder="请输入备注信息（选填）"
        readonly
      />

<!--      <van-field label="营业执照正本">-->
<!--        <template #input>-->
<!--          <div v-for="f in formData.licenseFiles" :key="f.fileName" class="file-link" @click="downloadFile('licenseFiles', f.fileName, f.originalName)">{{ f.originalName }}</div>-->
<!--        </template>-->
<!--      </van-field>-->
<!--      <van-field label="营业执照副本">-->
<!--        <template #input>-->
<!--          <div v-for="f in formData.licenseCopyFiles" :key="f.fileName" class="file-link" @click="downloadFile('licenseCopyFiles', f.fileName, f.originalName)">{{ f.originalName }}</div>-->
<!--        </template>-->
<!--      </van-field>-->
<!--      <van-field label="银行帐户开户许可证">-->
<!--        <template #input>-->
<!--          <div v-for="f in formData.bankFiles" :key="f.fileName" class="file-link" @click="downloadFile('bankFiles', f.fileName, f.originalName)">{{ f.originalName }}</div>-->
<!--        </template>-->
<!--      </van-field>-->
<!--      <van-field label="合作伙伴资源审查表">-->
<!--        <template #input>-->
<!--          <div v-for="f in formData.portalReviewFiles" :key="f.fileName" class="file-link" @click="downloadFile('portalReviewFiles', f.fileName, f.originalName)">{{ f.originalName }}</div>-->
<!--        </template>-->
<!--      </van-field>-->
<!--      <van-field label="其它附件(如业绩)">-->
<!--        <template #input>-->
<!--          <div v-for="f in formData.otherFiles" :key="f.fileName" class="file-link" @click="downloadFile('otherFiles', f.fileName, f.originalName)">{{ f.originalName }}</div>-->
<!--        </template>-->
<!--      </van-field>-->
    </van-form>

    <van-popup v-model:show="showPickerPopup" round position="bottom">
      <van-picker :columns="currentPickerColumns" @confirm="onPickerConfirm" @cancel="showPickerPopup = false" />
    </van-popup>
    <van-popup v-model:show="showDatePopup" round position="bottom">
      <van-date-picker v-model="datePickerValue" title="选择日期" @confirm="onDateConfirm" @cancel="showDatePopup = false" />
    </van-popup>
  </van-cell-group>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { getToken } from '@/common/utils';
import { API_CONTEXT } from '@/api/config';
import { AUTH_SIGN } from '@/common/http/config';
import { useLoginStore, useDictMapStore } from '@/store';

const loginStore = useLoginStore();
const dictMapStore = useDictMapStore();
const userInfo = computed(() => loginStore.userInfo || {}) as any;

const props = defineProps({
  business: { type: String, default: '' },
  hideFile: { type: Boolean, default: false },
  isShow: { type: Boolean, default: false},
});

const formRef = ref();
const currentType = ref('add');
const errorText = ref('');

const formData = reactive({
  partnerName: '',
  partnerAccount: '',
  partnerLabel: '',
  dictBusiLevel: '',
  dictBusiLevelName: '',
  partnerType: '',
  partnerUserName: '', // 联系人（详情接口 partnerUserName）
  partnerMobile: '',
  partnerUserEmail: '',
  coopValidityPeriod: 1,
  companyAddress: '',
  companyEstablishmentDate: '',
  legalRepresentative: '',
  busiLicenseNo: '',
  companyType: '',
  businessTermStart: '',
  businessTermEnd: '',
  isListed: '',
  registeredCapital: 0,
  registeredCapitalType: '',
  uscc: '',
  country: '',
  province: '',
  taxIdentification: '',
  taxCreditLevel: '',
  taxpayerIdentificationCode: '',
  businessScope: '',
  remark: '',
  licenseFiles: [] as any[],
  licenseCopyFiles: [] as any[],
  bankFiles: [] as any[],
  portalReviewFiles: [] as any[],
  otherFiles: [] as any[],
  scenceRelList: [] as any[],
});

const licenseFiles = ref<any[]>([]);
const licenseCopyFiles = ref<any[]>([]);
const bankFiles = ref<any[]>([]);
const portalReviewFiles = ref<any[]>([]);
const otherFiles = ref<any[]>([]);

// 行业/领域/场景子库
const sceneList = ref<any[]>([]);
const expandedKeys = reactive(new Set());
const createRowKey = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const toggleExpand = (rowKey: string) => {
  if (expandedKeys.has(rowKey)) {
    expandedKeys.delete(rowKey);
  } else {
    expandedKeys.add(rowKey);
  }
};

const processScenceRelList = (list: any[]) => {
  sceneList.value = [];
  expandedKeys.clear();
  if (!list || !list.length) return;
  const obj: Record<string, any> = {};
  const scenceNameMap: Record<string, string[]> = {};
  list.forEach((item: any) => {
    if (!obj[item.fieldCode]) {
      obj[item.fieldCode] = {
        rowKey: createRowKey(),
        fieldCode: item.fieldCode,
        fieldCodeText: item.fieldName,
        industryCode: item.industryCode,
        industryCodeText: item.industryName,
        scenceCodes: [item.scenceCode],
        scenceNames: [] as string[],
      };
      scenceNameMap[obj[item.fieldCode].rowKey] = [item.scenceName];
    } else {
      obj[item.fieldCode].scenceCodes.push(item.scenceCode);
      scenceNameMap[obj[item.fieldCode].rowKey].push(item.scenceName);
    }
  });
  for (const key in obj) {
    obj[key].scenceNames = scenceNameMap[obj[key].rowKey].join(' / ');
    sceneList.value.push(obj[key]);
  }
};

const getDictText = (dictCode: string, value: string) => {
  if (!value) return '';
  const list = dictMapStore.getDictMap[dictCode] || [];
  const item = list.find((i: any) => String(i.id) === String(value));
  return item ? item.name : '';
};

const dictBusiLevelText = computed(() => formData.dictBusiLevelName || getDictText('dictBusiLevel', formData.dictBusiLevel) || '-');
const partnerTypeText = computed(() => getDictText('partnerType', formData.partnerType) || '-');
const companyTypeText = computed(() => getDictText('companyType', formData.companyType) || '-');
const isListedText = computed(() => getDictText('isListed', formData.isListed) || '-');
const registeredCapitalTypeText = computed(() => getDictText('registeredCapitalType', formData.registeredCapitalType) || '-');
const countryText = computed(() => getDictText('countryCode', formData.country) || '-');
// 省份：formData.province 是名称（如"天津市"），provinceCode 字典是 { id, name }，
// 直接用 province 当 name 展示，无需匹配 id
const provinceText = computed(() => getDictText('provinceCode', formData.province) || '-');
const taxIdentificationText = computed(() => getDictText('taxIdentification', formData.taxIdentification) || '-');
const taxCreditLevelText = computed(() => getDictText('taxCreditLevel', formData.taxCreditLevel) || '-');
const companyEstablishmentDateText = computed(() => formData.companyEstablishmentDate || '-');

const showPickerPopup = ref(false);
const showDatePopup = ref(false);
const currentPickerKey = ref('');
const datePickerTarget = ref('');
const datePickerValue = ref(['2025', '01', '01']);

const pickerDictMap: Record<string, string> = {
  partnerType: 'partnerType',
  companyType: 'companyType',
  isListed: 'isListed',
  registeredCapitalType: 'registeredCapitalType',
  country: 'countryCode',
  province: 'provinceCode',
  taxIdentification: 'taxIdentification',
  taxCreditLevel: 'taxCreditLevel',
};

const currentPickerColumns = computed(() => {
  const dictCode = pickerDictMap[currentPickerKey.value] || '';
  return (dictMapStore.getDictMap[dictCode] || []).map((item: any) => ({ text: item.name, value: String(item.id) }));
});

const openPicker = (key: string) => {
  if (currentType.value === 'auth' || currentType.value === 'info') return;
  currentPickerKey.value = key;
  showPickerPopup.value = true;
};

const onPickerConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0];
  if (selected) {
    formData[currentPickerKey.value] = selected.value;
  }
  showPickerPopup.value = false;
};

const openDatePicker = (target: string) => {
  if (currentType.value === 'auth' || currentType.value === 'info') return;
  datePickerTarget.value = target;
  if (formData[target]) datePickerValue.value = formData[target].split('-');
  showDatePopup.value = true;
};

const onDateConfirm = ({ selectedValues }: any) => {
  formData[datePickerTarget.value] = selectedValues.join('-');
  showDatePopup.value = false;
};

const downloadFile = (fieldName: string, filename: string, displayName: string) => {
  const token = getToken();
  window.open(`${API_CONTEXT}/manage/file/download?fieldName=${encodeURIComponent(fieldName)}&filename=${encodeURIComponent(filename)}&asImage=false&Authorization=${encodeURIComponent(token || '')}`, '_blank');
};

const onFileUpload = async (file: any, field: string) => {
  file.status = 'uploading';
  const fd = new FormData();
  fd.append('uploadFile', file.file);
  fd.append('fieldName', field);
  fd.append('asImage', 'false');
  fd.append('businessId', '');
  fd.append('kind', '');
  try {
    const token = getToken();
    const res = await fetch(`${API_CONTEXT}/manage/file/upload`, { method: 'POST', headers: { Authorization: token || '', 'Auth-Sign': AUTH_SIGN, Sourcesystem: 'moa' }, body: fd });
    const response = await res.json();
    if (response.data) {
      formData[field].push({ fileName: response.data.filename, originalName: response.data.originalName, downloadUri: response.data.downloadUri, uploadPath: response.data.uploadPath });
      file.status = 'done';
      showToast('文件上传成功');
    }
  } catch { file.status = 'failed'; }
};

const onFileRemove = (file: any, field: string) => {
  const index = formData[field].findIndex((item: any) => item.originalName === file.name || item.originalName === file.originalName);
  if (index > -1) formData[field].splice(index, 1);
};

const toVantFiles = (list: any[]) => list.map((f: any) => ({ ...f, url: '', name: f.originalName }));

const showData = (data: any, type: string) => {
  currentType.value = type;
  const info = data.foundationInfo;
  formData.partnerName = info.partnerName;
  formData.partnerAccount = info.partnerAccount || '';
  formData.partnerLabel = info.partnerLabel || '';
  formData.dictBusiLevel = String(info.dictBusiLevel || '');
  formData.dictBusiLevelName = info.dictBusiLevelName || '';
  formData.partnerType = String(info.partnerType || '');
  formData.partnerUserName = info.partnerUserName || '';
  formData.partnerMobile = info.partnerMobile || '';
  formData.partnerUserEmail = info.partnerUserEmail || '';
  formData.coopValidityPeriod = info.coopValidityPeriod || 1;
  formData.companyAddress = info.companyAddress || '';
  formData.companyEstablishmentDate = info.companyEstablishmentDate || '';
  formData.legalRepresentative = info.legalRepresentative || '';
  formData.busiLicenseNo = info.busiLicenseNo || '';
  formData.companyType = String(info.companyType || '');
  formData.businessTermStart = info.businessTermStart || '';
  formData.businessTermEnd = info.businessTermEnd || '';
  formData.isListed = String(info.isListed || '');
  formData.registeredCapital = info.registeredCapital || 0;
  formData.registeredCapitalType = String(info.registeredCapitalType || '');
  formData.uscc = info.uscc || '';
  formData.country = String(info.country || '');
  formData.province = String(info.province || '');
  formData.taxIdentification = String(info.taxIdentification || '');
  formData.taxCreditLevel = String(info.taxCreditLevel || '');
  formData.taxpayerIdentificationCode = info.taxpayerIdentificationCode || '';
  formData.businessScope = info.businessScope || '';
  formData.remark = info.remark || '';

  formData.licenseFiles = data.licenseFiles || [];
  formData.licenseCopyFiles = data.licenseCopyFiles || [];
  formData.bankFiles = data.bankFiles || [];
  formData.portalReviewFiles = data.portalReviewFiles || [];
  formData.otherFiles = data.otherFiles || [];
  licenseFiles.value = toVantFiles(formData.licenseFiles);
  licenseCopyFiles.value = toVantFiles(formData.licenseCopyFiles);
  bankFiles.value = toVantFiles(formData.bankFiles);
  portalReviewFiles.value = toVantFiles(formData.portalReviewFiles);
  otherFiles.value = toVantFiles(formData.otherFiles);
  formData.scenceRelList = data.scenceRelList || [];
  processScenceRelList(data.scenceRelList);
};

const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.partnerName) { errorText.value = '请输入合作伙伴名称'; reject(errorText.value); return; }
    if (!formData.partnerType) { errorText.value = '请选择合作伙伴类别'; reject(errorText.value); return; }
    const params = { ...formData };
    resolve(params);
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

.date-range-text {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  font-size: 14px;
  color: #323233;

  .separator { color: #969799; white-space: nowrap; }
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .van-field { flex: 1; }
  .separator { color: #969799; white-space: nowrap; }
}

.file-link {
  color: #4A90E5;
  font-size: 13px;
  padding: 2px 0;
}

.scene-list {
  width: 100%;
}

.scene-item {
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;

  &__summary {
    display: flex;
    align-items: center;
    padding: 12px;
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

  &__text {
    flex: 1;
    font-size: 14px;
    color: #323233;
    margin-left: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    font-size: 14px;
    color: #969799;
    flex-shrink: 0;
    margin-left: 8px;
  }

  &__detail {
    padding: 0 12px 12px;
  }
}

.scene-detail-row {
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
}

.scene-empty {
  font-size: 13px;
  color: #969799;
  text-align: center;
  padding: 12px 0;
}

.partner-label {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  color: #4A90E5;
  background: #eaf3fc;
  border-radius: 10px;
}
</style>
