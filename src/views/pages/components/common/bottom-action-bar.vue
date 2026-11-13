<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { log } from 'console'

const route = useRoute()
interface Props {
  showReject?: boolean
  showAgree?: boolean
  showCancel?: boolean
  showClose?: boolean
  cancelText?: string
  rejectText?: string
  agreeText?: string
  closeText?: string
  submitLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showReject: true,
  showAgree: true,
  showCancel: true,
  showClose: false,
  cancelText: '取消',
  rejectText: '驳回',
  agreeText: '同意',
  closeText: '关闭',
  submitLoading: false,
})
const emit = defineEmits<{
  cancel: []
  reject: []
  agree: []
}>()

// 响应式状态变量
const isApprover = ref(false)
onMounted(() => {
  if (route.query.isApprover === 'true') {
    isApprover.value = true
  }
})
// 根据权限动态计算按钮显示状态
const showReject1 = computed(() => {
  if (!isApprover.value) return false
  return props.showReject
})
const showAgree1 = computed(() => {
  if (!isApprover.value) return false
  return props.showAgree
})
const showCancel1 = computed(() => {
  if (!isApprover.value) return false
  return props.showCancel
})
const showClose1 = computed(() => {
  if (!isApprover.value) return true
  return props.showClose
})
</script>

<template>
  <div class="bottom-bar">
    <van-button v-if="showClose1" @click="emit('cancel')">
      {{ closeText }}
    </van-button>
    <van-button v-if="showCancel1" @click="emit('cancel')">
      {{ cancelText }}
    </van-button>
    <van-button v-if="showReject1" type="danger" plain :loading="submitLoading" @click="emit('reject')">
      {{ rejectText }}
    </van-button>
    <van-button v-if="showAgree1" type="primary" :loading="submitLoading" @click="emit('agree')">
      {{ agreeText }}
    </van-button>
  </div>
</template>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  background: #fff;
  box-shadow: 0 -2px 12px rgb(100 101 102 / 8%);
  z-index: 100;
}

.bottom-bar .van-button {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
}
</style>
