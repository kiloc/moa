<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { PickDemandController, SysUserController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { post } from '@/common/http/request'
import { useLoginStore } from '@/store'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import PickSchemeDetail from './pickSchemeDetail.vue'

const submitLoading = ref(false)
const router = useRouter()
const route = useRoute()
const loginStore = useLoginStore()
const userInfo = computed(() => loginStore.userInfo || {})
const schemeFormData = reactive<ANY_OBJECT>({
  schemeName: '',
  schemeNumber: '',
  replyEndTime: '',
  schemeMethod: '',
  schemeOrganization: '',
  agencyName: '',
  projectManager: '',
  schemeDesc: '',
  decisionLevel: '',
  decisionTime: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
  createUserCityName: '',
});
const processInstanceId = computed(() => route.query.processInstanceId as string)
const taskId = computed(() => route.query.taskId as string)
const flowEntryName = computed(() => route.meta.commonTitle as string)
const taskName = computed(() => route.query.taskName as string)

const nextApproverList = ref<ANY_OBJECT[]>([])
const flowTaskCommentList = ref<ANY_OBJECT[]>([])
const detailData = ref<ANY_OBJECT>({})

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
  nextApproverList.value = [
    {
      userId: schemeFormData.projectManagerId,
      loginName: schemeFormData.projectManagerCode,
      showName: schemeFormData.projectManager
    }
  ]
}

function onCancel() {
  appBack()
  // router.back()
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
    submitLoading.value = false
    showToast('已驳回')
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
  if (nextApproverList.value.length === 0) {
    loadNextApproverList()
  }
}

async function confirmAgree() {
  if (!appointedAssignee.value.trim()) {
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

function loadDetail() {
  const demandNumber = route.query.businessKey as string;
  if (!demandNumber) {
    showToast('缺少需求编号参数')
    return
  }

  PickDemandController.queryDemand({ demandNumber })
    .then((res) => {
      if (res.data) {
        if (res.data.pickScheme) {
          Object.assign(schemeFormData, res.data.pickDemand, res.data.pickScheme);
        }
        detailData.value = res.data
      }
    })
    .catch((e) => {
      showToast('加载详情失败')
      console.error(e)
    })
}

onMounted(() => {
  loadDetail()
  loadFlowTaskCommentList()
})
</script>

<template>
  <div class="mobile-detail-manager">
    <div class="content-wrapper">
      <PickSchemeDetail
        :flow-entry-name="flowEntryName"
        :taskName="taskName"
        demand-detail
        :disabled="['甄选方式', '甄选方式理由', '合作伙伴列表']"
        :flow-task-comment-list="flowTaskCommentList"
        :detail-data="detailData"
      />
    </div>

    <BottomActionBar
      :submitLoading="submitLoading"
      @cancel="onCancel"
      @reject="onReject"
      @agree="onAgree"
    />

    <ApprovalPopup
      v-model:rejectDialogVisible="rejectDialogVisible"
      v-model:agreeDialogVisible="agreeDialogVisible"
      v-model:showApproverPicker="showApproverPicker"
      v-model:rejectReason="rejectReason"
      v-model:agreeReason="agreeReason"
      v-model:appointedAssigneeText="appointedAssigneeText"
      v-model:appointedAssignee="appointedAssignee"
      :islast="false"
      :submitLoading="submitLoading"
      :approverColumns="approverColumns"
      @confirmReject="confirmReject"
      @confirmAgree="confirmAgree"
    />
  </div>
</template>

<style scoped>
</style>
