<template>
  <div class="renewal-page">
    <van-nav-bar
      title="合作伙伴续约流程"
      left-arrow
      fixed
      placeholder
      @click-left="onCancel"
    />
    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <promoterInformation
            ref="promoterInformationRef"
            @changePartnerCode="changePartnerCode"
            :documentTitle="'续约'"
          />
          <partnerInfo ref="partnerInfoRef" v-show="formData.partnerCode" :business="''" />
          <renewal ref="renewalRef" v-show="formData.partnerCode" />
        </van-tab>
        <van-tab title="流程信息" name="process">
          <processInfo :processInstanceId="processInstanceId" />
        </van-tab>
        <van-tab title="附件信息" name="attachment">
          <attachmentInfo :attachmentData="attachmentData" :isShow="false" />
        </van-tab>
      </van-tabs>
    </div>

    <div v-if="currentType === 'info'" class="bottom-bar">
      <van-button block @click="onCancel">关闭</van-button>
    </div>
    <div v-if="currentType === 'add' || currentType === 'edit'" v-show="formData.partnerCode" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onSubmit">
        {{ currentType === 'edit' ? '提交' : '续约' }}
      </van-button>
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
import promoterInformation from '@/views/pages/inDatabase/components/promoterInformation.vue';
import partnerInfo from '@/views/pages/inDatabase/components/partnerInfo.vue';
import renewal from '@/views/pages/inDatabase/components/renewal.vue';
import processInfo from '@/views/pages/inDatabase/components/processInfo.vue';
import attachmentInfo from '@/views/pages/inDatabase/components/attachmentInfo.vue';
import DataBaseController from '@/api/dataBase/DataBaseController';
import { SysUserController } from '@/api/generated'
import { API_CONTEXT } from '@/api/config';
import { post } from '@/common/http/request';
import { appBack } from '@/common/utils';
import { onActivated, onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const params = router.currentRoute.value.query || {};
const taskId = ref(params.taskId);
const processInstanceId = ref(params.processInstanceId);
const islast = ref(params.taskName === '省本部DICT管理员审批');
console.log(params, 'params,');

const props = defineProps({
  joinType: {
    type: String,
    default: '',
  },
});

const formData = reactive({
  partnerCode: '',
  renewalInfoHisDtoList: [],
  inboundFiles: [],
  appointedAssignee: '',
  renewalName: '',
});

const promoterInformationRef = ref('');
const partnerInfoRef = ref('');
const renewalRef = ref('');

// Tab 相关
const activeTab = ref('business');
const attachmentData = reactive({
  inboundFiles: [],
  licenseFiles: [],
  licenseCopyFiles: [],
  bankFiles: [],
  portalReviewFiles: [],
  otherFiles: [],
});

const submitLoading = ref(false);
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
  let url = DataBaseController.renewalSubmit;
  if (currentType.value === 'edit') {
    url = DataBaseController.resubmitMaintenance;
    formData.processInstanceId = processInstanceId.value;
    formData.taskId = taskId.value;
    formData.businessKey = params.businessKey;
    formData.taskComment = '';
    formData.maintenanceType = 4; // 1、基本信息变更 2、行业扩展 3、区域扩展 4、续约
  }
  url(formData)
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

const onSubmit = () => {
  Promise.all([
    promoterInformationRef.value.handleSubmit(),
    partnerInfoRef.value.handleSubmit(),
    renewalRef.value.handleSubmit(),
  ])
    .then(results => {
      formData.renewalName = results[0].documentName;
      formData.foundationInfoHis = results[1];
      formData.renewalInfoHisDtoList = results[2].renewalInfoHisDtoList;
      formData.inboundFiles = results[2].inboundFiles;

      // 选择下一步审批人
      submitApproverLoading.value = true;
      showSubmitApproverPicker.value = true;
      SysUserController.listUserByRoleAndDeptFlag({
        roleId: '2036281370577211392',
        deptFlag: 'current',
      })
        .then(res => {
          submitApproverList.value = [];
          if (res.data) {
            submitApproverList.value = Array.isArray(res.data) ? res.data : res.data.dataList;
          }
          submitApproverLoading.value = false;
        })
        .catch(() => {
          submitApproverLoading.value = false;
          showToast('加载审批人列表失败');
        });
    })
    .catch(error => {
      console.log(error);
    });
};

const changePartnerCode = code => {
  formData.partnerCode = code;
  DataBaseController.getPartnerDetail({ partnerCode: code })
    .then(res => {
      partnerInfoRef.value.showData({ ...res.data, hideFile: true }, 'auth');
      renewalRef.value.showData({ industryDetailsInfoList: res.data.industryDetailsInfoList }, currentType.value);
      // 附件数据
      attachmentData.inboundFiles = res.data.inboundFiles || [];
      attachmentData.licenseFiles = res.data.licenseFiles || [];
      attachmentData.licenseCopyFiles = res.data.licenseCopyFiles || [];
      attachmentData.bankFiles = res.data.bankFiles || [];
      attachmentData.portalReviewFiles = res.data.portalReviewFiles || [];
      attachmentData.otherFiles = res.data.otherFiles || [];
    })
    .catch(() => {});
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
    let lastPer = {};
    if (props.flowTaskCommentList && props.flowTaskCommentList.length) {
      lastPer = props.flowTaskCommentList[props.flowTaskCommentList.length - 1];
    }
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerRenewalFlow`, payload);
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
  let url = SysUserController.listUserByRoleAndDeptFlag;
  let obj = {
    roleId: '2036281370577211392',
    deptFlag: 'current',
  };
  if (params.taskKey === 'Activity_0ut8szu') { // 省本部DICT管理员审批
    url = SysUserController.listUserRole;
    obj = {
      pageParam: { pageNum: 1, pageSize: 10 },
      roleId: '2034599001503830016',
      sysUserDtoFilter: {},
    };
  }
  url(obj)
    .then(res => {
      nextApproverList.value = [];
      if (res.data) {
        nextApproverList.value = Array.isArray(res.data) ? res.data : res.data.dataList;
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerRenewalFlow`, payload);
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
  DataBaseController.getPartnerOtherDetail({
    businessKey: params.businesskey || params.businessKey,
  })
    .then(res => {
      if (res.data && res.data.foundationInfo) {
        formData.partnerCode = res.data.foundationInfo.partnerCode;
      }
      promoterInformationRef.value.showData({
        ...res.data,
        ...params,
        documentName: res.data?.renewalName || '',
        documentCode: params.businesskey || params.businessKey,
      }, currentType.value);
      partnerInfoRef.value.showData(
        { ...res.data, foundationInfo: { ...res.data.foundationInfo }, hideFile: true },
        'auth',
      );
      renewalRef.value.showData(res.data, currentType.value);

      // 附件数据
      attachmentData.inboundFiles = res.data.inboundFiles || [];
      attachmentData.licenseFiles = res.data.licenseFiles || [];
      attachmentData.licenseCopyFiles = res.data.licenseCopyFiles || [];
      attachmentData.bankFiles = res.data.bankFiles || [];
      attachmentData.portalReviewFiles = res.data.portalReviewFiles || [];
      attachmentData.otherFiles = res.data.otherFiles || [];
    })
    .catch(() => {});
};

onActivated(() => {
  formData.partnerCode = '';
});

onMounted(() => {
  console.log(params, '流程进来的');
  if (params.businessKey || params.businesskey) {
    if (
      params.taskName === '三级经理审批' ||
      params.taskName === '采购经理审批' ||
      params.taskName === '分公司分管领导审批' ||
      params.taskName === '分公司总经理审批' ||
      params.taskName === '部门领导审批' ||
      params.taskName === '省本部DICT管理员审批'
    ) {
      currentType.value = 'auth';
    }
    if (params.isInfo === 'true') {
      currentType.value = 'info';
    }
    if (params.taskName === '发起申请') {
      currentType.value = 'edit';
    }
    init();
  }
});
</script>

<style scoped lang="scss">
.renewal-page {
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
    padding: 0 12px;
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
