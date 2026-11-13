<template>
  <div class="feedback-info-page">
    <van-nav-bar
      title="反馈信息"
      left-arrow
      fixed
      placeholder
      @click-left="onCancel"
    />
    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <!-- 发起人信息 -->
          <van-cell-group class="card-section" inset>
            <div class="card-section__header">
              <div class="card-section__title">发起人信息</div>
            </div>
            <van-cell title="创建人姓名" :value="formData.createUserName || '-'" />
            <van-cell title="创建时间" :value="formData.createTime || '-'" />
            <van-cell title="反馈标题" :value="formData.feedbackName || '-'" />
            <van-cell title="合作方名称" :value="formData.partnerName || '-'" />
            <van-cell title="项目名称" :value="formData.projectName || '-'" />
            <van-cell title="反馈内容" :value="formData.feedbackContent || '-'" />
          </van-cell-group>
        </van-tab>
        <van-tab title="流程信息" name="process">
          <processInfo :processInstanceId="processInstanceId" />
        </van-tab>
      </van-tabs>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="currentType === 'info'" class="bottom-bar">
      <van-button block @click="onCancel">关闭</van-button>
    </div>
    <div v-if="currentType === 'auth'" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="danger" plain :loading="submitLoading" @click="onReject">驳回</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onAgree">同意</van-button>
    </div>

    <!-- 驳回弹窗 -->
    <van-popup v-model:show="rejectDialogVisible" round position="bottom" :style="{ maxHeight: '70%' }">
      <div class="popup-content">
        <div class="popup-title">驳回</div>
        <van-field
          v-model="rejectForm.reason"
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

    <!-- 同意弹窗 -->
    <van-popup v-model:show="agreeDialogVisible" round position="bottom" :style="{ maxHeight: '70%' }">
      <div class="popup-content">
        <div class="popup-title">同意</div>
        <van-field
          v-model="agreeForm.reason"
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
import processInfo from '../../inDatabase/components/processInfo.vue';
import DataBaseController from '@/api/dataBase/DataBaseController';
import { API_CONTEXT } from '@/api/config';
import { post } from '@/common/http/request';
import { appBack } from '@/common/utils';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const params = router.currentRoute.value.query || {};
const taskId = ref(params.taskId as string | undefined);
const processInstanceId = ref(params.processInstanceId as string | undefined);
const submitLoading = ref(false);
const activeTab = ref('business');

const formData = reactive({
  createTime: '',
  createUserName: '',
  feedbackCode: '',
  feedbackContent: '',
  feedbackName: '',
  feedbackType: '',
  feedbackTypeName: '',
  partnerCode: '',
  partnerName: '',
  projectCode: '',
  projectName: '',
  replyStatusName: '',
});

// 对话框显示状态
const rejectDialogVisible = ref(false);
const agreeDialogVisible = ref(false);

// 驳回表单
const rejectForm = reactive({
  reason: '',
});

// 同意表单
const agreeForm = reactive({
  appointedAssignee: '',
  reason: '',
});

// 驳回
const onReject = () => {
  rejectForm.reason = '';
  rejectDialogVisible.value = true;
};

// 确认驳回
const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    showToast('请输入意见');
    return;
  }

  try {
    const payload = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectForm.reason,
      },
      taskVariableData: {
        appointedAssignee: '',
      },
    };
    submitLoading.value = true;
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/FeedbackSuggestionFlow`, payload);
    submitLoading.value = false;
    showToast('已驳回');
    rejectDialogVisible.value = false;
    // router.back();
    appBack();
  } catch (e) {
    submitLoading.value = false;
    // showToast('操作失败');
    console.error(e);
  }
};

// 同意
const onAgree = () => {
  agreeForm.appointedAssignee = '';
  agreeForm.reason = '';
  agreeDialogVisible.value = true;
};

// 确认同意
const confirmAgree = async () => {
  if (!agreeForm.reason.trim()) {
    showToast('请输入意见');
    return;
  }

  try {
    const payload = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'agree',
        taskComment: agreeForm.reason,
      },
      taskVariableData: {
        appointedAssignee: agreeForm.appointedAssignee,
      },
    };
    submitLoading.value = true;
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/FeedbackSuggestionFlow`, payload);
    submitLoading.value = false;
    showToast('审批通过');
    agreeDialogVisible.value = false;
    // router.back();
    appBack();
  } catch (e) {
    submitLoading.value = false;
    // showToast('操作失败');
    console.error(e);
  }
};

// 取消
const onCancel = () => {
  // router.back();
  appBack();
};

const currentType = ref('auth');
const init = () => {
  DataBaseController.viewbusinessKey({ businessKey: params.businessKey })
    .then((res: any) => {
      formData.createTime = res.data.createTime;
      formData.createUserName = res.data.createUserName;
      formData.feedbackCode = res.data.feedbackCode;
      formData.feedbackContent = res.data.feedbackContent;
      formData.feedbackName = res.data.feedbackName;
      formData.feedbackType = res.data.feedbackType;
      formData.partnerCode = res.data.partnerCode;
      formData.partnerName = res.data.partnerName;
      formData.projectCode = res.data.projectCode;
      formData.projectName = res.data.projectName;
      formData.replyStatusName = res.data.replyStatusName;
    })
    .catch(() => {});
};

onMounted(() => {
  console.log(params, '流程进来的');
  if (params.isInfo === 'true') {
    currentType.value = 'info';
  }
  if (params.businessKey || params.businesskey) {
    init();
  }
});
</script>

<style scoped lang="scss">
.feedback-info-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.content-wrapper {
  padding: 0;
}

.detail-tabs {
  :deep(.van-tabs__nav) {
    background: #fff;
  }

  :deep(.van-tab__panel) {
    padding: 0;
  }
}

.card-section {
  margin: 12px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #323233;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
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
