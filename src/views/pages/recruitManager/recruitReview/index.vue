<script setup lang="ts">
import { onMounted, reactive, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appBack } from '@/common/utils'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { RecruitController, NegativeController } from '@/api/negativeManagement'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import ApprovalPopup from '@/views/pages/components/common/approval-popup.vue'
import BottomActionBar from '@/views/pages/components/common/bottom-action-bar.vue'
import InitiatorInfo from '../components/initiatorInfo.vue'
import RecruitNeed from '../components/recruitNeed.vue'
import RecruitCaseInfo from '../components/recruitCaseInfo.vue'
import RecruitReviewCp from '../components/recruitReviewCp.vue'

const router = useRouter()
const route = useRoute()

const routeQuery = computed(() => route.query || {})
const params = ref(route.query || {})

const planCode = computed(
  () =>
    (routeQuery.value.businessKey ||
      routeQuery.value.businesskey ||
      routeQuery.value.businessKeyOrigin ||
      routeQuery.value.planCode ||
      '') + '',
)

const taskId = computed(() => routeQuery.value.taskId)
const processInstanceId = computed(() => routeQuery.value.processInstanceId)
const islast = computed(() => routeQuery.value.taskName === '省本部DICT管理员审批')

const currentType = ref('add')
const formData = reactive({
  partnerList: [],
  centralizedPurchaseType: '',
  decisionNumber: '',
  otherNegativeBehavior: '',
  isAmountPenalty: '',
  penaltyAmount: 0,
  banCooperationStartTime: '',
  banCooperationEndTime: '',
  isInternalRelease: '',
  isPartnerLoginPageRelease: '',
  isPartnerDoorPageRelease: '',
  isTop: '',
  effectiveStartTime: '',
  effectiveEndTime: '',
  announcementTitle: '',
  announcementContent: '',
  regionList: [],
  decisionMinutesFiles: [],
  appointedAssignee: '',
})

const reviewGroupRef = ref(null)
const initiatorInfoRef = ref(null)
const recruitNeedRef = ref(null)
const recruitCaseInfoRef = ref(null)

const recruitmentDemand = ref(false)
const recruitmentPlan = ref(false)
const queryDetailData = ref(null)

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

const onSubmit = (type?: string) => {
  const q = routeQuery.value
  Promise.all([reviewGroupRef.value.handleSubmit()])
    .then(results => {
      const reviewData = results[0]
      const isDividePackage = reviewGroupRef.value.isDividePackage ? 1 : 0

      const requestParams: any = {
        planCode: planCode.value || q.businessKey || q.businesskey,
        isDividePackage: isDividePackage,
        resultList: [],
        resultFiles: [],
        deleteFileIds: [],
      }

      if (type !== 'saveDraftBatch') {
        requestParams.processInstanceId = q.processInstanceId || ''
        requestParams.taskId = q.taskId || ''
        requestParams.businessKey = planCode.value || q.businessKey || q.businesskey || ''
        requestParams.appointedAssignee = q.appointedAssignee || ''
      }

      if (isDividePackage) {
        const packageReviewList = reviewData.packageReviewList || []
        const packageFiles = reviewData.packageFiles || {}

        packageReviewList.forEach(pkg => {
          const packageCode = pkg.packageCode

          pkg.reviewList.forEach(item => {
            requestParams.resultList.push({
              resultCode: item.resultCode || '',
              packageCode: packageCode,
              partnerCode: item.partnerCode || '',
              partnerName: item.partnerName || '',
              linkName: item.linkName || '',
              linkPhone: item.linkPhone || '',
              score: item.score || 0,
            })
          })

          if (pkg.recruitmentFile && pkg.recruitmentFile.length > 0) {
            pkg.recruitmentFile.forEach(file => {
              requestParams.resultFiles.push({
                packageCode: packageCode,
                fileName: file.fileName || '',
                originalName: file.originalName || '',
                downloadUri: file.downloadUri || '',
                uploadPath: file.uploadPath || '',
                remark: file.remark || '',
              })
            })
          }

          const pkgFiles = packageFiles[packageCode]
          if (pkgFiles && pkgFiles.length > 0) {
            pkgFiles.forEach(file => {
              requestParams.resultFiles.push({
                packageCode: packageCode,
                fileName: file.fileName || '',
                originalName: file.originalName || '',
                downloadUri: file.downloadUri || '',
                uploadPath: file.uploadPath || '',
                remark: file.remark || '',
              })
            })
          }
        })
      } else {
        const reviewList = reviewData.reviewList || []
        const inboundFiles = reviewData.inboundFiles || []
        const deletedFileIds = reviewData.deletedFileIds || []

        reviewList.forEach(item => {
          requestParams.resultList.push({
            resultCode: item.resultCode || '',
            packageCode: '',
            partnerCode: item.partnerCode || '',
            partnerName: item.partnerName || '',
            linkName: item.linkName || '',
            linkPhone: item.linkPhone || '',
            score: item.score || 0,
          })
        })

        if (inboundFiles.length > 0) {
          inboundFiles.forEach(file => {
            requestParams.resultFiles.push({
              packageCode: '',
              fileName: file.fileName || '',
              originalName: file.originalName || '',
              downloadUri: file.downloadUri || '',
              uploadPath: file.uploadPath || '',
              remark: file.remark || '',
            })
          })
        }

        if (deletedFileIds.length > 0) {
          requestParams.deleteFileIds = deletedFileIds
        }
      }

      let url = RecruitController.submitBatch
      if (type === 'saveDraftBatch') {
        url = RecruitController.saveDraftBatch
      }

      url(requestParams)
        .then(() => {
          showToast('提交成功')
          appBack()
          // router.back()
        })
        .catch(e => {
          console.error(e)
        })
    })
    .catch(error => {
      console.log(error)
    })
}

const normalizeQueryStr = (raw: any) => {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v == null) return ''
  return typeof v === 'string' ? v.trim() : String(v).trim()
}

const applyRouteType = () => {
  const q = routeQuery.value
  const taskName = normalizeQueryStr(q.taskName)
  const isApprover = q.isApprover === 'true' || q.isApprover === true
  const isRecruitResultFlow = q.processDefinitionKey === 'RecruitmentResultApprovalFlow'

  currentType.value = 'add'

  if (q.isInfo === 'true') {
    currentType.value = 'info'
    return
  }

  if (taskName === '招募结果维护') {
    currentType.value = 'edit'
    return
  }
}

const init = () => {
  const code = planCode.value
  if (!code) {
    console.warn('[recruitReview] 缺少 planCode/businessKey，无法加载详情')
    return
  }
  RecruitController.queryDetail({
    planCode: code,
  })
    .then(res => {
      queryDetailData.value = res.data
      formData.partnerCode = res.data.partnerCode
      recruitmentDemand.value = !!res.data.recruitmentDemand
      recruitmentPlan.value = !!res.data.recruitmentPlan

      nextTick(() => {
        if (reviewGroupRef.value && typeof reviewGroupRef.value.showData === 'function') {
          try {
            reviewGroupRef.value.showData(
              res.data,
              currentType.value === 'noProcessEdit' ? 'edit' : currentType.value,
            )
          } catch (error) {
            console.error('Error in reviewGroup showData:', error)
          }
        }

        if (initiatorInfoRef.value && typeof initiatorInfoRef.value.showData === 'function') {
          try {
            let initiatorData = res.data?.initiatorInfo || {}
            if (params.value.showName) {
              initiatorData = {
                showName: params.value.showName,
                taskId: params.value.taskId,
                processInstanceInitiatorMobile: params.value.processInstanceInitiatorMobile,
                processInstanceInitiatorDeptName: params.value.processInstanceInitiatorDeptName,
                processInstanceInitiatorCityName: params.value.processInstanceInitiatorCityName,
                processInstanceStartTime: params.value.processInstanceStartTime,
              }
            }
            initiatorInfoRef.value.showData(
              { taskId: params.value.taskId, ...initiatorData },
              currentType.value === 'noProcessEdit' ? 'edit' : currentType.value,
            )
          } catch (error) {
            console.error('Error in initiatorInfo showData:', error)
          }
        }
      })
    })
    .catch(e => {
      console.error('Error in queryDetail:', e)
    })
}

watch(
  [recruitmentDemand, recruitNeedRef],
  ([newDemand, newRef]) => {
    if (newDemand && newRef && typeof newRef.showData === 'function' && queryDetailData.value) {
      nextTick(() => {
        if (!recruitNeedRef.value || typeof recruitNeedRef.value.showData !== 'function') {
          console.warn('recruitNeedRef is not ready when nextTick executed')
          return
        }
        try {
          const data = queryDetailData.value?.recruitmentDemand
          const type = currentType.value === 'noProcessEdit' ? 'edit' : currentType.value
          recruitNeedRef.value.showData(data, type)
        } catch (error) {
          console.error('Error in RecruitNeed showData:', error)
        }
      })
    }
  },
  { immediate: false },
)

watch(
  [recruitmentPlan, recruitCaseInfoRef],
  ([newPlan, newRef]) => {
    if (newPlan && newRef && typeof newRef.showData === 'function' && queryDetailData.value) {
      nextTick(() => {
        if (!recruitCaseInfoRef.value || typeof recruitCaseInfoRef.value.showData !== 'function') {
          console.warn('recruitCaseInfoRef is not ready when nextTick executed')
          return
        }
        try {
          const data = queryDetailData.value?.recruitmentPlan
          const type = currentType.value === 'noProcessEdit' ? 'edit' : currentType.value
          recruitCaseInfoRef.value.showData(data, type)
        } catch (error) {
          console.error('Error in RecruitCaseInfo showData:', error)
        }
      })
    }
  },
  { immediate: false },
)

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
  showToast('已驳回')
  rejectDialogVisible.value = false
  appBack()
  // router.back()
}

const onAgree = () => {
  appointedAssignee.value = ''
  appointedAssigneeText.value = ''
  agreeReason.value = ''
  agreeDialogVisible.value = true
}

const confirmAgree = async () => {
  if (!agreeReason.value.trim()) {
    showToast('请输入意见')
    return
  }
  showToast('审批通过')
  agreeDialogVisible.value = false
  appBack()
  // router.back()
}

watch(
  () => planCode.value,
  (code, prev) => {
    if (code && code !== prev) {
      applyRouteType()
      init()
    }
  },
)

watch(
  () => [route.query.taskName, route.query.processDefinitionKey, route.query.isApprover, route.query.isInfo, route.query.isDraft],
  () => {
    applyRouteType()
  },
)

onMounted(() => {
  applyRouteType()
  if (planCode.value) {
    init()
  }
})
</script>

<template>
  <div class="mobile-recruit-review">
    <div class="content-wrapper">
      <div class="page-title">
        {{ params.taskName || '招募评审' }}
      </div>

      <InitiatorInfo ref="initiatorInfoRef" />

      <RecruitNeed v-if="recruitmentDemand" ref="recruitNeedRef" />

      <RecruitCaseInfo v-if="recruitmentPlan" ref="recruitCaseInfoRef" />

      <RecruitReviewCp ref="reviewGroupRef" :planCode="planCode" />
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
    />
  </div>
</template>

<style scoped lang="scss">
.mobile-recruit-review {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.content-wrapper {
  background-color: #ffffff;
  padding: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16px;
}
</style>
