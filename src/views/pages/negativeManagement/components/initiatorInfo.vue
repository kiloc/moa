<template>
  <div class="initiator-info-form">
    <van-cell-group class="card-section" inset>
      <div class="card-section__title">发起人信息</div>
      <van-field v-model="formData.createUserName" label="发起人" disabled />
      <van-field v-model="formData.createDeptName" label="发起部门" disabled />
      <van-field
        v-model="formData.contactPhone"
        label="联系电话"
        placeholder="请输入联系电话"
        required
        :rules="[{ required: true, message: '请输入联系电话' }]"
      />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useLoginStore } from '@/store';

const loginStore = useLoginStore();

// 表单数据
const formData = reactive({
  createUserName: loginStore.userInfo?.userName || '',
  createDeptName: loginStore.userInfo?.deptName || '',
  contactPhone: '',
});

// 显示数据
const showData = (data: any) => {
  formData.createUserName = data.createUserName || loginStore.userInfo?.userName || '';
  formData.createDeptName = data.createDeptName || loginStore.userInfo?.deptName || '';
  formData.contactPhone = data.contactPhone || '';
};

// 表单提交
const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.contactPhone) {
      reject();
      return;
    }
    resolve({ ...formData });
  });
};

defineExpose({
  handleSubmit,
  showData,
  formData,
});

onMounted(() => {
  formData.createUserName = loginStore.userInfo?.userName || '';
  formData.createDeptName = loginStore.userInfo?.deptName || '';
});
</script>

<style lang="scss" scoped>
.initiator-info-form {
  padding-bottom: 12px;

  .card-section {
    margin: 12px;

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: #323233;
      padding: 12px 16px 8px;
    }
  }
}
</style>
