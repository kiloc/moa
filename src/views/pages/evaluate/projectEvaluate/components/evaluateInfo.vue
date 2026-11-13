<template>
  <div class="section">
    <div class="section-subtitle">评估信息</div>
    <van-field
      :model-value="evaluateInfo.taskNo"
      label="评估任务编码"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.taskName"
      label="评估任务名称"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.projectCode"
      label="评估项目编码"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.projectName"
      label="评估项目名称"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.partnerName"
      label="合作伙伴名称"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.customerManager"
      label="客户经理"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.solutionManager"
      label="解决方案经理"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.opsManager"
      label="运维经理"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.deliveryManager"
      label="交付经理"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.projectProgress"
      label="当前项目进度"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.initiator"
      label="发起人"
      readonly
    />
    <van-field
      :model-value="evaluateInfo.initiatorDept"
      label="发起人部门"
      readonly
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ANY_OBJECT } from '@/types/generic';

const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {
    data: () => {},
  },
);

const evaluateInfo = ref<ANY_OBJECT>({});

watch(() => props.data, (newVal) => {
  evaluateInfo.value = newVal || {};
}, {
  immediate: true,
});
</script>

<style scoped lang="scss">
</style>