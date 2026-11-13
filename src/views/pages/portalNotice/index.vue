<template>
  <div class="portal-notice-page">
    <van-nav-bar
      title="门户公告审批"
      left-arrow
      fixed
      placeholder
      @click-left="onCancel"
    />

    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <van-loading v-if="pageLoading" class="page-loading" size="24px" vertical>
            加载中...
          </van-loading>
          <van-cell-group v-else class="notice-form" inset>
            <van-field :model-value="typeMap.get(formData.announcementType)" label="公告类型" readonly />
            <van-field label="公告标题" readonly>
              <template #input>
                <span style="word-break: break-all;">{{ formData.announcementTitle }}</span>
              </template>
            </van-field>
            <van-field label="公告有效期" readonly>
              <template #input>
                <span>{{ formData.validStartDate?.split(' ')[0] }} - {{ formData.validEndDate?.split(' ')[0] }}</span>
              </template>
            </van-field>
            <van-field label="公告内容" readonly>
              <template #input>
                <div class="content-text" style="white-space: pre-wrap;background-color: #f7f7f7;border-radius: 4px;padding:4px;" v-html="formData.announcementContent" />
              </template>
            </van-field>
            <van-field :model-value="formData.publisher" label="发布人" readonly />
            <van-field :model-value="formData.publishTime" label="发布时间" readonly />
            <van-field label="公告附件" readonly>
              <template #input>
                <div v-if="formData.announcementAttachment?.length" class="file-list">
                  <div
                    v-for="file in formData.announcementAttachment"
                    :key="file.fileName || file.filename"
                    class="file-item"
                    @click="onDownloadFile(file)"
                  >
                    {{ file.originalName || file.name || file.fileName }}
                  </div>
                </div>
                <span v-else>-</span>
              </template>
            </van-field>
          </van-cell-group>
        </van-tab>
        <van-tab title="流程信息" name="process">
          <processInfo :process-instance-id="processInstanceId" />
        </van-tab>
      </van-tabs>
    </div>

    <div v-if="currentType === 'info'" class="bottom-bar">
      <van-button block @click="onCancel">关闭</van-button>
    </div>
    <div v-else class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="danger" plain :loading="submitLoading" @click="onReject">驳回</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onAgree">同意</van-button>
    </div>

    <van-popup v-model:show="rejectDialogVisible" round position="bottom" :style="{ maxHeight: '70%' }">
      <div class="popup-content">
        <div class="popup-title">驳回</div>
        <van-field
          v-model="rejectReason"
          type="textarea"
          label="意见"
          placeholder="请输入意见"
          rows="4"
          maxlength="500"
          show-word-limit
          required
        />
        <div class="popup-actions">
          <van-button block @click="rejectDialogVisible = false">取消</van-button>
          <van-button block type="danger" :loading="submitLoading" @click="confirmReject">确定</van-button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="agreeDialogVisible" round position="bottom" :style="{ maxHeight: '70%' }">
      <div class="popup-content">
        <div class="popup-title">同意</div>
        <van-field
          v-model="agreeReason"
          type="textarea"
          label="意见"
          placeholder="请输入意见"
          rows="4"
          maxlength="500"
          show-word-limit
          required
        />
        <div class="popup-actions">
          <van-button block @click="agreeDialogVisible = false">取消</van-button>
          <van-button block type="primary" :loading="submitLoading" @click="confirmAgree">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import 'vant/es/toast/style';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { FlowOperationController } from '@/api/flow';
import { PortalNoticeController } from '@/api/generated';
import type { PortalNoticeFileDto, PortalNoticeVo } from '@/api/generated/portalNoticeController';
import processInfo from '@/views/pages/inDatabase/components/processInfo.vue';
import { appBack, downloadOnlineFormFile } from '@/common/utils';
import type { ANY_OBJECT } from '@/types/generic';

defineOptions({ name: 'portalNoticeApply' });

const typeMap = new Map([
  { id: '01', name: '系统公告' },
  { id: '02', name: '供应商管理公告' },
  { id: '03', name: '管理办法及政策法规' },
  { id: '04', name: '咨询帮忙文档' },
  { id: '05', name: '新闻资讯' },
  { id: '06', name: '合作伙伴大会' }
].map(item => [item.id, item.name]))

const route = useRoute();
const params = computed(() => route.query || {});
const processInstanceId = computed(() => (params.value.processInstanceId as string) || '');
const taskId = computed(() => (params.value.taskId as string) || '');
const processDefinitionKey = computed(
  () => (params.value.processDefinitionKey as string) || 'PortalNoticeFlow',
);

const activeTab = ref('business');
const pageLoading = ref(false);
const submitLoading = ref(false);
const currentType = ref(params.value.isInfo === 'true' ? 'info' : 'auth');

const formData = ref<PortalNoticeVo>({} as PortalNoticeVo);
const rejectDialogVisible = ref(false);
const agreeDialogVisible = ref(false);
const rejectReason = ref('');
const agreeReason = ref('');

function onDownloadFile(file: PortalNoticeFileDto) {
  downloadOnlineFormFile('xinxigonggaobiao', 'announcement_attachment', file.filename as string, file.originalName as string, formData.value.datasourceId);
}

function onCancel() {
  appBack();
}

function onReject() {
  rejectReason.value = '';
  rejectDialogVisible.value = true;
}

function onAgree() {
  agreeReason.value = '';
  agreeDialogVisible.value = true;
}

async function submitTask(approvalType: 'agree' | 'reject', taskComment: string) {
  submitLoading.value = true;
  const res = await FlowOperationController.submitUserTaskByFlowKey({
    processInstanceId: processInstanceId.value,
    taskId: taskId.value,
    flowTaskCommentDto: {
      approvalType,
      taskComment,
    },
    taskVariableData: {},
  }, {
    processDefinitionKey: processDefinitionKey.value,
  });
  return res;
}

async function confirmReject() {
  if (!rejectReason.value.trim()) {
    showToast('请输入意见');
    return;
  }
  try {
    const res = await submitTask('reject', rejectReason.value);
    if (res.success) {
      showToast('已驳回');
      rejectDialogVisible.value = false;
      appBack();
    }
  } catch (e) {
    console.error(e);
  } finally {
    submitLoading.value = false;
  }
}

async function confirmAgree() {
  if (!agreeReason.value.trim()) {
    showToast('请输入意见');
    return;
  }
  try {
    const res = await submitTask('agree', agreeReason.value);
    if (res.success) {
      showToast('审批通过');
      agreeDialogVisible.value = false;
      appBack();
    }
  } catch (e) {
    console.error(e);
  } finally {
    submitLoading.value = false;
  }
}

function loadDetail() {
  const id = params.value.businessKey || params.value.id;
  if (!id)
    return;
  pageLoading.value = true;
  PortalNoticeController.portalNoticeDetail({
    id,
    dataType: 1,
  })
    .then((res: ANY_OBJECT) => {
      formData.value = res.data || {};
    })
    .catch((e: unknown) => {
      console.error(e);
      showToast('加载详情失败');
    })
    .finally(() => {
      pageLoading.value = false;
    });
}

onMounted(() => {
  loadDetail();
});
</script>

<style scoped lang="scss">
.portal-notice-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.content-wrapper {
  padding: 10px 0;
}

.detail-tabs {
  :deep(.van-tabs__nav) {
    background: #fff;
  }
}

.notice-form {
  margin-top: 12px;
}

.content-text {
  width: 100%;
  color: #323233;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
}

.file-list {
  width: 100%;
}

.file-item {
  color: #1989fa;
  word-break: break-all;
  &:not(:last-child) {
    margin-bottom: 10px;
  }
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 12px rgb(100 101 102 / 8%);
  z-index: 100;

  .van-button {
    flex: 1;
  }
}

.popup-content {
  padding: 16px;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 16px;
  text-align: center;
}

.popup-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;

  .van-button {
    flex: 1;
  }
}
</style>
