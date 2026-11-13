<template>
  <div class="info-change-page">
    <van-nav-bar title="合作伙伴基本信息变更流程" left-arrow fixed placeholder @click-left="onCancel" />
    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <promoterInformation ref="promoterInformationRef" @changePartnerCode="changePartnerCode"
            :documentTitle="'变更'" />
          <partnerInfo ref="partnerInfoRef" v-show="formData.foundationInfoHis.partnerCode" :business="'infoChange'" />
          <cooperationQualification ref="cooperationQualificationRef" v-show="formData.foundationInfoHis.partnerCode"
            :disableFileDownload="true" />
          <supplierContactList ref="supplierContactListRef" v-show="formData.foundationInfoHis.partnerCode" />
          <bankAccountInfo ref="bankAccountInfoRef" v-show="formData.foundationInfoHis.partnerCode" />
        </van-tab>
        <van-tab title="流程信息" name="process">
          <processInfo :processInstanceId="processInstanceId" />
        </van-tab>
        <van-tab title="附件信息" name="attachment">
          <attachmentInfo :attachmentData="attachmentData" />
        </van-tab>
      </van-tabs>
    </div>

    <div v-if="currentType === 'info'" class="bottom-bar">
      <van-button block @click="onCancel">关闭</van-button>
    </div>
    <div v-if="currentType === 'add' || currentType === 'edit'" v-show="formData.foundationInfoHis.partnerCode"
      class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onSubmit">
        {{ currentType === 'edit' ? '提交' : '变更' }}
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
        <van-field v-model="rejectForm.reason" type="textarea" label="意见" placeholder="请输入意见" rows="4" maxlength="500"
          show-word-limit required />
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
        <van-field v-if="!islast" v-model="agreeForm.appointedAssigneeText" is-link readonly label="下一步审批人"
          placeholder="请选择下一步审批人" required @click="showApproverPicker = true" />
        <van-field v-model="agreeForm.reason" type="textarea" label="意见" placeholder="请输入意见" rows="4" maxlength="500"
          show-word-limit required />
        <div class="popup-actions">
          <van-button block @click="agreeDialogVisible = false">取消</van-button>
          <van-button block type="primary" :loading="submitLoading" @click="confirmAgree">确定</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 审批人选择器 -->
    <van-popup v-model:show="showApproverPicker" round position="bottom">
      <van-picker :columns="approverColumns" @confirm="onApproverConfirm" @cancel="showApproverPicker = false" />
    </van-popup>

    <!-- 提交时选择审批人弹窗 -->
    <van-popup v-model:show="showSubmitApproverPicker" round position="bottom">
      <div class="popup-content">
        <div class="popup-title">选择下一步审批人</div>
        <van-loading v-if="submitApproverLoading" class="page-loading" size="24px" vertical>加载中...</van-loading>
        <van-picker v-else :columns="submitApproverColumns" @confirm="onSubmitApproverConfirm"
          @cancel="showSubmitApproverPicker = false" />
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { showToast } from 'vant';
import promoterInformation from '@/views/pages/inDatabase/components/promoterInformation.vue';
import partnerInfo from '@/views/pages/inDatabase/components/partnerInfo.vue';
import cooperationExp from '@/views/pages/inDatabase/components/cooperationExp.vue';
import cooperationQualification from '@/views/pages/inDatabase/components/cooperationQualification.vue';
import supplierContactList from '@/views/pages/inDatabase/components/supplierContactList.vue';
import bankAccountInfo from '@/views/pages/inDatabase/components/bankAccountInfo.vue';
import processInfo from '@/views/pages/inDatabase/components/processInfo.vue';
import attachmentInfo from '@/views/pages/inDatabase/components/attachmentInfo.vue';
import DataBaseController from '@/api/dataBase/DataBaseController';
import { SysUserController } from '@/api/generated';
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

const props = defineProps({
  joinType: {
    type: String,
    default: '',
  },
});

const formData = reactive({
  // 合作伙伴基础信息
  foundationInfoHis: {
    id: 0,
    partnerCode: '', // 合作伙伴编码
    partnerName: '', //合作伙伴名称
    changeName: '', //合作伙伴名称
    joinCode: '', // 入库单据编号
    joinName: '', // 入库单据名称
    joinType: props.joinType ? props.joinType : 'URGENT_ORIENT_IN', // 入库类型
    dictBusiLevel: '', // DICT集成库级别
    partnerType: '', // 合作伙伴类别
    partnerMobile: '', // 联系电话
    coopValidityPeriod: 0, // 合作有效期
    companyAddress: '', // 公司地址
    companyEstablishmentDate: '', // 公司成立时间
    legalRepresentative: '', // 法定代表人
    busiLicenseNo: '', // 营业执照注册号
    companyType: '', // 公司类型
    businessTermStart: '', // 营业期限开始时间
    businessTermEnd: '', // 营业期限结束时间
    isListed: '', // 是否上市
    registeredCapital: 0, // 注册资本（万）
    registeredCapitalType: '', // 注册资本类型
    countryCode: '', // 国家编码
    country: '', // 国家
    provinceCode: '', // 省份编码
    province: '', // 省份
    uscc: '', // 统一社会信用代码
    taxIdentification: '', // 纳税标识
    taxpayerIdentificationCode: '', //纳税人识别号
    businessScope: '', // 经营范围
    remark: '', // 备注
    outType: '', // 退库类型
    outStartTime: '', // 退库开始时间
    outEndTime: '', // 退库结束时间
    createUserNo: '', // 创建人工号
    createUserName: '', // 创建人姓名
    createDeptNo: '', // 创建人部门编码
    createDeptName: '', // 创建人部门名称
    createTime: '', // 创建时间
    updateUserNo: '', // 更新人工号
    updateUserName: '', // 更新人姓名
    updateDeptNo: '', // 更新人部门编码
    updateDeptName: '', // 更新人部门名称
    updateTime: '', // 更新时间
    approvalEndTime: '', // 审批结束时间
    state: 0, // 状态
  },
  //合作伙伴资质列表
  qualificationList: [],
  //供应商联系人列表
  supplierContactPersonList: [],
  //银行帐号信息列表
  bankAccountInfoList: [],
  // 合作伙伴行业关系列表
  industryRelList: [],
  //合作伙伴场景关系列表
  scenceRelList: [],
  //领域场景子库列表
  fieldScenceDirectoryList: [],
  //合作伙伴合作区域列表
  regionRelList: [],
  //入库依据文件列表
  inboundFiles: [],
  //营业执照文件列表
  licenseFiles: [],
  //营业执照副本文件列表
  licenseCopyFiles: [],
  //银行账户开户许可证文件列表
  bankFiles: [],
  //合作伙伴资源审查表文件列表
  portalReviewFiles: [],
  //其他附件文件列表
  otherFiles: [],
  //指定审批人
  appointedAssignee: '',
});

const promoterInformationRef = ref('');
const partnerInfoRef = ref('');
const cooperationQualificationRef = ref('');
const supplierContactListRef = ref('');
const bankAccountInfoRef = ref('');

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
const errorText = ref('');
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
  let url = DataBaseController.infoChangeSubmit;
  if (currentType.value === 'edit') {
    url = DataBaseController.resubmitMaintenance;
    formData.processInstanceId = processInstanceId.value;
    formData.taskId = taskId.value;
    formData.businessKey = params.businessKey;
    formData.taskComment = '';
    formData.maintenanceType = 1; // 1、基本信息变更 2、行业扩展 3、区域扩展 4、续约
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
  errorText.value = '';
  const code  = formData.foundationInfoHis.partnerCode || '';
  Promise.all([
    promoterInformationRef.value.handleSubmit(),
    partnerInfoRef.value.handleSubmit().catch(val => { errorText.value = val }),
    cooperationQualificationRef.value.handleSubmit().catch(val => { errorText.value = val }),
    supplierContactListRef.value.handleSubmit().catch(val => { errorText.value = val }),
    bankAccountInfoRef.value.handleSubmit().catch(val => { errorText.value = val }),
  ])
    .then(results => {
      if (errorText.value) {
        showToast(errorText.value);
        return false;
      }

      // 入库依据start
      formData.foundationInfoHis = { ...formData.foundationInfo, ...results[0] };
      formData.inboundFiles = results[0].inboundFiles; // 入库依据文件
      formData.scenceRelList = results[0].scenceRelList; // 行业/领域/场景子库列表
      // 入库依据end

      //合作伙伴基本信息start
      formData.foundationInfoHis = { ...formData.foundationInfo, ...results[1], changeName: results[0].documentName, partnerCode: code || '' };
      formData.licenseFiles = results[1].licenseFiles; // 营业执照正本
      formData.licenseCopyFiles = results[1].licenseCopyFiles; // 营业执照副本
      formData.bankFiles = results[1].bankFiles; // 银行开户许可证
      formData.portalReviewFiles = results[1].portalReviewFiles; // 合作伙伴资源审查表
      formData.otherFiles = results[1].otherFiles; // 其它附件
      //合作伙伴基本信息end

      //合作伙伴资质start
      formData.qualificationList = [];
      results[2].forEach(item => {
        formData.qualificationList.push({
          id: item.id || undefined,
          qualificationCode: item.qualificationCode || '',
          qualificationName: item.qualificationName,
          partnerCode: item.partnerCode || '',
          certificateNumber: item.certificateNumber,
          contractValidityPeriod: item.contractValidityPeriod,
          qualificationFiles: item.qualificationFiles || [],
          createUserNo: item.createUserNo || '',
          createUserName: item.createUserName || '',
          createTime: item.createTime || '',
          updateUserNo: item.updateUserNo || '',
          updateUserName: item.updateUserName || '',
          updateTime: item.updateTime || '',
          state: item.state ?? 0,
        });
      });
      //合作伙伴资质end

      //供应商联系人列表start
      formData.supplierContactPersonList = results[3];
      //供应商联系人列表end

      //银行帐号信息列表start
      formData.bankAccountInfoList = results[4];
      //银行帐号信息列表end

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
    .catch(() => {
      if (errorText.value) {
        showToast(errorText.value);
      }
    });
};

const changePartnerCode = (code, partnerName) => {
  formData.foundationInfoHis.partnerCode = code;
  DataBaseController.searchByPartnerName({
    portalPartnerSearchByJoin: {
      partnerName,
      queryCandidate: false,
    },
  })
    .then(res => {
      const item = (res.data && res.data.foundationInfoList && res.data.foundationInfoList[0]) || {};
      const foundationInfo = item.foundationInfo || {};
      const joinList = item.joinList || [];
      const joinInfo = joinList[0] || {};

      // 行业/领域/场景子库：扁平化为 scenceRelList 兼容结构
      const scenceRelList = [];
      (joinInfo.regionRelList || []).forEach(region => {
        (region.industryList || []).forEach(industry => {
          (industry.sceneSubLibraryList || []).forEach(scence => {
            scenceRelList.push({
              industryCode: industry.industryCode,
              industryName: industry.industryName,
              fieldCode: industry.industryFieldCode,
              fieldName: industry.industryFieldName,
              scenceCode: scence.sceneSubLibraryCode,
              scenceName: scence.sceneSubLibraryName,
            });
          });
        });
      });

      // 适配后传给子组件的数据结构
      // DICT 集成库级别原本在 foundationInfo 中，但 searchByPartnerName 接口下它在 joinList 中，合并到 foundationInfo 供子组件读取
      const foundationInfoMerged = { ...foundationInfo, dictBusiLevel: joinInfo.dictBusiLevel || foundationInfo.dictBusiLevel || '' };
      const showPayload = {
        foundationInfo: foundationInfoMerged,
        qualificationList: foundationInfo.qualificationListVoList || [],
        supplierContactPersonList: foundationInfo.supplierContactPersonList || [],
        bankAccountInfoList: foundationInfo.bankAccountInfoListVoList || [],
        licenseFiles: foundationInfo.licenseFiles || [],
        licenseCopyFiles: foundationInfo.licenseCopyFiles || [],
        bankFiles: foundationInfo.bankFiles || [],
        portalReviewFiles: foundationInfo.portalReviewFiles || [],
        otherFiles: foundationInfo.otherFiles || [],
        inboundFiles: joinInfo.inboundFiles || [],
        scenceRelList,
      };

      // DICT 集成库级别取自入库单
      formData.foundationInfoHis.dictBusiLevel = joinInfo.dictBusiLevel || '';

      partnerInfoRef.value.showData(showPayload, currentType.value);
      cooperationQualificationRef.value.showData(showPayload, currentType.value);
      supplierContactListRef.value.showData(showPayload, currentType.value);
      bankAccountInfoRef.value.showData(showPayload, currentType.value);
      // 附件数据
      attachmentData.inboundFiles = showPayload.inboundFiles;
      attachmentData.licenseFiles = showPayload.licenseFiles;
      attachmentData.licenseCopyFiles = showPayload.licenseCopyFiles;
      attachmentData.bankFiles = showPayload.bankFiles;
      attachmentData.portalReviewFiles = showPayload.portalReviewFiles;
      attachmentData.otherFiles = showPayload.otherFiles;
    })
    .catch(() => { });
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
    if (formData.foundationInfoHis.dictBusiLevel === '2') {
      await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerFoundationInfoFlow`, payload);
    } else {
      await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerFoundationInfoFlow`, payload);
    }
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
  if (params.taskKey === 'Activity_0mv8mi8') {
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
    if (formData.foundationInfoHis.dictBusiLevel === '2') {
      await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerFoundationInfoFlow`, payload);
    } else {
      await post(`${API_CONTEXT}/flow/api/flowOperation/submitUserTask/PartnerFoundationInfoFlow`, payload);
    }
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

const dataInfo = ref({});
const currentType = ref('add');
const init = () => {
  DataBaseController.getPartnerHisDetail({ businessKey: params.businesskey || params.businessKey })
    .then(res => {
      dataInfo.value = res.data;
      if (res.data && res.data.foundationInfoHis) {
        formData.foundationInfoHis = {
          ...formData.foundationInfoHis,
          ...res.data.foundationInfoHis,
        };
      }
      promoterInformationRef.value.showData({
        ...res.data,
        ...params,
        documentName: res.data.foundationInfoHis?.changeName || '',
        documentCode: res.data.foundationInfoHis?.changeCode || '',
      }, currentType.value);
      partnerInfoRef.value.showData(
        { ...res.data, foundationInfo: { ...res.data.foundationInfoHis } },
        currentType.value,
      );
      cooperationQualificationRef.value.showData(res.data, currentType.value);
      supplierContactListRef.value.showData(res.data, currentType.value);
      bankAccountInfoRef.value.showData(res.data, currentType.value);

      // 附件数据
      attachmentData.inboundFiles = res.data.inboundFiles || [];
      attachmentData.licenseFiles = res.data.licenseFiles || [];
      attachmentData.licenseCopyFiles = res.data.licenseCopyFiles || [];
      attachmentData.bankFiles = res.data.bankFiles || [];
      attachmentData.portalReviewFiles = res.data.portalReviewFiles || [];
      attachmentData.otherFiles = res.data.otherFiles || [];
    })
    .catch(() => { });
};

onActivated(() => {
  formData.foundationInfoHis.partnerCode = '';
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
.info-change-page {
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
