<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { FlowOperationController } from '@/api/flow'
import { PickDemandController, PickResourceApplyController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config'
import { post } from '@/common/http/request'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import CommonApproval from '@/views/pages/components/common/common-approval.vue'
import PickSchemeDocCompleteDetail from './pickSchemeDocCompleteDetail.vue'
import 'vant/es/toast/style'

const submitLoading = ref(false)
const router = useRouter()
const route = useRoute()

const processInstanceId = computed(() => route.query.processInstanceId as string)
const taskId = computed(() => route.query.taskId as string)
const taskName = computed(() => route.query.taskName as string)
const flowEntryName = computed(() => route.meta.commonTitle as string)
const processDefinitionKey = computed(() => route.query.processDefinitionKey as string || 'SolutionApprove')
const isInfo = computed(() => route.query.isInfo === 'true')

const flowTaskCommentList = ref<ANY_OBJECT[]>([])

const rejectDialogVisible = ref(false)
const agreeDialogVisible = ref(false)

// 甄选需求表单数据
const formData = reactive<ANY_OBJECT>({
  demandId: undefined,
  demandNumber: '',
  demandName: '',
  createUserId: undefined,
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
  createUserCityName: '',
  bidPackageFlag: '',
  pickType: '',
  pickTypeReason: '',
  hasTemporaryFile: 0,
})

// 甄选方案表单数据
const schemeFormData = reactive<ANY_OBJECT>({
  schemeName: '',
  schemeNumber: '',
  createUserName: '',
  createUserOrg: '',
  createTime: '',
  createUserPhone: '',
  createUserDeptId: '',
  decisionLevel: '',
  decisionTime: '',
  hasTemporaryFile: 0,
  decisionMeetings: [],
})

// 甄选结果决策表单数据
const decisionFormData = reactive<ANY_OBJECT>({
  decisionTime: undefined,
  decisionDocs: '[]',
})

// 各类文件列表
const bidDocFileList = ref<ANY_OBJECT[]>([])
const pickDemandFileList = ref<ANY_OBJECT[]>([])
const decisionMeetingFileList = ref<ANY_OBJECT[]>([])
const decisionDocFileList = ref<ANY_OBJECT[]>([])

function onCancel() {
  appBack()
  // router.back()
}

function onReject() {
  rejectDialogVisible.value = true
}

function convertFileList(fileList: ANY_OBJECT[]) {
  return fileList.map((item: any) => ({
    fileName: item.filename || '',
    originalName: item.originalName || item.name,
    downloadUri: item.downloadUri || '',
    uploadFailed: '0',
    uploadPath: item.uploadPath || '',
  }))
}

async function confirmReject(text: string) {
  submitLoading.value = true
  try {
    const params = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: text,
      },
      taskVariableData: {
        bidDocs: convertFileList(bidDocFileList.value),
        schemeDocs: convertFileList(pickDemandFileList.value),
        decisionMeetings: convertFileList(decisionMeetingFileList.value),
        resultDecisionFiles: convertFileList(decisionDocFileList.value),
      },
    }
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${processDefinitionKey.value}`, params)
    showToast('已驳回')
    rejectDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    // showToast('操作失败')
    console.error(e)
  }
  finally {
    submitLoading.value = false
  }
}

function onAgree() {
  agreeDialogVisible.value = true
}

async function confirmAgree(text: string) {
  submitLoading.value = true
  try {
    const params = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'agree',
        taskComment: text,
      },
      taskVariableData: {
        appointedAssignee: '',
        bidDocs: convertFileList(bidDocFileList.value),
        schemeDocs: convertFileList(pickDemandFileList.value),
        decisionMeetings: convertFileList(decisionMeetingFileList.value),
        resultDecisionFiles: convertFileList(decisionDocFileList.value),
      },
    }
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${processDefinitionKey.value}`, params)
    showToast('审批通过')
    agreeDialogVisible.value = false
    appBack()
    // router.back()
  }
  catch (e) {
    // showToast('操作失败')
    console.error(e)
  }
  finally {
    submitLoading.value = false
  }
}

function convertToUploadFile(files: any[]): ANY_OBJECT[] {
  if (!files || !Array.isArray(files))
    return []
  return files.map((file, index) => ({
    name: file.originalName || file.filename || file.fileName || '未知文件',
    url: file.downloadUri,
    uid: Date.now() + index,
    status: 'success',
    downloadUri: file.downloadUri,
    filename: file.filename || file.fileName,
    originalName: file.originalName,
    uploadPath: file.uploadPath,
  }))
}

async function loadResourceApplyFiles(demandNumber: string) {
  try {
    const res = await PickResourceApplyController.queryResourceApplyStatus({
      businessId: demandNumber,
    })
    if (res.data) {
      if (res.data.bidDocs)
        bidDocFileList.value = convertToUploadFile(res.data.bidDocs)
      if (res.data.schemeDocs)
        pickDemandFileList.value = convertToUploadFile(res.data.schemeDocs)
      if (res.data.decisionMeetings)
        decisionMeetingFileList.value = convertToUploadFile(res.data.decisionMeetings)
      if (res.data.resultDecisionFiles)
        decisionDocFileList.value = convertToUploadFile(res.data.resultDecisionFiles)
    }
  }
  catch (error) {
    console.error('加载文件数据失败：', error)
  }
}

function loadDetail() {
  const businessKey = route.query.businessKey as string || route.query.demandNumber as string
  if (!businessKey) {
    showToast('缺少需求编号参数')
    return
  }

  let demandNumber = businessKey
  const isSplit = businessKey.includes('-')
  if (isSplit) {
    const parts = businessKey.split('-')
    if (parts.length >= 2) {
      demandNumber = parts[1]
    }
  }

  PickDemandController.queryDemand({ demandNumber })
    .then(async (res: ANY_OBJECT) => {
      if (res.data) {
        if (res.data.pickDemand) {
          Object.assign(formData, res.data.pickDemand)
        }
        if (res.data.pickScheme) {
          Object.assign(schemeFormData, res.data.pickScheme)
        }
        if (res.data.pickDecision) {
          decisionFormData.decisionTime = res.data.pickDecision.decisionTime
        }
      }
    })
    .catch((e: any) => {
      showToast('加载详情失败')
      console.error(e)
    })

  loadResourceApplyFiles(demandNumber)
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
      <PickSchemeDocCompleteDetail
        :flow-entry-name="flowEntryName"
        :task-name="taskName || '资料补传审批'"
        :flow-task-comment-list="flowTaskCommentList"
        :form-data="formData"
        :scheme-form-data="schemeFormData"
        :bid-doc-file-list="bidDocFileList"
        :pick-demand-file-list="pickDemandFileList"
        :decision-meeting-file-list="decisionMeetingFileList"
        :decision-doc-file-list="decisionDocFileList"
        :decision-form-data="decisionFormData"
      />
    </div>

    <BottomActionBar
      v-if="!isInfo"
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

    <CommonApproval
      v-model:visible="rejectDialogVisible"
      title="驳回"
      confirm-type="danger"
      :loading="submitLoading"
      placeholder="请输入驳回意见"
      @confirm="confirmReject"
    />

    <CommonApproval
      v-model:visible="agreeDialogVisible"
      title="同意"
      confirm-type="primary"
      :loading="submitLoading"
      placeholder="请输入审批意见"
      @confirm="confirmAgree"
    />
  </div>
</template>

<style scoped>
</style>
