<template>
  <div class="object-database-page">
    <van-nav-bar title="合作伙伴详情" left-arrow fixed placeholder @click-left="onCancel" />
    <div class="content-wrapper">
      <van-tabs v-model:active="activeTab" sticky offset-top="46" class="detail-tabs" type="card">
        <van-tab title="业务信息" name="business">
          <dataBaseAccording ref="dataBaseAccordingRef" :joinType="props.joinType"></dataBaseAccording>
          <partnerInfo ref="partnerInfoRef" :business="'inDatabase'"></partnerInfo>
          <cooperationQualification ref="cooperationQualificationRef"></cooperationQualification>
          <supplierContactList ref="supplierContactListRef"></supplierContactList>
          <bankAccountInfo ref="bankAccountInfoRef"></bankAccountInfo>
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
      <van-button block @click="onCancel">取消</van-button>
    </div>
    <!-- <div v-if="currentType === 'add' || currentType === 'edit'" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onSubmit">
        {{ currentType === 'edit' ? '提交' : '入库' }}
      </van-button>
    </div> -->
    <div v-if="currentType === 'auth'" class="bottom-bar">
      <van-button block @click="onCancel">取消</van-button>
      <van-button block type="danger" plain :loading="submitLoading" @click="onReject">驳回</van-button>
      <van-button block type="primary" :loading="submitLoading" @click="onAgree">同意</van-button>
      <!-- || params.taskKey === 'Activity_0xupre5' -->
      <!-- <van-button
        v-if="params.taskKey === 'Activity_00ymwy5' || params.taskKey === 'Activity_0j7kqsk'"
        block
        type="primary"
        :loading="submitLoading"
        @click="transfer"
      >
        转办
      </van-button> -->
    </div>

    <van-popup v-model:show="rejectDialogVisible" round position="bottom" :style="{ maxHeight: '70%' }">
      <div class="popup-content">
        <div class="popup-title">驳回</div>
        <van-field v-model="rejectForm.reason" type="textarea" label="意见" placeholder="请输入意见" rows="4" maxlength="500"
          show-word-limit required />
        <div class="popup-actions">
          <van-button block :loading="submitLoading" @click="rejectDialogVisible = false">取消</van-button>
          <van-button block type="danger" :loading="submitLoading" @click="confirmReject">确定</van-button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="agreeDialogVisible" round position="bottom" :style="{ maxHeight: '70%' }">
      <div class="popup-content">
        <div class="popup-title">{{ operationType === 'transfer' ? '转办' : '同意' }}</div>
        <van-field v-if="!islast" v-model="agreeForm.appointedAssigneeText" is-link readonly label="下一步审批人"
          placeholder="请选择下一步审批人" required @click="showApproverPicker = true" />
        <van-field v-model="agreeForm.reason" type="textarea" label="意见" placeholder="请输入意见" rows="4" maxlength="500"
          show-word-limit required />
        <div class="popup-actions">
          <van-button block :loading="submitLoading" @click="agreeDialogVisible = false">取消</van-button>
          <van-button block type="primary" :loading="submitLoading" @click="confirmAgree">确定</van-button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showApproverPicker" round position="bottom">
      <van-picker :columns="approverColumns" @confirm="onApproverConfirm" @cancel="showApproverPicker = false" />
    </van-popup>

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
import dataBaseAccording from '../components/dataBaseAccording.vue';
import partnerInfo from '../components/partnerInfo.vue';
import cooperationExp from '../components/cooperationExp.vue';
import cooperationQualification from '../components/cooperationQualification.vue';
import supplierContactList from '../components/supplierContactList.vue';
import bankAccountInfo from '../components/bankAccountInfo.vue';
import processInfo from '../components/processInfo.vue';
import attachmentInfo from '../components/attachmentInfo.vue';
import DataBaseController from '@/api/dataBase/DataBaseController';
import PartnerInfoController from '@/api/partnerInfo/PartnerInfoController';
import { SysUserController } from '@/api/generated';
import { API_CONTEXT } from '@/api/config';
import { post } from '@/common/http/request';
import { appBack } from "@/common/utils";
import { onMounted, reactive, onActivated, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '@/store';

const router = useRouter();
const params = router.currentRoute.value.query || {};
const taskId = ref(params.taskId);
const processInstanceId = ref(params.processInstanceId);
const islast = ref(params.taskName === '省本部DICT管理员审批');

const props = defineProps({
  joinType: {
    type: String,
    default: 'URGENT_ORIENT_IN',
  },
});
const loginStore = useLoginStore();
const userInfo = computed(() => loginStore.userInfo || {})
const formData = reactive({
  // 合作伙伴基础信息
  foundationInfo: {
    id: 0,
    partnerCode: '', // 合作伙伴编码
    taxCreditLevel: '', // 合作伙伴编码
    partnerName: '', //合作伙伴名称
    joinCode: '', // 入库单据编号
    joinName: '', // 入库单据名称
    joinType: props.joinType ? props.joinType : 'URGENT_ORIENT_IN', // 入库类型（URGENT_ORIENT_IN、紧急项目入库、DIRECT_IN、直接入库 PURCHASE_IN、采购入库）
    dictBusiLevel: '', // DICT集成库级别 （1、一集库 2、二集库 3、三集库）。
    partnerType: '', // 合作伙伴类别（1、外部 2、内部）。
    partnerMobile: '', // 联系电话
    coopValidityPeriod: 0, // 合作有效期 （年）。
    companyAddress: '', // 公司地址
    companyEstablishmentDate: '', // 公司成立时间。
    legalRepresentative: '', // 法定代表人
    busiLicenseNo: '', // 营业执照注册号
    companyType: '', // 公司类型（1、股份有效公司 2、有限责任公司）
    businessTermStart: '', // 营业期限开始时间
    businessTermEnd: '', // 营业期限结束时间
    isListed: '', // 公司类型（1、是 2、否）
    registeredCapital: 0, // 注册资本（万）
    registeredCapitalType: '', // 注册资本类型（1、人民币）
    countryCode: '', // 国家编码
    country: '', // 国家
    provinceCode: '', // 省份编码
    province: '', // 省份
    uscc: '', // 统一社会信用代码。
    taxIdentification: '', // 纳税标识（1、企业或组织）
    taxpayerIdentificationCode: '', //纳税人识别号
    businessScope: '', // 经营范围
    remark: '', // 备注
    outType: '', // 退库类型（1、永久退库 2、指定时间）
    outStartTime: '', // 退库开始时间
    outEndTime: '', // 退库结束时间。
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
    state: 0, // 状态 0、已入库 1、入库中 2、退库中 3、已退库。
  },
  //合作伙伴资质列表
  qualificationList: [
    // {
    //   "id": 0,
    //   "qualificationCode": "", // 资质编码
    //   "qualificationName": "", // 资质名称
    //   "partnerCode": "", // 合作伙伴编码
    //   "certificateNumber": "", //证书编号
    //   "contractValidityPeriod": "", // 有效期
    //   "createUserNo": "", // 创建人工号
    //   "createUserName": "", // 创建人姓名
    //   "createTime": "", // 创建时间
    //   "updateUserNo": "", // 更新人工号
    //   "updateUserName": "", // 更新人姓名
    //   "updateTime": "", // 创建时间
    //   "state": 0 // 状态 0、生效 1、失效
    // }
  ],
  //供应商联系人列表
  supplierContactPersonList: [
    // {
    //   "id": 0,
    //   "coopAreaCode": "", // 合作区域编码
    //   "coopAreaName": "", // 合作区域名称
    //   "partnerCode": "", // 合作伙伴编码
    //   "linkName": "", // 联系人姓名
    //   "linkPhone": "", // 联系人电话
    //   "email": "", // 邮箱
    //   "isMain": "", // 是否为主账号（1、是 2、否）。
    //   "createUserNo": "", //创建人工号
    //   "createUserName": "",
    //   "updateUserNo": "",
    //   "updateUserName": "",
    //   "state": 0 // 状态 0、生效 1、失效。
    // }
  ],
  //银行帐号信息列表
  bankAccountInfoList: [
    // {
    //   "id": 0,
    //   "coopAreaCode": "", // 合作区域编码
    //   "coopAreaName": "", //合作区域名称
    //   "partnerCode": "", // 合作伙伴编码。
    //   "bankName": "", // 银行名称
    //   "subBankName": "", // 支行名称。
    //   "bankAccountName": "", //银行账户名称
    //   "bankAccount": "", // 银行账户
    //   "permitNumber": "", // 许可证
    //   "createUserNo": "",
    //   "createUserName": "",
    //   "updateUserNo": "",
    //   "updateUserName": "",
    //   "state": 0 //状态 0、生效 1、失效。
    // }
  ],
  // 合作伙伴行业关系列表  (合作伙伴行业)
  industryRelList: [
    // {
    //   "id": 0,
    //   "partnerCode": "", // 合作伙伴编码
    //   "industryCode": "",// 行业编码
    //   "state": 0//状态 0、生效 1、失效。
    // }
  ],
  //合作伙伴场景关系列表 (行业领域)
  scenceRelList: [
    // {
    //   "id": 0,
    //   "partnerCode": "", // 合作伙伴编码
    //   "scenceCode": "", // 场景子库编码
    //   "state": 0//状态 0、生效 1、失效。
    // }
  ],
  //领域场景子库列表 (场景子库)
  fieldScenceDirectoryList: [
    // {
    //   "id": 0,
    //   "fieldCode": "", // 领域编码
    //   "fieldName": "", // 领域名称
    //   "scenceCode": "", // 场景编码
    //   "scenceName": "", // 场景名称
    //   "createUserNo": "",
    //   "createUserName": "",
    //   "updateUserNo": "",
    //   "updateUserName": "",
    //   "state": 0//状态 0、生效 1、失效。
    // }
  ],
  //合作伙伴合作区域列表
  regionRelList: [
    {
      "id": 0,
      "partnerCode": "", // 合作伙伴编码
      "regionCode": userInfo.value.regionCode, // 区域编码
      "regionName": userInfo.value.regionName, // 区域名称
      "state": 0//状态 0、生效 1、失效。
    }
  ],
  //入库依据文件列表
  inboundFiles: [
    // {
    //   "fileName": "",
    //   "originalName": "",
    //   "downloadUri": "",
    //   "uploadPath": "",
    //   "remark": ""
    // }
  ],
  //营业执照文件列表
  licenseFiles: [
    // {
    //   "fileName": "",
    //   "originalName": "",
    //   "downloadUri": "",
    //   "uploadPath": "",
    //   "remark": ""
    // }
  ],
  //营业执照副本文件列表
  licenseCopyFiles: [
    // {
    //   "fileName": "",
    //   "originalName": "",
    //   "downloadUri": "",
    //   "uploadPath": "",
    //   "remark": ""
    // }
  ],
  //银行账户开户许可证文件列表
  bankFiles: [
    // {
    //   "fileName": "",
    //   "originalName": "",
    //   "downloadUri": "",
    //   "uploadPath": "",
    //   "remark": ""
    // }
  ],
  //合作伙伴资源审查表文件列表
  portalReviewFiles: [
    // {
    //   "fileName": "",
    //   "originalName": "",
    //   "downloadUri": "",
    //   "uploadPath": "",
    //   "remark": ""
    // }
  ],
  //其他附件文件列表
  otherFiles: [
    // {
    //   "fileName": "",
    //   "originalName": "",
    //   "downloadUri": "",
    //   "uploadPath": "",
    //   "remark": ""
    // }
  ],
  //指定审批人（登录名）
  appointedAssignee: '',
});
const formDataCopy = JSON.parse(JSON.stringify(formData));
const dataBaseAccordingRef = ref('');
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

const submitLoading = ref(false)
const errorText = ref('')
const showSubmitApproverPicker = ref(false)
const submitApproverLoading = ref(false)
const submitApproverList = ref([])
const submitApproverColumns = computed(() =>
  submitApproverList.value.map(item => ({
    text: item.showName,
    value: item.loginName,
  })),
)
const onSubmitApproverConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0]
  if (!selected) {
    showToast('请选择下一步审批人')
    return
  }
  showSubmitApproverPicker.value = false
  formData.appointedAssignee = selected.value

  submitLoading.value = true
  let url = DataBaseController.portalPartnerSubmit
  if (currentType.value === 'edit') {
    url = DataBaseController.resubmitPartnerInfo
    formData.processInstanceId = processInstanceId.value
    formData.taskId = taskId.value
  }
  url(formData)
    .then(() => {
      submitLoading.value = false
      // router.back()
      appBack()
      showToast('提交成功')
    })
    .catch(() => {
      submitLoading.value = false
    })
}
const onSubmit = () => {
  errorText.value = ''
  Promise.all([
    dataBaseAccordingRef.value.handleSubmit().catch(val => {
      errorText.value = val
    }),
    partnerInfoRef.value.handleSubmit().catch(val => {
      errorText.value = val
    }),
    cooperationQualificationRef.value.handleSubmit().catch(val => {
      errorText.value = val
    }),
    supplierContactListRef.value.handleSubmit().catch(val => {
      errorText.value = val
    }),
    bankAccountInfoRef.value.handleSubmit().catch(val => {
      errorText.value = val
    }),
  ])
    .then(results => {
      if (errorText.value) {
        showToast(errorText.value);
        return false
      }
      formData.regionRelList[0].partnerCode = formData.foundationInfo.partnerCode

      // 入库依据start
      formData.foundationInfo = { ...formData.foundationInfo, ...results[0] };
      formData.inboundFiles = results[0].inboundFiles; // 入库依据文件
      formData.scenceRelList = results[0].scenceRelList; // 行业/领域/场景子库列表
      // 入库依据end

      //合作伙伴基本信息start
      formData.foundationInfo = { ...formData.foundationInfo, ...results[1] };
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
          id: item.id || undefined, // 已有资质带id，新增资质为空
          qualificationCode: item.qualificationCode || '', // 资质编码
          qualificationName: item.qualificationName, // 资质名称
          partnerCode: item.partnerCode || '', // 合作伙伴编码
          certificateNumber: item.certificateNumber, //证书编号
          contractValidityPeriod: item.contractValidityPeriod, // 有效期
          qualificationFiles: item.qualificationFiles || [], // 资质附件
          createUserNo: item.createUserNo || '', // 创建人工号
          createUserName: item.createUserName || '', // 创建人姓名
          createTime: item.createTime || '', // 创建时间
          updateUserNo: item.updateUserNo || '', // 更新人工号
          updateUserName: item.updateUserName || '', // 更新人姓名
          updateTime: item.updateTime || '', // 更新时间
          state: item.state ?? 0, // 状态 0、生效 1、失效
        });
      });
      //合作伙伴资质end

      //供应商联系人列表start
      formData.supplierContactPersonList = results[3];
      //供应商联系人列表end

      //银行帐号信息列表start
      formData.bankAccountInfoList = results[4];
      //银行帐号信息列表end

      let roleId = userInfo.value.orgType == '1' ? '2034602005636321280' : '2036280205496029184'
      if (props.joinType === 'DIRECT_IN') { // 直接入库查部门领导审批
        roleId = '2036281370577211392'
      }
      submitApproverLoading.value = true
      showSubmitApproverPicker.value = true
      SysUserController.listUserByRoleAndDeptFlag({
        "roleId": roleId,
        "deptFlag": "current"
      })
        .then(res => {
          submitApproverList.value = []
          if (res.data) {
            submitApproverList.value = Array.isArray(res.data) ? res.data : res.data.dataList
          }
          submitApproverLoading.value = false
        })
        .catch(e => {
          submitApproverLoading.value = false
          showToast('加载审批人列表失败')
        })

    })
    .catch(error => {
      showToast(errorText.value);
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
        // appointedAssignee: lastPer.createLoginName,
        appointedAssignee: '',
      },
    };
    submitLoading.value = true
    await post(
      `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/${params.processDefinitionKey}`,
      payload,
    );
    submitLoading.value = false
    showToast('已驳回');
    rejectDialogVisible.value = false;
    // router.back();
    appBack()
  } catch (e) {
    submitLoading.value = false
    // showToast('操作失败');
    console.error(e);
  }
};

const nextApproverList = ref([]); // 下一步审批人列表
const pickDemandDetailRef = ref();
// 加载下一步审批人列表
const loadNextApproverList = () => {
  let url = SysUserController.listUserByRoleAndDeptFlag
  let obj = {
    "roleId": '2036280205496029184',
    "deptFlag": "current"
  }
  if (params.taskKey === 'Activity_02uo03u' || params.taskKey === 'Activity_0shg0ge') { // 综合经理审批 分公司
    let roleId = ''
    if (userInfo.value.orgType == 2) {
      roleId = '2036280205496029184'  // 市
    }
    if (userInfo.value.orgType == 3) {
      roleId = '2036280313365139456'  // 区
    }
    obj = {
      "roleId": roleId,
      "deptFlag": "designatedDepartment",
      "designatedDeptFlag": "2"
    }
  }
  if (params.taskKey === 'Activity_00ymwy5') { // 分公司分管领导审批
    if (operationType.value === 'onAgree') {
      obj = {
        "roleId": '2034603054304595968',
        "deptFlag": "branchCompany"
      }
    } else {
      obj = {
        "deptFlag": "current"
      }
    }
  }
  if (params.taskKey === 'Activity_0dmczhh') { // 分公司总经理审批
    obj = {
      "roleId": '2034603147594305536',
      "deptFlag": "branchCompany"
    }
  }
  if (params.taskKey === 'Activity_1xmd76a' ) { // 省本部DICT管理员审批
    url = SysUserController.listUserRole
    obj = {
      "pageParam": {
        "pageNum": 1,
        "pageSize": 10
      },
      "roleId": "2034599001503830016",
      "sysUserDtoFilter": {}
    }
  }
  if (params.taskKey === 'Activity_1bymgio' || params.taskKey === 'Activity_1wyx3xf') { // 三级经理审批 省公司
    obj = {
      "roleId": '2034602005636321280',
      "deptFlag": "designatedDepartment",
      "designatedDeptFlag": "1"
    }
  }
  if (params.taskKey === 'Activity_0xupre5') { // 采购经理审批
    if (operationType.value === 'onAgree') {
      obj = {
        "roleId": '2034603147594305536',
        "deptFlag": "designatedDepartment",
        "designatedDeptFlag": "1"
      }
    } else {
      obj = {
        "deptFlag": "current"
      }
    }
  }

  if (params.taskKey === 'Activity_1i3ivm9' || params.taskKey === 'Activity_0gdrcu7') { // 采购部总经理审批
    obj = {
      "roleId": '2034603147594305536',
      "deptFlag": "designatedDepartment",
      "designatedDeptFlag": "3"
    }
  }
  if (params.taskKey === 'Activity_0j7kqsk') { // 当前节点战客部总经理审批，查的是省本部DICT管理员
    if (operationType.value === 'onAgree') {
      url = SysUserController.listUserRole
      obj = {
        "pageParam": {
          "pageNum": 1,
          "pageSize": 10
        },
        "roleId": "2034599001503830016",
        "sysUserDtoFilter": {}
      }
    } else {
      obj = {
        "deptFlag": "current"
      }
    }
  }
  if (params.taskKey === 'Activity_0anc7mu') {
    url = SysUserController.listUserRole
    obj = {
      "pageParam": {
        "pageNum": 1,
        "pageSize": 10
      },
      "roleId": "2034599001503830016",
      "sysUserDtoFilter": {}
    }
  }
  url(obj)
    .then(res => {
      nextApproverList.value = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          nextApproverList.value = res.data
        } else {
          nextApproverList.value = res.data.dataList
        }
      }
      // 记录调试日志到后台（不阻塞主流程）
      const logBody = {
        requestPath: url.name === 'listUserRole' ? '/upms/sysRole/listUserRole' : '/upms/sysDept/listUserByRoleAndDeptFlag',
        requestBody: JSON.stringify({
          reqParams: obj,
          res,
          loginName: userInfo.value.loginName,
          taskName: params.taskName,
          taskKey: params.taskKey,
        }),
      };
      SysUserController.addMoaRequestLog(logBody, { showError: false, showMask: false })
        .catch(e => console.error('记录调试日志失败', e));
    })
    .catch(e => {
      showToast('加载审批人列表失败');
      console.error(e);
    });
}
  ;

// 同意
const onAgree = () => {
  agreeForm.appointedAssignee = '';
  agreeForm.appointedAssigneeText = '';
  agreeForm.reason = '';
  agreeDialogVisible.value = true;
  operationType.value = 'onAgree';
  // 加载审批人列表
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

  let payload;
  if (operationType.value === 'transfer') {
    payload = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'transferTo',
        taskComment: agreeForm.reason,
      },
      taskVariableData: {
        appointedAssignee: islast.value ? '' : agreeForm.appointedAssignee,
      },
    }
  } else {
    payload = {
      processInstanceId: processInstanceId.value,
      taskId: taskId.value,
      flowTaskCommentDto: {
        approvalType: 'agree',
        taskComment: agreeForm.reason,
      },
      taskVariableData: {
        appointedAssignee: islast.value ? '' : agreeForm.appointedAssignee,
      },
    }
  }
  try {
    submitLoading.value = true
    await post(
      `${API_CONTEXT}/flow/api/flowOperation/submitUserTask/` + params.processDefinitionKey,
      payload,
    );
    submitLoading.value = false
    showToast('审批通过');
    agreeDialogVisible.value = false;
    // router.back();
    appBack()
  } catch (e) {
    submitLoading.value = false
    // showToast('操作失败');
    console.error(e);
  }
};

// 转办
const transfer = () => {
  agreeForm.appointedAssignee = '';
  agreeForm.appointedAssigneeText = '';
  agreeForm.reason = '';
  agreeDialogVisible.value = true;
  operationType.value = 'transfer';
  // 加载审批人列表
  nextApproverList.value = [];
  loadNextApproverList();
};

// 取消
const onCancel = () => {
  // router.back();
  appBack();
  // router.push({name: 'formMyTask'});
};
const dataInfo = ref({});
const currentType = ref('add');
const operationType = ref('');
// 5.2.1.7+：把 searchByPartnerName 的嵌套响应转换为旧版扁平结构，供各子组件 showData 使用
// 旧结构：{ foundationInfo, inboundFiles, licenseFiles, ..., scenceRelList, supplierContactPersonList, ... }
// 新结构：{ hitSource, foundationInfoList: [{ foundationInfo: {..., supplierContactPersonList, qualificationListVoList, bankAccountInfoListVoList, licenseFiles, licenseCopyFiles, bankFiles, portalReviewFiles, otherFiles}, joinList: [{ industryList: [{ sceneSubLibraryList }], areaList, inboundFiles }] }] }
// 提取并过滤空对象文件项（后端返回偶尔出现 [{}] 等异常数据）
// 注意：仅过滤明显异常的空对象（无任何字段），保留有原始文件名/下载链接的真实文件
const pickValidFiles = files => {
  if (!Array.isArray(files)) return [];
  return files.filter(f => f && typeof f === 'object' && Object.keys(f).length > 0);
};
const adaptSearchResponseToFlat = (resData) => {
  if (!resData || !Array.isArray(resData.foundationInfoList) || resData.foundationInfoList.length === 0) {
    return null;
  }
  const item = resData.foundationInfoList[0];
  const foundationInfo = { ...(item.foundationInfo || {}) };
  // 联系人/资质/银行：新接口内嵌在 foundationInfo 里，提取到顶层
  const supplierContactPersonList = foundationInfo.supplierContactPersonList || [];
  const qualificationList = foundationInfo.qualificationListVoList || [];
  const bankAccountInfoList = foundationInfo.bankAccountInfoListVoList || [];
  // 文件类字段（也是内嵌在 foundationInfo 里），提取并过滤空对象
  const licenseFiles = pickValidFiles(foundationInfo.licenseFiles);
  const licenseCopyFiles = pickValidFiles(foundationInfo.licenseCopyFiles);
  const bankFiles = pickValidFiles(foundationInfo.bankFiles);
  const portalReviewFiles = pickValidFiles(foundationInfo.portalReviewFiles);
  const otherFiles = pickValidFiles(foundationInfo.otherFiles);
  delete foundationInfo.supplierContactPersonList;
  delete foundationInfo.qualificationListVoList;
  delete foundationInfo.bankAccountInfoListVoList;
  delete foundationInfo.licenseFiles;
  delete foundationInfo.licenseCopyFiles;
  delete foundationInfo.bankFiles;
  delete foundationInfo.portalReviewFiles;
  delete foundationInfo.otherFiles;
  // 入库依据文件：新接口在 joinList[].inboundFiles，按 join 合并到顶层（去重，避免同一文件重复）
  const inboundFiles = [];
  const seenFile = new Set();
  (item.joinList || []).forEach(joinDto => {
    (joinDto.inboundFiles || []).forEach(file => {
      const key = `${file.fileName}_${file.uploadPath}`;
      if (!seenFile.has(key)) {
        seenFile.add(key);
        inboundFiles.push(file);
      }
    });
  });
  // 把 joinList 嵌套结构拍平为 scenceRelList（供 dataBaseAccording 组件 showData）
  // 5.2.1.7 文档：join → regionRelList[].industryList[].sceneSubLibraryList[]
  const scenceRelList = [];
  (item.joinList || []).forEach(joinDto => {
    (joinDto.regionRelList || []).forEach(regionDto => {
      (regionDto.industryList || []).forEach(industryDto => {
        (industryDto.sceneSubLibraryList || []).forEach(sceneDto => {
          scenceRelList.push({
            scenceCode: sceneDto.sceneSubLibraryCode,
            scenceName: sceneDto.sceneSubLibraryName, // 对齐 dataBaseAccording.showData 字段名（scenceName）
            fieldCode: industryDto.industryFieldCode,
            fieldName: industryDto.industryFieldName,
            industryCode: industryDto.industryCode,
            industryName: industryDto.industryName,
            libraryLevel: joinDto.dictBusiLevel,
            // §2.3 区域下移到 regionVo
            areaCode: regionDto.regionCode,
            areaName: regionDto.regionName,
            id: sceneDto.id,
          });
        });
      });
    });
  });
  // 5.2.1.7：joinCode/joinName 保留在 foundationInfo（兼容旧版字段，但 §2.1 标记为非必填，可传）
  if (item.joinList && item.joinList.length > 0) {
    foundationInfo.joinCode = item.joinList[0].joinCode || foundationInfo.joinCode || '';
    foundationInfo.joinName = item.joinList[0].joinName || foundationInfo.joinName || '';
    // §2.1：dictBusiLevel/coopValidityPeriod 已迁移至 joinDto；但 UI 基本信息仍需要展示 dictBusiLevel，
    // 此处仅用于回显展示（不再写回 foundationInfo 提交），从 joinList[0] 取值兜底
    if (!foundationInfo.dictBusiLevel && item.joinList[0].dictBusiLevel) {
      foundationInfo.dictBusiLevel = item.joinList[0].dictBusiLevel;
    }
    if (!foundationInfo.dictBusiLevelName && item.joinList[0].dictBusiLevelName) {
      foundationInfo.dictBusiLevelName = item.joinList[0].dictBusiLevelName;
    }
  }
  return {
    foundationInfo,
    supplierContactPersonList,
    qualificationList,
    bankAccountInfoList,
    inboundFiles,
    licenseFiles,
    licenseCopyFiles,
    bankFiles,
    portalReviewFiles,
    otherFiles,
    scenceRelList,
  };
};
const init = () => {
  // 5.2.1.7+：流程进入（partnerDemandApply 入口）改用 searchPartnerByHisPartnerCode
  // 其他入口（按 partnerName 搜索）走 searchByPartnerName
  const innerParams = {};
  if (params.businesskey || params.businessKey) {
    // partnerDemandApply 入口：businesskey 携带 partnerCode
    // 走 searchPartnerByHisPartnerCode（入参只用 partnerCode）
    PartnerInfoController.searchPartnerByHisPartnerCode({
      portalPartnerSearchByJoin: { partnerCode: params.businesskey || params.businessKey }
    })
      .then(res => {
        const flatData = adaptSearchResponseToFlat(res?.data);
        if (!flatData) {
          return;
        }
        console.log(flatData);
        dataInfo.value = flatData;
        if (flatData.foundationInfo) {
          formData.foundationInfo = { ...formData.foundationInfo, ...flatData.foundationInfo };
        }
        dataBaseAccordingRef.value.showData(flatData, currentType.value);
        partnerInfoRef.value.showData(flatData, currentType.value);
        cooperationQualificationRef.value.showData(flatData, currentType.value);
        supplierContactListRef.value.showData(flatData, currentType.value);
        bankAccountInfoRef.value.showData(flatData, currentType.value);

        // 附件数据
        attachmentData.inboundFiles = flatData.inboundFiles || [];
        attachmentData.licenseFiles = flatData.licenseFiles || [];
        attachmentData.licenseCopyFiles = flatData.licenseCopyFiles || [];
        attachmentData.bankFiles = flatData.bankFiles || [];
        attachmentData.portalReviewFiles = flatData.portalReviewFiles || [];
        attachmentData.otherFiles = flatData.otherFiles || [];
      })
      .catch(e => { });
  } else {
    innerParams.partnerName = params.partnerName || formData.foundationInfo.partnerName;
    DataBaseController.searchByPartnerName({ portalPartnerSearchByJoin: innerParams })
      .then(res => {
        const flatData = adaptSearchResponseToFlat(res?.data);
        if (!flatData) {
          return;
        }
        console.log(flatData);
        dataInfo.value = flatData;
        // 将获取到的数据赋值给 formData.foundationInfo，以便在审批时使用
        if (flatData.foundationInfo) {
          formData.foundationInfo = { ...formData.foundationInfo, ...flatData.foundationInfo };
        }
        dataBaseAccordingRef.value.showData(flatData, currentType.value);
        partnerInfoRef.value.showData(flatData, currentType.value);
        cooperationQualificationRef.value.showData(flatData, currentType.value);
        supplierContactListRef.value.showData(flatData, currentType.value);
        bankAccountInfoRef.value.showData(flatData, currentType.value);

        // 附件数据
        attachmentData.inboundFiles = flatData.inboundFiles || [];
        attachmentData.licenseFiles = flatData.licenseFiles || [];
        attachmentData.licenseCopyFiles = flatData.licenseCopyFiles || [];
        attachmentData.bankFiles = flatData.bankFiles || [];
        attachmentData.portalReviewFiles = flatData.portalReviewFiles || [];
        attachmentData.otherFiles = flatData.otherFiles || [];
      })
      .catch(e => { });
  }
};
onActivated(() => {
  if (formDataCopy) {
    for (let key in formDataCopy) {
      formData[key] = formDataCopy[key];
    }
  }
});
onMounted(() => {
  // 流程进来的
  console.log(params, '流程进来的');
  if (params.isInfo === 'true') {
    currentType.value = 'info';
  }
  if (params.businessKey || params.businesskey) {
    if (
      params.taskName === '三级经理审批' ||
      params.taskName === '采购经理审批' ||
      params.taskName === '采购部总经理审批' ||
      params.taskName === '战客部总经理审批' ||
      params.taskName === '分公司分管领导审批' ||
      params.taskName === '分公司总经理审批' ||
      params.taskName === '部门领导审批' ||
      params.taskName === '省本部DICT管理员审批' ||
      params.taskName === '综合部审批' ||
      params.taskName === '采购部审批' ||
      params.taskName === '战客部审批' ||
      params.taskName === '采购部二级经理审批'
    ) {
      currentType.value = 'auth';
    }

    // if (params.taskName === '发起申请' || params.taskName === '直接入库发起') {
    //   currentType.value = 'edit';
    // }
    init();
  }
});
</script>
<style scoped lang="scss">
.object-database-page {
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
