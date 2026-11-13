<script setup lang="ts">
import { showToast } from 'vant'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { SysUserController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { RecruitNoticeController } from '@/api/recruitManagement'
import { post } from '@/common/http/request'
import { useLoginStore } from '@/store'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import NoticeCompile from '@/views/pages/components/recruitManager/noticeCompile.vue'
import planPackageInfo from '@/views/pages/components/recruitManager/planPackageInfo.vue'
import recruitInfo from '@/views/pages/components/recruitManager/recruitInfo.vue'
import recruitPlanDecision from '@/views/pages/components/recruitManager/recruitPlanDecision.vue'
import recruitPlanInfo from '@/views/pages/components/recruitManager/recruitPlanInfo.vue'
import RecruitPlanInfoAttachment from '../../components/recruitManager/recruitPlanInfoAttachment.vue'
import recruitInfoAttachment from '@/views/pages/components/recruitManager/recruitInfoAttachment.vue'
import recruitInfoAttachmentNew from '@/views/pages/components/recruitManager/recruitInfoAttachmentNew.vue'

import 'vant/es/toast/style'

const router = useRouter()
const route = useRoute()
const loginStore = useLoginStore()
const userInfo = computed(() => loginStore.userInfo || {})

const submitLoading = ref(false)
const params = router.currentRoute.value.query || {}
console.log(params, 'value')
const islast = ref(params.taskName === '招募管理员审批')
const showPackageInfo = ref(false)

const currentType = ref('add')
const formData = ref({})

const initiatorInfoRef = ref(null)
const recruitInfoRef = ref(null)
const recruitPlanInfoRef = ref(null)
const planPlanPackageInfo = ref(null)
const recruitPlanDecisionRef = ref(null)
const noticeCompileRef = ref(null)

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)
const showApproverPicker = ref(false)

const rejectReason = ref('')
const agreeReason = ref('')
const appointedAssigneeText = ref('')
const appointedAssignee = ref('')

const nextApproverList = ref<any[]>([])
const initiatorInfo = ref({})
const recruitmentDemandFiles = ref([])
const recruitmentFiles = ref([])

const fajcxx = reactive({
  fileList: [],
  decisionLevel: '',
  decisionTime: ''
})
const approverColumns = computed(() =>
  nextApproverList.value.map(user => ({
    text: user.showName,
    value: user.loginName,
  })),
)

const deptId = ref('')
const area = ref('')

const isShowApprovalBtn = computed(() => {
  return currentType.value === 'auth'
})

const isShowCloseBtn = computed(() => {
  return currentType.value === 'info'
})

function onCancel() {
  appBack()
  // router.back()
}

function init() {
  getCurrentType()
  queryDetail()
}

const fajbxxFileData = ref([])

function queryDetail() {
  if (!params.businessKey)
    return
  RecruitNoticeController.queryDetail({ planCode: params.businessKey }).then((res) => {
    formData.value = res.data
    nextTick(() => {
      deptId.value = res.data?.recruitmentPlanQueryVo?.initiatorInfo?.deptId
      area.value = res.data?.recruitmentPlanQueryVo?.initiatorInfo?.area

      fajbxxFileData.value = res.data.recruitmentPlanQueryVo.recruitmentPlanFiles || []
      if (params.showName) {
        initiatorInfo.value.createUserName = params.showName
        initiatorInfo.value.createUserPhone = params.processInstanceInitiatorMobile
        initiatorInfo.value.createUserOrg = params.processInstanceInitiatorDeptName
        initiatorInfo.value.createUserCityName = params.processInstanceInitiatorCityName
        initiatorInfo.value.createTime = params.processInstanceStartTime
      }
      else {
        initiatorInfo.value = res.data.initiatorInfo
      }

      recruitInfoRef.value?.showData(res.data?.recruitmentDemandDetailVo, 'info')
      recruitPlanInfoRef.value?.showData(res.data?.recruitmentPlanQueryVo, 'info')

      if (res.data.recruitmentPlanQueryVo.bidPackages && res.data.recruitmentPlanQueryVo.bidPackages.length) {
        showPackageInfo.value = true
        setTimeout(() => {
          planPlanPackageInfo.value?.showData(res.data.recruitmentPlanQueryVo.bidPackages, 'info')
        }, 500)
      }

      // recruitPlanDecisionRef.value?.showData(res.data?.recruitmentPlanQueryVo, 'info')
      noticeCompileRef.value?.showData(
        res.data,
        currentType.value === 'noProcessEdit' ? 'edit' : currentType.value,
      )


      console.log( res.data, ' res.data.recruitmentPlan----')
      fajcxx.decisionLevel = res.data.recruitmentPlanQueryVo.recruitmentPlan?.decisionLevel || ''
      fajcxx.decisionTime = res.data.recruitmentPlanQueryVo.recruitmentPlan?.decisionTime || ''
      fajcxx.fileList = res.data.recruitmentPlanQueryVo.recruitmentPlanDecisionFiles || []
      recruitmentDemandFiles.value = res.data?.recruitmentPlanQueryVo?.recruitmentUploadFiles || []
      recruitmentFiles.value = res.data?.recruitmentDemandDetailVo?.recruitmentFiles || []
    })
  })
}

function onSubmit(type?: string) {
  noticeCompileRef.value?.handleSubmit().then((res) => {
    const saveParam = {
      id: formData.value.id,
      announceCode: formData.value.announceCode,
      planCode: params.businessKey,
      status: formData.value.status,
      publishTime: formData.value.publishTime,
      isDividePackage: formData.value?.recruitmentPlanQueryVo?.recruitmentPlan?.isDividePackage,
      ...res,
    }

    const fn = () => {
      if (type === 'save') {
        RecruitNoticeController.save(saveParam).then(() => {
          showToast('保存成功')
          appBack()
          // router.back()
        })
      }
      else {
        const submitParam = {
          processInstanceId: params.processInstanceId,
          taskId: params.taskId,
          businessKey: params.businessKey,
          appointedAssignee: params.appointedAssignee,
          recruitmentAnnouncementDto: saveParam,
        }
        RecruitNoticeController.submit(submitParam).then(() => {
          showToast('提交成功')
          appBack()
          // router.back()
        })
      }
    }

    if (type && type === 'save') {
      fn()
    }
    else {
      let roleId = ''
      if (area.value === '1') {
        roleId = '2034603668178735104'
      }
      if (area.value === '2') {
        roleId = '2034603715310129152'
      }
      if (area.value === '3') {
        roleId = '2034603760671526912'
      }

      SysUserController.listUserByRoleAndDeptFlag({
        roleId,
        deptFlag: 'current',
        deptId: deptId.value,
      })
        .then((res) => {
          const users = res.data || []
          if (users.length === 1) {
            params.appointedAssignee = users[0].loginName
            fn()
          }
          else if (users.length > 1) {
            nextApproverList.value = users
            appointedAssigneeText.value = ''
            appointedAssignee.value = ''
            showApproverPicker.value = true
          }
          else {
            fn()
          }
        })
        .catch(() => {
          fn()
        })
    }
  })
}

function getCurrentType() {
  if (params.isInfo === 'true') {
    currentType.value = 'info'
  }
  else if (params.taskName === '详情') {
    currentType.value = 'info'
  }
  else if (params.taskName === '修改' || params.taskName === '招募公告编制') {
    currentType.value = 'edit'
  }
  else if (params.taskName === '流程') {
    currentType.value = 'process'
  }
  else if (params.taskName === '招募管理员审批') {
    currentType.value = 'auth'
  }
}

function loadNextApproverList() {
  const obj = {
    roleId: '',
    deptFlag: 'current',
  }
  if (userInfo.value.area == 1) {
    obj.roleId = '2034603668178735104'
  }
  if (userInfo.value.area == 2) {
    obj.roleId = '2034603715310129152'
  }
  if (userInfo.value.area == 3) {
    obj.roleId = '2034603760671526912'
  }

  SysUserController.listUserByRoleAndDeptFlag(obj)
    .then((res) => {
      nextApproverList.value = res.data || []
    })
    .catch((e) => {
      showToast('加载审批人列表失败')
      console.error(e)
    })
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
    const param = {
      processInstanceId: params.processInstanceId,
      taskId: params.taskId,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectReason.value,
      },
      taskVariableData: {},
    }

    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/RecruitmentAnnouncementApprovalFlow`, param)
    showToast('已驳回')
    rejectDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
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
  if (!agreeReason.value.trim()) {
    showToast('请输入意见')
    return
  }

  try {
    const param = {
      processInstanceId: params.processInstanceId,
      taskId: params.taskId,
      flowTaskCommentDto: {
        approvalType: 'agree',
        taskComment: agreeReason.value,
      },
      taskVariableData: {
        appointedAssignee: appointedAssignee.value,
      },
    }
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/RecruitmentAnnouncementApprovalFlow`, param)
    showToast('审批通过')
    agreeDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    // showToast('操作失败')
    console.error(e)
  }
}
const activeName = ref('1')
const flowTaskCommentList = ref([])

function loadFlowTaskCommentList() {
  if (!params.processInstanceId)
    return
  FlowOperationController.listFlowTaskComment({
    processInstanceId: params.processInstanceId || '',
  })
    .then((res) => {
      flowTaskCommentList.value = res.data || []
    })
    .catch(e => console.error(e))
}

watch(
  () => route.query,
  (q) => {
    const queryParams = q || {}
    islast.value = queryParams.taskName === '招募管理员审批'
    init()
  },
  { immediate: true },
)

onMounted(() => {
  loadFlowTaskCommentList()
  init()
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
          <!--    发起人信息-->
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
                <!-- 招募需求信息 -->
                <recruitInfo v-if="formData?.recruitmentDemandDetailVo?.id" ref="recruitInfoRef" />
                <!-- 招募方案基本信息 -->
                <recruitPlanInfo ref="recruitPlanInfoRef" />
                <planPackageInfo v-if="showPackageInfo" ref="planPlanPackageInfo" />
                <!-- 招募公告-->
                <NoticeCompile ref="noticeCompileRef" />
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
                <!-- 招募需求信息 -->
                <recruitInfoAttachment v-if="formData?.recruitmentDemandDetailVo?.id" :file-list="recruitmentFiles" />
                <!-- 招募方案基本信息 -->
                <RecruitPlanInfoAttachment :file-list="fajbxxFileData" />
                <!-- 招募方案决策信息 -->
                <recruitPlanDecision :decision-level="fajcxx.decisionLevel" :decision-time="fajcxx.decisionTime" :file-list="fajcxx.fileList" />
                <!-- 招募文件 -->
                <recruitInfoAttachmentNew :file-list="recruitmentDemandFiles" />
              </div>
            </van-tab>
          </van-tabs>
        </div>
      </div>
    </div>
    <BottomActionBar
      v-if="currentType !== 'info' && currentType !== 'auth'"
      :show-reject="false"
      :show-agree="true"
      :submit-loading="submitLoading"
      @cancel="onCancel"
      @agree="() => onSubmit()"
    >
      <template #extra>
        <van-button type="default" size="large" @click="() => onSubmit('save')">
          保存
        </van-button>
      </template>
    </BottomActionBar>

    <BottomActionBar
      v-else-if="currentType === 'auth'"
      :cancel-text="isShowCloseBtn ? '关闭' : '取消'"
      :show-reject="isShowApprovalBtn"
      :show-agree="isShowApprovalBtn"
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
      :is-require-agree-reason="true"
      :submit-loading="submitLoading"
      :approver-columns="approverColumns"
      @confirm-reject="confirmReject"
      @confirm-agree="confirmAgree"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
