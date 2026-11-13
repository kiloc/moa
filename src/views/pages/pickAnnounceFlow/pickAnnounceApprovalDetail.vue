<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { ref } from 'vue'
import { downloadAppFile } from '@/common/utils'
import { API_CONTEXT } from '@/api/config'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import PartnerList from '@/views/pages/components/partnerList/indexDemand.vue'

const _props = withDefaults(
  defineProps<{
    flowEntryName: string
    taskName:string
    flowTaskCommentList?: any[]
    formData?: ANY_OBJECT
    schemeFormData?: ANY_OBJECT
    announceFormData?: ANY_OBJECT
    announceFileList?: ANY_OBJECT[]
    resultNoticeFormData?: ANY_OBJECT
    mainNoticeFileList?: ANY_OBJECT[]
    mainResultNoticeFileList?: ANY_OBJECT[]
    bidPackageList?: ANY_OBJECT[]
  }>(),
  {
    flowEntryName: '',
    taskName: '甄选管理员审批',
    flowTaskCommentList: () => [],
    formData: () => ({}),
    schemeFormData: () => ({}),
    announceFormData: () => ({}),
    announceFileList: () => [],
    resultNoticeFormData: () => ({}),
    mainNoticeFileList: () => [],
    mainResultNoticeFileList: () => [],
    bidPackageList: () => [],
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
        :create-user-name="announceFormData.createUserName"
        :create-user-phone="announceFormData.createUserPhone"
        :create-time="announceFormData.createTime"
        :create-user-org="announceFormData.createUserOrg"
        :create-user-city-name="announceFormData.createUserCityName"
      />

      <van-tabs v-model:active="activeName" type="card">
        <van-tab title="业务信息" name="1">
          <div class="tab-content">
            <div class="section">
              <div class="section-subtitle">
                甄选需求信息
              </div>
              <van-field :model-value="formData.demandName" label="甄选需求名称" readonly />
              <van-field :model-value="formData.demandNumber" label="甄选需求编号" readonly />
              <van-field :model-value="formData.createUserName" label="需求发起人" readonly />
              <van-field :model-value="formData.createUserOrg" label="发起单位/部门" readonly />
              <van-field :model-value="formData.createTime" label="发起时间" readonly />
              <van-field :model-value="formData.createUserPhone" label="发起人联系方式" readonly />
            </div>

            <div v-if="formData.bidPackageFlag === '1' && bidPackageList.length > 0">
              <div class="section-subtitle">
                标包划分情况
              </div>
              <div v-for="(pkg, index) in bidPackageList" :key="index" class="bid-package-card">
                <div class="package-title">
                  标包{{ index + 1 }}
                </div>
                <van-field :model-value="pkg.bidPackageTitle" label="甄选标段标题" type="textarea" readonly />
                <van-field :model-value="pkg.bidPackageNumber" label="标段标识" readonly />
                <van-field :model-value="pkg.pickType" label="甄选方式" readonly />
                <!-- <van-field :model-value="pkg.minBidCount" label="最低应标数量" readonly /> -->
                <van-field :model-value="pkg.bidPackage" label="标段金额不含税(万)" readonly />
                <van-field :model-value="pkg.bidPackageTax" label="标段金额含税(万)" readonly />
                <van-field :model-value="pkg.pickTypeReason" label="甄选方式理由" readonly type="textarea" rows="2" />
                <PartnerList
                  :partners="pkg.pickPartners"
                  :data="pkg"
                  :industry="formData.demandIndustry"
                  read-only
                  label="合作伙伴列表"
                />
                <van-field :model-value="pkg.bidPackageDesc" label="标段信息描述" readonly type="textarea" rows="2" />
                <template v-if="pkg.bidPackageDocs && pkg.bidPackageDocs.length > 0">
                  <van-cell title="标包文件">
                    <template #label>
                      <div
                        v-for="(file, fileIndex) in pkg.bidPackageDocs"
                        :key="fileIndex"
                        class="file-link"
                        @click="downloadAppFile(file.name || file.originalName, 'bidPackageDoc', file.filename||file.fileName)"
                      >
                        {{ file.originalName }}
                      </div>
                    </template>
                  </van-cell>
                </template>
              </div>
            </div>

            <div class="section">
              <div class="section-subtitle">
                甄选方案基本信息
              </div>
              <van-field :model-value="schemeFormData.schemeName" label="甄选方案名称" readonly />
              <van-field :model-value="schemeFormData.schemeNumber" label="甄选方案编码" readonly />
              <van-field :model-value="schemeFormData.createUserName" label="需求发起人" readonly />
              <van-field :model-value="schemeFormData.createUserOrg" label="发起单位/部门" readonly />
              <van-field :model-value="schemeFormData.createTime" label="发起时间" readonly />
              <van-field :model-value="schemeFormData.createUserPhone" label="发起人联系方式" readonly />
            </div>

            <div class="section">
              <div class="section-subtitle">
                公示信息
              </div>
              <van-field :model-value="announceFormData.announceTitle" label="公示标题" type="textarea" readonly />
              <van-field :model-value="announceFormData.replyDeadlineTime" label="公示截止时间" readonly />
              <van-field label="公告正文">
                <template #input>
                  <div class="rich-text" v-html="announceFormData.announcement"/>
                </template>
              </van-field>
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
                公示信息
              </div>
              <van-cell title="公示文件">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in announceFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'announceFiles', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!announceFileList?.length">-</span>
                  </div>
                </template>
              </van-cell>
            </div>
            <div class="section">
              <div class="section-subtitle">
                结果通知书
              </div>
              <van-cell title="主选通知书">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in mainNoticeFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'mainNoticeFiles', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!mainNoticeFileList?.length">-</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="主选结果通知书">
                <template #value>
                  <div class="file-list">
                    <div v-for="file in mainResultNoticeFileList" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'mainResultNoticeFiles', file.filename||file.fileName)">
                      <span>{{ file.originalName }}</span>
                    </div>
                    <span v-if="!mainResultNoticeFileList?.length">-</span>
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
