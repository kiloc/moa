<template>
  <div class="out-database-page">
    <van-nav-bar
      title="退库详情"
      left-arrow
      fixed
      placeholder
      @click-left="onCancel"
    />
    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <promoterInformation ref="promoterInformationRef" @changePartnerCode="changePartnerCode" :documentTitle="'退库'"></promoterInformation>
          <partnerInfo v-show="formData.partnerCode" ref="partnerInfoRef" :business="''"></partnerInfo>
          <outDataBaseReq v-show="formData.partnerCode" ref="outDataBaseReqRef"></outDataBaseReq>
        </van-tab>
        <van-tab title="流程信息" name="process">
          <processInfo :processInstanceId="processInstanceId" />
        </van-tab>
        <van-tab title="附件信息" name="attachment">
          <div class="attachment-section">
            <div class="attachment-group">
              <div class="attachment-group__title">退库申请附件</div>
              <div class="attachment-group__list">
                <div v-for="f in attachmentData.outStorageFiles" :key="f.fileName" class="attachment-item" @click="downloadAppFile(f.name || f.originalName, 'outStorageFiles', f.filename||f.fileName)">
                  <van-icon name="description" class="attachment-item__icon" />
                  <span class="attachment-item__name">{{ f.originalName || f.fileName }}</span>
                </div>
                <div v-if="!attachmentData.outStorageFiles.length" class="attachment-empty">暂无文件</div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <div v-if="currentType === 'info'" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
    </div>
    <div v-if="currentType === 'add' || currentType === 'edit'" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onSubmit">{{ currentType === 'edit' ? '提交' : '退库' }}</van-button>
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
import promoterInformation from '../../inDatabase/components/promoterInformation.vue';
import partnerInfo from '../../inDatabase/components/partnerInfo.vue';
import outDataBaseReq from '../../inDatabase/components/outDataBaseReq.vue';
import processInfo from '../../inDatabase/components/processInfo.vue';
import DataBaseController from '@/api/dataBase/DataBaseController';
import { SysUserController } from '@/api/generated';
import { API_CONTEXT } from '@/api/config';
import { post } from '@/common/http/request';
import { downloadAppFile, appBack } from '@/common/utils';
import { onMounted, reactive, onActivated, computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const params = router.currentRoute.value.query || {};
const taskId = ref(params.taskId);
const processInstanceId = ref(params.processInstanceId);
const islast = ref(params.taskName === '省本部DICT管理员审批');

const props = defineProps({
  joinType: {
    type: String,
    default: '',
  },
});

const formData = reactive({
  partnerId: '',
  partnerCode: '',
  partnerName: '',
  outType: '',
  outStartTime: '',
  outEndTime: '',
  outRemark: '',
  outName: '',
  outStorageFiles: [],
});
const formDataCopy = JSON.parse(JSON.stringify(formData));
const promoterInformationRef = ref('');
const partnerInfoRef = ref('');
const outDataBaseReqRef = ref('');

// Tab 相关
const activeTab = ref('business');
const attachmentData = reactive({
  outStorageFiles: [],
  licenseFiles: [],
  licenseCopyFiles: [],
  bankFiles: [],
  portalReviewFiles: [],
  otherFiles: [],
});

// 下载附件

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
  let url = DataBaseController.submitOutStorage;
  if (currentType.value === 'edit') {
    url = DataBaseController.resubmitOutStorage;
    formData.processInstanceId = processInstanceId.value;
    formData.taskId = taskId.value;
    formData.batchCode = params.businesskey || params.businessKey;
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
    outDataBaseReqRef.value.handleSubmit(),
  ]).then(results => {
    formData.partnerId = results[0].partnerId;
    formData.partnerCode = results[0].partnerCode;
    formData.partnerName = results[0].partnerName;
    formData.outName = results[0].documentName;
    formData.outType = results[1].outType;
    formData.outStartTime = results[1].outStartTime;
    formData.outEndTime = results[1].outEndTime;
    formData.outRemark = results[1].outRemark;
    formData.industryDetailIds = results[1].industryDetailIds;
    formData.outStorageFiles = results[1].outStorageFiles;

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
  }).catch(() => {});
};

const changePartnerCode = (code) => {
  formData.partnerCode = code;
  DataBaseController.partnerOutStorageDetail({ partnerCode: code }).then(res => {
    setTimeout(() => {
      partnerInfoRef.value.showData({ foundationInfo: { ...res.data }, hideFile: true }, 'auth');
      outDataBaseReqRef.value.showData(res.data, currentType.value);
      // 附件数据
      attachmentData.outStorageFiles = res.data.outStorageFiles || [];
      attachmentData.licenseFiles = res.data.licenseFiles || [];
      attachmentData.licenseCopyFiles = res.data.licenseCopyFiles || [];
      attachmentData.bankFiles = res.data.bankFiles || [];
      attachmentData.portalReviewFiles = res.data.portalReviewFiles || [];
      attachmentData.otherFiles = res.data.otherFiles || [];
    }, 500);
  }).catch(() => {});
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerReturnFlow`, payload);
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

const nextApproverList = ref([]);
// 加载下一步审批人列表
const loadNextApproverList = () => {
  let url = SysUserController.listUserByRoleAndDeptFlag;
  let obj = {
    roleId: '2036281370577211392',
    deptFlag: 'current',
  };
  if (params.taskKey === 'Activity_1cfm77x') {
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerReturnFlow`, payload);
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
  DataBaseController.getIndustryReturnByBatchCode({ batchCode: params.businesskey || params.businessKey }).then(res => {
    formData.partnerCode = res.data.partnerInfo.partnerCode;
    promoterInformationRef.value.showData({
      ...res.data.partnerInfo,
      ...params,
      documentName: res.data.outName || '',
      documentCode: res.data.outCode || '',
    }, currentType.value);
    partnerInfoRef.value.showData({ foundationInfo: res.data.partnerInfo, hideFile: true }, 'auth');
    outDataBaseReqRef.value.showData(res.data, currentType.value);

    // 附件数据
    attachmentData.outStorageFiles = res.data.outStorageFiles || [];
    attachmentData.licenseFiles = res.data.licenseFiles || [];
    attachmentData.licenseCopyFiles = res.data.licenseCopyFiles || [];
    attachmentData.bankFiles = res.data.bankFiles || [];
    attachmentData.portalReviewFiles = res.data.portalReviewFiles || [];
    attachmentData.otherFiles = res.data.otherFiles || [];
  }).catch(() => {});
};

onActivated(() => {
  if (formDataCopy) {
    for (let key in formDataCopy) {
      formData[key] = formDataCopy[key];
    }
  }
});

onMounted(() => {
  console.log(params, '流程进来的');
  if (params.businesskey || params.businessKey) {
    if (
      params.taskName === '三级经理审批' ||
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
.out-database-page {
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

.attachment-section {
  padding: 12px;
  margin: 12px 0;
  background: #fff;
  border-radius: 8px;
}

.attachment-group {
  margin-bottom: 16px;

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    padding: 10px 0 6px;
  }

  &__list {
    background: #f7f8fa;
    border-radius: 8px;
    padding: 4px 12px;
  }
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebedf0;

  &:last-child {
    border-bottom: none;
  }

  &__icon {
    font-size: 20px;
    color: #4A90E5;
    margin-right: 8px;
    flex-shrink: 0;
  }

  &__name {
    font-size: 14px;
    color: #4A90E5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.attachment-empty {
  font-size: 13px;
  color: #969799;
  padding: 10px 0;
  text-align: center;
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
