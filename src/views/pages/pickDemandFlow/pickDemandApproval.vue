<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { SysUserController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { post } from '@/common/http/request'
import { useLoginStore } from '@/store'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import PickDemandDetail from './pickDemandDetail.vue'

const submitLoading = ref(false)
const router = useRouter()
const route = useRoute()
const loginStore = useLoginStore()
const userInfo = computed(() => loginStore.userInfo || {})

const processInstanceId = computed(() => route.query.processInstanceId as string)
const taskId = computed(() => route.query.taskId as string)
const taskName = computed(() => route.query.taskName as string)
const flowEntryName = computed(() => route.meta.commonTitle as string)
const islast = computed(() => taskName.value === '三级经理决策信息审批')

const nextApproverList = ref<ANY_OBJECT[]>([])
const flowTaskCommentList = ref<ANY_OBJECT[]>([])

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)
const showApproverPicker = ref(false)

const rejectReason = ref('')
const agreeReason = ref('')
const appointedAssigneeText = ref('')
const appointedAssignee = ref('')

const approverColumns = computed(() =>
  nextApproverList.value.map(user => ({
    text: user.showName,
    value: user.loginName,
  })),
)

async function loadNextApproverList() {
  try {
    const resp = await SysUserController.getUserWithDeptByUserId({ userId: userInfo.value.userId })
    const userData = Array.isArray(resp.data) ? resp.data[0] : resp.data
    const roleId = userData?.city_code == '10' ? '2032682362805948416' : '2032682417046687744'
    const cityCode = userData?.city_code
    const res = await SysUserController.getUserWithDeptListByRoleIdAndCityCode({ roleId, cityCode })
    nextApproverList.value = res.data || []
  }
  catch (e) {
    showToast('加载审批人列表失败')
    console.error(e)
  }
}

function onCancel() {
  appBack()
  // // router.back()
}

function onReject() {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

async function confirmReject() {
  if (!rejectReason.value.trim()) {
    showToast('请输入驳回意见')
    return
  }
  try {
    submitLoading.value = true
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PickAllFlow`, {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectReason.value,
      },
      taskVariableData: { appointedAssignee: '' },
    })
    showToast('已驳回')
    submitLoading.value = false
    rejectDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    submitLoading.value = false
    // showToast('操作失败')
    console.error(e)
  }
}

function onAgree() {
  appointedAssignee.value = ''
  appointedAssigneeText.value = ''
  agreeReason.value = ''
  agreeDialogVisible.value = true
  if (nextApproverList.value.length === 0 && !islast.value) {
    loadNextApproverList()
  }
}

async function confirmAgree() {
  if (!appointedAssignee.value.trim() && !islast.value) {
    showToast('请指定下一步审批人')
    return
  }
  try {
    submitLoading.value = true
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PickAllFlow`, {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'agree',
        taskComment: agreeReason.value,
      },
      taskVariableData: {
        appointedAssignee: appointedAssignee.value,
      },
    })
    showToast('审批通过')
    submitLoading.value = false
    agreeDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    submitLoading.value = false
    // showToast('操作失败')
    console.error(e)
  }
}

function loadFlowTaskCommentList() {
  if (!processInstanceId.value)
    return
  FlowOperationController.listFlowTaskComment({
    processInstanceId: processInstanceId.value,
  })
    .then((res) => {
      flowTaskCommentList.value = res.data || []
    })
    .catch(e => console.error(e))
}

onMounted(() => {
  loadFlowTaskCommentList()
})

const navTarTitle = computed(() => {
  return flowEntryName.value + '-' + taskName.value
})
</script>

<template>
  <div class="mobile-detail-manager">
    <div class="content-wrapper">
      <!-- <van-nav-bar
        :title="navTarTitle"
        left-arrow
        fixed
        placeholder
        @click-left="onCancel"
      /> -->
      <PickDemandDetail
        :flow-entry-name="flowEntryName"
        :taskName="taskName"
        demand-detail
        :disabled="['合作伙伴列表']"
        :flow-task-comment-list="flowTaskCommentList"
      />
    </div>

    <BottomActionBar
      v-if="route.query.isRuntime === 'true'"
      :submit-loading="submitLoading"
      @cancel="onCancel"
      @reject="onReject"
      @agree="onAgree"
    />

    <BottomActionBar
      v-else
      cancel-text="关闭"
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
      :islast="islast"
      :submit-loading="submitLoading"
      :approver-columns="approverColumns"
      @confirm-reject="confirmReject"
      @confirm-agree="confirmAgree"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
