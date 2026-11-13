<script setup lang="ts">
import { showToast } from 'vant'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { SysUserController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { RecruitPlanManagerController } from '@/api/recruitManager/recruitPlanManager'
import { post } from '@/common/http/request'
import { useLoginStore } from '@/store'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import planPackageInfo from '@/views/pages/components/recruitManager/planPackageInfo.vue'
import recruitFile from '@/views/pages/components/recruitManager/recruitFile.vue'
import recruitInfo from '@/views/pages/components/recruitManager/recruitInfo.vue'
import recruitInfoAttachment from '@/views/pages/components/recruitManager/recruitInfoAttachment.vue'
import recruitPlanDecision from '@/views/pages/components/recruitManager/recruitPlanDecision.vue'
import recruitPlanInfo from '@/views/pages/components/recruitManager/recruitPlanInfo.vue'
import RecruitPlanInfoAttachment from '../../components/recruitManager/recruitPlanInfoAttachment.vue'
import 'vant/es/toast/style'

const router = useRouter()
const route = useRoute()
const loginStore = useLoginStore()
const taskName = computed(() => route.query.taskName as string)
const flowEntryName = computed(() => route.meta.commonTitle as string)
const userInfo = computed(() => loginStore.userInfo || {})

const params = router.currentRoute.value.query || {}
const taskId = ref(params.taskId)
const processInstanceId = ref(params.processInstanceId)
const islast = ref(params.taskName === '三级经理审批')

const formData = reactive({
  planCode: '',
  processInstanceId: '',
  taskId: '',
  taskComment: '',
  appointedAssignee: '',
  recruitmentFiles: [],
})

const recruitInfoRef = ref(null)
const recruitInfoAttachmentRef = ref(null)
const recruitPlanInfoRef = ref(null)
const fajbxxFileData = ref([])
const recruitmentDemandFiles = ref([])
const recruitPlanDecisionRef = ref(null)
const planPlanPackageInfo = ref(null)
const recruitFileRef = ref(null)
const errorText = ref('')

const showRecruitInfo = ref(false)
const showPackageInfo = ref(false)

const currentType = ref('add')
const initiatorInfo = ref({})

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

function changeDividePackage(isPackage: string) {
  showPackageInfo.value = isPackage === '1'
}

function onSubmit(type?: string) {
  errorText.value = ''
  Promise.all([
    recruitFileRef.value?.handleSubmit().catch((val: string) => {
      errorText.value = val
    }),
  ])
    .then((results) => {
      if (errorText.value) {
        showToast(errorText.value)
        return
      }

      let param = {
        ...formData,
        processInstanceId: processInstanceId.value,
        taskId: taskId.value,
        planCode: params.businesskey || params.businessKey || params.planCode,
        recruitmentFiles: results[0]?.recruitmentFiles || [],
      }

      const fn = () => {
        let url = RecruitPlanManagerController.uploadAndCompleteTask
        if (currentType.value === 'edit' && processInstanceId.value && taskId.value) {
          url = RecruitPlanManagerController.resubmitFileAfterReject
          param.processInstanceId = processInstanceId.value
          param.taskId = taskId.value
        }
        if (type && type === 'saveDraftBatch') {
          url = RecruitPlanManagerController.fileSaveDraftBatch
        }
        url(param)
          .then(() => {
            showToast('提交成功')
            appBack()
            // router.back()
          })
          .catch(() => {})
      }

      if (type && type === 'saveDraftBatch') {
        fn()
      }
      else {
        let roleId = ''
        if (initiatorInfo.value.area == 1) {
          roleId = '2034603668178735104'
        }
        if (initiatorInfo.value.area == 2) {
          roleId = '2034603715310129152'
        }
        if (initiatorInfo.value.area == 3) {
          roleId = '2034603760671526912'
        }

        SysUserController.listUserByRoleAndDeptFlag({
          roleId,
          deptFlag: 'current',
          deptId: initiatorInfo.value.deptId,
        })
          .then((res) => {
            const users = res.data || []
            if (users.length === 1) {
              param.appointedAssignee = users[0].loginName
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
    .catch(() => {
      showToast(errorText.value)
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
    const paramsData = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectReason.value,
      },
      taskVariableData: {},
    }

    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/RecruitmentPlanFileFlow`, paramsData)
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

function loadNextApproverList() {
  let obj: any = {
    roleId: '',
    deptFlag: 'current',
  }

  if (params.taskKey === 'Activity_01fldlk') {
    obj = {
      deptFlag: 'designatedDepartment',
      designatedDeptFlag: '1',
    }
  }
  if (params.taskKey === 'Activity_0g7twq1') {
    if (initiatorInfo.value.area == 1) {
      obj = {
        roleId: '2034604034224033792',
        deptFlag: 'current',
        deptId: initiatorInfo.value.deptId,
      }
    }
    if (initiatorInfo.value.area == 2) {
      obj = {
        roleId: '2034604084098502656',
        deptFlag: 'current',
        deptId: initiatorInfo.value.deptId,
      }
    }
    if (initiatorInfo.value.area == 3) {
      obj = {
        roleId: '2034604155405864960',
        deptFlag: 'current',
        deptId: initiatorInfo.value.deptId,
      }
    }
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
  if (!agreeReason.value.trim()) {
    showToast('请输入意见')
    return
  }

  try {
    const paramsData = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'agree',
        taskComment: agreeReason.value,
      },
      taskVariableData: {
        appointedAssignee: appointedAssignee.value,
      },
    }
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/RecruitmentPlanFileFlow`, paramsData)
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

function onCancel() {
  appBack()
  // router.back()
}
const zmwjRemark = ref('')
const zmwjFileList = ref([])
const fajcxx = reactive({
  fileList: [],
  decisionLevel: '',
  decisionTime: '',
})
function init() {
  RecruitPlanManagerController.queryPlanNegativeBehaviorBatch({
    planCode: params.businessKey || params.planCode,
    // planCode: 'ZMFA3046892026040036',
  })
    .then((res) => {
      initiatorInfo.value = res.data.initiatorInfo
      if (res.data && res.data.recruitmentPlan.id) {
        delete res.data.recruitmentPlan.id
      }
      if (res.data.recruitmentDemandDetail) {
        showRecruitInfo.value = true
        recruitmentDemandFiles.value = res.data.recruitmentDemandDetail.recruitmentFiles || []
        setTimeout(() => {
          recruitInfoRef.value?.showData(res.data.recruitmentDemandDetail, 'auth')
        }, 500)
      }
      if (res.data.recruitmentPlan.isDividePackage == '1') {
        showPackageInfo.value = true
        setTimeout(() => {
          planPlanPackageInfo.value?.showData(res.data.bidPackages, 'auth')
        }, 500)
      }

      if (recruitFileRef.value && typeof recruitFileRef.value.showData === 'function') {
        try {
          recruitFileRef.value.showData(res.data, currentType.value === 'noProcessEdit' ? 'edit' : currentType.value)
        }
        catch (error) {
          console.error(error)
        }
      }

      if (recruitPlanInfoRef.value && typeof recruitPlanInfoRef.value.showData === 'function') {
        try {
          recruitPlanInfoRef.value.showData(res.data, 'auth')
        }
        catch (error) {
          console.error(error)
        }
      }

      fajbxxFileData.value = res.data.recruitmentPlanFiles || []

      if (recruitPlanDecisionRef.value && typeof recruitPlanDecisionRef.value.showData === 'function') {
        try {
          recruitPlanDecisionRef.value.showData(res.data, 'auth')
        }
        catch (error) {
          console.error(error)
        }
      }
      if (params.showName) {
        initiatorInfo.value.createUserName = params.showName
        initiatorInfo.value.createUserPhone = params.processInstanceInitiatorMobile
        initiatorInfo.value.createUserOrg = params.processInstanceInitiatorDeptName
        initiatorInfo.value.createUserCityName = params.processInstanceInitiatorCityName
        initiatorInfo.value.createTime = params.processInstanceStartTime
      }

      if (res.data.recruitmentUploadFiles) {
        res.data.recruitmentUploadFiles.forEach((item: any) => {
          zmwjRemark.value = item.remark
        })
        zmwjFileList.value = res.data.recruitmentUploadFiles
      }
      else if (res.data.recruitmentFiles) {
        zmwjFileList.value = res.data.recruitmentFiles
      }

      fajcxx.decisionLevel = res.data.recruitmentPlan?.decisionLevel || ''
      fajcxx.decisionTime = res.data.recruitmentPlan?.decisionTime || ''
      fajcxx.fileList = res.data.recruitmentPlanDecisionFiles || []
    })
    .catch(() => {})
}

const activeName = ref('1')
const submitLoading = ref(false)
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
  if (params.businesskey || params.businessKey || params.planCode) {
    if (params.isInfo === 'true') {
      currentType.value = 'info'
    }
    if (
      params.taskName === '招募管理员审批'
      || params.taskName === '采购部门审批'
      || params.taskName === '三级经理审批'
    ) {
      currentType.value = 'auth'
    }
    if (params.taskName === '发起申请') {
      currentType.value = 'edit'
    }
    if (params.taskName === '修改') {
      currentType.value = 'noProcessEdit'
    }
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
            {{ flowEntryName }}{{ taskName ? `-${taskName}` : '' }}
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
                <recruitInfo v-if="showRecruitInfo" ref="recruitInfoRef" />
                <recruitPlanInfo ref="recruitPlanInfoRef" />
                <planPackageInfo v-if="showPackageInfo" ref="planPlanPackageInfo" />
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
                <recruitInfoAttachment v-if="showRecruitInfo" :file-list="recruitmentDemandFiles" />
                <RecruitPlanInfoAttachment :file-list="fajbxxFileData" />
                <recruitPlanDecision :decision-level="fajcxx.decisionLevel" :decision-time="fajcxx.decisionTime" :file-list="fajcxx.fileList" />
                <recruitFile ref="recruitFileRef" :file-list="zmwjFileList" :remark="zmwjRemark" />
              </div>
            </van-tab>
          </van-tabs>
        </div>
      </div>
    </div>

    <BottomActionBar
      v-if="currentType === 'add' || currentType === 'edit' || currentType === 'noProcessEdit'"
      :show-reject="false"
      :show-agree="true"
      @cancel="onCancel"
      @agree="() => onSubmit()"
    >
      <template #extra>
        <van-button type="default" size="large" @click="() => onSubmit('saveDraftBatch')">
          保存
        </van-button>
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
      :is-require-agree-reason="true"
      :approver-columns="approverColumns"
      :submit-loading="submitLoading"
      @confirm-reject="confirmReject"
      @confirm-agree="confirmAgree"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
