<template>
  <div class="negative-management-page">
    <van-nav-bar
      title="合作伙伴负面行为流程"
      left-arrow
      fixed
      placeholder
      @click-left="onCancel"
    />
    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <supplierNegative ref="supplierNegativeRef" />
        </van-tab>
        <van-tab title="流程信息" name="process">
          <processInfo :processInstanceId="processInstanceId" />
        </van-tab>
      </van-tabs>
    </div>

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

    <!-- 审批人选择器 -->
    <van-popup v-model:show="showApproverPicker" round position="bottom">
      <van-picker
        :columns="approverColumns"
        @confirm="onApproverConfirm"
        @cancel="showApproverPicker = false"
      />
    </van-popup>

    <!-- 提交时选择审批人弹窗 -->
    <van-popup v-model:show="showSubmitApproverPicker" round position="bottom">
      <div class="popup-content">
        <div class="popup-title">选择下一步审批人</div>
        <van-loading v-if="submitApproverLoading" class="page-loading" size="24px" vertical>加载中...</van-loading>
        <van-picker
          v-else
          :columns="submitApproverColumns"
          @confirm="onSubmitApproverConfirm"
          @cancel="showSubmitApproverPicker = false"
        />
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { showToast } from 'vant';
import supplierNegative from './components/supplierNegative.vue';
import processInfo from '@/views/pages/inDatabase/components/processInfo.vue';
import { NegativeController } from '@/api/negativeManagement';
import { SysUserController } from '@/api/generated';
import { API_CONTEXT } from '@/api/config';
import { post } from '@/common/http/request';
import { appBack } from '@/common/utils';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '@/store';

const router = useRouter();
const params = router.currentRoute.value.query || {};
const taskId = ref(params.taskId);
const processInstanceId = ref(params.processInstanceId);
const islast = ref(params.taskName === '三级经理审批');

const loginStore = useLoginStore();
const userInfo = computed(() => loginStore.userInfo || {});

const props = defineProps({
  joinType: {
    type: String,
    default: '',
  },
});

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
});

const supplierNegativeRef = ref(null);

// Tab 相关
const activeTab = ref('business');
const submitLoading = ref(false);

// 提交审批人选择
const showSubmitApproverPicker = ref(false);
const submitApproverLoading = ref(false);
const submitApproverList = ref([]);
const submitApproverColumns = computed(() =>
  submitApproverList.value.map(item => ({
    text: item.showName,
    value: item.loginName,
  })),
);

const onSubmitApproverConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0];
  if (!selected) {
    showToast('请选择下一步审批人');
    return;
  }
  showSubmitApproverPicker.value = false;
  formData.appointedAssignee = selected.value;

  submitLoading.value = true;
  const submitParams = { ...formData };
  let url = NegativeController.submitBatch;
  if (currentType.value === 'edit' && processInstanceId.value && taskId.value) {
    url = NegativeController.resubmit;
    submitParams.processInstanceId = processInstanceId.value;
    submitParams.taskId = taskId.value;
  }
  url(submitParams)
    .then(() => {
      submitLoading.value = false;
      // router.back();
      appBack();
      showToast('提交成功');
    })
    .catch(() => {
      submitLoading.value = false;
    });
};

const onSubmit = type => {
  supplierNegativeRef.value.handleSubmit()
    .then(results => {
      let submitParams = { ...formData, ...results };

      if (type === 'saveDraftBatch') {
        // 暂存
        submitLoading.value = true;
        let url = NegativeController.saveDraftBatch;
        if (currentType.value === 'edit' && processInstanceId.value && taskId.value) {
          url = NegativeController.resubmit;
          submitParams.processInstanceId = processInstanceId.value;
          submitParams.taskId = taskId.value;
        }
        url(submitParams)
          .then(() => {
            submitLoading.value = false;
            // router.back();
            appBack();
            showToast('暂存成功');
          })
          .catch(() => {
            submitLoading.value = false;
          });
      } else {
        // 提交 - 选择审批人
        let roleId = '';
        if (userInfo.value.area == 1) roleId = '2034602005636321280'; // 省
        if (userInfo.value.area == 2) roleId = '2036280205496029184'; // 市
        if (userInfo.value.area == 3) roleId = '2036280313365139456'; // 区

        Object.assign(formData, submitParams);
        submitApproverLoading.value = true;
        showSubmitApproverPicker.value = true;
        SysUserController.listUserByRoleAndDeptFlag({
          roleId,
          deptFlag: 'current',
        })
          .then(res => {
            submitApproverList.value = [];
            if (res.data) {
              submitApproverList.value = Array.isArray(res.data) ? res.data : (res.data.dataList || []);
            }
            submitApproverLoading.value = false;
          })
          .catch(() => {
            submitApproverLoading.value = false;
            showToast('加载审批人列表失败');
          });
      }
    })
    .catch(error => {
      console.log(error);
    });
};

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
  appointedAssigneeText: '',
  reason: '',
});

const showApproverPicker = ref(false);
const nextApproverList = ref([]);
const approverColumns = computed(() =>
  nextApproverList.value.map(item => ({
    text: item.showName,
    value: item.loginName,
  })),
);
const onApproverConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0];
  if (selected) {
    agreeForm.appointedAssignee = selected.value;
    agreeForm.appointedAssigneeText = selected.text;
  }
  showApproverPicker.value = false;
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
    const payload = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'reject',
        taskComment: rejectForm.reason,
      },
      taskVariableData: {},
    };
    submitLoading.value = true;
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/NegativeBehaviorFlow`, payload);
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
    if (userInfo.value.area == 1) obj.roleId = '2034602005636321280'; // 省
    if (userInfo.value.area == 2) obj.roleId = '2036280205496029184'; // 市
    if (userInfo.value.area == 3) obj.roleId = '2036280313365139456'; // 区
  }

  SysUserController.listUserByRoleAndDeptFlag(obj)
    .then(res => {
      nextApproverList.value = [];
      if (res.data) {
        nextApproverList.value = Array.isArray(res.data) ? res.data : (res.data.dataList || []);
      }
    })
    .catch(() => {
      showToast('加载审批人列表失败');
    });
};

// 同意
const onAgree = () => {
  agreeForm.appointedAssignee = '';
  agreeForm.appointedAssigneeText = '';
  agreeForm.reason = '';
  agreeDialogVisible.value = true;
  nextApproverList.value = [];
  loadNextApproverList();
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/NegativeBehaviorFlow`, payload);
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

const currentType = ref('add');
const init = () => {
  NegativeController.queryNegativeBehaviorBatch({
    negativeBehaviorCode: params.businessKey || params.negativeBehaviorCode,
  })
    .then(res => {
      formData.partnerCode = res.data.partnerCode;

      if (supplierNegativeRef.value && typeof supplierNegativeRef.value.showData === 'function') {
        try {
          supplierNegativeRef.value.showData(res.data, currentType.value === 'noProcessEdit' ? 'edit' : currentType.value);
        } catch (error) {
          console.error('Error in supplierNegative showData:', error);
        }
      }
    })
    .catch(e => {
      console.error('Error in queryNegativeBehaviorBatch:', e);
    });
};

onMounted(() => {
  console.log(params, '流程进来的');
  if (params.businesskey || params.businessKey || params.negativeBehaviorCode) {
    if (params.isInfo === 'true') {
      currentType.value = 'info';
    }
    if (
      params.taskName === '三级经理审批' ||
      params.taskName === '部门领导审批' ||
      params.taskName === '省本部DICT管理员审批'
    ) {
      currentType.value = 'auth';
    }
    if (params.taskName === '发起申请') {
      currentType.value = 'edit';
    }
    if (params.taskName === '编辑') {
      currentType.value = 'noProcessEdit';
    }
    init();
  }
});
</script>

<style scoped lang="scss">
.negative-management-page {
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
    //padding: 0 12px;
  }
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
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
<style>
.dataBase-box-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding-left: 10px;
  border-left: 4px solid #4A90E5;
  margin-bottom: 15px;
}
</style>
