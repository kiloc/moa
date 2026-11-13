<template>
  <div class="negative-apply-page">
    <van-nav-bar
      title="负面行为批量入库"
      left-arrow
      fixed
      placeholder
      @click-left="onCancel"
    />
    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <!-- 发起人信息 -->
          <promoterInformation
            ref="promoterInformationRef"
            @changePartnerCode="changePartnerCode"
          />

          <!-- 负面行为列表 -->
          <van-cell-group class="card-section" inset>
            <div class="card-section__header">
              <div class="card-section__title">负面行为列表</div>

            </div>

            <div v-if="tableData.length" class="negative-list">
              <div v-for="(item, index) in tableData" :key="index" class="negative-card">
                <div class="negative-card__header">
                  <span class="negative-card__index">{{ index + 1 }}</span>
                  <span class="negative-card__code">编号{{ item.negativeBehaviorCode || '-' }}</span>
                </div>
                <div class="negative-card__body">
                  <div class="negative-card__row">
                    <span class="negative-card__label">涉及项目/产品</span>
                    <span class="negative-card__value">{{ item.productContent || '-' }}</span>
                  </div>
                  <div class="negative-card__row">
                    <span class="negative-card__label">负面行为等级</span>
                    <span class="negative-card__value">{{ getName(dictMapStore.getDictMap.negativeBehaviorLevel, item.negativeBehaviorLevel) || '-' }}</span>
                  </div>
                  <div class="negative-card__row">
                    <span class="negative-card__label">负面行为内容</span>
                    <span class="negative-card__value">{{ item.negativeBehaviorContent || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <van-empty v-else description="暂无数据" />

            <!-- 编辑模式：上传附件 -->
            <template v-if="currentType === 'edit'">
              <div class="upload-section">
                <div class="upload-label">重新上传附件：</div>
                <van-uploader
                  v-model="uploadFiles"
                  :after-read="onImportClick"
                  :max-count="1"
                  accept=".xls,.xlsx"
                >
                  <van-button size="small" type="primary" plain>上传</van-button>
                </van-uploader>
                <div class="upload-tip">
                  支持上传文件格式：.xls,.xlsx
                  <span class="upload-tip__link" @click="handleExport">下载模版</span>
                </div>
              </div>
            </template>

            <!-- 导入状态提示 -->
            <div v-if="uploadStatus === 'fail'" class="status-box status-box--error">
              <span>导入失败！失败原因：点击<span class="status-box__link" @click="errorDialog = true">查看详情</span></span>
              <span class="status-box__close" @click="uploadStatus = ''">x</span>
            </div>
            <div v-if="uploadStatus === 'success'" class="status-box status-box--success">
              <span>导入成功！合作伙伴数据导入成功，导入的数据请到<span class="status-box__link" @click="goInfoQuery">我的已办（点击进入）</span>进行查看。<span class="status-box__link" @click="uploadStatus = ''">继续导入</span></span>
              <span class="status-box__close" @click="uploadStatus = ''">x</span>
            </div>
          </van-cell-group>
        </van-tab>
        <van-tab title="流程信息" name="process">
          <processInfo :processInstanceId="processInstanceId" />
        </van-tab>
      </van-tabs>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="currentType === 'auth'" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="danger" plain :loading="submitLoading" @click="onReject">驳回</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onAgree">同意</van-button>
    </div>
    <div v-if="currentType === 'edit'" class="bottom-bar">
      <van-button block @click="onCancel">关闭</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="reimport">重新提交</van-button>
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

    <!-- 错误详情弹窗 -->
    <van-popup v-model:show="errorDialog" round position="bottom" :style="{ maxHeight: '80%' }">
      <div class="popup-content">
        <div class="popup-title">错误信息</div>
        <div v-if="errorDetails.length" class="error-list">
          <div v-for="(item, index) in errorDetails" :key="index" class="error-card">
            <div class="error-card__header">
              <span class="error-card__index">第{{ item.rowNum }}行</span>
              <span class="error-card__code">{{ item.negativeBehaviorCode || '-' }}</span>
            </div>
            <div class="error-card__body">
              <div class="error-card__row">
                <span class="error-card__label">涉及项目/产品</span>
                <span class="error-card__value">{{ item.productContent || '-' }}</span>
              </div>
              <div class="error-card__row">
                <span class="error-card__label">负面行为等级</span>
                <span class="error-card__value">{{ item.negativeBehaviorLevel || '-' }}</span>
              </div>
              <div class="error-card__row">
                <span class="error-card__label">负面行为内容</span>
                <span class="error-card__value">{{ item.negativeBehaviorContent || '-' }}</span>
              </div>
              <div class="error-card__row error-card__row--error">
                <span class="error-card__label">错误信息</span>
                <span class="error-card__value">
                  <p v-for="(err, errIndex) in item.errors" :key="errIndex" class="error-text">{{ err }}</p>
                </span>
              </div>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无错误信息" />
        <div class="popup-actions">
          <van-button block @click="errorDialog = false">关闭</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 重新提交审批人选择 -->
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

<script setup lang="ts">
import { showToast } from 'vant';
import promoterInformation from '../../inDatabase/components/promoterInformation.vue';
import processInfo from '../../inDatabase/components/processInfo.vue';
import DataBaseController from '@/api/dataBase/DataBaseController';
import { SysUserController } from '@/api/generated';
import { API_CONTEXT } from '@/api/config';
import { post } from '@/common/http/request';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDictMapStore, useLoginStore } from '@/store';
import { appBack } from '@/common/utils';

const dictMapStore = useDictMapStore() as any;
const router = useRouter();
const params = router.currentRoute.value.query || {};
const taskId = ref(params.taskId as string | undefined);
const processInstanceId = ref(params.processInstanceId as string | undefined);
const islast = ref(params.taskName === '三级经理审批');
const loginStore = useLoginStore();
const userInfo = computed(() => loginStore.userInfo || {}) as any;
const submitLoading = ref(false);


const activeTab = ref('business');

const props = defineProps({
  joinType: {
    type: String,
    default: '',
  },
});

const getName = (list: any[], value: string) => {
  if (!list || !value) return '';
  const data = list.filter(item => item.id == value);
  if (data && data.length) {
    return data[0].name;
  } else {
    return '';
  }
};

// 上传状态
const uploadStatus = ref('');
const errorDialog = ref(false);
const errorDetails = ref<any[]>([]);
const tableData = ref<any[]>([]);
const uploadFiles = ref<any[]>([]);
const importFile = ref();

const formData = reactive({
  partnerId: '',
  partnerCode: '',
  partnerName: '',
});
const promoterInformationRef = ref<any>('');

const changePartnerCode = (code: string) => {
  formData.partnerCode = code;
};

const onImportClick = (file: any) => {
  importFile.value = file.file;
};

const handleExport = () => {
  DataBaseController.downloadTemplate({}, '入库批量导入模板.xlsx')
    .then(() => {})
    .catch(() => {});
};

const reimport = () => {
  if (!importFile.value) {
    showToast('请先上传文件');
    return;
  }

  let roleId = '';
  if (userInfo.value.area == 1) roleId = '2034602005636321280';
  if (userInfo.value.area == 2) roleId = '2036280205496029184';
  if (userInfo.value.area == 3) roleId = '2036280313365139456';

  submitApproverLoading.value = true;
  showSubmitApproverPicker.value = true;
  SysUserController.listUserByRoleAndDeptFlag({
    roleId,
    deptFlag: 'current',
  })
    .then((res: any) => {
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
};

const onSubmitApproverConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0];
  if (!selected) {
    showToast('请选择下一步审批人');
    return;
  }
  showSubmitApproverPicker.value = false;

  const obj = {
    importFile: importFile.value,
    resubmitDto: JSON.stringify({
      entryBatchNo: params.businessKey || params.businesskey,
      taskComment: '重新提交',
      appointedAssignee: selected.value,
    }),
  };
  uploadStatus.value = '';
  submitLoading.value = true;
  DataBaseController.portalNegativeBehaviorImport(obj)
    .then((res: any) => {
      submitLoading.value = false;
      if (res.data.failCount) {
        errorDetails.value = res.data.errorDetails;
        uploadStatus.value = 'fail';
      } else {
        // router.back();
        appBack();
      }
    })
    .catch(() => {
      submitLoading.value = false;
    });
};

// 重新提交审批人
const showSubmitApproverPicker = ref(false);
const submitApproverLoading = ref(false);
const submitApproverList = ref<any[]>([]);
const submitApproverColumns = computed(() =>
  submitApproverList.value.map(item => ({
    text: item.showName,
    value: item.loginName,
  })),
);

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

// 审批人 Picker 列
const nextApproverList = ref<any[]>([]);
const approverColumns = computed(() =>
  nextApproverList.value.map(item => ({
    text: item.showName,
    value: item.loginName,
  })),
);

const onApproverConfirm = ({ selectedOptions }: any) => {
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
      taskVariableData: {
        appointedAssignee: '',
      },
    };
    submitLoading.value = true;
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/NegativeBehaviorBatchFlow`, payload);
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
  if (params.taskKey === 'Activity_0l22hdq') {
    if (userInfo.value.area == 1) obj.roleId = '2034602005636321280';
    if (userInfo.value.area == 2) obj.roleId = '2036280205496029184';
    if (userInfo.value.area == 3) obj.roleId = '2036280313365139456';
  }

  SysUserController.listUserByRoleAndDeptFlag(obj)
    .then((res: any) => {
      nextApproverList.value = [];
      if (res.data) {
        nextApproverList.value = Array.isArray(res.data) ? res.data : res.data.dataList;
      }
    })
    .catch(e => {
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/NegativeBehaviorBatchFlow`, payload);
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

// 跳转我的已办
const goInfoQuery = () => {
  router.push({ name: 'formMyDone' });
};

const currentType = ref('auth');
const init = () => {
  DataBaseController.queryByBatchNo({ entryBatchNo: params.businessKey })
    .then((res: any) => {
      tableData.value = res.data.dataList || [];
      promoterInformationRef.value.showData(
        {
          showName: params.showName,
          documentCode: params.businessKey || '',
          documentName: res.data.negativeBehaviorName || '',
          processInstanceInitiatorDeptName: params.processInstanceInitiatorDeptName,
          processInstanceInitiatorMobile: params.processInstanceInitiatorMobile,
          processInstanceInitiatorCityName: params.processInstanceInitiatorCityName,
        },
        currentType.value,
      );
    })
    .catch(() => {});
};



onMounted(() => {
  console.log(params, '流程进来的');
  if (params.businessKey || params.businesskey) {
    if (params.taskName === '部门领导审批' || params.taskName === '省本部DICT管理员审批') {
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
.negative-apply-page {
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

.card-section {
  margin: 12px 0;

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

// 负面行为卡片列表
.negative-list {
  padding: 0 16px 8px;
}

.negative-card {
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
  }

  &__index {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #4A90E5;
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__code {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #323233;
    margin-left: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__body {
    padding: 0 12px 10px 42px;
  }

  &__row {
    display: flex;
    align-items: flex-start;
    padding: 3px 0;
    font-size: 13px;
  }

  &__label {
    color: #969799;
    width: 80px;
    flex-shrink: 0;
  }

  &__value {
    color: #323233;
    flex: 1;
    word-break: break-all;
  }
}

// 上传区域
.upload-section {
  padding: 12px 16px;

  .upload-label {
    font-size: 14px;
    color: #323233;
    margin-bottom: 8px;
  }

  .upload-tip {
    font-size: 12px;
    color: #969799;
    margin-top: 4px;

    &__link {
      color: #4A90E5;
    }
  }
}

// 状态提示
.status-box {
  position: relative;
  padding: 12px 32px 12px 12px;
  margin: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;

  &--error {
    border: 1px solid #ff4b52;
    background: #ff000012;
    color: #323233;
  }

  &--success {
    border: 1px solid #25e610;
    background: rgb(0 255 22 / 7%);
    color: #323233;
  }

  &__link {
    color: #4A90E5;
  }

  &__close {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
  }
}

// 底部操作栏
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

// 弹窗
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

.page-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

// 错误详情卡片
.error-list {
  max-height: 50vh;
  overflow-y: auto;
}

.error-card {
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
  }

  &__index {
    font-size: 13px;
    color: #4A90E5;
    font-weight: 500;
  }

  &__code {
    font-size: 13px;
    color: #323233;
    margin-left: 8px;
  }

  &__body {
    padding: 0 12px 10px;
  }

  &__row {
    display: flex;
    align-items: flex-start;
    padding: 3px 0;
    font-size: 13px;

    &--error {
      .error-card__value {
        color: #ee0a24;
      }
    }
  }

  &__label {
    color: #969799;
    width: 80px;
    flex-shrink: 0;
  }

  &__value {
    color: #323233;
    flex: 1;
    word-break: break-all;
  }
}

.error-text {
  color: #f56c6c;
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
}
</style>
