<template>
  <div class="batch-apply-page">
    <van-nav-bar
      title="批量入库详情"
      left-arrow
      fixed
      placeholder
      @click-left="onCancel"
    />
    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <!-- 发起人信息 -->
          <promoterInformation ref="promoterInformationRef" @changePartnerCode="changePartnerCode" />

          <!-- 合作伙伴列表 -->
          <van-cell-group class="card-section" inset>
            <div class="card-section__title">
              合作伙伴列表

            </div>
            <div v-if="tableData.length" class="partner-list">
              <div v-for="(item, index) in tableData" :key="index" class="partner-card">
                <div class="partner-card__header">
                  <span class="partner-card__index">{{ index + 1 }}</span>
                  <span class="partner-card__name">{{ item.partnerName || '-' }}</span>
                </div>
                <div class="partner-card__body">
                  <div class="partner-row">
                    <span class="partner-row__label">合作伙伴名称</span>
                    <span class="partner-row__value">{{ item.partnerName || '-' }}</span>
                  </div>
                  <div class="partner-row">
                    <span class="partner-row__label">统一社会信用代码</span>
                    <span class="partner-row__value">{{ item.uscc || '-' }}</span>
                  </div>
                  <div class="partner-row">
                    <span class="partner-row__label">所属行业</span>
                    <span class="partner-row__value">{{ item.industryCode || '-' }}</span>
                  </div>
                  <div class="partner-row">
                    <span class="partner-row__label">入库领域</span>
                    <span class="partner-row__value">{{ item.fieldCode || '-' }}</span>
                  </div>
                  <div class="partner-row">
                    <span class="partner-row__label">场景子库</span>
                    <span class="partner-row__value">{{ item.scenceCode || '-' }}</span>
                  </div>
                  <div class="partner-row">
                    <span class="partner-row__label">合作区域</span>
                    <span class="partner-row__value">{{ item.regionName || '-' }}</span>
                  </div>
                  <div class="partner-row">
                    <span class="partner-row__label">入库形式</span>
                    <span class="partner-row__value">{{ item.joinType || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="partner-empty">暂无数据</div>

            <!-- 编辑模式：重新上传附件 -->
            <div v-if="currentType === 'edit'" class="upload-section">
              <div class="upload-section__title">重新上传附件</div>
              <van-uploader
                v-model="fileList"
                :max-count="1"
                accept=".xls,.xlsx"
                :after-read="onFileRead"
                @delete="onFileDelete"
              >
                <van-button size="small" type="primary" plain>选择文件</van-button>
              </van-uploader>
              <div class="upload-section__tip">
                支持上传文件格式：.xls, .xlsx
                <span class="upload-section__link" @click="handleExport">下载模版</span>
              </div>
            </div>
          </van-cell-group>
        </van-tab>
        <van-tab title="流程信息" name="process">
          <processInfo :processInstanceId="processInstanceId" />
        </van-tab>
      </van-tabs>
    </div>

    <!-- 底部按钮 -->
    <div v-if="currentType === 'auth'" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="danger" plain :loading="submitLoading" @click="onReject">驳回</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onAgree">同意</van-button>
    </div>
    <div v-if="currentType === 'edit'" class="bottom-bar">
      <van-button block @click="onCancel">关闭</van-button>
      <van-button block type="danger" :loading="submitLoading" @click="cancelBatchImport">撤销</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="reimport">重新提交</van-button>
    </div>
    <div v-if="currentType === 'info'" class="bottom-bar">
      <van-button block @click="onCancel">返回</van-button>
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

    <!-- 重新提交-选择审批人 -->
    <van-popup v-model:show="showReimportPicker" round position="bottom" :style="{ maxHeight: '60%' }">
      <div class="popup-content">
        <div class="popup-title">选择下一步审批人</div>
        <van-loading v-if="reimportApproverLoading" class="page-loading" size="24px" vertical>加载中...</van-loading>
        <van-picker
          v-else
          :columns="reimportApproverColumns"
          @confirm="onReimportApproverConfirm"
          @cancel="showReimportPicker = false"
        />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { showToast, showConfirmDialog } from 'vant';
import promoterInformation from '../../inDatabase/components/promoterInformation.vue';
import processInfo from '../../inDatabase/components/processInfo.vue';
import DataBaseController from '@/api/dataBase/DataBaseController';
import { SysUserController } from '@/api/generated';
import { API_CONTEXT } from '@/api/config';
import { post } from '@/common/http/request';
import { onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '@/store';
import { appBack } from '@/common/utils';

const router = useRouter();
const loginStore = useLoginStore();
const userInfo = computed(() => loginStore.userInfo || {});
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

const currentType = ref('auth');
const submitLoading = ref(false);
const activeTab = ref('business');

const tableData = ref([]);
const promoterInformationRef = ref('');

// 文件上传相关
const fileList = ref([]);
const importFile = ref(null);
const onFileRead = (file: any) => {
  importFile.value = file.file;
};
const onFileDelete = () => {
  importFile.value = null;
};

const changePartnerCode = (code: string) => {};

// 下载模版
const handleExport = () => {
  DataBaseController.downloadTemplate({}, '入库批量导入模板.xlsx')
    .then(() => {})
    .catch(() => {});
};

// 撤销
const cancelBatchImport = () => {
  showConfirmDialog({
    title: '提示',
    message: '是否撤销',
  })
    .then(() => {
      const obj = {
        joinCode: params.businessKey || params.businesskey,
        processDefinitionld: params.processDefinitionId,
      };
      DataBaseController.cancelBatchImport(obj)
        .then(() => {
          // router.back();
          appBack();
        })
        .catch(() => {});
    })
    .catch(() => {});
};

// 重新提交
const showReimportPicker = ref(false);
const reimportApproverLoading = ref(false);
const reimportApproverList = ref([]);
const reimportApproverColumns = computed(() =>
  reimportApproverList.value.map((item: any) => ({
    text: item.showName,
    value: item.loginName,
  })),
);

const reimport = () => {
  if (!importFile.value) {
    showToast('请先上传文件');
    return;
  }
  // 加载审批人
  reimportApproverLoading.value = true;
  showReimportPicker.value = true;
  SysUserController.listUserByRoleAndDeptFlag({
    roleId: '2036281370577211392',
    deptFlag: 'current',
  })
    .then((res: any) => {
      reimportApproverList.value = [];
      if (res.data) {
        reimportApproverList.value = Array.isArray(res.data) ? res.data : res.data.dataList;
      }
      reimportApproverLoading.value = false;
    })
    .catch(() => {
      reimportApproverLoading.value = false;
      showToast('加载审批人列表失败');
    });
};

const onReimportApproverConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0];
  if (!selected) {
    showToast('请选择下一步审批人');
    return;
  }
  showReimportPicker.value = false;
  submitLoading.value = true;
  const obj = {
    importFile: importFile.value,
    resubmitDto: JSON.stringify({
      joinCode: params.businessKey || params.businesskey,
      processInstanceId: params.processInstanceId,
      taskId: params.taskId,
      taskComment: '重新提交',
      appointedAssignee: selected.value,
    }),
  };
  DataBaseController.portalPartnerImportReimport(obj)
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

// 对话框
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

// 审批人列表
const nextApproverList = ref([]);
const approverColumns = computed(() =>
  nextApproverList.value.map((item: any) => ({
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

// 加载下一步审批人
const loadNextApproverList = () => {
  let url: any = SysUserController.listUserByRoleAndDeptFlag;
  let obj: any = {
    roleId: '2036281370577211392',
    deptFlag: 'current',
  };
  if (params.taskKey === 'Activity_0lodwho') {
    url = SysUserController.listUserRole;
    obj = {
      pageParam: { pageNum: 1, pageSize: 10 },
      roleId: '2034599001503830016',
      sysUserDtoFilter: {},
    };
  }
  url(obj)
    .then((res: any) => {
      nextApproverList.value = [];
      if (res.data) {
        nextApproverList.value = Array.isArray(res.data) ? res.data : res.data.dataList;
      }
    })
    .catch(() => {
      showToast('加载审批人列表失败');
    });
};

// 驳回
const onReject = () => {
  rejectForm.reason = '';
  rejectDialogVisible.value = true;
};

const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    showToast('请输入意见');
    return;
  }
  try {
    submitLoading.value = true;
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerBatchJoinFlow`, payload);
    submitLoading.value = false;
    showToast('已驳回');
    rejectDialogVisible.value = false;
    // router.back();
    appBack();
  } catch (e) {
    submitLoading.value = false;
    // showToast('操作失败');
  }
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
    submitLoading.value = true;
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
    await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerBatchJoinFlow`, payload);
    submitLoading.value = false;
    showToast('审批通过');
    agreeDialogVisible.value = false;
    // router.back();
    appBack();
  } catch (e) {
    submitLoading.value = false;
    // showToast('操作失败');
  }
};

// 取消
const onCancel = () => {
  // router.back();
  appBack();
};

// 初始化
const init = () => {
  DataBaseController.listByJoinCode({ joinCode: params.businessKey })
    .then((res: any) => {
      tableData.value = res.data || [];
      console.log({
        taskId: params.taskId,
        showName: params.showName,
        processInstanceInitiatorDeptName: params.processInstanceInitiatorDeptName,
        processInstanceInitiatorMobile: params.processInstanceInitiatorMobile,
        processInstanceInitiatorCityName: params.processInstanceInitiatorCityName,
      },)
      promoterInformationRef.value.showData(
        {
          taskId: params.taskId,
          showName: params.showName,
          documentCode: params.businessKey,
          documentName: tableData.value[0].joinName || '',
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
.batch-apply-page {
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
  margin: 12px 0 !important;

  &__title {
    padding: 14px 16px 6px;
    font-size: 15px;
    font-weight: 600;
    color: #323233;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.partner-list {
  padding: 0 12px;
}

.partner-card {
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #ebedf0;
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

  &__name {
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
    padding: 10px 12px;
  }
}

.partner-row {
  display: flex;
  padding: 4px 0;
  font-size: 13px;

  &__label {
    color: #969799;
    width: 110px;
    flex-shrink: 0;
  }

  &__value {
    color: #323233;
    flex: 1;
    word-break: break-all;
  }
}

.partner-empty {
  font-size: 13px;
  color: #969799;
  text-align: center;
  padding: 12px 0;
}

.upload-section {
  padding: 12px 16px;
  border-top: 1px solid #ebedf0;

  &__title {
    font-size: 14px;
    color: #323233;
    margin-bottom: 8px;
  }

  &__tip {
    font-size: 12px;
    color: #969799;
    margin-top: 8px;
  }

  &__link {
    color: #4A90E5;
    margin-left: 4px;
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
