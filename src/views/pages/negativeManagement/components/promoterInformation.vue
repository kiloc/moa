<!--发起人信息-->
<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">发起人信息</div>
    <van-field v-model="formData.createUserName" label="发起人" readonly />
    <van-field v-model="formData.createUserOrg" label="发起单位/部门" readonly />
    <van-field v-model="formData.createUserPhone" label="发起人联系方式" readonly />
    <van-field v-model="formData.createUserCityName" label="地市" readonly />
    <van-field v-model="formData.createTime" label="发起时间" readonly />
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useLoginStore } from '@/store';
import { FlowOperationController } from '@/api/flow';

const loginStore = useLoginStore();
const userInfo = computed(() => loginStore.userInfo || {}) as any;

interface FormData {
  createUserName: string;
  createUserPhone: string;
  createUserOrg: string;
  createUserCityName: string;
  createTime: string;
  partnerCode: string;
  partnerId: string;
  partnerName: string;
}

const formData = reactive<FormData>({
  createUserName: userInfo.value?.showName,
  createUserPhone: userInfo.value?.mobile,
  createUserOrg: userInfo.value?.deptName,
  createUserCityName: userInfo.value?.cityName,
  createTime: '',
  partnerCode: '',
  partnerId: '',
  partnerName: '',
});

const currentType = ref('add');

const showData = (data: any, type: string) => {
  currentType.value = type;
  if (data.recruitmentDemandDetail) {
    data = { ...data.recruitmentDemandDetail, ...data };
  }
  if (data.initiatorInfo) {
    data = { ...data.initiatorInfo, ...data };
  }
  formData.createUserName = data.showName || data.createUserName;
  formData.createUserPhone = data.processInstanceInitiatorMobile || data.createUserPhone;
  formData.createUserOrg = data.processInstanceInitiatorDeptName || data.deptName || data.createUserOrg;
  formData.createUserCityName = data.processInstanceInitiatorCityName || data.cityName || data.createUserCityName;
  formData.createTime = data.processInstanceStartTime || data.createTime || data.initiatorTime || '';
  formData.partnerCode = data.partnerCode;
  formData.partnerId = data.id;
  formData.partnerName = data.partnerName;
  if (data.taskId) {
    FlowOperationController.getRuntimeTaskInitiatorInfo({ taskId: data.taskId || '' }).then((res: any) => {
      const obj = res.data || {} as any;
      formData.createUserName = obj.showName || formData.createUserName;
      formData.createUserOrg = obj.processInstanceInitiatorDeptName || formData.createUserOrg;
      formData.createUserPhone = obj.processInstanceInitiatorMobile || formData.createUserPhone;
      formData.createUserCityName = obj.processInstanceInitiatorCityName || formData.createUserCityName;
      formData.createTime = obj.processInstanceStartTime || data.createTime || data.initiatorTime || '';
      formData.partnerCode = obj.partnerCode || formData.partnerCode;
      formData.partnerName = obj.partnerName || formData.partnerName;
    });
  }
};

const getCurrentTime = () => {
  const now = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const y = now.getFullYear();
  const m = pad2(now.getMonth() + 1);
  const d = pad2(now.getDate());
  const hh = pad2(now.getHours());
  const mm = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
};

const initCreateTime = () => {
  if (currentType.value !== 'add') return;
  if (formData.createTime) return;
  formData.createTime = getCurrentTime();
};

onMounted(() => {
  initCreateTime();
});

const handleSubmit = () => {
  return new Promise((resolve) => {
    resolve(formData);
  });
};

defineExpose({
  handleSubmit,
  showData,
});
</script>

<style lang="scss" scoped>
.card-section {
  margin: 12px 0;

  &__title {
    padding: 14px 16px 6px;
    font-size: 15px;
    font-weight: 600;
    color: #323233;
  }
}
</style>
