<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { ref } from 'vue'
import { downloadAppFile } from '@/common/utils'
import { API_CONTEXT } from '@/api/config'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'

const _props = withDefaults(
  defineProps<{
    flowEntryName?: string
    taskName?: string
    flowTaskCommentList?: any[]
    formData?: ANY_OBJECT
    schemeFormData?: ANY_OBJECT
    bidDocFileList?: ANY_OBJECT[]
    pickDemandFileList?: ANY_OBJECT[]
    decisionMeetingFileList?: ANY_OBJECT[]
    decisionDocFileList?: ANY_OBJECT[]
    decisionFormData?: ANY_OBJECT
  }>(),
  {
    flowEntryName: '',
    taskName: '资料补传审批',
    flowTaskCommentList: () => [],
    formData: () => ({}),
    schemeFormData: () => ({}),
    bidDocFileList: () => [],
    pickDemandFileList: () => [],
    decisionMeetingFileList: () => [],
    decisionDocFileList: () => [],
    decisionFormData: () => ({}),
  },
)

const activeName = ref('1')
const isDownload = ref(false)


function getDecisionLevelText(level: number | string | undefined) {
  if (!level)
    return '-'
  const map: Record<string, string> = {
    1: '政企部部务会',
    2: '跨部门评审',
    3: '分管领导专题办公会',
    4: '总经理办公会',
  }
  return map[String(level)] || '-'
}
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
            <!-- 甄选需求信息 -->
            <div class="section">
              <div class="section-subtitle">
                甄选需求信息
              </div>
              <van-field :model-value="formData.demandName" label="甄选需求名称" readonly />
              <van-field :model-value="formData.demandNumber" label="甄选需求编码" readonly />
              <!-- {{ schemeFormData.hasTemporaryFile }}-{{ formData.hasTemporaryFile }} -->
              <van-field
                :model-value="formData.hasTemporaryFile === '1' ? '是' : '否'"
                label="附件文档中是否存在临时文件"
                readonly
              />
            </div>

            <!-- 甄选方案信息 -->
            <div v-if="schemeFormData.schemeName" class="section">
              <div class="section-subtitle">
                甄选方案信息
              </div>
              <van-field :model-value="schemeFormData.schemeName" label="甄选方案名称" readonly />
              <van-field :model-value="schemeFormData.schemeNumber" label="甄选方案编码" readonly />
              <van-field
                :model-value="schemeFormData.hasTemporaryFile === '1'? '是' : '否'"
                label="附件文档中是否存在临时文件"
                readonly
              />
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
               <!-- 甄选方案决策信息 -->
            <div class="section">
              <div class="section-subtitle">
                甄选方案决策信息
              </div>
              <van-field :model-value="getDecisionLevelText(schemeFormData.decisionLevel)" label="决策层级" readonly />
              <van-field :model-value="schemeFormData.decisionTime || '-'" label="决策时间" readonly />
              <van-cell title="方案决策会议纪要">
                <template #value>
                  <div class="file-list">
                    <div
                      v-for="file in schemeFormData.decisionMeetings || []"
                      :key="file.uid"
                      class="file-item"
                      @click="downloadAppFile(file.name || file.originalName, '5', file.filename||file.fileName)"
                    >
                      {{ file.originalName || file.fileName }}
                    </div>
                    <span v-if="!schemeFormData.decisionMeetings || schemeFormData.decisionMeetings.length === 0" class="empty-text">-</span>
                  </div>
                </template>
              </van-cell>
              <van-field
                :model-value="schemeFormData.hasTemporaryFile === 1 ? '是' : '否'"
                label="是否存在临时文件"
                readonly
              />
            </div>

            <!-- 甄选方案决策信息资料补传 -->
            <div class="section">
              <div class="section-subtitle">
                甄选方案决策信息资料补传
              </div>
              <van-cell title="方案决策会议纪要">
                <template #value>
                  <div class="file-list">
                    <div
                      v-for="file in decisionMeetingFileList"
                      :key="file.uid"
                      class="file-item"
                      @click="downloadAppFile(file.name || file.originalName, '5', file.filename||file.fileName)"
                    >
                      {{ file.name || file.originalName }}
                    </div>
                    <span v-if="!decisionMeetingFileList.length" class="empty-text">-</span>
                  </div>
                </template>
              </van-cell>
            </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
