<template>
  <div class="notice-add-page">
    <van-nav-bar
      title="发布公告"
      left-arrow
      fixed
      placeholder
      @click-left="onCancel"
    />
    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <!-- 发起人信息 -->
          <PromoterInformation ref="initiatorInfoRef" />

          <!-- 发布范围信息 -->
          <ReleaseInfo ref="releaseInfoRef" />

          <!-- 公告信息内容 -->
          <ContentInfo ref="contentInfoRef" />
        </van-tab>
        <van-tab title="流程信息" name="process">
          <processInfo :processInstanceId="processInstanceId" />
        </van-tab>
      </van-tabs>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="currentType === 'add' || currentType === 'edit' || currentType === 'noProcessEdit'" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button
        v-if="currentType === 'add' || currentType === 'noProcessEdit'"
        block
        type="default"
        :loading="submitLoading"
        @click="onSubmit('saveDraftBatch')"
      >暂存</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onSubmit('')">提交</van-button>
    </div>
    <div v-if="currentType === 'auth'" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="danger" plain :loading="submitLoading" @click="onReject">驳回</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onAgree">同意</van-button>
    </div>
    <div v-if="currentType === 'info'" class="bottom-bar">
      <van-button block @click="onCancel">关闭</van-button>
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
          v-if="!islast"
          v-model="agreeForm.appointedAssigneeText"
          is-link
          readonly
          label="下一步审批人"
          placeholder="请选择下一步审批人"
          required
          @click="showApproverPicker = true"
        />
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

    <!-- 审批人选择 Picker -->
    <van-popup v-model:show="showApproverPicker" round position="bottom">
      <van-picker
        :columns="approverColumns"
        @confirm="onApproverConfirm"
        @cancel="showApproverPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { useLoginStore } from '@/store';
import PromoterInformation from './components/promoterInformation.vue';
import processInfo from '@/views/pages/inDatabase/components/processInfo.vue';
import ContentInfo from './components/contentInfo.vue';
import ReleaseInfo from './components/releaseInfo.vue';
import { NegativeController } from '@/api/negativeManagement';
import { SysUserController } from '@/api/generated';
import { API_CONTEXT } from '@/api/config';
import { post } from '@/common/http/request';
import { appBack } from '@/common/utils';

const router = useRouter();
const route = useRoute();
const loginStore = useLoginStore();
const submitLoading = ref(false);
const activeTab = ref('business');

const initiatorInfoRef = ref();
const contentInfoRef = ref();
const releaseInfoRef = ref();

const params = route.query || {};
const taskId = ref(params.taskId);
const processInstanceId = ref(params.processInstanceId as string | undefined);
const islast = ref(params.taskName === '合作伙伴管理员审批');
const userInfo = computed(() => loginStore.userInfo || {});

// 对话框显示状态
const rejectDialogVisible = ref(false);
const agreeDialogVisible = ref(false);
const showApproverPicker = ref(false);

// 驳回表单
const rejectForm = reactive({
  reason: '',
});

// 同意表单
const agreeForm = reactive({
  appointedAssignee: '',
  appointedAssigneeText: '',
  reason: '',
});

const nextApproverList = ref<any[]>([]);
const currentType = ref('add');

// 审批人 Picker 列
const approverColumns = computed(() =>
  nextApproverList.value.map(user => ({
    text: user.showName,
    value: user.loginName,
  }))
);

// 审批人选择确认
const onApproverConfirm = ({ selectedOptions }: any) => {
  agreeForm.appointedAssignee = selectedOptions[0].value;
  agreeForm.appointedAssigneeText = selectedOptions[0].text;
  showApproverPicker.value = false;
};

// 提交表单
const onSubmit = async (type?: string) => {
  try {
    if (!initiatorInfoRef.value) {
      showToast('发起人信息未加载完成');
      return;
    }
    if (!releaseInfoRef.value) {
      showToast('发布范围信息未加载完成');
      return;
    }
    if (!contentInfoRef.value) {
      showToast('公告信息内容未加载完成');
      return;
    }

    const initiatorData = await initiatorInfoRef.value.handleSubmit();
    const releaseData = await releaseInfoRef.value.handleSubmit();
    const contentData = await contentInfoRef.value.handleSubmit();

    const submitData = {
      ...initiatorData,
      ...releaseData,
      ...contentData,
      negativeBehaviorCode: params.negativeBehaviorCode || params.businessKey || params.businesskey,
    } as any;

    let roleId = '';
    if (userInfo.value.area == 1) roleId = '2034602005636321280';
    if (userInfo.value.area == 2) roleId = '2036280205496029184';
    if (userInfo.value.area == 3) roleId = '2036280313365139456';

    submitLoading.value = true;
    const fn = () => {
      let url = NegativeController.submitNotice;
      if (type === 'saveDraftBatch') {
        url = NegativeController.saveNoticeDraft;
      }
      if (currentType.value === 'edit' && processInstanceId.value && taskId.value) {
        url = NegativeController.resubmitNotice;
        submitData.processInstanceId = processInstanceId.value;
        submitData.taskId = taskId.value;
      }
      url(submitData)
        .then(() => {
          submitLoading.value = false;
          showToast('提交成功');
          // router.back();
          appBack();
        })
        .catch(() => {
          submitLoading.value = false;
        });
    };

    if (type === 'saveDraftBatch') {
      fn();
    } else {
      // 选择下一步审批人
      SysUserController.listUserByRoleAndDeptFlag({
        roleId,
        deptFlag: 'current',
      })
        .then((res: any) => {
          const userList = res.data || [];
          if (userList.length === 1) {
            submitData.appointedAssignee = userList[0].loginName;
            fn();
          } else if (userList.length > 1) {
            nextApproverList.value = userList;
            // 弹出选择
            showApproverPicker.value = true;
            // 等待选择后手动调用
            const unwatch = watch(() => agreeForm.appointedAssignee, (val) => {
              if (val) {
                submitData.appointedAssignee = val;
                fn();
                unwatch();
              }
            });
          } else {
            fn();
          }
        })
        .catch(() => {
          submitLoading.value = false;
          showToast('加载审批人列表失败');
        });
    }
  } catch (error) {
    submitLoading.value = false;
    console.error('发布公告失败:', error);
    showToast('发布公告失败，请稍后重试');
  }
};

// 取消
const onCancel = () => {
  // router.back();
  appBack();
};

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
    const submitData = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectForm.reason,
      },
      taskVariableData: {},
    };

    submitLoading.value = true;
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/NegativeBehaviorNoticeFlow`, submitData);
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

// 加载下一步审批人列表
const loadNextApproverList = () => {
  const obj = {
    roleId: '',
    deptFlag: 'current',
  };
  if (params.taskKey === 'Activity_1ttltov') {
    if (userInfo.value.area == 1) obj.roleId = '2034602005636321280';
    if (userInfo.value.area == 2) obj.roleId = '2036280205496029184';
    if (userInfo.value.area == 3) obj.roleId = '2036280313365139456';
  }

  SysUserController.listUserByRoleAndDeptFlag(obj)
    .then((res: any) => {
      nextApproverList.value = res.data || [];
    })
    .catch((e: any) => {
      showToast('加载审批人列表失败');
      console.error(e);
    });
};

// 同意
const onAgree = () => {
  agreeForm.appointedAssignee = '';
  agreeForm.appointedAssigneeText = '';
  agreeForm.reason = '';
  agreeDialogVisible.value = true;
  if (nextApproverList.value.length === 0) {
    loadNextApproverList();
  }
};

// 确认同意
const confirmAgree = async () => {
  if (!agreeForm.appointedAssignee.trim() && !islast.value) {
    showToast('请指定下一步审批人');
    return;
  }
  if (!agreeForm.reason.trim()) {
    showToast('请输入意见');
    return;
  }

  try {
    const submitData = {
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/NegativeBehaviorNoticeFlow`, submitData);
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

const props = defineProps({
  flowTaskCommentList: {
    type: Array,
    default: () => [],
  },
});

const init = () => {
  NegativeController.queryNegativeBehaviorBatch({
    negativeBehaviorCode: params.businessKey || params.negativeBehaviorCode,
  })
    .then((res: any) => {
      if (initiatorInfoRef.value && typeof initiatorInfoRef.value.showData === 'function') {
        try {
          initiatorInfoRef.value.showData({
            showName: params.showName,
            taskId: params.taskId,
            processInstanceInitiatorMobile: params.processInstanceInitiatorMobile,
            processInstanceInitiatorDeptName: params.processInstanceInitiatorDeptName,
            processInstanceInitiatorCityName: params.processInstanceInitiatorCityName,
            processInstanceStartTime: params.processInstanceStartTime,
          }, currentType.value === 'noProcessEdit' ? 'edit' : currentType.value);
        } catch (error) {
          console.error('Error in initiatorInfo showData:', error);
        }
      }

      if (releaseInfoRef.value && typeof releaseInfoRef.value.showData === 'function') {
        try {
          releaseInfoRef.value.showData(res.data, currentType.value === 'noProcessEdit' ? 'edit' : currentType.value);
        } catch (error) {
          console.error('Error in releaseInfo showData:', error);
        }
      }

      if (contentInfoRef.value && typeof contentInfoRef.value.showData === 'function') {
        try {
          contentInfoRef.value.showData(res.data, currentType.value === 'noProcessEdit' ? 'edit' : currentType.value);
        } catch (error) {
          console.error('Error in contentInfo showData:', error);
        }
      }
    })
    .catch((e: any) => {
      console.error('Error in queryNegativeBehaviorBatch:', e);
    });
};

onMounted(() => {
  console.log(params, '流程进来的');
  if (params.businesskey || params.businessKey || params.negativeBehaviorCode) {
    if (params.isInfo === 'true') {
      currentType.value = 'info';
    }
    if (params.taskName === '三级经理审批' || params.taskName === '合作伙伴管理员审批') {
      currentType.value = 'auth';
    }
    if (params.taskName === '公告发起') {
      currentType.value = 'edit';
    }
    if (params.taskName === '编辑') {
      currentType.value = 'noProcessEdit';
    }
    init();
  }
});
</script>

<style lang="scss" scoped>
.notice-add-page {
  min-height: 100vh;
  background: #f7f8fa;
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
    padding: 0 12px;
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
