<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { RecruitDemandManagerController } from '@/api/recruitManager/recruitDemandManager'
import { SysUserController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { FlowOperationController } from '@/api/flow'
import { post } from '@/common/http/request'
import { useLoginStore } from '@/store'
import RecruitDemanDetail from './recruit-deman-detail.vue'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'

const router = useRouter()
const route = useRoute()
const loginStore = useLoginStore()
const userInfo = computed(() => loginStore.userInfo || {})
const recruitDemanDetailRef = ref()

const submitLoading = ref(false)
const params = ref(route.query || {})
const taskId = ref(params.value.taskId)
const processInstanceId = ref(params.value.processInstanceId)
const islast = ref(params.value.taskName === '三级经理审批')

const flowTaskCommentList = ref<any[]>([])

const taskName = computed(() => route.query.taskName as string)
const flowEntryName = computed(() => route.meta.commonTitle as string)

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

const currentType = ref('add')
const showPackageInfo = ref(false)

const formData = reactive({
  name: '',
  isDividePackage: 0,
  recruitmentType: 0,
  endTime: '',
  description: '',
  content: '',
  recruitmentFiles: [],
  sceneRels: [],
  directedPartners: [],
  bidPackages: [],
})

const changeDividePackage = (isPackage: number) => {
  showPackageInfo.value = isPackage === 1
}

const loadNextApproverList = () => {
  // params.value.taskKey === 'Activity_0tc1kq6'
  const obj = {
    roleId: '',
    deptFlag: 'current'
  }
  if(userInfo.value.area == 1){
    obj.roleId = '2034603668178735104'  // 省
  }
  if(userInfo.value.area == 2){
    obj.roleId = '2034603715310129152'  // 市
  }
  if(userInfo.value.area == 3){
    obj.roleId = '2034603760671526912'  // 区
  }

  SysUserController.listUserByRoleAndDeptFlag(obj)
    .then(res => {
      nextApproverList.value = res.data || [];
      console.log(nextApproverList.value, 'nextApproverList---1')
    })
    .catch(e => {
      showToast('加载审批人列表失败');
      console.error(e);
    });
}

const onCancel = () => {
  appBack()
  // router.back()
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
    const params = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectReason.value,
      },
      taskVariableData: {},
    }

    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/recruitmentDemandFlow`, params)
    showToast('已驳回')
    rejectDialogVisible.value = false
    appBack()
    // router.back()
  } catch (e) {
    // showToast('操作失败')
    console.error(e)
  }
}

const onAgree = () => {
  appointedAssignee.value = ''
  appointedAssigneeText.value = ''
  agreeReason.value = ''
  agreeDialogVisible.value = true
  loadNextApproverList()
}

const confirmAgree = async () => {
  if (!appointedAssignee.value.trim()) {
    showToast('请指定下一步审批人')
    return
  }
  if (!agreeReason.value.trim()) {
    showToast('请输入意见')
    return
  }

  try {
    const params = {
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/recruitmentDemandFlow`, params)
    showToast('审批通过')
    agreeDialogVisible.value = false
    appBack()
    // router.back()
  } catch (e) {
    showToast('操作失败')
    console.error(e)
  }
}

const init = () => {
  RecruitDemandManagerController.queryNegativeBehaviorBatch({
    demandCode: params.value.businessKey || params.value.businesskey || params.value.demandCode,
  })
    .then(res => {
      viewData.value = res.data
      nextTick(() => {
        console.log(recruitDemanDetailRef.value, 'ecruitDemanDetailRef.value')
        recruitDemanDetailRef.value?.showData(res.data, currentType.value === 'noProcessEdit' ? 'edit': currentType.value)
      })
    })
    .catch(() => {})
}

const applyRouteParams = (q: any) => {
  params.value = q || {}
  taskId.value = params.value.taskId
  processInstanceId.value = params.value.processInstanceId
  islast.value = params.value.taskName === '三级经理审批'

  currentType.value = 'add'
  showPackageInfo.value = false

  if (params.value.isInfo === 'true') {
    currentType.value = 'info'
  }
  if (
    params.value.taskName === '三级经理审批' ||
    params.value.taskName === '部门领导审批' ||
    params.value.taskName === '省本部DICT管理员审批'
  ) {
    currentType.value = 'auth'
  }
  if (params.value.taskName === '招募需求流程发起') {
    currentType.value = 'edit'
  }
  if (params.value.taskName === '修改') {
    currentType.value = 'noProcessEdit'
  }

  if (params.value.businesskey || params.value.businessKey || params.value.demandCode) {
    init()
  } else {
    try {
      // recruitInfoRef.value?.showData?.(
      //   {
      //     name: '',
      //     isDividePackage: 0,
      //     recruitmentType: 0,
      //     endTime: '',
      //     description: '',
      //     content: '',
      //     recruitmentFiles: [],
      //     sceneRels: [],
      //     directedPartners: [],
      //     bidPackages: [],
      //   },
      //   'add',
      // )
    } catch (e) {}
  }
}

watch(
  () => route.query,
  q => {
    applyRouteParams(q)
  },
  { immediate: true },
)

const loadFlowTaskCommentList = () =>{
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
const viewData = ref({})

const isShowApprovalBtn = computed(() => {
  return currentType.value === 'auth'
})
const isShowCloseBtn = computed(() => {
  return currentType.value === 'info'
})

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
            {{ flowEntryName }}{{ taskName ? '-' + taskName : ''}}
          </div>
          <InfoHeader
            :create-user-name="viewData?.initiatorInfo?.createUserName"
            :create-user-phone="viewData?.initiatorInfo?.createUserPhone"
            :create-time="viewData?.initiatorInfo?.createTime"
            :create-user-org="viewData?.initiatorInfo?.createUserOrg"
            :create-user-city-name="viewData?.initiatorInfo?.createUserCityName"
          />

          <RecruitDemanDetail ref="recruitDemanDetailRef" :viewData="viewData" :flowTaskCommentList="flowTaskCommentList"/>
        </div>
      </div>
    </div>

     <BottomActionBar
      :cancel-text="isShowCloseBtn ? '关闭' : '取消'"
      :show-reject="isShowApprovalBtn"
      :show-agree="isShowApprovalBtn"
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
