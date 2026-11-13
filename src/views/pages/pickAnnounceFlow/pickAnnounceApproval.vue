<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { PickDemandController } from '@/api/generated'
import PickAnnounceController from '@/api/generated/pickAnnounceController'
import { API_CONTEXT } from '@/api/config'
import { post } from '@/common/http/request'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import PickAnnounceApprovalDetail from './pickAnnounceApprovalDetail.vue'
import 'vant/es/toast/style'

const submitLoading = ref(false)
const router = useRouter()
const route = useRoute()

const processInstanceId = computed(() => route.query.processInstanceId as string)
const taskId = computed(() => route.query.taskId as string)
const taskName = computed(() => route.query.taskName as string)
const flowEntryName = computed(() => route.meta.commonTitle as string)

const nextApproverList = ref<ANY_OBJECT[]>([])
const flowTaskCommentList = ref<ANY_OBJECT[]>([])

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)
const showApproverPicker = ref(false)

const rejectReason = ref('')
const agreeReason = ref('')
const appointedAssigneeText = ref('')
const appointedAssignee = ref('')

const pickSchemeDeptId = ref<string>('')
const reviewTime = ref<number>(0)
const bidPackagesFromDemand = ref<ANY_OBJECT[]>([])

const formData = reactive<ANY_OBJECT>({
  demandNumber: '',
  demandName: '',
  bidPackageFlag: '',
  demandIndustry: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
})

const schemeFormData = reactive<ANY_OBJECT>({
  schemeName: '',
  schemeNumber: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
})

const announceFormData = reactive<ANY_OBJECT>({
  noticeId: undefined,
  announceNumber: '',
  announceTitle: '',
  replyDeadlineTime: '',
  announcement: '',
  announceFiles: '[]',
  announceStatus: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
  id: '',
})

const announceFileList = ref<ANY_OBJECT[]>([])

const resultNoticeFormData = reactive<ANY_OBJECT>({
  mainNoticeFiles: '[]',
  mainResultNoticeFiles: '[]',
})

const mainNoticeFileList = ref<ANY_OBJECT[]>([])
const mainResultNoticeFileList = ref<ANY_OBJECT[]>([])

const bidPackageList = ref<ANY_OBJECT[]>([])

const approverColumns = computed(() =>
  nextApproverList.value.map(user => ({
    text: user.showName,
    value: user.loginName,
  })),
)

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
    const flowUrl = reviewTime.value === 2
      ? `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/RePickFlow`
      : `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PickAllFlow`

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
}

function getSafeFileArray(fileData: any): any[] {
  if (!fileData)
    return []
  if (Array.isArray(fileData))
    return fileData
  if (typeof fileData === 'string') {
    try {
      return JSON.parse(fileData) || []
    }
    catch {
      return []
    }
  }
  return []
}

async function confirmAgree() {
  try {
    const announceFiles = getSafeFileArray(announceFormData.announceFiles).map((file: any) => ({
      fileName: file.filename || file.fileName,
      originalName: file.originalName,
      downloadUri: file.downloadUri,
      uploadFailed: 0,
      uploadPath: file.uploadPath,
    }))

    const mainNoticeFiles = getSafeFileArray(resultNoticeFormData.mainNoticeFiles).map((file: any) => ({
      fileName: file.filename || file.fileName,
      originalName: file.originalName,
      downloadUri: file.downloadUri,
      uploadFailed: 0,
      uploadPath: file.uploadPath,
    }))

    const mainResultNoticeFiles = getSafeFileArray(resultNoticeFormData.mainResultNoticeFiles).map((file: any) => ({
      fileName: file.filename || file.fileName,
      originalName: file.originalName,
      downloadUri: file.downloadUri,
      uploadFailed: 0,
      uploadPath: file.uploadPath,
    }))

    const saveData = {
      noticeId: announceFormData.noticeId,
      announceNumber: announceFormData.announceNumber,
      announceTitle: announceFormData.announceTitle,
      replyDeadlineTime: announceFormData.replyDeadlineTime,
      announcement: announceFormData.announcement,
      announceFiles,
      demandNumber: formData.demandNumber,
      announceStatus: '2',
      mainSelectionNotice: mainNoticeFiles,
      mainResultNotice: mainResultNoticeFiles,
      id: announceFormData.id,
    }

    submitLoading.value = true
    await PickAnnounceController.passSave(saveData)
    const flowUrl = `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PickAllFlow`

    await post(flowUrl, {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'agree',
        taskComment: agreeReason.value,
      },
      demandNumber: formData.demandNumber,
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

async function loadBidResultData(demandNumber: string, noticeId: number) {
  try {
    const res = await PickDemandController.queryBidResult({
      demandNumber,
      noticeId,
      successFlag: 0,
    })

    if (res.data && res.data.pickBidPackages && Array.isArray(res.data.pickBidPackages)) {
      const resultPackages = res.data.pickBidPackages.map((resultPkg: ANY_OBJECT) => {
        const demandPkg = bidPackagesFromDemand.value.find(
          (pkg: ANY_OBJECT) =>
            pkg.id === resultPkg.bidPackageId
            || pkg.bidPackageNumber === resultPkg.bidPackageNumber,
        )
        return {
          ...resultPkg,
          pickPartners: demandPkg?.pickPartners || resultPkg.pickPartners || [],
        }
      })

      if (formData.bidPackageFlag === '0') {
        if (resultPackages.length > 0) {
          const firstPackage = resultPackages[0] as ANY_OBJECT
          formData.pickType = firstPackage.pickType
          formData.pickTypeReason = firstPackage.pickTypeReason
        }
      }
      else {
        bidPackageList.value = resultPackages
      }
    }
  }
  catch (e: any) {
    showToast('加载标包信息失败')
    console.error(e)
  }
}

function loadDetail() {
  let demandNumber = route.query.businessKey as string
  if (!demandNumber) {
    showToast('缺少需求编号参数')
    return
  }

  const isSplitDemandNumber = demandNumber.includes('-')
  if (isSplitDemandNumber) {
    const parts = demandNumber.split('-')
    if (parts.length >= 2) {
      demandNumber = parts[1]
    }
  }

  const queryPromise = isSplitDemandNumber
    ? PickDemandController.queryFirstReviewTimeDemand({ demandNumber })
    : PickDemandController.queryDemand({ demandNumber })

  queryPromise
    .then(async (res: ANY_OBJECT) => {
      if (res.data) {
        if (res.data.pickDemand) {
          const pickDemand = res.data.pickDemand

          if (pickDemand.mainSelectionNotice && Array.isArray(pickDemand.mainSelectionNotice)) {
            mainNoticeFileList.value = pickDemand.mainSelectionNotice.map((file: any, index: number) => ({
              name: file.originalName || file.fileName,
              url: file.downloadUri,
              uid: Date.now() + index,
              status: 'success',
              filename: file.fileName,
              originalName: file.originalName,
            }))
          }
          if (pickDemand.mainResultNotice && Array.isArray(pickDemand.mainResultNotice)) {
            mainResultNoticeFileList.value = pickDemand.mainResultNotice.map((file: any, index: number) => ({
              name: file.originalName || file.fileName,
              url: file.downloadUri,
              uid: Date.now() + index,
              status: 'success',
              filename: file.fileName,
              originalName: file.originalName,
            }))
          }

          Object.assign(formData, res.data.pickDemand)
        }

        if (res.data.pickScheme) {
          Object.assign(schemeFormData, res.data.pickScheme)
          pickSchemeDeptId.value = res.data.pickScheme.createUserDeptId || ''
        }

        if (res.data.pickAnnounce) {
          const announceData = res.data.pickAnnounce
          Object.assign(announceFormData, announceData)
          if (announceData.announceFiles && Array.isArray(announceData.announceFiles)) {
            announceFileList.value = announceData.announceFiles.map((file: any, index: number) => ({
              name: file.originalName || file.fileName,
              url: file.downloadUri,
              uid: Date.now() + index,
              status: 'success',
              downloadUri: file.downloadUri,
              filename: file.fileName,
              originalName: file.originalName,
            }))
          }
        }

        if (res.data.pickBidPackages && Array.isArray(res.data.pickBidPackages)) {
          bidPackagesFromDemand.value = res.data.pickBidPackages
        }

        if (res.data.pickOpportunity) {
          reviewTime.value = res.data.pickOpportunity.reviewTime || 0
        }

        if (isSplitDemandNumber && res.data.pickNotice?.id) {
          await loadBidResultData(demandNumber, res.data.pickNotice.id)
        }
        else {
          if (res.data.pickBidPackages && res.data.pickBidPackages.length > 0) {
            if (formData.bidPackageFlag === '0') {
              const firstPackage = res.data.pickBidPackages[0] as ANY_OBJECT
              formData.pickType = firstPackage.pickType
              formData.pickTypeReason = firstPackage.pickTypeReason
            }
            else {
              bidPackageList.value = res.data.pickBidPackages
            }
          }
        }
      }
    })
    .catch((e: any) => {
      showToast('加载详情失败')
      console.error(e)
    })
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
  loadDetail()
  loadFlowTaskCommentList()
})
</script>

<template>
  <div class="mobile-detail-manager">
    <div class="content-wrapper">
      <PickAnnounceApprovalDetail
        :flow-task-comment-list="flowTaskCommentList"
        :form-data="formData"
        :scheme-form-data="schemeFormData"
        :announce-form-data="announceFormData"
        :announce-file-list="announceFileList"
        :result-notice-form-data="resultNoticeFormData"
        :main-notice-file-list="mainNoticeFileList"
        :main-result-notice-file-list="mainResultNoticeFileList"
        :bid-package-list="bidPackageList"
        :task-name="taskName"
        :flow-entry-name="flowEntryName"
      />
    </div>

    <BottomActionBar
      v-if="route.query.isInfo !== 'true'"
      :submit-loading="submitLoading"
      @cancel="onCancel"
      @reject="onReject"
      @agree="onAgree"
    />

    <BottomActionBar
      v-else
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
      :islast="true"
      :submit-loading="submitLoading"
      :approver-columns="approverColumns"
      @confirm-reject="confirmReject"
      @confirm-agree="confirmAgree"
    />
  </div>
</template>

<style scoped>
</style>
