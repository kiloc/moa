<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">行业或专业能力扩充</div>
    <van-form>
      <van-field label="行业/领域/场景子库" required>
        <template #input>
          <div v-if="formData.scenceRelList.length" class="scene-list">
            <div v-for="(item, index) in formData.scenceRelList" :key="item.rowKey" class="scene-item">
              <div class="scene-item__summary" @click="toggleExpand(item.rowKey)">
                <span class="scene-item__index">{{ index + 1 }}</span>
                <span class="scene-item__text">{{ item.industryCodeText || '-' }} / {{ item.fieldCodeText || '-' }}</span>
                <van-icon :name="expandedKeys.has(item.rowKey) ? 'arrow-up' : 'arrow-down'" class="scene-item__arrow" />
              </div>
              <div v-if="expandedKeys.has(item.rowKey)" class="scene-item__detail">
                <template v-if="currentType === 'auth' || currentType === 'info'">
                  <!-- 库级别 / 入库方式 / 区域（只读，与 PC 端 #spanMethod 合并的三列对齐） -->
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">库级别</span>
                    <span class="scene-detail-row__value">{{ item.dictBusiLevelName || getLevelName(item.dictBusiLevel) || '-' }}</span>
                  </div>
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">入库方式</span>
                    <span class="scene-detail-row__value">{{ getJoinTypeName(item.joinType) || '-' }}</span>
                  </div>
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">区域</span>
                    <span class="scene-detail-row__value">{{ item.areaName || getAreaName(item.areaCode) || '-' }}</span>
                  </div>
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
                    <span class="scene-detail-row__value">{{ getSceneNames(item) || '-' }}</span>
                  </div>
                </template>
                <template v-else>
                  <!-- 库级别 / 入库方式 / 区域（移动端不开放编辑，但需要展示） -->
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">库级别</span>
                    <span class="scene-detail-row__value">{{ item.dictBusiLevelName || getLevelName(item.dictBusiLevel) || '-' }}</span>
                  </div>
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">入库方式</span>
                    <span class="scene-detail-row__value">{{ getJoinTypeName(item.joinType) || '-' }}</span>
                  </div>
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">区域</span>
                    <span class="scene-detail-row__value">{{ item.areaName || getAreaName(item.areaCode) || '-' }}</span>
                  </div>
                  <div class="scene-detail-row scene-detail-row--editable" @click="openIndustryPicker(index, item)">
                    <span class="scene-detail-row__label">行业</span>
                    <span class="scene-detail-row__value" :class="{ 'scene-detail-row__placeholder': !item.industryCodeText }">
                      {{ item.industryCodeText || '请选择行业' }}
                    </span>
                    <van-icon name="arrow" class="scene-detail-row__link" />
                  </div>
                  <div class="scene-detail-row scene-detail-row--editable" @click="openFieldPicker(index, item)">
                    <span class="scene-detail-row__label">行业领域</span>
                    <span class="scene-detail-row__value" :class="{ 'scene-detail-row__placeholder': !item.fieldCodeText }">
                      {{ item.fieldCodeText || '请选择行业领域' }}
                    </span>
                    <van-icon name="arrow" class="scene-detail-row__link" />
                  </div>
                  <div class="scene-detail-row scene-detail-row--column">
                    <span class="scene-detail-row__label">场景子库</span>
                    <div class="scene-detail-row__checkboxes">
                      <van-checkbox-group v-model="item.scenceCode" direction="horizontal">
                        <van-checkbox v-for="s in scenceCodeList[item.rowKey] || []" :key="s.id" :name="s.id">
                          {{ s.name }}
                        </van-checkbox>
                      </van-checkbox-group>
                    </div>
                  </div>
                  <div v-if="item.add" class="scene-item__actions">
                    <van-button size="small" type="danger" plain @click="handleDelete(index)" :disabled="formData.scenceRelList.length <= 1">删除</van-button>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div v-else class="scene-empty">暂无数据</div>
          <van-button v-if="currentType === 'add' || currentType === 'edit'" type="primary" plain block size="small" @click="handleAdd" style="margin-top: 8px">
            + 添加行业/领域/场景子库
          </van-button>
        </template>
      </van-field>
      <!-- <van-field label="入库依据" required>
        <template #input>
          <van-uploader
            v-if="currentType === 'add' || currentType === 'edit'"
            v-model="vantFiles"
            :max-count="10"
            :after-read="onAnnounceFileUploadSuccess"
            @delete="onAnnounceFileRemove"
          />
          <div v-else>
            <div v-for="item in formData.inboundFiles" :key="item.fileName" class="file-link" @click="downloadAppFile(item.name || item.originalName, 'inboundFiles', item.filename||item.fileName)">
              {{ item.originalName }}
            </div>
          </div>
        </template>
      </van-field> -->
      <van-field label="申请说明">
        <template #input>
          <span class="plain-text">{{ formData.outRemark || '-' }}</span>
        </template>
      </van-field>
    </van-form>

    <van-popup v-model:show="showIndustryPicker" round position="bottom">
      <van-picker :columns="industryPickerColumns" @confirm="onIndustryConfirm" @cancel="showIndustryPicker = false" />
    </van-popup>
    <van-popup v-model:show="showFieldPicker" round position="bottom">
      <van-picker :columns="fieldPickerColumns" @confirm="onFieldConfirm" @cancel="showFieldPicker = false" />
    </van-popup>
  </van-cell-group>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { downloadAppFile } from '@/common/utils';
import { API_CONTEXT } from '@/api/config';
import { AUTH_SIGN } from '@/common/http/config';
import { DictionaryController } from '@/api/system';
import { useDictMapStore } from '@/store';
import { getToken} from '@/common/utils/index';
const currentType = ref('add');
const dictMapStore = useDictMapStore();
const vantFiles = ref<any[]>([]);

const createRowKey = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const createSceneRow = (data: Partial<any> = {}) => ({
  rowKey: createRowKey(),
  add: true,
  scenceCode: [],
  fieldCode: '',
  fieldCodeText: '',
  industryCode: '',
  industryCodeText: '',
  // 5.2.1.7+ 扩充区域：库级别/入库方式/区域（与 joinId+regionId 同时保留）
  dictBusiLevel: '',
  dictBusiLevelName: '',
  joinType: '',
  joinTypeName: '',
  joinId: '',
  regionId: '',
  areaCode: '',
  areaName: '',
  ...data,
});

const formData = reactive({
  scenceRelList: [createSceneRow()],
  inboundFiles: [] as any[],
  partnerCode: '',
  outRemark: '',
}) as any;

const fieldCodeList = ref<Record<string, any[]>>({});
const scenceCodeList = ref<Record<string, any[]>>({});

// 展开/收起
const expandedKeys = reactive(new Set());
const toggleExpand = (rowKey: string) => {
  if (expandedKeys.has(rowKey)) {
    expandedKeys.delete(rowKey);
  } else {
    expandedKeys.add(rowKey);
  }
};
const getSceneNames = (item: any) => {
  const list = scenceCodeList.value[item.rowKey] || [];
  if (list.length) {
    const names = list
      .filter((s: any) => (item.scenceCode || []).includes(s.id))
      .map((s: any) => s.name);
    if (names.length) return names.join(' / ');
  }
  return '';
};

// ===== 字典翻译（库级别 / 入库方式 / 区域），参考 PC 端 abilityAdd.vue =====
const getLevelName = (code: string) => {
  if (!code) return '-';
  const list = (dictMapStore.getDictMap.dictBusiLevel || []) as any[];
  const hit = list.find((item: any) => String(item.id) === String(code));
  return hit ? hit.name : code;
};
const getJoinTypeName = (code: string) => {
  if (!code) return '-';
  const list = (dictMapStore.getDictMap.joinType || []) as any[];
  // 兼容数字编码（'1'/'2'/'3'）与 5.2.1.7+ 字符串枚举（PURCHASE_IN/RECRUIT_IN/...）
  const JOIN_TYPE_NUMBER_MAP: Record<string, string> = {
    '1': 'PURCHASE_IN',
    '2': 'RECRUIT_IN',
    '3': 'URGENT_ORIENT_IN',
  };
  const lookupCode = JOIN_TYPE_NUMBER_MAP[String(code)] || String(code);
  const hit = list.find(
    (item: any) => String(item.id) === lookupCode || String(item.itemId) === lookupCode,
  );
  return hit ? hit.name : code;
};
const getAreaName = (code: string) => {
  if (!code) return '-';
  const list = (dictMapStore.getDictMap.regionCityCode || []) as any[];
  const hit = list.find((item: any) => String(item.id) === String(code));
  return hit ? hit.name : code;
};

const showIndustryPicker = ref(false);
const showFieldPicker = ref(false);
const pickerIndex = ref(0);

const industryPickerColumns = computed(() =>
  (dictMapStore.getDictMap.portalIndustryList || []).map((item: any) => ({ text: item.name, value: item.id })),
);
const fieldPickerColumns = computed(() => {
  const row = formData.scenceRelList[pickerIndex.value];
  if (!row) return [];
  return (fieldCodeList.value[row.rowKey] || []).map((item: any) => ({ text: item.name, value: item.id }));
});

const openIndustryPicker = (index: number, item: any) => {
  if (currentType.value === 'auth' || currentType.value === 'info' || !item.add) return;
  pickerIndex.value = index;
  showIndustryPicker.value = true;
};

const openFieldPicker = (index: number, item: any) => {
  if (currentType.value === 'auth' || currentType.value === 'info' || !item.add) return;
  pickerIndex.value = index;
  showFieldPicker.value = true;
};

const onIndustryConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0];
  if (selected) {
    const idx = pickerIndex.value;
    formData.scenceRelList[idx].industryCode = selected.value;
    formData.scenceRelList[idx].industryCodeText = selected.text;
    changeMain(selected.value, formData.scenceRelList[idx], idx, 'portalRealm');
  }
  showIndustryPicker.value = false;
};

const onFieldConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0];
  if (selected) {
    const idx = pickerIndex.value;
    formData.scenceRelList[idx].fieldCode = selected.value;
    formData.scenceRelList[idx].fieldCodeText = selected.text;
    changeMain(selected.value, formData.scenceRelList[idx], idx, 'partnerScence');
  }
  showFieldPicker.value = false;
};

const changeMain = (val: any, row: any, index: number, type: string) => {
  DictionaryController.scenceRelChildren({ typeCode: type, parentCodeId: val })
    .then((resp: any) => {
      if (resp?.data) {
        resp.data.forEach((item: any) => { item.id = item.codeId; item.name = item.codeName; });
      }
      if (type === 'portalRealm') {
        fieldCodeList.value[row.rowKey] = resp.data || [];
        scenceCodeList.value[row.rowKey] = [];
        formData.scenceRelList[index].fieldCode = '';
        formData.scenceRelList[index].fieldCodeText = '';
        formData.scenceRelList[index].scenceCode = [];
      }
      if (type === 'partnerScence') {
        scenceCodeList.value[row.rowKey] = resp.data || [];
        formData.scenceRelList[index].scenceCode = [];
      }
    })
    .catch(() => {});
};

const showData = (data: any, type: string) => {
  currentType.value = type;
  const files = Array.isArray(data.inboundFiles) ? data.inboundFiles : data.inboundFiles ? [data.inboundFiles] : [];
  files.forEach((item: any) => { item.name = item.originalName; });
  formData.inboundFiles = files;
  vantFiles.value = files.map((f: any) => ({ ...f, url: '', name: f.originalName }));
  formData.scenceRelList = [];
  fieldCodeList.value = {};
  scenceCodeList.value = {};
  let fieldList: any[] = [];
  let scenceList: any[] = [];
  let obj: any = {};
  let lastOutRemark: any = undefined;
  (data.industryIncInfoHisList || []).forEach((item: any) => {
    lastOutRemark = item.outRemark;
    // 审批模式（auth）：过滤掉 isNew=1 的已有数据，仅展示本次新增（isNew=0）的扩充行
    if (currentType.value === 'auth' && item.isNew === 1) return;
    if (!obj[item.fieldCode]) {
      obj[item.fieldCode] = createSceneRow({
        add: item.add,
        scenceCode: [item.scenceCode],
        fieldCode: item.fieldCode,
        fieldCodeText: item.fieldName,
        industryCode: item.industryCode,
        industryCodeText: item.industryName,
        // 5.2.1.7+ 扩充区域：库级别/入库方式/区域（与 joinId/regionId 一起保留）
        dictBusiLevel: item.dictBusiLevel || '',
        dictBusiLevelName: item.dictBusiLevelName || '',
        joinType: item.joinType || '',
        joinTypeName: item.joinType || '',
        joinId: item.joinId || '',
        regionId: item.regionId,
        areaCode: item.regionCode || item.areaCode || '',
        areaName: item.regionName || item.areaName || '',
      });
    } else {
      obj[item.fieldCode].scenceCode.push(item.scenceCode);
    }
    fieldList.push({ id: item.fieldCode, name: item.fieldName });
    scenceList.push({ id: item.scenceCode, name: item.scenceName });
  });
  // outRemark 在循环外统一赋值，避免被 auth 过滤掉的项干扰
  if (lastOutRemark !== undefined) {
    formData.outRemark = lastOutRemark;
  }
  for (const key in obj) {
    formData.scenceRelList.push(obj[key]);
    fieldCodeList.value[obj[key].rowKey] = [...fieldList];
    scenceCodeList.value[obj[key].rowKey] = [...scenceList];
  }
};

const handleAdd = () => { formData.scenceRelList.push(createSceneRow()); };
const handleDelete = (index: number) => {
  if (formData.scenceRelList.length <= 1) { showToast('至少保留一条'); return; }
  const deletedRow = formData.scenceRelList[index];
  formData.scenceRelList.splice(index, 1);
  if (deletedRow?.rowKey) { delete fieldCodeList.value[deletedRow.rowKey]; delete scenceCodeList.value[deletedRow.rowKey]; }
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
    const res = await fetch(`${API_CONTEXT}/manage/file/upload`, { method: 'POST', headers: { Authorization: token || '', 'Auth-Sign': AUTH_SIGN, Sourcesystem: 'moa' }, body: fd });
    const response = await res.json();
    if (response.data) {
      formData.inboundFiles.push({ fileName: response.data.filename, originalName: response.data.originalName, downloadUri: response.data.downloadUri, uploadPath: response.data.uploadPath });
      file.status = 'done';
      showToast('文件上传成功');
    }
  } catch { file.status = 'failed'; }
};

const onAnnounceFileRemove = (file: any) => {
  const index = formData.inboundFiles.findIndex((item: any) => item.originalName === file.name || item.originalName === file.originalName);
  if (index > -1) formData.inboundFiles.splice(index, 1);
};

const validateAll = () => {
  for (const row of formData.scenceRelList) {
    if (!row.scenceCode?.length || !row.fieldCode || !row.industryCode) {
      showToast('请填写完整的行业/领域/场景子库列表');
      return false;
    }
  }
  return true;
};

const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.inboundFiles?.length) { showToast('请上传文件'); reject(); return; }
    if (!validateAll()) { reject(); return; }
    const params = { ...formData };
    const arr: any[] = [];
    params.scenceRelList.forEach((item: any) => {
      item.scenceCode.forEach((val: any) => {
        const row: any = {
          // 与 PC 端 abilityAdd.vue handleSubmit 对齐
          joinId: item.joinId,            // 入库单据 ID
          regionId: item.regionId,        // 区域 ID
          scenceCode: val,                // 场景编码
          fieldCode: item.fieldCode,      // 行业领域编码
          industryCode: item.industryCode, // 行业编码
          dictBusiLevel: item.dictBusiLevel,
          joinType: item.joinType,
          areaCode: item.areaCode,
          outRemark: params.outRemark,
        };
        // add / edit 模式带 isNew（是否扩充：0=是，1=否）
        if (currentType.value === 'add' || currentType.value === 'edit') {
          row.isNew = item.isNew ? 0 : 1;
        }
        arr.push(row);
      });
    });
    params.scenceRelList = arr;
    resolve(params);
  });
};

defineExpose({ handleSubmit, showData });

onActivated(() => {
  formData.scenceRelList = [createSceneRow()];
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

.scene-card {
  margin: 8px 0;
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
    cursor: pointer;
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

  &__actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }
}

.scene-detail-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;

  &--column {
    flex-direction: column;
    align-items: flex-start;
  }

  &--editable {
    cursor: pointer;
  }

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

  &__placeholder {
    color: #c8c9cc;
  }

  &__link {
    font-size: 14px;
    color: #969799;
    flex-shrink: 0;
    margin-left: 4px;
  }

  &__checkboxes {
    margin-top: 4px;
    width: 100%;
  }
}

.scene-empty {
  font-size: 13px;
  color: #969799;
  text-align: center;
  padding: 12px 0;
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
</style>
