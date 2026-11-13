<script setup lang="ts">
import { onMounted, reactive, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { RecruitReviewController } from '@/api/recruitManagement'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import InitiatorInfo from '../components/initiatorInfo.vue'
import recruitInfo from '../components/recruitInfo.vue'
import recruitPlanInfo from '../components/recruitPlanInfo.vue'
import recruitPlanDecision from '../components/recruitPlanDecision.vue'
import ReviewGroup from '../components/reviewGroup.vue'

const router = useRouter()
const route = useRoute()

const params = ref(route.query || {})
const currentType = ref('add')
const formData = ref({})

const initiatorInfoRef = ref(null)
const recruitInfoRef = ref(null)
const recruitPlanInfoRef = ref(null)
const recruitPlanDecisionRef = ref(null)
const reviewGroupRef = ref(null)

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)
const showApproverPicker = ref(false)

const rejectReason = ref('')
const agreeReason = ref('')
const appointedAssigneeText = ref('')
const appointedAssignee = ref('')

const nextApproverList = ref<any[]>([])

const approverColumns = computed(() =>
  nextApproverList.value.map(user => ({
    text: user.showName,
    value: user.loginName,
  })),
)

const isShowApprovalBtn = computed(() => {
  return currentType.value === 'auth'
})

const isShowCloseBtn = computed(() => {
  return currentType.value === 'info'
})

const init = () => {
  if (!params.value?.businessKey) return
  getCurrentType()
  queryDetail()
}

const queryDetail = () => {
  RecruitReviewController.queryReviewGroupList({
    planCode: params.value.businessKey,
  }).then(res => {
    formData.value = res.data
    nextTick(() => {
      if (params.value.showName) {
        initiatorInfoRef.value?.showData({
          showName: params.value.showName,
          taskId: params.value.taskId,
          processInstanceInitiatorMobile: params.value.processInstanceInitiatorMobile,
          processInstanceInitiatorDeptName: params.value.processInstanceInitiatorDeptName,
          processInstanceInitiatorCityName: params.value.processInstanceInitiatorCityName,
          processInstanceStartTime: params.value.processInstanceStartTime,
        }, 'info')
      } else {
        initiatorInfoRef.value?.showData({ taskId: params.value.taskId, ...res.data?.initiatorInfo }, 'info')
      }

      recruitInfoRef.value?.showData(res.data?.recruitmentDemandDetailVo, 'info')
      recruitPlanInfoRef.value?.showData(res.data?.recruitmentPlanQueryVo, 'info')
      recruitPlanDecisionRef.value?.showData(res.data?.recruitmentPlanQueryVo, 'info')
      reviewGroupRef.value?.showData(res.data, currentType.value)
    })
  })
}

const validate = (type: string) => {
  return reviewGroupRef.value.handleSubmit(type)
}

const onSubmit = (type: string) => {
  if (type === 'save') {
    appBack()
    // router.back()
    return
  }
  const param = {
    processInstanceId: params.value.processInstanceId,
    taskId: params.value.taskId,
    planCode: params.value.businessKey,
  }
  RecruitReviewController.submit(param).then(() => {
    showToast('提交成功')
    appBack()
    // router.back()
  })
}

const getCurrentType = () => {
  if (params.value.taskName === '详情' || params.value.isInfo === 'true') {
    currentType.value = 'info'
  } else if (params.value.taskName === '流程') {
    currentType.value = 'process'
  }
}

const onCancel = () => {
  appBack()
  // router.back()
}

const onReject = () => {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    showToast('请输入意见')
    return
  }
  showToast('已驳回')
  rejectDialogVisible.value = false
  appBack()
  // router.back()
}

const onAgree = () => {
  appointedAssignee.value = ''
  appointedAssigneeText.value = ''
  agreeReason.value = ''
  agreeDialogVisible.value = true
}

const confirmAgree = async () => {
  if (!agreeReason.value.trim()) {
    showToast('请输入意见')
    return
  }
  showToast('审批通过')
  agreeDialogVisible.value = false
  appBack()
  // router.back()
}

watch(
  () => route.query,
  q => {
    params.value = q || {}
    init()
  },
)

onMounted(() => {
  init()
})
</script>

<template>
  <div class="mobile-recruit-review-manager">
    <div class="content-wrapper">
      <div class="page-title">
        {{ params.taskName || '招募评审管理' }}
      </div>

      <InitiatorInfo ref="initiatorInfoRef" />

      <recruitInfo ref="recruitInfoRef" v-if="formData?.recruitmentDemandDetailVo?.id" />

      <recruitPlanInfo ref="recruitPlanInfoRef" />

      <recruitPlanDecision ref="recruitPlanDecisionRef" />

      <ReviewGroup ref="reviewGroupRef" @refresh="queryDetail" />
    </div>

    <BottomActionBar
      v-if="currentType !== 'info' && currentType !== 'auth'"
      :show-reject="false"
      :show-agree="true"
      @cancel="onCancel"
      @agree="() => onSubmit('submit')"
    >
      <template #extra>
        <van-button type="default" size="large" @click="() => onSubmit('save')">保存</van-button>
      </template>
    </BottomActionBar>

    <BottomActionBar
      v-else-if="currentType === 'auth'"
      :cancel-text="isShowCloseBtn ? '关闭' : '取消'"
      :show-reject="isShowApprovalBtn"
      :show-agree="isShowApprovalBtn"
      @cancel="onCancel"
      @reject="onReject"
      @agree="onAgree"
    />

    <BottomActionBar
      v-else
      :cancel-text="'关闭'"
      :show-reject="false"
      :show-agree="false"
      @cancel="onCancel"
    />

    <ApprovalPopup
      v-model:reject-dialog-visible="rejectDialogVisible"
      v-model:agree-dialog-visible="agreeDialogVisible"
      v-model:show-approver-picker="showApproverPicker"
      v-model:reject-reason="rejectReason"
      v-model:agree-reason="agreeReason"
      v-model:appointed-assignee-text="appointedAssigneeText"
      v-model:appointed-assignee="appointedAssignee"
      :islast="true"
      :is-require-agree-reason="true"
      :approver-columns="approverColumns"
      @confirm-reject="confirmReject"
      @confirm-agree="confirmAgree"
    />
  </div>
</template>

<style scoped lang="scss">
.mobile-recruit-review-manager {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.content-wrapper {
  background-color: #ffffff;
  padding: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16px;
}
</style>
