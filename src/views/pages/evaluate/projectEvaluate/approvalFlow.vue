<script lang="ts" setup>
import type { ANY_OBJECT } from '@/types/generic'
import { showToast } from 'vant'
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ProjectEvaluationController } from '@/api/evaluation'
import { FlowOperationController } from '@/api/flow'
import { appBack } from '@/common/utils'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import EvaluateInfo from '@/views/pages/evaluate/projectEvaluate/components/evaluateInfo.vue'
import 'vant/es/toast/style'

const route = useRoute()
const params = (route.query || {}) as ANY_OBJECT

// 计分方式字典
const SCORING_METHOD_DICT: Record<number, string> = {
  1: '加分',
  2: '扣分',
}
const getScoringMethodName = (method: number) => {
  const key = Number(method)
  return SCORING_METHOD_DICT[key] || '-'
}

// 评估信息
const evaluateInfo = ref<ANY_OBJECT>({})
// 任务配置
const taskConfig = ref<ANY_OBJECT>({})
// 考核 / 审批人员信息
const staffInfo = ref<ANY_OBJECT>({})
// 评估规则（按阶段分组）
const stageSections = ref<ANY_OBJECT[]>([])

// 阶段规则展示数据：按主项分组并标记合并信息 + 总分
const stageViewData = computed(() => {
  return stageSections.value.map((stage: ANY_OBJECT) => {
    const ruleList: ANY_OBJECT[] = Array.isArray(stage.ruleList) ? stage.ruleList : []
    // 主项分组：[{ name, count, startIndex }]
    const groups: { name: string; count: number; startIndex: number }[] = []
    ruleList.forEach((row, i) => {
      const n = row.name || '-'
      const last = groups[groups.length - 1]
      if (last && last.name === n) {
        last.count++
      } else {
        groups.push({ name: n, count: 1, startIndex: i })
      }
    })
    // 给每行附加主项合并信息
    const rows = ruleList.map((row, i) => {
      const g = groups.find(it => it.startIndex === i)
      return {
        ...row,
        mainRowspan: g ? g.count : 1,
        isMainStart: !!g,
      }
    })
    // 总分：按计分方式区分，扣分项用减法（与 PC 端 scoreFlow footerMethodFor 一致）
    let totalAdd = 0
    let totalDeduct = 0
    ruleList.forEach((r) => {
      const raw = r.score
      if (raw === null || raw === undefined || raw === '') return
      const v = Number(raw)
      if (isNaN(v)) return
      if (Number(r.scoringMethod) === 2) {
        totalDeduct += v
      } else {
        totalAdd += v
      }
    })
    const total = Number((totalAdd - totalDeduct).toFixed(2))
    return {
      ...stage,
      ruleList: rows,
      totalScore: total,
      colCount: 7,
    }
  })
})

// 展开规则为扁平行
const convertRuleSetToFlat = (items: ANY_OBJECT[]) => {
  const flatList: ANY_OBJECT[] = []
  if (!Array.isArray(items)) return flatList
  items.forEach((mainItem: ANY_OBJECT) => {
    const itemName = mainItem.itemName || mainItem.name || ''
    const itemId = mainItem.itemId ?? mainItem.id ?? ''
    const subs = mainItem.subitems || mainItem.subItemList || []
    if (Array.isArray(subs) && subs.length > 0) {
      subs.forEach((sub: ANY_OBJECT) => {
        flatList.push({
          itemId,
          itemName,
          name: itemName,
          subItemId: sub.subitemId ?? sub.subItemId ?? sub.id ?? '',
          subItemName: sub.subitemName || sub.subItemName || sub.name || '',
          maxScore: sub.maxScore ?? 0,
          scoringRule: sub.scoringRule || '',
          scoringMethod: sub.scoringMethod ?? 1,
          score: sub.score ?? null,
          scoreRemark: sub.scoreRemark ?? '',
        })
      })
    } else {
      flatList.push({
        itemId,
        itemName,
        name: itemName,
        subItemId: '',
        subItemName: '-',
        maxScore: mainItem.maxScore ?? 0,
        scoringRule: mainItem.scoringRule || '',
        scoringMethod: mainItem.scoringMethod ?? 1,
        score: null,
        scoreRemark: '',
      })
    }
  })
  return flatList
}

// 查询详情：与 PC 端一致，调 assessmentDetail
async function queryDetail() {
  const taskId = params.taskId || ''
  if (!taskId) return
  try {
    const res: ANY_OBJECT = await ProjectEvaluationController.assessmentDetail({ taskId })
    const data: ANY_OBJECT = res?.data || {}

    // 评估信息：字段映射（与 PC 端 fieldMap 一致）
    const fieldMap: Record<string, string> = {
      taskNo: 'taskNo',
      taskName: 'taskName',
      projectCode: 'projectCode',
      projectName: 'projectName',
      partnerName: 'partnerName',
      customerManager: 'custManagerName',
      solutionManager: 'solutionManName',
      opsManager: 'maintenanceManagerName',
      deliveryManager: 'deliveryManagerName',
      projectProgress: 'projectProgress',
      initiator: 'initiatorName',
      initiatorDept: 'initiatorDeptName',
      projectStage: 'projectStage',
    }
    const info: ANY_OBJECT = {}
    Object.entries(fieldMap).forEach(([k, src]) => {
      info[k] = data[src] ?? ''
    })
    evaluateInfo.value = info

    // 任务配置
    const firstStage =
      Array.isArray(data.stages) && data.stages.length > 0 ? data.stages[0] : {}
    taskConfig.value = {
      taskType: data.stages?.[0]?.stageName ? `项目${data.stages[0].stageName}评估` : '',
      taskHandlingTime: firstStage.taskHandlingTime || data.taskHandlingTime || '',
      timeoutHandlingMethod: '满分',
    }

    // 考核 / 审批人员信息
    staffInfo.value = {
      evaluatorName: data.evaluatorName || '',
      evaluatorDeptName: data.evaluatorDeptName || '',
      evaluateTime: data.evaluatorSubmitTime || '',
      approverName: data.managerName || '',
      approverDeptName: data.managerDeptName || '',
      approvalTime: data.managerSubmitTime || '',
    }

    // 评估规则
    if (Array.isArray(data.stages)) {
      stageSections.value = data.stages.map((stage: ANY_OBJECT) => ({
        taskStageId: stage.taskStageId,
        stageCode: stage.stageCode,
        stageName: stage.stageName,
        ruleList: convertRuleSetToFlat(stage.items || []),
      }))
    } else {
      stageSections.value = []
    }
  } catch (e) {
    console.error(e)
  }
}

const submitLoading = ref(false)
const rejectReason = ref('')
const rejectDialogVisible = ref(false)
function onReject() {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

async function confirmReject() {
  const comment = rejectReason.value.trim()
  if (!comment) {
    showToast('请输入意见')
    return
  }
  try {
    const paramsData = {
      dto: {
        taskNo: (evaluateInfo.value as ANY_OBJECT).taskNo || '',
        workflowTaskId: params.taskId || '',
        taskComment: comment,
        operationType: 'reject',
      },
    }
    submitLoading.value = true
    await ProjectEvaluationController.approvalSubmit(paramsData)
    showToast('已驳回')
    submitLoading.value = false
    rejectDialogVisible.value = false
    appBack()
  } catch (e: any) {
    submitLoading.value = false
    showToast(e?.message || '操作失败')
  }
}

const showApproverPicker = ref(false)
const approverColumns = ref([])
const appointedAssignee = ref('')
const appointedAssigneeText = ref('')
const agreeReason = ref('')
const agreeDialogVisible = ref(false)
function onAgree() {
  appointedAssignee.value = ''
  appointedAssigneeText.value = ''
  agreeReason.value = ''
  agreeDialogVisible.value = true
}

async function confirmAgree() {
  const comment = agreeReason.value.trim()
  try {
    const paramsData = {
      dto: {
        taskNo: (evaluateInfo.value as ANY_OBJECT).taskNo || '',
        workflowTaskId: params.taskId || '',
        taskComment: comment,
        operationType: 'agree',
      },
    }
    submitLoading.value = true
    await ProjectEvaluationController.approvalSubmit(paramsData)
    showToast('审批通过')
    submitLoading.value = false
    agreeDialogVisible.value = false
    appBack()
  } catch (e: any) {
    submitLoading.value = false
    showToast(e?.message || '操作失败')
  }
}

// 取消
function onCancel() {
  appBack()
}

const activeName = ref('1')
const flowTaskCommentList = ref<any[]>([])
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

const isShowApprovalBtn = computed(() => {
  return params.taskName === '三级经理审批'
})

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
            {{ params.flowEntryName
              }}{{ params.taskName ? `-${params.taskName}` : '' }}
          </div>
          <van-tabs v-model:active="activeName" type="card">
            <van-tab title="业务信息" name="1">
              <div class="tab-content">
                <!-- 评估信息 -->
                <EvaluateInfo :data="evaluateInfo" />

                <!-- 任务配置 + 考核 / 审批人员信息 -->
                <div class="section">
                  <div class="section-subtitle">任务配置</div>
                  <van-cell title="评估任务类型" :value="taskConfig.taskType" />
                  <van-cell title="任务处理时间" :value="taskConfig.taskHandlingTime" />
                  <van-cell title="超时处理方式" :value="taskConfig.timeoutHandlingMethod" />
                </div>

                <div class="section">
                  <div class="section-subtitle">考核人员信息</div>
                  <van-cell title="考核人员姓名" :value="staffInfo.evaluatorName" />
                  <van-cell title="考核人员组织架构" :value="staffInfo.evaluatorDeptName" />
                  <van-cell title="考核提交时间" :value="staffInfo.evaluateTime" />
                </div>

                <div class="section">
                  <div class="section-subtitle">审批人员信息</div>
                  <van-cell title="审批人员姓名" :value="staffInfo.approverName" />
                  <van-cell title="审批人员组织架构" :value="staffInfo.approverDeptName" />
                  <van-cell title="审批提交时间" :value="staffInfo.approvalTime" />
                </div>

                <!-- 评估规则（按阶段分组） -->
                <div v-for="stage in stageViewData" :key="stage.taskStageId || stage.stageCode" class="section">
                  <div class="section-subtitle">
                    评估规则 - {{ stage.stageName || stage.stageCode }}
                  </div>
                  <van-empty v-if="!stage.ruleList || stage.ruleList.length === 0" description="暂无评估规则" />
                  <div v-else class="table-wrapper">
                    <table class="rule-table">
                      <thead>
                        <tr>
                          <th>考核主项</th>
                          <th>考核子项</th>
                          <th>子项分值</th>
                          <th>得分规则</th>
                          <th>计分方式</th>
                          <th>得分</th>
                          <th>备注</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, idx) in stage.ruleList" :key="idx">
                          <td v-if="row.isMainStart" :rowspan="row.mainRowspan">{{ row.name || '-' }}</td>
                          <td>{{ row.subItemName || '-' }}</td>
                          <td>{{ row.maxScore ?? '-' }}</td>
                          <td>{{ row.scoringRule || '-' }}</td>
                          <td>{{ getScoringMethodName(row.scoringMethod) }}</td>
                          <td>{{ row.score ?? '-' }}</td>
                          <td>{{ row.scoreRemark || '-' }}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>合计</td>
                          <td :colspan="4"></td>
                          <td>总分：{{ Number.isInteger(stage.totalScore) ? stage.totalScore : stage.totalScore.toFixed(2) }} 分</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
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
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: #fff;
  border-radius: 8px;
}
.rule-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 13px;
  color: #323233;
  th,
  td {
    padding: 10px 8px;
    border-bottom: 1px solid #ebedf0;
    border-right: 1px solid #ebedf0;
    text-align: center;
    vertical-align: middle;
    word-break: break-all;
    &:last-child {
      border-right: none;
    }
  }
  thead th {
    background-color: #f2f3f5;
    font-weight: 500;
    color: #323233;
    white-space: nowrap;
  }
  tbody tr:nth-child(even) td {
    background-color: #fafbfc;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tfoot td {
    background-color: #f7f8fa;
    font-weight: 500;
    color: #323233;
  }
}
</style>
