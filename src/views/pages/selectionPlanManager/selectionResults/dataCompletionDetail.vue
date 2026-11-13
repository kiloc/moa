<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { ref } from 'vue'
import { API_CONTEXT } from '@/api/config'
import { downloadAppFile } from '@/common/utils'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'

const _props = withDefaults(
  defineProps<{
    flowEntryName?: string
    taskName?: string
    flowTaskCommentList?: any[]
    formData?: ANY_OBJECT
    schemeFormData?: any
    bidDocFileList?: ANY_OBJECT[]
    selectionRequestFormFileList?: ANY_OBJECT[]
    partnerSelectionRequirementFileList?: ANY_OBJECT[]
    selectionReviewPlanFileList?: ANY_OBJECT[]
    technicalSpecificationFileList?: ANY_OBJECT[]
    contractMainTermsFileList?: ANY_OBJECT[]
    decisionMeetingFileList?: ANY_OBJECT[]
    decisionDocFileList?: ANY_OBJECT[]
    decisionFormData?: ANY_OBJECT
    isShow?: boolean
  }>(),
  {
    flowEntryName: '',
    taskName: '资料补传审批',
    flowTaskCommentList: () => [],
    formData: () => ({}),
    schemeFormData: () => {},
    bidDocFileList: () => [],
    selectionRequestFormFileList: () => [],
    partnerSelectionRequirementFileList: () => [],
    selectionReviewPlanFileList: () => [],
    technicalSpecificationFileList: () => [],
    contractMainTermsFileList: () => [],
    decisionMeetingFileList: () => [],
    decisionDocFileList: () => [],
    decisionFormData: () => ({}),
    isShow: true,
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
            <div class="section">
              <div class="section-subtitle">
                甄选方案信息
              </div>
              <van-field :model-value="schemeFormData.schemeName" label="甄选方案名称" readonly />
              <van-field :model-value="schemeFormData.schemeNumber" label="甄选方案编号" readonly />
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
                    <div v-for="file in formData.decisionFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'decisionDoc', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!formData.decisionFiles?.length">-</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="合同/价格审批文件" v-if="isShow">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in formData.contractPriceApproval" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'contractPriceReviewFiles', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!formData.contractPriceApproval?.length">-</span>
                  </div>
                </template>
              </van-cell>
            </div>

            <div class="section">
              <div class="section-subtitle">
                甄选结果决策信息资料补传
              </div>
              <van-cell title="结果决策会议纪要">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in decisionDocFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'decisionDoc', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!decisionDocFileList?.length">-</span>
                  </div>
                </template>
              </van-cell>
              <!-- 不展示合同/价格审批文件 -->
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
