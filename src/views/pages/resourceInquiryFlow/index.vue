<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { ResourceInquiryFlowController } from '@/api/generated'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import ResourceInquiryDetail from './detail.vue'
import { SystemUserController } from '@/api/system'
import 'vant/es/toast/style'
import { useLoginStore } from '@/store'

const submitLoading = ref(false)
const router = useRouter()
const route = useRoute()
const loginStore = useLoginStore();

const processInstanceId = computed(() => route.query.processInstanceId as string)
const taskId = computed(() => route.query.taskId as string)
const taskName = computed(() => route.query.taskName as string)
const flowEntryName = computed(() => route.meta.commonTitle as string)

const nextApproverList = ref<ANY_OBJECT[]>([])
const flowTaskCommentList = ref<ANY_OBJECT[]>([])

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)
const showApproverPicker = ref(false)

const rejectReason = ref('')
const agreeReason = ref('')
const appointedAssigneeText = ref('')
const appointedAssignee = ref('')

const formData = ref<ANY_OBJECT>({})
const announceFormData = ref<ANY_OBJECT>({})

const userInfo = computed(() => loginStore.userInfo || {}) as any;

const params = computed(() => route.query || {});
const islast = computed(() => params.value.taskName === '省本部DICT管理员审批');

const isResubmitMode = computed(() => {
  return formData.value.status === 1
});

const approverColumns = computed(() =>
  nextApproverList.value.map(user => ({
    text: user.showName,
    value: user.loginName,
  })),
)

function onCancel() {
  appBack()
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
    const res = await FlowOperationController.submitUserTaskByFlowKey({
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectReason.value,
      },
      taskVariableData: {},
    }, {
      processDefinitionKey: params.value.processDefinitionKey,
    })
    if (res.success) {
      showToast('已驳回')
      submitLoading.value = false
      rejectDialogVisible.value = false
      appBack()
    }
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
}

async function confirmAgree() {
  submitLoading.value = true
  if(isResubmitMode.value) {
      const res = await ResourceInquiryFlowController.resubmit({
        id: formData.value.id as number,
        title: formData.value.title,
        content: formData.value.content,
        taskType: formData.value.taskType,
        applyStartTime: formData.value.applyStartTime,
        applyEndTime: formData.value.applyEndTime,
        showEndTime: formData.value.showEndTime,
        isTop: formData.value.isTop,
        industryLimitType: formData.value.industryCodes.length > 0 ? 0 : 1,
        industryCodes: formData.value.industryCodes.length > 0 ? formData.value.industryCodes : undefined,
        regionLimitType: formData.value.regionCodes.length > 0 ? 0 : 1,
        regionCodes: formData.value.regionCodes.length > 0 ? formData.value.regionCodes : undefined,
        reason: formData.value.reason,
        publishFiles: formData.value.publishFiles,
        reAppointedAssignee: appointedAssignee.value,
        taskComment: agreeReason.value,
        processInstanceId: processInstanceId.value,
        taskId: taskId.value,
      })
      if(res.success) {
        showToast('提交成功')
        submitLoading.value = false
        agreeDialogVisible.value = false
        appBack()
      }
    } else {
      // 审批
      try {
        const res = await FlowOperationController.submitUserTaskByFlowKey({
          processInstanceId: processInstanceId.value,
          taskId: taskId.value,
          flowTaskCommentDto: {
            approvalType: 'agree',
            taskComment: agreeReason.value,
        
          },
          taskVariableData: {
            appointedAssignee: appointedAssignee.value,
          },
        }, {
          processDefinitionKey: params.value.processDefinitionKey,
        })
        if (res.success) {
          showToast('审批通过')
          submitLoading.value = false
          agreeDialogVisible.value = false
          appBack()
        }
      }
      catch (e) {
        submitLoading.value = false
        // showToast('操作失败')
        console.error(e)
      }
    }
}

function loadDetail() {
  const queryPromise = ResourceInquiryFlowController.resourceInquiryFlow({ 
    processInstanceId: processInstanceId.value,
    taskId: taskId.value,
   })

  queryPromise
    .then((res: ANY_OBJECT) => {
      if (res.success) {
        formData.value = res.data
        announceFormData.value = res.data.initiatorInfo
      }
    })
    .catch((e: any) => {
      showToast('加载详情失败')
      console.error(e)
    })
}

function loadFlowTaskCommentList() {
  if (!processInstanceId.value)
    return
  FlowOperationController.listFlowTaskComment({
    processInstanceId: processInstanceId.value,
  })
    .then((res: ANY_OBJECT) => {
      flowTaskCommentList.value = res.data || []
    })
    .catch((e: unknown) => console.error(e))
}

async function loadNextApproverList() {
  await SystemUserController.listByDeptRelation({
    sysUserDtoFilter: {
      deptId: userInfo.value.deptId || '',
      taskKey: isResubmitMode.value ? 'Activity_0rimgr' : 'Activity_0ridict',
    },
    pageParam: {
      pageNum: 1,
      pageSize: 100,
    },
  }).then(res => {
    nextApproverList.value = res.data.dataList;
  });
}

onMounted(() => {
  loadDetail()
  loadNextApproverList()
  loadFlowTaskCommentList()
})
</script>

<template>
  <div class="mobile-detail-manager">
    <div class="content-wrapper">
      <ResourceInquiryDetail
        :flow-task-comment-list="flowTaskCommentList"
        :form-data="formData"
        :task-name="taskName"
        :readonly="!isResubmitMode"
        :flow-entry-name="flowEntryName"
        :announce-form-data="announceFormData"
      />
    </div>

    <BottomActionBar
      v-if="route.query.isInfo !== 'true'"
      :submit-loading="submitLoading"
      :show-reject="!isResubmitMode"
      :agreeText="isResubmitMode ? '提交' : '同意'"
      @cancel="onCancel"
      @reject="onReject"
      @agree="onAgree"
    />

    <BottomActionBar
      v-else
      :submit-loading="submitLoading"
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

<style scoped>
</style>
