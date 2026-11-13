<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">合作经历</div>
    <div v-for="(item, index) in cooperationList" :key="index" class="list-card">
      <van-cell-group inset>
        <van-field
          v-model="item.partner"
          label="合作单位"
          placeholder="请输入合作单位"
          :disabled="!item.isEditing"
          required
        />
        <van-field
          v-model="item.regionText"
          is-link
          readonly
          label="合作区域"
          placeholder="请选择合作区域"
          :disabled="!item.isEditing"
          @click="openRegionPicker(index, item)"
        />
        <van-field
          v-model="item.projectName"
          label="合作项目名称"
          placeholder="请输入合作项目名称"
          :disabled="!item.isEditing"
          required
        />
        <van-field
          v-model="item.startDate"
          is-link
          readonly
          label="合作开始时间"
          placeholder="选择开始时间"
          :disabled="!item.isEditing"
          required
          @click="openDatePicker(index, 'startDate')"
        />
        <van-field
          v-model="item.endDate"
          is-link
          readonly
          label="合作结束时间"
          placeholder="选择结束时间"
          :disabled="!item.isEditing"
          required
          @click="openDatePicker(index, 'endDate')"
        />
      </van-cell-group>
      <div class="list-card__actions">
        <van-button size="small" type="primary" plain @click="handleEdit(index)">
          {{ item.isEditing ? '锁定' : '修改' }}
        </van-button>
        <van-button size="small" type="danger" plain @click="handleDelete(index)" :disabled="cooperationList.length <= 1">
          删除
        </van-button>
      </div>
    </div>
    <div class="add-btn">
      <van-button type="primary" plain block @click="handleAdd">+ 添加合作经历</van-button>
    </div>

    <van-popup v-model:show="showRegionPicker" round position="bottom">
      <van-picker :columns="regionOptions" @confirm="onRegionConfirm" @cancel="showRegionPicker = false" />
    </van-popup>
    <van-popup v-model:show="showDatePicker" round position="bottom">
      <van-date-picker v-model="datePickerValue" title="选择日期" @confirm="onDateConfirm" @cancel="showDatePicker = false" />
    </van-popup>
  </van-cell-group>
</template>

<script setup lang="ts">
import { showToast } from 'vant';

interface CooperationItem {
  partner: string;
  region: string;
  regionText: string;
  projectName: string;
  startDate: string;
  endDate: string;
  isEditing?: boolean;
}

const regionOptions = [
  { text: '云南省内', value: 'yn' },
  { text: '云南省外', value: 'other' },
  { text: '境外', value: 'abroad' },
];

const regionTextMap: Record<string, string> = { yn: '云南省内', other: '云南省外', abroad: '境外' };

const cooperationList = ref<CooperationItem[]>([{
  partner: '', region: 'yn', regionText: '云南省内', projectName: '', startDate: '', endDate: '', isEditing: true,
}]);

const showRegionPicker = ref(false);
const showDatePicker = ref(false);
const pickerIndex = ref(0);
const datePickerTarget = ref('');
const datePickerValue = ref(['2025', '01', '01']);

const openRegionPicker = (index: number, item: CooperationItem) => {
  if (!item.isEditing) return;
  pickerIndex.value = index;
  showRegionPicker.value = true;
};

const onRegionConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0];
  if (selected) {
    cooperationList.value[pickerIndex.value].region = selected.value;
    cooperationList.value[pickerIndex.value].regionText = selected.text;
  }
  showRegionPicker.value = false;
};

const openDatePicker = (index: number, target: string) => {
  if (!cooperationList.value[index].isEditing) return;
  pickerIndex.value = index;
  datePickerTarget.value = target;
  const val = cooperationList.value[index][target as keyof CooperationItem];
  if (val) datePickerValue.value = (val as string).split('-');
  showDatePicker.value = true;
};

const onDateConfirm = ({ selectedValues }: any) => {
  (cooperationList.value[pickerIndex.value] as any)[datePickerTarget.value] = selectedValues.join('-');
  showDatePicker.value = false;
};

const handleAdd = () => {
  cooperationList.value.push({ partner: '', region: 'yn', regionText: '云南省内', projectName: '', startDate: '', endDate: '', isEditing: true });
};

const handleDelete = (index: number) => {
  if (cooperationList.value.length <= 1) { showToast('至少保留一条合作经历'); return; }
  cooperationList.value.splice(index, 1);
};

const handleEdit = (index: number) => {
  cooperationList.value[index].isEditing = !cooperationList.value[index].isEditing;
};

const validateAll = () => {
  for (const row of cooperationList.value) {
    if (!row.partner || !row.projectName || !row.startDate || !row.endDate) {
      showToast('请填写完整的合作经历信息');
      return false;
    }
  }
  return true;
};

defineExpose({ validateAll });
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

.list-card {
  margin: 8px 0;

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 8px 16px;
  }
}

.add-btn {
  padding: 8px 16px 16px;
}
</style>
