<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appBack } from '@/common/utils'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { RecruitPlanManagerController } from '@/api/recruitManager/recruitPlanManager'
import { SysUserController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { post } from '@/common/http/request'
import { useLoginStore } from '@/store'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import RecruitNeed from '@/views/pages/components/recruitManager/recruitNeed.vue'
import RecruitCaseInfo from '@/views/pages/components/recruitManager/recruitCaseInfo.vue'
import RecruitResPublic from '@/views/pages/components/recruitManager/recruitResPublic.vue'
import RecruitResPublicAttachment from '@/views/pages/components/recruitManager/recruitResPublicAttachment.vue'
import { FlowOperationController } from '@/api/flow'


const router = useRouter()
const loginStore = useLoginStore()

const params = router.currentRoute.value.query || {}
const taskId = ref(params.taskId)
const processInstanceId = ref(params.processInstanceId)
const islast = ref(params.taskName === '招募管理员审批');

const initiatorInfo = ref<any>({})
const currentType = ref('add')

const recruitNeedRef = ref<any>(null)
const recruitmentDemand = ref(false)
const recruitCaseInfoRef = ref<any>(null)
const recruitResPublicRef = ref<any>(null)

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)
const showApproverPicker = ref(false)

const rejectReason = ref('')
const agreeReason = ref('')
const appointedAssigneeText = ref('')
const appointedAssignee = ref('')
const nextApproverList = ref<any[]>([])
const submitLoading = ref(false)

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

const onSubmit = (type?: string) => {
  recruitResPublicRef.value?.handleSubmit().then(results => {
    const submitParam = {
      ...results,
      businessKey: params.businessKey || params.planCode || results.businessKey,
    }

    const fn = () => {
      if (type === 'saveDraftBatch') {
        submitParam.appointedAssignee = 'admin'
        RecruitPlanManagerController.recruitmentPublicitySave(submitParam)
          .then(() => {
            showToast('暂存成功')
            appBack()
            // router.back()
          })
          .catch(() => {})
      } else {
        submitParam.processInstanceId = processInstanceId.value
        submitParam.taskId = taskId.value
        RecruitPlanManagerController.recruitmentPublicitySub(submitParam)
          .then(() => {
            showToast('提交成功')
            appBack()
            // router.back()
          })
          .catch(() => {})
      }
    }

    if (type === 'saveDraftBatch') {
      fn()
    } else {
      let roleId = ''
      if (area.value == '1') {
        roleId = '2034603668178735104'
      }
      if (area.value == '2') {
        roleId = '2034603715310129152'
      }
      if (area.value == '3') {
        roleId = '2034603760671526912'
      }

      SysUserController.listUserByRoleAndDeptFlag({
        roleId,
        deptFlag: 'current',
        deptId: deptId.value,
      })
        .then(res => {
          const users = res.data || []
          if (users.length === 1) {
            submitParam.appointedAssignee = users[0].loginName
            fn()
          } else if (users.length > 1) {
            nextApproverList.value = users
            appointedAssigneeText.value = ''
            appointedAssignee.value = ''
            showApproverPicker.value = true
          } else {
            fn()
          }
        })
        .catch(() => {
          fn()
        })
    }
  }).catch(error => {
    console.log(error)
  })
}

const viewData = ref({})
function init() {
  RecruitPlanManagerController.recruitmentPublicityDetail({
    planCode: params.businessKey || params.planCode || params.negativeBehaviorCode,
  })
    .then(res => {
    viewData.value = res.data;
    if (params.showName) {
      initiatorInfo.value.createUserName = params.showName
      initiatorInfo.value.createUserPhone = params.processInstanceInitiatorMobile
      initiatorInfo.value.createUserOrg = params.processInstanceInitiatorDeptName
      initiatorInfo.value.createUserCityName = params.processInstanceInitiatorCityName
      initiatorInfo.value.createTime = params.processInstanceStartTime
    } else {
      initiatorInfo.value = res.data?.initiatorInfo || {}
    }

    nextTick(() => {
      recruitNeedRef.value?.showData(res.data?.recruitmentDemand, 'info')
      recruitmentDemand.value = !!res.data.recruitmentDemand;
      recruitCaseInfoRef.value?.showData(res.data?.recruitmentPlan, 'info')
      recruitResPublicRef.value?.showData(
        res.data,
        currentType.value === 'noProcessEdit' ? 'edit' : currentType.value,
      )
    })
  })
  .catch(e => {
    console.error('Error in queryDetailByCaseCode:', e);
  });
}

function getCurrentType() {
  if (params.isInfo === 'true') {
    currentType.value = 'info'
  }
  if (params.taskName === '招募管理员审批' || params.taskName === '三级经理审批') {
    currentType.value = 'auth'
  }
  if (params.taskName === '招募结果决策维护发起' || params.taskName === '招募结果决策维护') {
    currentType.value = 'edit'
  }
  if (params.taskName === '编辑') {
    currentType.value = 'noProcessEdit'
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

    submitLoading.value = true
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/recruitmentPublicityApprovalFlow`, paramsData)
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

function loadNextApproverList() {
  const obj = {
    roleId: '',
    deptFlag: 'current'
  }
  if (loginStore.userInfo?.area === 1) {
    obj.roleId = '2034603668178735104'  // 省
  }
  if (loginStore.userInfo?.area === 2) {
    obj.roleId = '2034603715310129152'  // 市
  }
  if (loginStore.userInfo?.area === 3) {
    obj.roleId = '2034603760671526912'  // 区
  }

  SysUserController.listUserByRoleAndDeptFlag(obj)
    .then(res => {
      nextApproverList.value = res.data || [];
    })
    .catch(e => {
      showToast('加载审批人列表失败');
      console.error(e);
    });
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
    submitLoading.value = true
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/recruitmentPublicityApprovalFlow`, paramsData)
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

const activeName = ref('1')
const flowTaskCommentList = ref<any[]>([])
function loadFlowTaskCommentList() {
  if (!processInstanceId.value)
    return
  FlowOperationController.listFlowTaskComment({
    processInstanceId: processInstanceId.value,
  })
    .then((res: any) => {
      flowTaskCommentList.value = res.data || []
    })
    .catch((e: any) => console.error(e))
}

onMounted(() => {
  if (params.businesskey || params.businessKey || params.planCode || params.negativeBehaviorCode) {
    if (params.isInfo === 'true') {
      currentType.value = 'info';
    }
    if (
        params.taskName === '招募管理员审批'
    ) {
      currentType.value = 'auth';
    }
    // if (params.taskName === '招募结果公示发起' || params.taskName === '招募结果公示') {
    //   currentType.value = 'edit';
    // }
    if (params.taskName === '编辑') {
      currentType.value = 'noProcessEdit';
    }
    init();
  }
  loadFlowTaskCommentList()
});
</script>

<template>
  <div class="mobile-detail-manager">
    <div class="content-wrapper">
      <div class="mobile-detail">
        <div class="mobile-detail-content-wrapper">
          <div class="page-title">
            {{ params.flowEntryName }}{{ params.taskName ? `-${params.taskName}` : '' }}
          </div>
          <!-- 发起人信息-->
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
                <RecruitNeed ref="recruitNeedRef" v-if="recruitmentDemand"></RecruitNeed>
                <!-- 招募方案信息 -->
                <RecruitCaseInfo ref="recruitCaseInfoRef"></RecruitCaseInfo>
                <!-- 招募结果公示 -->
                <RecruitResPublic ref="recruitResPublicRef" :type="currentType"></RecruitResPublic>
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
                <!-- 招募结果公示 -->
                <RecruitResPublicAttachment :data="viewData" />
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
          暂存
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
      :islast="islast"
      :is-require-agree-reason="true"
      :approver-columns="approverColumns"
      @confirm-reject="confirmReject"
      @confirm-agree="confirmAgree"
      :submit-loading="submitLoading"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
