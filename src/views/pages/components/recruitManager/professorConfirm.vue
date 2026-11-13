<template>
  <div class="section">
    <div class="section-subtitle">评审确认信息</div>
    <!-- 是否参加评审单选组 -->
    <van-field label="是否参加评审" required>
      <template #input>
        <van-radio-group
          v-model="localData.confirmStatus"
          :disabled="currentType === 'info'"
          @change="onConfirmStatusChange"
          direction="horizontal"
        >
          <van-radio :name="1">是</van-radio>
          <van-radio :name="2">否</van-radio>
        </van-radio-group>
      </template>
    </van-field>

    <!-- 原因说明（当选择“否”时显示） -->
    <van-field v-if="currentType === 'info'" label="原因说明" :required="localData.confirmStatus === 2">
      <template #input>
        <span>{{ localData.reason }}</span>
      </template>
    </van-field>
    <van-field
      v-else
      label="原因说明"
      v-model="localData.reason"
      type="textarea"
      rows="2"
      maxlength="100"
      placeholder="请输入原因说明"
      :required="localData.confirmStatus === 2"
      :clearable="currentType !== 'info'"
      autosize
      class="reason-field"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { showToast } from 'vant'

// 外部传入的 props（可选，通常通过 showData 注入）
const props = defineProps<{
  initialData?: { confirmStatus?: number; reason?: string }
}>()

// 当前类型（add/edit/info/auth 等）
const currentType = ref('edit')

// 内部数据
const localData = reactive({
  confirmStatus: 1,   // 1-是，2-否
  reason: '',
})

// 当选择“否”时，自动校验原因是否填写（UI 提示）
const onConfirmStatusChange = (val: number) => {
  if (val === 2 && !localData.reason.trim()) {
    // 可选：仅提示，不强依赖 field 校验
    // showToast('请填写原因说明')
  }
}

// 暴露给父组件的方法：回显数据
const showData = (data: any, type: string) => {
  currentType.value = type
  localData.confirmStatus = data.confirmStatus !== undefined ? data.confirmStatus : 1
  localData.reason = data.reason || ''
}

// 提交校验并返回数据
const handleSubmit = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (localData.confirmStatus === 2 && !localData.reason.trim()) {
      showToast('请填写原因说明')
      reject(new Error('请填写原因说明'))
      return
    }
    resolve({
      confirmStatus: localData.confirmStatus,
      reason: localData.reason,
    })
  })
}

// 暴露 ref 可访问的数据
defineExpose({
  handleSubmit,
  showData,
  formData: localData,
})
</script>

<style scoped lang="scss">
</style>