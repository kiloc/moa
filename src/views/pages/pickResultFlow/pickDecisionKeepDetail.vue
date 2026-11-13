<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { ref } from 'vue'
import { downloadAppFile } from '@/common/utils'
import { API_CONTEXT } from '@/api/config'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import PartnerList from './indexDemand.vue'

interface Props {
  flowEntryName: string
  taskName: string
  flowTaskCommentList?: any[]
  formData?: ANY_OBJECT
  schemeFormData?: ANY_OBJECT
  decisionFormData?: ANY_OBJECT
  successList?: ANY_OBJECT[]
  decisionFiles?: ANY_OBJECT[]

}

const props = withDefaults(defineProps<Props>(), {
  flowEntryName: '',
  taskName: '甄选管理员决策信息审批',
  flowTaskCommentList: () => [],
  formData: () => ({}),
  schemeFormData: () => ({}),
  decisionFormData: () => ({}),
  successList: () => [] as ANY_OBJECT[],
  decisionFiles: () => [] as ANY_OBJECT[],
})

const activeName = ref('1')
const isDownload = ref(false)

</script>

<template>
  <div class="mobile-detail">
    <div class="mobile-detail-content-wrapper">
      <div class="page-title">
        {{ flowEntryName }}{{ taskName ? `-${taskName}` : '' }}
      </div>

      <InfoHeader
        :create-user-name="props.formData.createUserName"
        :create-user-phone="props.formData.createUserPhone"
        :create-time="props.formData.createTime"
        :create-user-org="props.formData.createUserOrg"
        :create-user-city-name="props.formData.createUserCityName"
      />

      <van-tabs v-model:active="activeName" type="card">
        <van-tab title="业务信息" name="1">
          <div class="tab-content">
            <div class="section">
              <div class="section-subtitle">
                甄选需求信息
              </div>
              <van-field :model-value="props.formData.demandName" label="甄选需求名称" readonly />
              <van-field :model-value="props.formData.demandNumber" label="甄选需求编号" readonly />
              <van-field :model-value="props.formData.createUserName" label="发起人" readonly />
              <van-field :model-value="props.formData.createUserOrg" label="发起单位/部门" readonly />
              <van-field :model-value="props.formData.createTime" label="发起时间" readonly />
              <van-field :model-value="props.formData.createUserPhone" label="发起人联系方式" readonly />
            </div>

            <div class="section">
              <div class="section-subtitle">
                甄选方案信息
              </div>
              <van-field :model-value="props.schemeFormData.schemeName" label="甄选方案名称" readonly />
              <van-field :model-value="props.schemeFormData.schemeNumber" label="甄选方案编号" readonly />
              <van-field :model-value="props.schemeFormData.createUserName" label="发起人" readonly />
              <van-field :model-value="props.schemeFormData.createUserOrg" label="发起单位/部门" readonly />
              <van-field :model-value="props.schemeFormData.createTime" label="发起时间" readonly />
              <van-field :model-value="props.schemeFormData.createUserPhone" label="发起人联系方式" readonly />
            </div>

            <div class="section">
              <div class="section-subtitle">
                甄选成功信息
              </div>

              <template v-if="props.formData.bidPackageFlag === '0' && props.successList.length > 0">
                <div v-for="(item, index) in props.successList" :key="index" class="package-wrapper">
                  <van-field label="甄选结果">
                    <template #input>
                      <span>{{ item.pickResult === '1' ? '成功' : '失败' }}</span>
                    </template>
                  </van-field>

                  <van-field label="评审日期">
                    <template #input>
                      <span>{{ item.auditStartTime }} 至 {{ item.auditEndTime }}</span>
                    </template>
                  </van-field>

                  <template v-if="item.pickResult === '1'">
                    <van-field :model-value="item.bidPartnerName" label="中标合作伙伴" readonly />
                    <van-field :model-value="item.score" label="得分" readonly />
                    <van-field :model-value="item.quotePrice" label="报价不含税(万)" readonly />
                    <van-field :model-value="item.quotePriceTax" label="报价含税(万)" readonly />

                    <PartnerList
                      :partners="item.pickPartners"
                      :data="item"
                      read-only
                      label="得分列表"
                    />

                    <!-- <div class="file-section">
                      <div class="file-label">
                        评审报告
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.resultFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'auditReport', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.resultFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        应答文件密封性检查暨签收表
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.sealCheckReceiptFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'sealCheckReceipt', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.sealCheckReceiptFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        评委抽取过程记录
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.judgeSelectionRecordFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'judgeSelectionRecord', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.judgeSelectionRecordFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        评委签到表
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.judgeAttendanceFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'judgeAttendance', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.judgeAttendanceFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        特定关系人与特定事项申报书
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.relationshipDeclarationFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'relationshipDeclaration', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.relationshipDeclarationFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        评审工作纪律
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.reviewDisciplineFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'reviewDiscipline', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.reviewDisciplineFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        评审阶段澄清文件
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.reviewClarificationFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'reviewClarification', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.reviewClarificationFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        初步评审表
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.preliminaryReviewFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'preliminaryReview', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.preliminaryReviewFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        商务评分表
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.commercialScoreFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'commercialScore', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.commercialScoreFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        技术评分表
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.technicalScoreFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'technicalScore', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.technicalScoreFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        价格评分表
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.priceScoreFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'priceScore', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.priceScoreFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        加分表及证明材料
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.bonusProofFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'bonusProof', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.bonusProofFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        谈判记录表（含最终报价表）
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.negotiationRecordFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'negotiationRecord', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.negotiationRecordFiles?.length">-</span>
                      </div>
                    </div>

                    <div class="file-section">
                      <div class="file-label">
                        评分汇总表
                      </div>
                      <div class="file-list">
                        <div
                          v-for="file in item.scoreSummaryFiles"
                          :key="file.fileName"
                          class="file-item"
                          @click="downloadAppFile(file.name || file.originalName, 'scoreSummary', file.filename||file.fileName)"
                        >
                          {{ file.originalName }}
                        </div>
                        <span v-if="!item.scoreSummaryFiles?.length">-</span>
                      </div>
                    </div> -->
                  </template>
                </div>
              </template>

              <template v-else-if="props.formData.bidPackageFlag === '1' && props.successList.length > 0">
                <div
                  v-for="(pkg, index) in props.successList"
                  :key="index"
                  class="package-wrapper-border"
                >
                  <div class="package-title">
                    标包{{ index + 1 }}：{{ pkg.bidPackageTitle || '-' }}
                  </div>

                  <van-field label="甄选结果">
                    <template #input>
                      <span>{{ pkg.pickResult === '1' ? '成功' : '失败' }}</span>
                    </template>
                  </van-field>

                  <van-field label="评审日期">
                    <template #input>
                      <span>{{ pkg.auditStartTime }} 至 {{ pkg.auditEndTime }}</span>
                    </template>
                  </van-field>

                  <template v-if="pkg.pickResult === '1'">
                    <van-field :model-value="pkg.bidPartnerName" label="中标合作伙伴" readonly />
                    <van-field :model-value="pkg.score" label="得分" readonly />
                    <van-field :model-value="pkg.quotePrice" label="报价不含税(万元)" readonly />
                    <van-field :model-value="pkg.quotePriceTax" label="报价含税(万元)" readonly />

                    <PartnerList
                      :partners="pkg.pickPartners"
                      :data="pkg"
                      read-only
                      label="得分列表"
                    />
                  </template>
                </div>
              </template>
            </div>
          </div>
        </van-tab>

        <van-tab title="流程信息" name="2">
          <div class="tab-content">
            <div class="section">
              <approvalTimeline v-if="props.flowTaskCommentList.length > 0" :list="props.flowTaskCommentList" />
              <van-empty v-else description="暂无流程信息" />
            </div>
          </div>
        </van-tab>

        <van-tab title="附件信息" name="3">
          
          <template v-if="formData.bidPackageFlag === '0' && successList.length > 0">
            <div
              v-for="(pkg, index) in successList"
              :key="index"
              class="package-wrapper"
              style="margin-top: 16px;"
            >
              <template v-if="pkg.pickResult === '1'">
                <van-cell title="评审报告">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.resultFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'bidDoc', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.resultFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="应答文件密封性检查暨签收表">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.sealCheckReceiptFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'sealCheckReceipt', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.sealCheckReceiptFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="评委抽取过程记录">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.judgeSelectionRecordFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'judgeSelectionRecord', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.judgeSelectionRecordFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="评委签到表">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.judgeAttendanceFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'judgeAttendance', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.judgeAttendanceFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="特定关系人与特定事项申报书">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.relationshipDeclarationFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'relationshipDeclaration', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.relationshipDeclarationFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="评审工作纪律">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.reviewDisciplineFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'reviewDiscipline', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.reviewDisciplineFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="评审阶段澄清文件">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.reviewClarificationFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'reviewClarification', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.reviewClarificationFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>

                <van-cell title="初步评审表">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.preliminaryReviewFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'preliminaryReview', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.preliminaryReviewFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="商务评分表">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.commercialScoreFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'commercialScore', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.commercialScoreFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="技术评分表">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.technicalScoreFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'technicalScore', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.technicalScoreFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="价格评分表">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.priceScoreFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'priceScore', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.priceScoreFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="加分表及证明材料">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.bonusProofFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'bonusProof', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.bonusProofFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>

                <van-cell title="谈判记录表（含最终报价表）">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.negotiationRecordFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'negotiationRecord', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.negotiationRecordFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>

                <van-cell title="评分汇总表">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.scoreSummaryFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'scoreSummary', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.scoreSummaryFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
              </template>
            </div>
          </template>
          <template v-if="formData.bidPackageFlag === '1' && successList.length > 0">
            <div
              v-for="(pkg, index) in successList"
              :key="index"
              class="package-wrapper-border"
              style="margin-top: 16px;"
            >
              <div class="package-title">
                标包{{ index + 1 }}：{{ pkg.bidPackageTitle || '-' }}
              </div>

              <template v-if="pkg.pickResult === '1'">
                <van-cell title="评审报告">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.resultFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'bidDoc', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.resultFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="应答文件密封性检查暨签收表">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.sealCheckReceiptFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'sealCheckReceipt', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.sealCheckReceiptFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="评委抽取过程记录">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.judgeSelectionRecordFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'judgeSelectionRecord', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.judgeSelectionRecordFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="评委签到表">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.judgeAttendanceFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'judgeAttendance', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.judgeAttendanceFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="特定关系人与特定事项申报书">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.relationshipDeclarationFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'relationshipDeclaration', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.relationshipDeclarationFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="评审工作纪律">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.reviewDisciplineFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'reviewDiscipline', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.reviewDisciplineFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="评审阶段澄清文件">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.reviewClarificationFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'reviewClarification', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.reviewClarificationFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>

                <van-cell title="初步评审表">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.preliminaryReviewFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'preliminaryReview', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.preliminaryReviewFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="商务评分表">
                  <template #value>
                    <div class="file-list">
                      <div v-for="file in pkg.commercialScoreFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'commercialScore', file.filename||file.fileName)">
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.commercialScoreFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="技术评分表">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.technicalScoreFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'technicalScore', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.technicalScoreFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="价格评分表">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.priceScoreFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'priceScore', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.priceScoreFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
                <van-cell title="加分表及证明材料">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.bonusProofFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'bonusProof', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.bonusProofFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>

                <van-cell title="谈判记录表（含最终报价表）">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.negotiationRecordFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'negotiationRecord', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.negotiationRecordFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>

                <van-cell title="评分汇总表">
                  <template #value>
                    <div class="file-list">
                      <div
                        v-for="file in pkg.scoreSummaryFiles"
                        :key="file.fileName"
                        class="file-item"
                        @click="downloadAppFile(file.name || file.originalName, 'scoreSummary', file.filename||file.fileName)"
                      >
                        <span>{{ file.originalName }}</span>
                      </div>
                      <span v-if="!pkg.scoreSummaryFiles?.length">-</span>
                    </div>
                  </template>
                </van-cell>
              </template>
            </div>
          </template>
          <div class="section">
            <div class="section-subtitle">
              甄选结果决策信息
            </div>
            <van-cell title="决策时间">
              <template #value>
                {{ decisionFormData.decisionTime }}
              </template>
            </van-cell>
            <van-cell title="附件文档中是否存在临时文件">
              <template #value>
                {{ decisionFormData.hasTemporaryFile === '1' ? '是' : '否' }}
              </template>
            </van-cell>
            <van-cell title="甄选决策会议记录">
              <template #value>
                <div class="file-list">
                  <div v-for="file in decisionFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'decisionDoc', file.filename||file.fileName)">
                    <span>{{ file.originalName }}</span>
                  </div>
                  <span v-if="!decisionFiles?.length">-</span>
                </div>
              </template>
            </van-cell>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped>
</style>
