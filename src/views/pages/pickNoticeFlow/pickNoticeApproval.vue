<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { PickDemandController, PickNoticeController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { post } from '@/common/http/request'
import { getApproverList } from '@/common/utils'
import { useLoginStore } from '@/store'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import PickSchemeFileDetail from './pickNoticeDetail.vue'

const submitLoading = ref(false)
const router = useRouter()
const route = useRoute()
const loginStore = useLoginStore()
const userInfo = computed(() => loginStore.userInfo || {})

const processInstanceId = computed(() => route.query.processInstanceId as string)
const taskId = computed(() => route.query.taskId as string)
const taskName = computed(() => route.query.taskName as string)
const flowEntryName = computed(() => route.meta.commonTitle as string)

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
const pickSchemeDeptId = ref('')

const approverColumns = computed(() =>
  nextApproverList.value.map(user => ({
    text: user.showName,
    value: user.loginName,
  })),
)

// 表单数据
const formData = reactive<ANY_OBJECT>({
  demandNumber: '',
  demandName: '',
  oppoName: '',
  oppoCode: '',
  oppoOrg: '',
  oppoIndustry: '',
  oppoSignedAmount: undefined,
  customerName: '',
  completeTime: '',
  budgetAmount: undefined,
  budgetAmountTax: undefined,
  pickBidFlag: '',
  bidPackageFlag: '',
  demandIndustry: '',
  demandScene: '',
  demandArea: '',
  servicePackageFlag: '',
  servicePackageAmount: undefined,
  projectLevel: '',
  expertArea: '',
  consistentFlag: '',
  openTime: '',
  pickType: '',
  pickTypeReason: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
  createUserCityName: '',
});

const bidPackageList = ref<ANY_OBJECT[]>([]);
const noBidPackagePartners = ref<ANY_OBJECT[]>([]);

const schemeFormData = reactive<ANY_OBJECT>({
  id: undefined,
  schemeName: '',
  schemeNumber: '',
  replyEndTime: '',
  schemeMethod: '',
  schemeOrganization: '',
  agencyName: '',
  projectManager: '',
  schemeDesc: '',
  projectManagerCode: '',
});

const noticeFormData = reactive<ANY_OBJECT>({
  schemeId: undefined,
  noticeNumber: '',
  noticeTitle: '',
  loseTime: '',
  applyDeadlineTime: '',
  replyDeadlineTime: '',
  noticeStatus: 0,
  notice: '',
  bidAuditTime: '',
  bidAuditPlace: '',
  bidAuditLinkman: '',
  bidAuditPhone: '',
  clarifyFiles: [],
  clarifyContent: ''
});

const uploadFormData = reactive({
  remark: '',
  pickFiles: undefined as string | undefined,
});

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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${route.query.processDefinitionKey}`, {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectReason.value,
      },
      taskVariableData: { appointedAssignee: '' },
    })
    showToast('已驳回')
    submitLoading.value = false
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
  nextApproverList.value = [{
    userId: '1',
    showName: schemeFormData.projectManager,
    loginName: schemeFormData.projectManagerCode,
  }]
}

async function confirmAgree() {
  if (!appointedAssignee.value.trim()) {
    showToast('请指定下一步审批人')
    return
  }
  try {
    submitLoading.value = true
    // ====================== 优化点：先更新公告状态为4 ======================
    const submitData = {
      ...formData,
      ...schemeFormData,
      ...noticeFormData,
      remark: uploadFormData.remark,
      noticeStatus: 1, // 关键：设置状态为1 审核通过
    };
    // 调用保存接口
    await PickNoticeController.insertOrUpdate(submitData);
    // ====================================================================

    // 公告更新成功后，再提交流程审批
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
    };
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${route.query.processDefinitionKey}`, params);

    showToast('审批通过');
    submitLoading.value = false
    agreeDialogVisible.value = false;
    appBack()
    // router.back();
  } catch (e) {
    submitLoading.value = false
    // showToast('操作失败');
    console.error(e);
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
  let demandNumber = route.query.businessKey as string
  if (!demandNumber) {
    showToast('缺少需求编号参数')
    return
  }

  const isSplitDemandNumber = demandNumber.includes('-');
  if (isSplitDemandNumber) {
    const parts = demandNumber.split('-');
    if (parts.length >= 2) {
      demandNumber = parts[1];
    }
  }
  let obj = {
      demandNumber: demandNumber,
      reviewTime:route.query.processDefinitionKey === 'PickAllFlow' ? 1 : 2
    }
  const queryPromise = isSplitDemandNumber
      ? PickDemandController.queryFirstReviewTimeDemand({ demandNumber })
      : PickDemandController.queryDemand(obj);

  queryPromise
      .then(async res => {
        if (res.data) {
          detailData.value = res.data
          if (res.data.pickDemand) {
            Object.assign(formData, res.data.pickDemand);
          }
          if (res.data.pickScheme) {
            Object.assign(schemeFormData, res.data.pickScheme);
            pickSchemeDeptId.value = res.data.pickScheme.createUserDeptId || '';
            noticeFormData.schemeId = res.data.pickScheme.id;
            uploadFormData.remark = res.data.pickScheme.remark || '';
          }
          if (res.data.pickNotice) {
            Object.assign(noticeFormData, res.data.pickNotice);
          }
          // if (res.data.pickFiles && Array.isArray(res.data.pickFiles)) {
          //   pickFileList.value = res.data.pickFiles.map((file: any) => ({
          //     name: file.originalName || file.fileName,
          //     url: file.downloadUri,
          //     status: 'success',
          //     filename: file.fileName,
          //     originalName: file.originalName || file.fileName,
          //   }));
          // }
          if (res.data.pickBidPackages && res.data.pickBidPackages.length > 0) {
            if (formData.bidPackageFlag === '0') {
              const firstPackage = res.data.pickBidPackages[0];
              formData.pickTypeReason = firstPackage.pickTypeReason;
              noBidPackagePartners.value = firstPackage.pickPartners || [];
            } else {
              bidPackageList.value = res.data.pickBidPackages;
            }
          }
        }
      })
      .catch(e => {
        showToast('加载详情失败');
        console.error(e);
      });
}

onMounted(() => {
  loadDetail()
  loadFlowTaskCommentList()
})
</script>

<template>
  <div class="mobile-detail-manager">
    <div class="content-wrapper">
      <PickSchemeFileDetail
        :flow-entry-name="flowEntryName"
        :taskName="taskName"
        :flow-task-comment-list="flowTaskCommentList"
        :detail-data="detailData"
        :disabled="['甄选方式理由', '合作伙伴列表']"
      />
    </div>

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
.mobile-pick-scheme-file-approval {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}
</style>

