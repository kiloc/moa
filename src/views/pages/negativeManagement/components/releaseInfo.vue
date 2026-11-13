<template>
  <div class="announcement-scope-form">
    <van-cell-group class="card-section" inset>
      <div class="card-section__title">发布公告信息</div>

      <!-- 发布区域 -->
      <van-field label="发布区域">
        <template #input>
          <div class="scope-group">
            <div class="scope-item">
              <van-checkbox
                v-model="formData.isPartnerLoginPageRelease"
                :disabled="currentType === 'auth' || currentType === 'info'"
              >合作伙伴登录界面</van-checkbox>
            </div>
            <div class="scope-item">
              <van-checkbox
                v-model="formData.isPartnerDoorPageRelease"
                :disabled="currentType === 'auth' || currentType === 'info'"
              >合作伙伴门户界面</van-checkbox>
            </div>
          </div>
        </template>
      </van-field>

      <!-- 是否置顶 -->
      <van-field
        v-model="isTopText"
        is-link
        readonly
        label="是否置顶"
        placeholder="请选择是否置顶"
        @click="showTopPicker = currentType !== 'auth' && currentType !== 'info'"
      />

      <!-- 公告生效时间 -->
      <van-field label="公告生效时间">
        <template #input>
          <div class="date-range">
            <span
              class="date-range__item"
              :class="{ 'date-range__item--link': currentType !== 'auth' && currentType !== 'info' }"
              @click="showStartPicker = currentType !== 'auth' && currentType !== 'info'"
            >{{ effectiveStartTimeText || '开始日期' }}</span>
            <span class="date-range__separator">至</span>
            <span
              class="date-range__item"
              :class="{ 'date-range__item--link': currentType !== 'auth' && currentType !== 'info' }"
              @click="showEndPicker = currentType !== 'auth' && currentType !== 'info'"
            >{{ effectiveEndTimeText || '结束日期' }}</span>
          </div>
        </template>
      </van-field>
    </van-cell-group>

    <!-- 是否置顶 Picker -->
    <van-popup v-model:show="showTopPicker" position="bottom" round>
      <van-picker
        :columns="topOptions"
        @confirm="onTopConfirm"
        @cancel="showTopPicker = false"
      />
    </van-popup>

    <!-- 开始日期 Picker -->
    <van-popup v-model:show="showStartPicker" position="bottom" round>
      <van-date-picker
        v-model="startPickerValue"
        title="选择生效开始日期"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date(2030, 11, 31)"
        @confirm="onStartConfirm"
        @cancel="showStartPicker = false"
      />
    </van-popup>

    <!-- 结束日期 Picker -->
    <van-popup v-model:show="showEndPicker" position="bottom" round>
      <van-date-picker
        v-model="endPickerValue"
        title="选择生效结束日期"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date(2030, 11, 31)"
        @confirm="onEndConfirm"
        @cancel="showEndPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { showToast } from 'vant';
import { useLoginStore, useDictMapStore } from '@/store';

const loginStore = useLoginStore();
const dictMapStore = useDictMapStore();
const currentType = ref('add');

// Picker 状态
const showTopPicker = ref(false);
const showStartPicker = ref(false);
const showEndPicker = ref(false);

// 置顶选项
const topOptions = [
  { text: '是', value: '1' },
  { text: '否', value: '0' },
];

// 日期选择器值
const startPickerValue = ref(['2024', '01', '01']);
const endPickerValue = ref(['2024', '01', '01']);

// 表单数据
const formData = reactive({
  isPartnerLoginPageRelease: false,
  isPartnerDoorPageRelease: false,
  isTop: '1',
  effectiveStartTime: '',
  effectiveEndTime: '',
});

// 计算属性
const isTopText = computed(() => formData.isTop === '1' ? '是' : '否');
const effectiveStartTimeText = computed(() => formData.effectiveStartTime || '');
const effectiveEndTimeText = computed(() => formData.effectiveEndTime || '');

// 是否置顶确认
const onTopConfirm = ({ selectedOptions }) => {
  formData.isTop = selectedOptions[0].value;
  showTopPicker.value = false;
};

// 开始日期确认
const onStartConfirm = ({ selectedValues }) => {
  formData.effectiveStartTime = selectedValues.join('-');
  showStartPicker.value = false;
};

// 结束日期确认
const onEndConfirm = ({ selectedValues }) => {
  formData.effectiveEndTime = selectedValues.join('-');
  showEndPicker.value = false;
};

// 显示数据
const showData = (data: any, type: string) => {
  currentType.value = type;
  formData.isPartnerLoginPageRelease = data.isPartnerLoginPageRelease == '1' ? true : false;
  formData.isPartnerDoorPageRelease = data.isPartnerDoorPageRelease == '1' ? true : false;
  formData.isTop = data.isTop;
  formData.effectiveStartTime = data.effectiveStartTime;
  formData.effectiveEndTime = data.effectiveEndTime;

  // 初始化日期选择器
  if (data.effectiveStartTime) {
    const parts = data.effectiveStartTime.split('-');
    startPickerValue.value = parts;
  }
  if (data.effectiveEndTime) {
    const parts = data.effectiveEndTime.split('-');
    endPickerValue.value = parts;
  }
};

// 表单提交
const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.isPartnerLoginPageRelease && !formData.isPartnerDoorPageRelease) {
      showToast('请选择发布区域');
      reject();
      return;
    }
    if (!formData.effectiveStartTime || !formData.effectiveEndTime) {
      showToast('请选择完整的生效时间');
      reject();
      return;
    }
    if (new Date(formData.effectiveStartTime) > new Date(formData.effectiveEndTime)) {
      showToast('开始时间不能晚于结束时间');
      reject();
      return;
    }

    const params = {
      isPartnerLoginPageRelease: formData.isPartnerLoginPageRelease ? '1' : '0',
      isPartnerDoorPageRelease: formData.isPartnerDoorPageRelease ? '1' : '0',
      isTop: formData.isTop,
      effectiveStartTime: formData.effectiveStartTime,
      effectiveEndTime: formData.effectiveEndTime,
    };
    resolve(params);
  });
};

defineExpose({
  handleSubmit,
  showData,
});

onMounted(() => {});
</script>

<style lang="scss" scoped>
.announcement-scope-form {

  .card-section {
    margin: 12px 0;

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: #323233;
      padding: 12px 16px 8px;
    }
  }

  .scope-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .scope-item {
    display: flex;
    align-items: center;
  }

  .date-range {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;

    &__item {
      flex: 1;
      text-align: center;
      color: #323233;
      font-size: 14px;

      &--link {
        color: #4A90E5;
      }
    }

    &__separator {
      color: #969799;
      font-size: 14px;
      flex-shrink: 0;
    }
  }
}
</style>
