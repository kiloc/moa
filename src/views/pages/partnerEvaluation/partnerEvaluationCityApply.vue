<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack, formatDate } from '@/common/utils'
import { PartnerEvaluationController } from '@/api/partnerEvaluation'
import { FlowOperationController } from '@/api/flow'
import { useLayoutStore, useLoginStore, useDictMapStore } from '@/store';
import { post } from '@/common/http/request'
import { API_CONTEXT } from '@/api/config'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import EvaluationRuleTable from '@/views/pages/partnerEvaluation/components/EvaluationRuleTable.vue'
import PartnerJoinInfoDialog from '@/views/pages/partnerEvaluation/components/PartnerJoinInfoDialog.vue'

const router = useRouter()
const route = useRoute()
const params = router.currentRoute.value.query || {}
const dictMapStore = useDictMapStore();

const formData = ref<ANY_OBJECT>({
  taskCode: '',
  taskName: '',
  projectName: '合作伙伴后评估',
  initiatorTime: '',
  startTime: '',
  endTime: '',
  initiator: '',
  initiatorDept: '',
  ruleList: [] as ANY_OBJECT[],
  partnerList: [] as ANY_OBJECT[],
  evaluatorList: [] as ANY_OBJECT[],
})

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

const partnerDetailDialogVisible = ref(false)
const partnerDetailCode = ref('')

const isInfo = computed(() => params.isInfo === 'true')
const isShowApprovalBtn = computed(() => params.isInfo !== 'true')

const formattedStartTime = computed(() => formatDate(formData.value.startTime, 'YYYY-MM-DD'))
const formattedEndTime = computed(() => formatDate(formData.value.endTime, 'YYYY-MM-DD'))

function convertToFlatList(treeData: ANY_OBJECT[]): ANY_OBJECT[] {
  const flatList: ANY_OBJECT[] = []
  treeData.forEach((mainItem: ANY_OBJECT) => {
    const { subItemList, ...mainInfo } = mainItem
    if (subItemList && subItemList.length > 0) {
      subItemList.forEach((subItem: ANY_OBJECT) => {
        flatList.push({
          itemType: mainItem.itemType,
          parentId: mainItem.id,
          id: subItem.id,
          name: mainItem.name,
          subItemName: subItem.name || '',
          maxScore: Number(subItem.maxScore) || 0,
          scoringRule: subItem.scoringRule || '',
          weight: subItem.weight || 0,
          description: subItem.description || '',
          scoreRuleList: subItem.scoreRuleList || [],
          autoScoreParamType: subItem.autoScoreParamType || '',
          baseScore: subItem.baseScore || 0,
        })
      })
    }
  })
  return flatList
}

function initPage() {
  const businessKey = route.query.businessKey as string
  if (!businessKey) {
    showToast('缺少任务编号')
    return
  }

  PartnerEvaluationController.getEvaluationDetail({
    taskNo: businessKey,
  })
    .then((res) => {
      if (res.data) {
        const data = res.data
        formData.value.taskCode = data.taskNo || ''
        formData.value.taskName = data.taskName || ''
        formData.value.startTime = data.startTime || ''
        formData.value.endTime = data.endTime || ''
        formData.value.initiator = data.createUserName || ''
        formData.value.initiatorDept = data.createDeptName || ''
        formData.value.initiatorTime = route.query.processInstanceStartTime || data.createTime || ''

        if (data.ruleSetDetail?.itemList && Array.isArray(data.ruleSetDetail.itemList)) {
          formData.value.ruleList = convertToFlatList(data.ruleSetDetail.itemList)
        }

        if (data.partnerInfoList && Array.isArray(data.partnerInfoList)) {
          formData.value.partnerList = data.partnerInfoList.map((item: ANY_OBJECT) => ({ ...item }))
        }

        if (data.evaluatorList && Array.isArray(data.evaluatorList)) {
          formData.value.evaluatorList = data.evaluatorList.map((item: ANY_OBJECT) => ({ ...item }))
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
    .catch((error) => {
      console.error('加载评估详情失败：', error)
      showToast('加载评估详情失败')
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
const getName = (list: ANY_OBJECT[], value: string) => {
  if (!list || !value) return '';
  const data = list.filter(item => item.id == value);
  if (data && data.length) {
    return data[0].name;
  } else {
    return '';
  }
};

const formatDictBusiLevel = (value: string) => {
  if (!value) return '-';
  const dictList = dictMapStore.getDictMap.dictBusiLevel || [];
  const names = String(value)
    .split(',')
    .map(item => getName(dictList, item.trim()))
    .filter(Boolean);
  return names.length ? names.join(',') : value;
};

const onViewPartnerDetail = (row: ANY_OBJECT) => {
  if (!row?.partnerCode) {
    showToast('合作伙伴编码为空')
    return
  }
  partnerDetailCode.value = row.partnerCode
  partnerDetailDialogVisible.value = true
};
onMounted(() => {
  loadFlowTaskCommentList()
  initPage()
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
                </div>

                <div class="section">
                  <div class="section-subtitle">评估合作伙伴</div>
                  <van-empty v-if="formData.partnerList.length === 0" description="暂无合作伙伴数据" />
                  <template v-else>
                    <div v-for="(item, index) in formData.partnerList" :key="index" class="result-card">
                      <van-cell title="合作伙伴名称" :value="item.partnerName" />
                      <van-cell title="DICT集成库级别">
                        <template #value>
                          {{ formatDictBusiLevel(item.dictBusiLevel) }}
                        </template>
                      </van-cell>
                      <van-cell title="行业" :value="item.industryName" />
                      <div class="card-actions">
                        <van-button
                          size="small"
                          type="primary"
                          plain
                          @click="onViewPartnerDetail(item)"
                        >
                          查看详情
                        </van-button>
                      </div>
                    </div>
                  </template>
                </div>

                <EvaluationRuleTable
                  v-model="formData.ruleList"
                  :isHide="true"
                />

                <div class="section">
                  <div class="section-subtitle">考核人员列表</div>
                  <van-empty v-if="formData.evaluatorList.length === 0" description="暂无考核人员数据" />
                  <template v-else>
                    <div v-for="(item, index) in formData.evaluatorList" :key="index" class="result-card">
                      <van-cell title="姓名" :value="item.evaluatorUserName" />
                      <van-cell title="组织架构" :value="item.evaluatorDeptName" />
                    </div>
                  </template>
                </div>
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

    <PartnerJoinInfoDialog
      v-model="partnerDetailDialogVisible"
      :partner-code="partnerDetailCode"
    />
  </div>
</template>

<style scoped lang="scss">
.result-card {
  border: 1px solid #ebedf0;
  margin-bottom: 10px;
  overflow: hidden;
  border-radius: 10px;

  .card-actions {
    display: flex;
    justify-content: flex-end;
    padding: 8px 12px;
    border-top: 1px solid #f5f5f5;
    background: #fafafa;
  }
}
</style>