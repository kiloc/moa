<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { PickDemandController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { post } from '@/common/http/request'
import { getApproverList } from '@/common/utils'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import PickDecisionKeepDetail from './pickDecisionKeepDetail.vue'
import 'vant/es/toast/style'

const submitLoading = ref(false)
const router = useRouter()
const route = useRoute()

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

const isSplitDemandNumber = ref<boolean>(false)
const pickSchemeDeptId = ref<string>('')
const noticeId = ref<number>(0)
const bidPackagesFromDemand = ref<ANY_OBJECT[]>([])

const formData = reactive<ANY_OBJECT>({
  demandId: undefined,
  demandNumber: '',
  demandName: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
  bidPackageFlag: '0',
})

const schemeFormData = reactive<ANY_OBJECT>({
  schemeId: undefined,
  schemeNumber: '',
  schemeName: '',
  createUserId: undefined,
  projectManagerId: undefined,
  projectManagerCode: '',
  projectManager: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
})

const decisionFormData = reactive<ANY_OBJECT>({
  decisionTime: '',
  hasTemporaryFile: '',
})

const decisionFiles = ref<ANY_OBJECT[]>([])
const successList = ref<ANY_OBJECT[]>([])

const approverColumns = computed(() =>
  nextApproverList.value.map(user => ({
    text: user.showName,
    value: user.loginName,
  })),
)

async function loadNextApproverList() {
  try {
    if (taskName.value === '三级经理决策信息审批') {
      nextApproverList.value = [
        {
          showName: schemeFormData.projectManager,
          loginName: schemeFormData.projectManagerCode,
          userId: schemeFormData.projectManagerId,
        },
      ]
    }
    else {
      nextApproverList.value = await getApproverList(pickSchemeDeptId.value)
    }
  }
  catch (e) {
    showToast('加载审批人列表失败')
    console.error(e)
  }
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
    const flowUrl = isSplitDemandNumber.value
      ? `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/RePickFlow`
      : `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${route.query.processDefinitionKey}`
    submitLoading.value = true
    await post(flowUrl, {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectReason.value,
      },
      taskVariableData: {
        appointedAssignee: '',
      },
    })
    showToast('已驳回')
    submitLoading.value = false
    rejectDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    // showToast('操作失败')
    submitLoading.value = false
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
  if (!appointedAssignee.value.trim() && !islast.value) {
    showToast('请指定下一步审批人')
    return
  }
  try {
    const flowUrl = `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${route.query.processDefinitionKey}`
    submitLoading.value = true
    await post(flowUrl, {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'agree',
        taskComment: agreeReason.value || '同意',
      },
      taskVariableData: {
        appointedAssignee: islast.value ? schemeFormData.projectManagerCode : appointedAssignee.value,
      },
    })
    showToast('审批通过')
    submitLoading.value = false
    agreeDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    // showToast('操作失败')
    submitLoading.value = false
    console.error(e)
  }
}

async function loadSuccessData(demandNumber: string, noticeId: number) {
  try {
    let obj = {
      demandNumber: demandNumber,
      noticeId: noticeId,
      successFlag: 1, // 写死为1，查询成功的信息
    }
    if(route.query.processDefinitionKey === 'RePickFlow'){
      obj['reviewTime'] = 2
    }
    const res = await PickDemandController.queryBidResult(obj)

    if (res.data) {
      if (res.data.pickBidPackages && Array.isArray(res.data.pickBidPackages)&& route.query.processDefinitionKey !== 'RePickFlow') {
        successList.value = res.data.pickBidPackages.map((resultPkg: ANY_OBJECT) => {
          const demandPkg = bidPackagesFromDemand.value.find(
            (pkg: ANY_OBJECT) =>
              pkg.id === resultPkg.bidPackageId
              || pkg.bidPackageNumber === resultPkg.bidPackageNumber,
          )
          const partners = demandPkg?.pickPartners || resultPkg.pickPartners || []
          return {
            ...resultPkg,
            pickPartners: partners,
          }
        })
      }

      if (res.data.pickDecision) {
        const decision = res.data.pickDecision
        decisionFormData.decisionTime = decision.decisionTime
        decisionFormData.hasTemporaryFile = decision.hasTemporaryFile
        if (decision.decisionFiles && Array.isArray(decision.decisionFiles)) {
          decisionFiles.value = decision.decisionFiles
        }
      }
    }
  }
  catch (e: any) {
    showToast('加载甄选维护成功信息失败')
    console.error(e)
  }
}

async function loadSchemeData() {
  const businessKey = (route.query.demandNumber as string) || (route.query.businessKey as string)

  if (!businessKey) {
    showToast('缺少需求编号参数')
    return
  }

  const isSplit = businessKey.includes('-')
  isSplitDemandNumber.value = isSplit
  let demandNumber = businessKey

  if (isSplit) {
    const parts = businessKey.split('-')
    if (parts.length >= 2) {
      demandNumber = parts[1]
    }
  }

  try {
    let obj = {
      demandNumber:demandNumber
    }
    if(route.query.processDefinitionKey === 'RePickFlow'){
      obj.reviewTime = 2
    }
    const queryPromise = isSplit
      ? PickDemandController.queryFirstReviewTimeDemand({ demandNumber })
      : PickDemandController.queryDemand(obj)

    const res = await queryPromise

    if (res.data) {
      if (res.data.pickDemand) {
        Object.assign(formData, res.data.pickDemand)
      }

      if (res.data.pickScheme) {
        Object.assign(schemeFormData, res.data.pickScheme)
        const scheme = res.data.pickScheme
        pickSchemeDeptId.value = scheme.createUserDeptId
      }

      if (res.data.pickBidPackages && Array.isArray(res.data.pickBidPackages)) {
        bidPackagesFromDemand.value = res.data.pickBidPackages
        if(route.query.processDefinitionKey === 'RePickFlow'){
          successList.value = []
          bidPackagesFromDemand.value.forEach(item=>{
            successList.value.push({
              ...item,
              pageInfo: {
                currentPage: 1,
                pageSize: 10
              }
            })
          })
        }
      }

      await loadSuccessData(demandNumber, noticeId.value)
    }
  }
  catch (e: any) {
    showToast('加载需求数据失败')
    console.error(e)
  }
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

onMounted(() => {
  console.log(route.query,'route.query')
  loadFlowTaskCommentList()
  loadSchemeData()
})
</script>

<template>
  <div class="mobile-detail-manager">
    <div class="content-wrapper">
      <PickDecisionKeepDetail
        :flow-entry-name="flowEntryName"
        :flow-task-comment-list="flowTaskCommentList"
        :form-data="formData"
        :scheme-form-data="schemeFormData"
        :decision-form-data="decisionFormData"
        :success-list="successList"
        :decision-files="decisionFiles"
        :task-name="taskName"
      />
    </div>
<!-- v-if="route.query.isInfo !== 'true'" -->
    <BottomActionBar
      :submit-loading="submitLoading"
      @cancel="onCancel"
      @reject="onReject"
      @agree="onAgree"
    />

    <ApprovalPopup
      v-model:reject-dialog-visible="rejectDialogVisible"
      v-model:agree-dialog-visible="agreeDialogVisible"
      v-model:show-approver-picker="showApproverPicker"
      v-model:reject-reason="rejectReason"
      v-model:agree-reason="agreeReason"
      v-model:appointed-assignee-text="appointedAssigneeText"
      v-model:appointed-assignee="appointedAssignee"
      :islast="false"
      :submit-loading="submitLoading"
      :approver-columns="approverColumns"
      @confirm-reject="confirmReject"
      @confirm-agree="confirmAgree"
    />
  </div>
</template>

<style scoped>
</style>
