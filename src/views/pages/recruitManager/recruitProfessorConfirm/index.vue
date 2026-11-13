<script setup lang="ts">
import { showToast } from 'vant'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { RecruitReviewController } from '@/api/recruitManagement'
import { useLoginStore } from '@/store'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import ProfessorConfirm from '@/views/pages/components/recruitManager/professorConfirm.vue'
import recruitInfo from '@/views/pages/components/recruitManager/recruitInfo.vue'
import recruitInfoAttachment from '@/views/pages/components/recruitManager/recruitInfoAttachment.vue'
import recruitPlanDecision from '@/views/pages/components/recruitManager/recruitPlanDecision.vue'
import recruitPlanInfo from '@/views/pages/components/recruitManager/recruitPlanInfo.vue'
import RecruitPlanInfoAttachment from '../../components/recruitManager/recruitPlanInfoAttachment.vue'
import 'vant/es/toast/style'

const router = useRouter()
const route = useRoute()
const loginStore = useLoginStore()
const userInfo = computed(() => loginStore.userInfo || {})
const params = router.currentRoute.value.query || {}
const taskId = ref(params.taskId)
const processInstanceId = ref(params.processInstanceId)

const initiatorInfo = ref({})
const currentType = ref('add')

const recruitInfoRef = ref(null)
const recruitPlanInfoRef = ref(null)
const recruitPlanDecisionRef = ref(null)
const professorConfirmRef = ref(null)

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)
const showApproverPicker = ref(false)

const rejectReason = ref('')
const agreeReason = ref('')
const appointedAssigneeText = ref('')
const appointedAssignee = ref('')
const submitLoading = ref(false)
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

const demandNumber = ref('')

function init() {
  getCurrentType()
  demandNumber.value = params.businessKeyOrigin || params.businessKey
  if (params.businessKeyOrigin && params.businessKeyOrigin.includes('-')) {
    const parts = params.businessKeyOrigin.split('-')
    if (parts.length >= 2) {
      demandNumber.value = parts[0] // 提取中间的 demandNumber
    }
  }

  queryDetail()
}

const formData = ref({})
const recruitmentDemandFiles = ref([])
const fajbxxFileData = ref([])
const fajcxx = reactive({
  fileList: [],
  decisionLevel: '',
  decisionTime: '',
})

function queryDetail() {
  RecruitReviewController.queryReviewGroupList({
    planCode: demandNumber.value,
  }).then((res) => {
    formData.value = res.data

    const recruitmentPlanQueryVo = res.data.recruitmentPlanQueryVo

    recruitmentDemandFiles.value = res.data?.recruitmentDemandDetailVo?.recruitmentFiles || []

    recruitmentPlanQueryVo?.recruitmentPlanFiles.forEach((item) => {
      item.name = item.originalName
    })
    fajbxxFileData.value = recruitmentPlanQueryVo?.recruitmentPlanFiles || []

    nextTick(() => {
      // 回显数据 - 发起人信息
      if (params.showName) {
        initiatorInfo.value.createUserName = params.showName
        initiatorInfo.value.createUserPhone = params.processInstanceInitiatorMobile
        initiatorInfo.value.createUserOrg = params.processInstanceInitiatorDeptName
        initiatorInfo.value.createUserCityName = params.processInstanceInitiatorCityName
        initiatorInfo.value.createTime = params.processInstanceStartTime
      }
      else {
        initiatorInfo.value = res.data.initiatorInfo || {}
      }
      // 回显数据 - 招募需求
      recruitInfoRef?.value?.showData(res.data?.recruitmentDemandDetailVo, 'info')
      // 回显数据 - 招募方案基本信息
      recruitPlanInfoRef?.value?.showData(res.data?.recruitmentPlanQueryVo, 'info')
      // 回显数据 - 招募决策信息
      fajcxx.decisionLevel = `${recruitmentPlanQueryVo.recruitmentPlan.decisionLevel || ''}`
      fajcxx.decisionTime = recruitmentPlanQueryVo.recruitmentPlan.decisionTime
      if (recruitmentPlanQueryVo.recruitmentPlanDecisionFiles && recruitmentPlanQueryVo.recruitmentPlanDecisionFiles.length) {
        recruitmentPlanQueryVo.recruitmentPlanDecisionFiles.forEach((item) => {
          item.name = item.originalName
        })
        fajcxx.fileList = recruitmentPlanQueryVo.recruitmentPlanDecisionFiles
      }

      if (res.data?.recruitmentExpertSelectionVo && res.data?.recruitmentExpertSelectionVo.length) {
        res.data?.recruitmentExpertSelectionVo.forEach((item) => {
          if (item.loginName === userInfo.value.loginName) {
            professorConfirmRef?.value?.showData({
              confirmStatus: item.confirmStatus,
              reason: item.reason,
            }, currentType.value)
          }
        })
      }
    })
  })
}

function onSubmit() {
  const param = {
    processInstanceId: params.processInstanceId,
    taskId: params.taskId,
    planCode: demandNumber.value,
    ...professorConfirmRef.value?.formData,
  }
  submitLoading.value = true
  RecruitReviewController.confirm(param).then(() => {
    showToast('提交成功')
    appBack()
    // router.back()
  }).finally(() => {
    submitLoading.value = false
  })
}

function getCurrentType() {
  if (params.taskName === '详情' || params.isInfo === 'true') {
    currentType.value = 'info'
  }
  else if (params.taskName === '专家确认') {
    currentType.value = 'auth'
  }
  else {
    currentType.value = 'add'
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
    showToast('请输入意见')
    return
  }
  showToast('已驳回')
  rejectDialogVisible.value = false
  appBack()
  // router.back()
}

function onAgree() {
  appointedAssignee.value = ''
  appointedAssigneeText.value = ''
  agreeReason.value = ''
  agreeDialogVisible.value = true
}

async function confirmAgree() {
  if (!agreeReason.value.trim()) {
    showToast('请输入意见')
    return
  }
  showToast('审批通过')
  agreeDialogVisible.value = false
  appBack()
  // router.back()
}

const activeName = ref('1')
const flowTaskCommentList = ref([])

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
  if (params.businesskey || params.businessKey) {
    init()
  }
  loadFlowTaskCommentList()
})
</script>

<template>
  <div class="mobile-detail-manager">
    <div class="content-wrapper">
      <div class="mobile-detail">
        <div class="mobile-detail-content-wrapper">
          <div class="page-title">
            {{ params.flowEntryName }}{{ params.taskName ? `-${params.taskName}` : '' }}
          </div>
          <InfoHeader
            :create-user-name="initiatorInfo?.createUserName"
            :create-user-phone="initiatorInfo?.createUserPhone"
            :create-time="initiatorInfo?.createTime"
            :create-user-org="initiatorInfo?.createUserOrg"
            :create-user-city-name="initiatorInfo?.createUserCityName"
          />

          <van-tabs v-model:active="activeName" type="card">
            <van-tab title="业务信息" name="1">
              <div class="tab-content">
                <!--    招募需求信息 -->
                <recruitInfo v-if="formData?.recruitmentDemandDetailVo?.id" ref="recruitInfoRef" />
                <!--    招募方案基本信息 -->
                <recruitPlanInfo ref="recruitPlanInfoRef" />
                <!--    专家确认 -->
                <ProfessorConfirm ref="professorConfirmRef" />
              </div>
            </van-tab>
            <van-tab title="流程信息" name="2">
              <div class="tab-content">
                <div class="section">
                  <approvalTimeline v-if="flowTaskCommentList.length > 0" :list="flowTaskCommentList" />
                  <van-empty v-else description="暂无流程信息" />
                </div>
              </div>
            </van-tab>
            <van-tab title="附件信息" name="3">
              <div class="tab-content">
                <!--    招募需求信息 -->
                <recruitInfoAttachment v-if="formData?.recruitmentDemandDetailVo?.id" :file-list="recruitmentDemandFiles" />
                <!--    招募方案基本信息 -->
                <RecruitPlanInfoAttachment :file-list="fajbxxFileData" />
                <!--    招募方案决策信息 -->
                <recruitPlanDecision :decision-level="fajcxx.decisionLevel" :decision-time="fajcxx.decisionTime" :file-list="fajcxx.fileList" />
              </div>
            </van-tab>
          </van-tabs>
        </div>
      </div>
    </div>

    <BottomActionBar
      v-if="currentType === 'add'"
      :show-reject="false"
      :show-agree="true"
      @cancel="onCancel"
      @agree="onSubmit"
    />

    <BottomActionBar
      v-else-if="currentType === 'auth'"
      :cancel-text="isShowCloseBtn ? '关闭' : '取消'"
      :show-reject="false"
      @cancel="onCancel"
      @reject="onReject"
      agreeText="提交"
      @agree="onSubmit"
    />

    <BottomActionBar
      v-else
      cancel-text="关闭"
      :show-reject="false"
      :show-agree="false"
      @cancel="onCancel"
    />

    <!-- <ApprovalPopup
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
      :submit-loading="submitLoading"
    /> -->
  </div>
</template>

<style scoped lang="scss">
.mobile-detail-manager {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.content-wrapper {
  padding-bottom: 100px;
}

.mobile-detail {
  background-color: #ffffff;
}

.mobile-detail-content-wrapper {
  padding: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16px;
}

.tab-content {
  padding-top: 16px;
}

.section {
  margin-bottom: 16px;
}
</style>
