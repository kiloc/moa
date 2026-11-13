<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">入库依据</div>
    <van-form ref="formRef">
      <van-field v-model="formData.joinCode" label="入库单据编号" readonly placeholder="保存后自动生成" />
      <van-field
        v-model="formData.joinName"
        label="入库单据名称"
        placeholder="请输入入库单据名称"
        autosize
        type="textarea"
        maxlength="100"
        readonly
      />
<!--      <van-field label="入库依据">-->
<!--        <template #input>-->
<!--        <div v-for="item in formData.inboundFiles" :key="item.fileName" class="file-link" @click="downloadFile('inboundFiles', item.fileName, item.originalName)">-->
<!--              {{ item.originalName }}-->
<!--            </div>-->
<!--        </template>-->
<!--      </van-field>-->

      <van-field label="行业/领域/场景子库">
        <template #input>
          <div v-if="industryGroups.length" class="scene-list">
            <div v-for="(item, index) in industryGroups" :key="item.rowKey" class="scene-item">
              <div class="scene-item__summary" @click="toggleExpand(item.rowKey)">
                <span class="scene-item__index">{{ index + 1 }}</span>
                <span class="scene-item__text">{{ item.industryName || '-' }}</span>
                <van-icon :name="expandedKeys.has(item.rowKey) ? 'arrow-up' : 'arrow-down'" class="scene-item__arrow" />
              </div>
              <div v-if="expandedKeys.has(item.rowKey)" class="scene-item__detail">
                <!-- 行业领域 / 场景子库明细 -->
                <div
                  v-for="(field, fi) in item.fields"
                  :key="fi"
                  class="scene-detail-block"
                >
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">行业领域</span>
                    <span class="scene-detail-row__value">{{ field.fieldName || '-' }}</span>
                  </div>
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">场景子库</span>
                    <span class="scene-detail-row__value">{{ field.scenceNames.length ? field.scenceNames.join(' / ') : '-' }}</span>
                  </div>
                </div>
                <!-- (库级别, 区域) 组合：与行业领域/场景子库同样的横排 label/value -->
                <div
                  v-for="(cell, ci) in item.cells"
                  :key="'cell-' + ci"
                  class="scene-detail-block"
                >
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">库级别</span>
                    <span class="scene-detail-row__value">{{ cell.libraryLevelText }}</span>
                  </div>
                  <div class="scene-detail-row">
                    <span class="scene-detail-row__label">区域</span>
                    <span class="scene-detail-row__value">{{ cell.areaName || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="scene-empty">暂无数据</div>
        </template>
      </van-field>

      <van-field v-model="formData.createUserName" label="创建人" readonly />
      <van-field v-model="formData.createDeptName" autosize type="textarea" label="创建部门" readonly />
      <van-field v-model="formData.createTime" label="入库单创建时间" readonly />
    </van-form>

  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLoginStore, useDictMapStore } from '@/store';
import { formatDate } from '@/common/utils';


const loginStore = useLoginStore();
const dictMapStore = useDictMapStore();
const userInfo = computed(() => loginStore.userInfo || {}) as any;

const props = defineProps({
  joinType: { type: String, default: '' },
});

const formRef = ref();
const currentType = ref('add');

const createRowKey = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const createSceneRow = (data: Partial<any> = {}) => ({
  rowKey: createRowKey(),
  scenceCode: [],
  fieldCode: '',
  fieldCodeText: '',
  industryCode: '',
  industryCodeText: '',
  ...data,
});

const formData = reactive({
  id: 0,
  inboundFiles: [] as any[],
  scenceRelList: [createSceneRow()],
  partnerCode: '',
  partnerName: '',
  joinCode: '',
  joinName: '',
  createUserNo: userInfo.value?.loginName,
  createUserName: userInfo.value?.showName,
  createDeptNo: userInfo.value?.deptId,
  createDeptName: userInfo.value?.deptName,
  createTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
});

const formDataCopy = JSON.parse(JSON.stringify(formData));
const fieldCodeList = ref<Record<string, any[]>>({});
const scenceCodeList = ref<Record<string, any[]>>({});
const scenceIdMap = ref<Record<string, any>>({});
const errorText = ref('');

// 按行业（industryCode）聚合的展示数据：每个行业下挂 N 个 (库级别, 区域) 组合 + 行业领域/场景子库明细
const industryGroups = ref<Array<{
  rowKey: string;
  industryCode: string;
  industryName: string;
  cells: Array<{ libraryLevel: string; libraryLevelText: string; areaCode: string; areaName: string; }>;
  fields: Array<{ fieldCode: string; fieldName: string; scenceNames: string[] }>;
}>>([]);

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
  if (list.length) return list.map((s: any) => s.name).join(' / ');
  // 兜底：从 scenceCode 推算
  return (item.scenceCode || []).join(' / ');
};

// 字典翻译：dictBusiLevel（1/2/3 -> 一集库/二集库/三集库）
const getDictBusiLevelText = (value: string | number | undefined) => {
  if (value === '' || value === null || value === undefined) return '';
  const list = dictMapStore.getDictMap?.dictBusiLevel || [];
  const item = list.find((i: any) => String(i.id) === String(value));
  return item ? item.name : String(value);
};

const showData = (data: any, type: string) => {
  currentType.value = type;
  formData.id = data.foundationInfo.id;
  formData.partnerCode = data.foundationInfo.partnerCode;
  formData.partnerName = data.foundationInfo.partnerName;
  formData.joinCode = data.foundationInfo.joinCode;
  formData.joinName = data.foundationInfo.joinName;
  formData.createUserNo = data.foundationInfo.createUserNo;
  formData.createUserName = data.foundationInfo.createUserName;
  formData.createDeptNo = data.foundationInfo.createDeptNo;
  formData.createDeptName = data.foundationInfo.createDeptName;
  formData.createTime = data.foundationInfo.createTime;
  data.inboundFiles.forEach((item: any) => { item.name = item.originalName; });
  formData.inboundFiles = data.inboundFiles;

  formData.scenceRelList = [];
  fieldCodeList.value = {};
  scenceCodeList.value = {};
  scenceIdMap.value = {};
  let fieldList: any[] = [];
  let scenceList: any[] = [];
  let obj: any = {};
  data.scenceRelList.forEach((item: any) => {
    if (item.id) scenceIdMap.value[`${item.fieldCode}_${item.scenceCode}`] = item.id;
    if (!obj[item.fieldCode]) {
      obj[item.fieldCode] = createSceneRow({
        scenceCode: [item.scenceCode],
        fieldCode: item.fieldCode,
        fieldCodeText: item.fieldName,
        industryCode: item.industryCode,
        industryCodeText: item.industryName,
      });
    } else {
      obj[item.fieldCode].scenceCode.push(item.scenceCode);
    }
    fieldList.push({ id: item.fieldCode, name: item.fieldName });
    scenceList.push({ id: item.scenceCode, name: item.scenceName });
  });
  for (const key in obj) {
    formData.scenceRelList.push(obj[key]);
    fieldCodeList.value[obj[key].rowKey] = [...fieldList];
    scenceCodeList.value[obj[key].rowKey] = [...scenceList];
  }

  // 按 industryCode 聚合：每个行业下挂若干 (库级别, 区域) 组合（去重）+ 行业领域/场景子库明细
  industryGroups.value = [];
  const groupMap = new Map<string, any>();
  data.scenceRelList.forEach((item: any) => {
    const key = String(item.industryCode || '');
    if (!key) return;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        rowKey: createRowKey(),
        industryCode: key,
        industryName: item.industryName || '',
        cells: [],
        cellKeys: new Set<string>(),
        fields: [],
        fieldKeys: new Set<string>(),
        scenceKeyMap: new Map<string, Set<string>>(),
      });
    }
    const group = groupMap.get(key);
    // (库级别, 区域) 去重
    const cellKey = `${item.libraryLevel || ''}_${item.areaCode || ''}`;
    if (!group.cellKeys.has(cellKey)) {
      group.cellKeys.add(cellKey);
      group.cells.push({
        libraryLevel: item.libraryLevel || '',
        libraryLevelText: getDictBusiLevelText(item.libraryLevel) || '-',
        areaCode: item.areaCode || '',
        areaName: item.areaName || '',
      });
    }
    // 行业领域 / 场景子库 去重（同一行业领域下的同一场景子库只保留一次）
    const fieldKey = String(item.fieldCode || '');
    if (fieldKey && !group.fieldKeys.has(fieldKey)) {
      group.fieldKeys.add(fieldKey);
      group.fields.push({
        fieldCode: fieldKey,
        fieldName: item.fieldName || '',
        scenceNames: [],
      });
      group.scenceKeyMap.set(fieldKey, new Set<string>());
    }
    if (fieldKey && item.scenceName) {
      const seen = group.scenceKeyMap.get(fieldKey);
      if (!seen.has(item.scenceName)) {
        seen.add(item.scenceName);
        const field = group.fields.find((f: any) => f.fieldCode === fieldKey);
        if (field) field.scenceNames.push(item.scenceName);
      }
    }
  });
  groupMap.forEach(g => industryGroups.value.push(g));
};

const validateAll = () => {
  for (const row of formData.scenceRelList) {
    if (!row.scenceCode?.length || !row.fieldCode || !row.industryCode) {
      errorText.value = '请填写完整的行业/领域/场景子库';
      return false;
    }
  }
  return true;
};

const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.joinName) { errorText.value = '请填写入库单据名称'; reject(errorText.value); return; }
    if (!formData.inboundFiles?.length) { errorText.value = '请上传入库依据文件'; reject(errorText.value); return; }
    if (!validateAll()) { reject(errorText.value); return; }
    const params = { ...formData };
    const arr: any[] = [];
    params.scenceRelList.forEach((item: any) => {
      item.scenceCode.forEach((val: any) => {
        const mapKey = `${item.fieldCode}_${val}`;
        arr.push({ id: scenceIdMap.value[mapKey] || undefined, scenceCode: val, fieldCode: item.fieldCode, industryCode: item.industryCode });
      });
    });
    params.scenceRelList = arr;
    resolve(params);
  });
};

defineExpose({ handleSubmit, showData });

onActivated(() => {
  if (formDataCopy) {
    for (const key in formDataCopy) formData[key] = formDataCopy[key];
  }
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
  }
}

.scene-detail-block {
  border-bottom: 1px dashed #ebedf0;
  padding-bottom: 4px;
  margin-bottom: 4px;

  &:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
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
</style>
