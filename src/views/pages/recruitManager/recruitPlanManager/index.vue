<script setup lang="ts">
import { onMounted, reactive, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { RecruitPlanManagerController } from '@/api/recruitManager/recruitPlanManager'
import { SysUserController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { post } from '@/common/http/request'
import { useLoginStore } from '@/store'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import recruitInfo from '@/views/pages/components/recruitManager/recruitInfo.vue'
import recruitPlanInfo from '@/views/pages/components/recruitManager/recruitPlanInfo.vue'
import planPackageInfo from '@/views/pages/components/recruitManager/planPackageInfo.vue'
import recruitPlanDecision from '@/views/pages/components/recruitManager/recruitPlanDecision.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import { FlowOperationController } from '@/api/flow'
import recruitInfoAttachment from '@/views/pages/components/recruitManager/recruitInfoAttachment.vue'
import RecruitPlanInfoAttachment from '../../components/recruitManager/recruitPlanInfoAttachment.vue'

const router = useRouter()
const route = useRoute()
const loginStore = useLoginStore()
const userInfo = computed(() => loginStore.userInfo || {})

const params = ref(route.query || {})
const taskId = ref(params.value.taskId)
const processInstanceId = ref(params.value.processInstanceId)
const islast = ref(params.value.taskName === '方案三级经理审批')

const formData = reactive({
  planCode: params.value.businessKey || params.value.planCode,
  plan: {
    name: '',
    isDividePackage: 0,
    recruitmentType: 0,
    validityPeriod: 2,
    agencyId: '',
    agentId: '',
    planAttachmentId: '',
    description: '',
    decisionLevel: 1,
    decisionTime: '',
    decisionMeetingMinutesId: '',
    planCode: params.value.businessKey || params.value.planCode,
    status: 0,
  },
  directedPartners: [],
  sceneRels: [],
  fieldQualificationRels: [],
  bidPackages: null,
  recruitmentPlanFiles: [],
  recruitmentPlanDecisionFiles: [],
})

const recruitPlanInfoRef = ref(null)
const recruitInfoRef = ref(null)
const recruitPlanDecisionRef = ref(null)
const planPlanPackageInfo = ref(null)
const errorText = ref('')

const showPackageInfo = ref(false)
const isrecruitToPlan = ref(false)
const currentType = ref('add')

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)
const transferVisible = ref(false)
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

const changeDividePackage = (isPackage: string) => {
  showPackageInfo.value = isPackage === '1'
}

const onSubmit = (type?: string) => {
  errorText.value = ''
  Promise.all([
    recruitPlanInfoRef.value?.handleSubmit().catch((val: string) => { errorText.value = val }),
    recruitPlanDecisionRef.value?.handleSubmit().catch((val: string) => { errorText.value = val }),
    showPackageInfo.value ? planPlanPackageInfo.value?.handleSubmit().catch((val: string) => { errorText.value = val }) : Promise.resolve({}),
  ])
    .then(results => {
      if (errorText.value) {
        showToast(errorText.value)
        return
      }

      let requestParams: any = {
        ...formData,
        plan: {
          ...results[0],
        },
        recruitmentPlanFiles: results[0].recruitmentPlanFiles,
        fieldQualificationRels: results[0].fieldQualificationRels,
        directedPartners: results[0].directedPartners,
      }

      if (results[0].planCode) {
        requestParams.planCode = params.value.businessKey || params.value.planCode
      }

      if (results[0].sceneRels && results[0].sceneRels.length) {
        requestParams.sceneRels = results[0].sceneRels
      } else {
        requestParams.sceneRels = []
        ;(results[0].industryCode || []).forEach((item: string) => {
          ;(results[0].sceneCode || []).forEach((val: string) => {
            requestParams.sceneRels.push({
              industryCode: item,
              fieldCode: results[0].fieldCode,
              sceneCode: val,
            })
          })
        })
      }

      requestParams.recruitmentPlanDecisionFiles = results[1].recruitmentPlanDecisionFiles
      requestParams.plan.decisionLevel = results[1].decisionLevel
      requestParams.plan.decisionTime = results[1].decisionTime

      if (results[2] && results[2].length) {
        requestParams.bidPackages = results[2]
        results[2].forEach((val: any, index: number) => {
          if (val.sceneRels && val.sceneRels.length) {
            requestParams.bidPackages[index].sceneRels = val.sceneRels
            return
          }
          requestParams.bidPackages[index].sceneRels = []
          ;(val.industryCode || []).forEach((item: string) => {
            ;(val.sceneCode || []).forEach((valItem: string) => {
              requestParams.bidPackages[index].sceneRels.push({
                industryCode: item,
                fieldCode: val.fieldCode,
                sceneCode: valItem,
              })
            })
          })
        })
      }

      const fn = () => {
        let url = RecruitPlanManagerController.submitBatch
        if (type && type === 'saveDraftBatch') {
          url = RecruitPlanManagerController.saveDraftBatch
        }
        if (currentType.value === 'edit' && processInstanceId.value && taskId.value) {
          url = RecruitPlanManagerController.resubmit
          requestParams.processInstanceId = processInstanceId.value
          requestParams.taskId = taskId.value
        }
        url(requestParams)
          .then(() => {
            showToast('提交成功')
            appBack()
            // router.back()
          })
          .catch(() => {})
      }

      if (type && type === 'saveDraftBatch') {
        fn()
      } else {
        let roleId = ''
        if (userInfo.value.area == 1) {
          roleId = '2034604034224033792'
        }
    if (userInfo.value.area == 2) {
          roleId = '2034604084098502656'
        }
        if (userInfo.value.area == 3) {
          roleId = '2034604155405864960'
        }

        SysUserController.listUserByRoleAndDeptFlag({
          roleId,
          deptFlag: 'current',
        })
          .then(res => {
            const users = res.data || []
            if (users.length === 1) {
              requestParams.appointedAssignee = users[0].loginName
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
    })
    .catch(() => {
      showToast(errorText.value)
    })
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

  try {
    submitLoading.value = true
    const requestParams = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectReason.value,
      },
      taskVariableData: {},
    }

    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/RecruitmentPlanFlow`, requestParams)
    showToast('已驳回')
    rejectDialogVisible.value = false
    submitLoading.value = false
    appBack()
    // router.back()
  } catch (e) {
    submitLoading.value = false
    // showToast('操作失败')
    console.error(e)
  }
}

const loadNextApproverList = () => {
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
    .then(res => {
      nextApproverList.value = res.data || []
      nextApproverList.value = nextApproverList.value.filter(item => item.userId == userInfo.value.userId)
    })
    .catch(e => {
      showToast('加载审批人列表失败')
      console.error(e)
    })
}

const onAgree = () => {
  appointedAssignee.value = ''
  appointedAssigneeText.value = ''
  agreeReason.value = ''
  agreeDialogVisible.value = true
  if (nextApproverList.value.length === 0) {
    loadNextApproverList()
  }
}

const transfer = () => {
  appointedAssignee.value = ''
  appointedAssigneeText.value = ''
  agreeReason.value = ''
  transferVisible.value = true
  if (nextApproverList.value.length === 0) {
    loadNextApproverList()
  }
}

const confirmTransfer = async () => {
  if (!appointedAssignee.value.trim()) {
    showToast('请指定下一步审批人')
    return
  }
  if (!agreeReason.value.trim()) {
    showToast('请输入意见')
    return
  }

  try {
    const requestParams = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'transfer',
        taskComment: agreeReason.value,
        delegateAssignee: appointedAssignee.value,
      },
      taskVariableData: {
        appointedAssignee: appointedAssignee.value,
      },
    }
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/RecruitmentPlanFlow`, requestParams)
    showToast('操作成功')
    agreeDialogVisible.value = false
    appBack()
    // router.back()
  } catch (e) {
    // showToast('操作失败')
    console.error(e)
  }
}

const confirmAgree = async () => {
  if (!appointedAssignee.value.trim() && !islast.value) {
    showToast('请指定下一步审批人')
    return
  }
  if (!agreeReason.value.trim()) {
    showToast('请输入意见')
    return
  }

  try {
    submitLoading.value = true
    const requestParams = {
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/RecruitmentPlanFlow`, requestParams)
    showToast('审批通过')
    agreeDialogVisible.value = false
    submitLoading.value = false
    appBack()
    // router.back()
  } catch (e) {
    submitLoading.value = false
    // showToast('操作失败')
    console.error(e)
  }
}

const onCancel = () => {
  appBack()
  // router.back()
}

const recruitmentDemandFiles = ref([])
const fajbxxFileData = ref([])
const fajcxx = reactive({
  fileList: [],
  decisionLevel: '',
  decisionTime: '',
})
const initiatorInfo = ref([])
const init = () => {
  RecruitPlanManagerController.queryPlanNegativeBehaviorBatch({
    planCode: params.value.businessKey || params.value.planCode,
  })
    .then(res => {
      isrecruitToPlan.value = false
      fajbxxFileData.value = res.data.recruitmentPlanFiles || []
      if (params.showName) {
        initiatorInfo.value.createUserName = params.showName
        initiatorInfo.value.createUserPhone = params.processInstanceInitiatorMobile
        initiatorInfo.value.createUserOrg = params.processInstanceInitiatorDeptName
        initiatorInfo.value.createUserCityName = params.processInstanceInitiatorCityName
        initiatorInfo.value.createTime = params.processInstanceStartTime
      } else {
        initiatorInfo.value = res.data?.initiatorInfo || {}
      }
      if (res.data.recruitmentDemandDetail) {
        recruitmentDemandFiles.value = res.data.recruitmentDemandDetail.recruitmentFiles || []
        isrecruitToPlan.value = true
        res.data.recruitmentDemandDetail.planCode = params.value.businessKey || params.value.planCode
        setTimeout(() => {
          recruitInfoRef.value?.showData(res.data.recruitmentDemandDetail, 'info', 'recruitToPlan')
        }, 500)
      }

      if (!isrecruitToPlan.value && res.data && res.data.recruitmentPlan.id) {
        delete res.data.recruitmentPlan.id
      }

      if (!isrecruitToPlan.value && res.data.recruitmentPlan.isDividePackage == '1') {
        showPackageInfo.value = true
        setTimeout(() => {
          planPlanPackageInfo.value?.showData(res.data.bidPackages, currentType.value === 'noProcessEdit' ? 'edit' : currentType.value)
        }, 500)
      }

      if (isrecruitToPlan.value && res.data.recruitmentDemandDetail.isDividePackage == '1') {
        showPackageInfo.value = true
        setTimeout(() => {
          const list = res.data.bidPackages || res.data.recruitmentDemandDetail.bidPackages
          planPlanPackageInfo.value?.showData(list, 'info', 'recruitToPlan')
        }, 500)
      }

      if (recruitPlanInfoRef.value && typeof recruitPlanInfoRef.value.showData === 'function') {
        try {
          recruitPlanInfoRef.value.showData(res.data, currentType.value === 'noProcessEdit' ? 'edit' : currentType.value)
        } catch (error) {
          console.error(error)
        }
      }

      fajcxx.decisionLevel = res.data.recruitmentPlan?.decisionLevel || ''
      fajcxx.decisionTime = res.data.recruitmentPlan?.decisionTime || ''
      fajcxx.fileList = res.data.recruitmentPlanDecisionFiles || []
      
    })
    .catch(() => {})
}

const applyRouteParams = (q: any) => {
  params.value = q || {}
  taskId.value = params.value.taskId
  processInstanceId.value = params.value.processInstanceId
  islast.value = params.value.taskName === '方案三级经理审批'

  currentType.value = 'add'
  showPackageInfo.value = false

  if (params.value.isInfo === 'true') {
    currentType.value = 'info'
  }
  if (
    params.value.taskName === '方案三级经理审批' ||
    params.value.taskName === '部门领导审批' ||
    params.value.taskName === '省本部DICT管理员审批'
  ) {
    currentType.value = 'auth'
  }
  if (params.value.taskName === '招募方案流程发起') {
    currentType.value = 'edit'
  }
  if (params.value.taskName === '修改') {
    currentType.value = 'noProcessEdit'
  }

  if (params.value.businesskey || params.value.businessKey || params.value.planCode) {
    init()
  }
}

watch(
  () => route.query,
  q => {
    applyRouteParams(q)
  },
  { immediate: true },
)

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
                <recruitInfo v-if="isrecruitToPlan" ref="recruitInfoRef" :is-show="false" />
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
                <recruitInfoAttachment v-if="isrecruitToPlan" :file-list="recruitmentDemandFiles" />
                <RecruitPlanInfoAttachment :file-list="fajbxxFileData" />
                <recruitPlanDecision :decision-level="fajcxx.decisionLevel" :decision-time="fajcxx.decisionTime" :file-list="fajcxx.fileList" />
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
        <van-button type="default" size="large" @click="() => onSubmit('saveDraftBatch')">保存</van-button>
        <van-button type="default" size="large" v-if="isrecruitToPlan" @click="transfer">转办</van-button>
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
      :submit-loading="submitLoading"
      @confirm-reject="confirmReject"
      @confirm-agree="confirmAgree"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
