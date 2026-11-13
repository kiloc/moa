<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack, formatDate } from '@/common/utils'
import { PartnerEvaluationController } from '@/api/partnerEvaluation'
import { FlowOperationController } from '@/api/flow'
import { post } from '@/common/http/request'
import { API_CONTEXT } from '@/api/config'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import EvaluateResult from '@/views/pages/evaluate/projectEvaluate/components/evaluateResult.vue'

const router = useRouter()
const route = useRoute()
const params = router.currentRoute.value.query || {}

const formData = ref<ANY_OBJECT>({
  taskCode: '',
  taskName: '',
  startTime: '',
  endTime: '',
  initiator: '',
  initiatorDept: '',
  initiatorTime: '',
  createRegionName: '',
})

const partnerList = ref<ANY_OBJECT[]>([])
const flowTaskCommentList = ref<any[]>([])
const initiatorInfo = ref({})

const submitLoading = ref(false)
const rejectReason = ref('')
const rejectDialogVisible = ref(false)
const agreeReason = ref('')
const agreeDialogVisible = ref(false)
const showApproverPicker = ref(false)
const approverColumns = ref([])
const appointedAssignee = ref('')
const appointedAssigneeText = ref('')
const activeName = ref('1')

const isShowApprovalBtn = computed(() => {
  return true
})

const formattedStartTime = computed(() => formatDate(formData.value.startTime, 'YYYY-MM-DD'))
const formattedEndTime = computed(() => formatDate(formData.value.endTime, 'YYYY-MM-DD'))

function queryDetail() {
  const businessKey = route.query.businessKey as string
  if (!businessKey) {
    showToast('缺少任务编号')
    return
  }

  PartnerEvaluationController.getEvaluationDetail({
    taskNo: businessKey,
    processInstanceId: (params.processInstanceId as string) || undefined,
  }).then((res) => {
    if (res.data) {
      const data = res.data
      formData.value.taskCode = data.taskNo || ''
      formData.value.taskName = data.taskName || ''
      formData.value.startTime = data.startTime || ''
      formData.value.endTime = data.endTime || ''
      formData.value.initiator = data.createUserName || ''
      formData.value.initiatorDept = data.createDeptName || ''
      formData.value.initiatorTime = route.query.processInstanceStartTime || data.createTime || ''
      formData.value.createRegionName = data.createRegionName || ''

      if (data.evaluationScoreResultList && Array.isArray(data.evaluationScoreResultList)) {
        partnerList.value = data.evaluationScoreResultList.map((item: ANY_OBJECT) => ({
          isValid: item.isValid,
          partnerName: item.partnerName || '',
          totalScore: item.totalScore ?? '',
          evaluatorUserName: item.evaluatorUserName || '',
          evaluatorDeptName: item.evaluatorDeptName || '',
        }))
      }
    }

    if (params.showName) {
      initiatorInfo.value = {
        createUserName: params.showName,
        createUserPhone: params.processInstanceInitiatorMobile,
        createUserOrg: params.processInstanceInitiatorDeptName,
        createUserCityName: params.processInstanceInitiatorCityName,
        createTime: params.processInstanceStartTime,
      }
    } else {
      initiatorInfo.value = {
        createUserName: formData.value.initiator,
        createUserOrg: formData.value.initiatorDept,
        createTime: formData.value.initiatorTime,
      }
    }
  })
}

function loadFlowTaskCommentList() {
  if (!params.processInstanceId) return
  FlowOperationController.listFlowTaskComment({
    processInstanceId: params.processInstanceId,
  })
    .then((res: any) => {
      flowTaskCommentList.value = res.data || []
    })
    .catch((e: any) => console.error(e))
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

  try {
    submitLoading.value = true
    await post(
      `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${params.processDefinitionKey}`,
      {
        processInstanceId: params.processInstanceId,
        taskId: params.taskId,
        flowTaskCommentDto: {
          approvalType: 'reject',
          taskComment: rejectReason.value,
        },
        taskVariableData: {},
      },
    )
    showToast('已驳回')
    submitLoading.value = false
    rejectDialogVisible.value = false
    appBack()
    // router.back()
  } catch (e) {
    submitLoading.value = false
    // showToast('操作失败')
    console.error(e)
  }
}

function onAgree() {
  agreeReason.value = ''
  agreeDialogVisible.value = true
}

async function confirmAgree() {
  try {
    submitLoading.value = true
    await post(
      `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${params.processDefinitionKey}`,
      {
        processInstanceId: params.processInstanceId,
        taskId: params.taskId,
        flowTaskCommentDto: {
          approvalType: 'agree',
          taskComment: agreeReason.value,
        },
        taskVariableData: {},
      },
    )
    showToast('审批通过')
    submitLoading.value = false
    agreeDialogVisible.value = false
    appBack()
    // router.back()
  } catch (e) {
    submitLoading.value = false
    // showToast('操作失败')
    console.error(e)
  }
}

function onCancel() {
  appBack()
  // router.back()
}

onMounted(() => {
  loadFlowTaskCommentList()
  queryDetail()
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
          <!-- <InfoHeader
            :create-user-name="initiatorInfo?.createUserName"
            :create-user-phone="initiatorInfo?.createUserPhone"
            :create-time="initiatorInfo?.createTime"
            :create-user-org="initiatorInfo?.createUserOrg"
            :create-user-city-name="initiatorInfo?.createUserCityName"
          /> -->
          <van-tabs v-model:active="activeName" type="card">
            <van-tab title="业务信息" name="1">
              <div class="tab-content">
                <div class="section">
                  <div class="section-subtitle">评估信息</div>
                  <van-field v-model="formData.taskCode" label="评估任务编号" readonly />
                  <van-field v-model="formData.taskName" label="评估任务名称" readonly />
                  <van-field v-model="formattedStartTime" label="评估起止时间" readonly />
                  <van-field v-model="formattedEndTime" label="评估截止时间" readonly />
                  <van-field v-model="formData.initiator" label="发起人" readonly />
                  <van-field v-model="formData.initiatorDept" label="发起人部门" readonly />
                  <van-field v-model="formData.initiatorTime" label="发起时间" readonly />
                  <van-field v-model="formData.createRegionName" label="发起区域" readonly />
                </div>

                <EvaluateResult :data="partnerList" :is-hide-level="true" />
                <!-- <div class="section"> 
                  <div class="section-subtitle">评估结果</div>
                  <van-empty v-if="partnerList.length === 0" description="暂无评估结果" />
                  <template v-else>
                    <div v-for="(item, index) in partnerList" :key="index" class="result-card">
                      <van-cell class="card-header">
                        <template #title>
                          <span class="partner-name">{{ item.partnerName }}</span>
                        </template>
                        <template #value>
                          <span class="total-score">评估得分：{{ item.totalScore }}</span>
                        </template>
                      </van-cell>
                      <van-cell title="评估人员" :value="item.evaluatorUserName || '--'" />
                      <van-cell title="评估人员部门" :value="item.evaluatorDeptName || '--'" />
                    </div> -->
                  <!-- </template> -->
                <!-- </div> -->
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
            <!-- <van-tab title="附件信息" name="3">
              <div class="tab-content">
                <van-empty description="暂无附件信息" />
              </div>
            </van-tab> -->
          </van-tabs>
        </div>
      </div>
    </div>

    <BottomActionBar
      :cancel-text="isShowApprovalBtn ? '取消' : '关闭'"
      :show-reject="isShowApprovalBtn"
      :show-agree="isShowApprovalBtn"
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
      :islast="true"
      :is-require-agree-reason="false"
      :approver-columns="approverColumns"
      :submit-loading="submitLoading"
      @confirm-reject="confirmReject"
      @confirm-agree="confirmAgree"
    />
  </div>
</template>

<style scoped lang="scss">
.result-card {
  border-bottom: 1px solid #ebedf0;

  .card-header {
    padding: 12px 16px;
    background-color: #fff;

    .partner-name {
      font-size: 15px;
      font-weight: 500;
      color: #323233;
    }

    .total-score {
      font-size: 14px;
      color: #ee0a24;
      font-weight: 500;
    }
  }
}
</style>