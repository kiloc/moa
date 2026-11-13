<script setup lang="ts">
interface Props {
  isRequireAgreeReason?: boolean
  rejectDialogVisible: boolean
  agreeDialogVisible: boolean
  showApproverPicker: boolean
  rejectReason: string
  agreeReason: string
  appointedAssigneeText: string
  appointedAssignee: string
  islast: boolean
  submitLoading: boolean
  approverColumns: Array<{ text: string, value: string }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:rejectDialogVisible': [value: boolean]
  'update:agreeDialogVisible': [value: boolean]
  'update:showApproverPicker': [value: boolean]
  'update:rejectReason': [value: string]
  'update:agreeReason': [value: string]
  'update:appointedAssigneeText': [value: string]
  'update:appointedAssignee': [value: string]
  'confirmReject': []
  'confirmAgree': []
}>()

function onApproverConfirm({ selectedOptions }: { selectedOptions: Array<{ text: string, value: string }> }) {
  const selected = selectedOptions[0]
  if (selected) {
    emit('update:appointedAssignee', selected.value)
    emit('update:appointedAssigneeText', selected.text)
  }
  emit('update:showApproverPicker', false)
}
</script>

<template>
  <div>
    <van-popup
      :show="rejectDialogVisible"
      round
      position="bottom"
      :style="{ maxHeight: '70%' }"
      @update:show="emit('update:rejectDialogVisible', $event)"
    >
      <div class="popup-content">
        <div class="popup-title">
          驳回
        </div>
        <van-field
          :model-value="rejectReason"
          type="textarea"
          label="意见"
          placeholder="请输入意见"
          rows="4"
          maxlength="500"
          show-word-limit
          required
          @update:model-value="emit('update:rejectReason', $event as string)"
        />
        <div class="popup-actions">
          <van-button :loading="submitLoading" @click="emit('update:rejectDialogVisible', false)">
            取消
          </van-button>
          <van-button type="danger" :loading="submitLoading" @click="emit('confirmReject')">
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <van-popup
      :show="agreeDialogVisible"
      round
      position="bottom"
      :style="{ maxHeight: '70%' }"
      @update:show="emit('update:agreeDialogVisible', $event)"
    >
      <div class="popup-content">
        <div class="popup-title">
          同意
        </div>
        <van-field
          v-if="!islast"
          :model-value="appointedAssigneeText"
          is-link
          readonly
          label="下一步审批人"
          placeholder="请选择下一步审批人"
          required
          @click="emit('update:showApproverPicker', true)"
        />
        <van-field
          :model-value="agreeReason"
          type="textarea"
          label="意见"
          placeholder="请输入意见"
          rows="4"
          maxlength="500"
          show-word-limit
          :required="props.isRequireAgreeReason"
          @update:model-value="emit('update:agreeReason', $event as string)"
        />
        <div class="popup-actions">
          <van-button :loading="submitLoading" @click="emit('update:agreeDialogVisible', false)">
            取消
          </van-button>
          <van-button type="primary" :loading="submitLoading" @click="emit('confirmAgree')">
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <van-popup
      :show="showApproverPicker"
      round
      position="bottom"
      @update:show="emit('update:showApproverPicker', $event)"
    >
      <van-picker
        :columns="approverColumns"
        @confirm="onApproverConfirm"
        @cancel="emit('update:showApproverPicker', false)"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.popup-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  padding: 10px;
  border-bottom: 1px solid #ebedf0;
}

.popup-content {
  padding: 10px;
  max-height: 60vh;
  overflow-y: auto;
}

.popup-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.popup-actions .van-button {
  flex: 1;
  height: 44px;
  border-radius: 8px;
}
</style>
