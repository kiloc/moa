<template>
  <van-popup
    v-model:show="localVisible"
    round
    position="bottom"
    :style="{ maxHeight: '70%' }"
    @closed="onClosed"
  >
    <div class="popup-content">
      <div class="popup-title">{{ title }}</div>
      <van-field
        v-model="opinionText"
        :label="label"
        :placeholder="placeholder"
        type="textarea"
        :rows="rows"
        :maxlength="maxlength"
        :show-word-limit="showWordLimit"
        :required="required"
      />
      <div class="popup-actions">
        <van-button :disabled="loading" @click="onCancel">
          取消
        </van-button>
        <van-button
          :type="confirmType"
          :loading="loading"
          @click="onConfirm"
        >
          确定
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { showToast } from 'vant';

export interface ApprovalPopupProps {
  /** 弹窗显示状态 (v-model:visible) */
  visible: boolean;
  /** 弹窗标题 */
  title?: string;
  /** 确定按钮类型 (primary / danger / default) */
  confirmType?: 'primary' | 'danger' | 'default';
  /** 提交中状态（外部控制） */
  loading?: boolean;
  /** 意见输入框占位文本 */
  placeholder?: string;
  /** 意见字段标签 */
  label?: string;
  /** 是否必填 */
  required?: boolean;
  /** 文本域行数 */
  rows?: number;
  /** 最大输入长度 */
  maxlength?: number;
  /** 是否显示字数统计 */
  showWordLimit?: boolean;
}

const props = withDefaults(defineProps<ApprovalPopupProps>(), {
  title: '审批',
  confirmType: 'primary',
  loading: false,
  placeholder: '请输入意见',
  label: '意见',
  required: true,
  rows: 4,
  maxlength: 500,
  showWordLimit: true,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', opinion: string): void;
  (e: 'close'): void;
}>();

// 内部状态：弹窗显隐（支持 v-model:visible）
const localVisible = ref(props.visible);
watch(
  () => props.visible,
  (val) => {
    localVisible.value = val;
    // 每次打开弹窗时清空旧内容
    if (val) {
      opinionText.value = '';
    }
  }
);
watch(localVisible, (val) => {
  emit('update:visible', val);
});

// 意见内容
const opinionText = ref('');

// 操作：关闭弹窗
const onCancel = () => {
  localVisible.value = false;
};

// 关闭弹窗后的回调（可选）
const onClosed = () => {
  emit('close');
};

// 确认操作：校验并提交
const onConfirm = () => {
  const trimmed = opinionText.value?.trim() || '';
  if (props.required && !trimmed) {
    showToast(props.placeholder);
    return;
  }
  emit('confirm', trimmed);
};
</script>

<style scoped>
.popup-content {
  background-color: #fff;
  border-radius: 16px 16px 0 0;
  padding: 20px 16px 30px;
}

.popup-title {
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20px;
  color: #323233;
}

.popup-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
}

.popup-actions .van-button {
  flex: 1;
}
</style>