<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { ref } from 'vue'
import { downloadAppFile } from '@/common/utils'
import { API_CONTEXT } from '@/api/config'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'

const _props = withDefaults(
  defineProps<{
    flowEntryName: string
    taskName?: string
    flowTaskCommentList?: any[]
    formData?: ANY_OBJECT
    bidDocFileList?: ANY_OBJECT[]
    selectionRequestFormFileList?: ANY_OBJECT[]
    partnerSelectionRequirementFileList?: ANY_OBJECT[]
    selectionReviewPlanFileList?: ANY_OBJECT[]
    technicalSpecificationFileList?: ANY_OBJECT[]
    contractMainTermsFileList?: ANY_OBJECT[]
    decisionMeetingFileList?: ANY_OBJECT[]
    decisionDocFileList?: ANY_OBJECT[]
    decisionFormData?: ANY_OBJECT
  }>(),
  {
    flowEntryName: '',
    taskName: '资料补传审批',
    flowTaskCommentList: () => [],
    formData: () => ({}),
    bidDocFileList: () => [],
    selectionRequestFormFileList: () => [],
    partnerSelectionRequirementFileList: () => [],
    selectionReviewPlanFileList: () => [],
    technicalSpecificationFileList: () => [],
    contractMainTermsFileList: () => [],
    decisionMeetingFileList: () => [],
    decisionDocFileList: () => [],
    decisionFormData: () => ({}),
  },
)

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
        :create-user-name="formData.createUserName"
        :create-user-phone="formData.createUserPhone"
        :create-time="formData.createTime"
        :create-user-org="formData.createUserOrg"
        :create-user-city-name="formData.createUserCityName"
      />

      <van-tabs v-model:active="activeName" type="card">
        <van-tab title="业务信息" name="1">
          <div class="tab-content">
            <div class="section">
              <div class="section-subtitle">
                甄选需求信息
              </div>
              <van-field :model-value="formData.demandName" label="甄选需求名称" readonly />
              <van-field :model-value="formData.demandNumber" label="甄选需求编码" readonly />
            </div>
          </div>
        </van-tab>

        <van-tab title="流程信息" name="2">
          <div class="tab-content">
            <approvalTimeline :list="flowTaskCommentList" />
          </div>
        </van-tab>

        <van-tab title="附件信息" name="3">
          <div class="tab-content">
            <div class="section">
              <div class="section-subtitle">
                甄选需求信息
              </div>
              <van-cell title="甲方招标文件">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in formData.bidDocs" :key="file.filename||file.fileName" class="file-item" @click="downloadAppFile(file.originalName, 'bidDoc', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!formData.bidDocs.length">-</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="合作伙伴甄选需求表">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in formData.partnerSelectionRequirement" :key="file.filename||file.fileName" class="file-item" @click="downloadAppFile(file.originalName, 'partnerSelectionRequirement', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!formData.partnerSelectionRequirement.length">-</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="甄选评审方案">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in formData.selectionReviewPlan" :key="file.filename||file.fileName" class="file-item" @click="downloadAppFile(file.originalName, 'selectionReviewPlan', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!formData.selectionReviewPlan.length">-</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="技术（服务）规范书">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in formData.technicalSpecification" :key="file.filename||file.fileName" class="file-item" @click="downloadAppFile(file.originalName, 'technicalSpecification', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!formData.technicalSpecification.length">-</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="合同主要条款">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in formData.contractMainTerms" :key="file.filename||file.fileName" class="file-item" @click="downloadAppFile(file.originalName, 'contractMainTerms', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!formData.contractMainTerms.length">-</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="附件文档中是否存在临时文件">
                <template #value>
                  <span>{{ formData.hasTemporaryFile === '1' ? '是' : '否' }}</span>
                </template>
              </van-cell>
            </div>
            <div class="section">
              <div class="section-subtitle">
                甄选需求资料补传信息
              </div>

              <van-cell title="甲方招标文件">
                <template #value>
                  <div class="file-list">
                    <div
                      v-for="file in bidDocFileList"
                      :key="file.uid"
                      class="file-item"
                      @click="downloadAppFile(file.name || file.originalName, 'bidDoc', file.filename||file.fileName)"
                    >
                      {{ file.name || file.originalName }}
                    </div>
                    <span v-if="!bidDocFileList.length" class="empty-text">暂无文件</span>
                  </div>
                </template>
              </van-cell>

              <van-cell title="合作伙伴甄选需求表">
                <template #value>
                  <div class="file-list">
                    <div
                      v-for="file in partnerSelectionRequirementFileList"
                      :key="file.uid"
                      class="file-item"
                      @click="downloadAppFile(file.name || file.originalName, 'partnerSelectionRequirement', file.filename||file.fileName)"
                    >
                      {{ file.name || file.originalName }}
                    </div>
                    <span v-if="!partnerSelectionRequirementFileList.length" class="empty-text">暂无文件</span>
                  </div>
                </template>
              </van-cell>

              <van-cell title="甄选评审方案">
                <template #value>
                  <div class="file-list">
                    <div
                      v-for="file in selectionReviewPlanFileList"
                      :key="file.uid"
                      class="file-item"
                      @click="downloadAppFile(file.name || file.originalName, 'selectionReviewPlan', file.filename||file.fileName)"
                    >
                      {{ file.name || file.originalName }}
                    </div>
                    <span v-if="!selectionReviewPlanFileList.length" class="empty-text">暂无文件</span>
                  </div>
                </template>
              </van-cell>

              <van-cell title="技术服务规范书">
                <template #value>
                  <div class="file-list">
                    <div
                      v-for="file in technicalSpecificationFileList"
                      :key="file.uid"
                      class="file-item"
                      @click="downloadAppFile(file.name || file.originalName, 'technicalSpecification', file.filename||file.fileName)"
                    >
                      {{ file.name || file.originalName }}
                    </div>
                    <span v-if="!technicalSpecificationFileList.length" class="empty-text">暂无文件</span>
                  </div>
                </template>
              </van-cell>

              <van-cell title="合同主要条款">
                <template #value>
                  <div class="file-list">
                    <div
                      v-for="file in contractMainTermsFileList"
                      :key="file.uid"
                      class="file-item"
                      @click="downloadAppFile(file.name || file.originalName, 'contractMainTerms', file.filename||file.fileName)"
                    >
                      {{ file.name || file.originalName }}
                    </div>
                    <span v-if="!contractMainTermsFileList.length" class="empty-text">暂无文件</span>
                  </div>
                </template>
              </van-cell>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
