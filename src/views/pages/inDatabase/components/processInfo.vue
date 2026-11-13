<template>
  <div class="process-section">
    <van-loading v-if="processLoading" class="page-loading" size="24px" vertical>加载中...</van-loading>
    <template v-else>
      <div v-if="flowTaskCommentList.length" class="process-timeline">
        <div v-for="(item, index) in flowTaskCommentList" :key="index" class="process-step">
          <div class="process-step__left">
            <span class="process-step__dot" :class="'process-step__dot--' + item.approvalType"></span>
            <span v-if="index < flowTaskCommentList.length - 1" class="process-step__line"></span>
          </div>
          <div class="process-step__right">
            <div class="process-step__header">
              <span class="process-step__name">{{ item.taskName }}</span>
              <van-tag
                :type="getApprovalTagType(item.approvalType)"
                size="medium"
                round
              >
                {{ getApprovalTypeName(item.approvalType) }}
              </van-tag>
            </div>
            <div class="process-step__info">
              <div class="process-step__row">
                <span class="process-step__label">实际审批人</span>
                <span class="process-step__value">{{ item.createUsername || '-' }}</span>
              </div>
              <div v-if="item.delegateShowName" class="process-step__row">
                <span class="process-step__label">受委托人</span>
                <span class="process-step__value">{{ item.delegateShowName }}</span>
              </div>
              <div v-if="item.deptName" class="process-step__row">
                <span class="process-step__label">处理部门</span>
                <span class="process-step__value">{{ item.deptName || '-' }}</span>
              </div>
              <div v-if="item.taskComment" class="process-step__row">
                <span class="process-step__label">审批意见</span>
                <span class="process-step__value process-step__value--wrap">{{ item.taskComment }}</span>
              </div>
              <div class="process-step__row">
                <span class="process-step__label">处理时间</span>
                <span class="process-step__value">{{ item.createTime || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <van-empty v-else description="暂无审批记录" />
    </template>
  </div>
</template>

<script setup>
  import FlowOperationController from '@/api/flow/FlowOperationController';
  import {SysFlowTaskOperationType} from '@/common/staticDict/flow';
  import {ref, watch} from 'vue';

  const props = defineProps({
    processInstanceId: {
      type: String,
      default: '',
    },
  });

  const processLoading = ref(false);
  const flowTaskCommentList = ref([]);

  const getApprovalTypeName = (type) => {
    return SysFlowTaskOperationType.getValue(type);
  };

  const getApprovalTagType = (type) => {
    const map = {
      agree: 'success',
      refuse: 'danger',
      reject: 'danger',
      rejectToStart: 'danger',
      rejectToTask: 'danger',
      revoke: 'warning',
      transfer: 'primary',
      multi_consign: 'primary',
      stop: 'danger',
    };
    return map[type] || 'default';
  };

  const loadFlowTaskComment = () => {
    if (!props.processInstanceId) return;
    processLoading.value = true;
    FlowOperationController.listFlowTaskComment({
      processInstanceId: props.processInstanceId,
    })
      .then((res) => {
        flowTaskCommentList.value = res.data || [];
      })
      .catch(() => {
        flowTaskCommentList.value = [];
      })
      .finally(() => {
        processLoading.value = false;
      });
  };

  watch(() => props.processInstanceId, (val) => {
    if (val) loadFlowTaskComment();
  }, { immediate: true });

  defineExpose({
    loadFlowTaskComment,
    flowTaskCommentList,
  });
</script>

<style scoped lang="scss">
.process-section {
  padding: 12px;
  margin: 12px 0;
  background: #fff;
  border-radius: 8px;
}

.process-timeline {
  padding-left: 4px;
}

.process-step {
  display: flex;
  min-height: 100px;
  position: relative;

  &__left {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 24px;
    flex-shrink: 0;
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #969799;
    flex-shrink: 0;
    margin-top: 4px;

    &--agree { background: #07c160; }
    &--refuse, &--reject, &--rejectToStart, &--rejectToTask, &--stop { background: #ee0a24; }
    &--revoke { background: #ff976a; }
    &--transfer { background: #4A90E5; }
  }

  &__line {
    width: 2px;
    flex: 1;
    background: #ebedf0;
    margin: 4px 0;
  }

  &__right {
    flex: 1;
    padding-bottom: 16px;
    margin-left: 12px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
    color: #323233;
  }

  &__info {
    background: #f7f8fa;
    border-radius: 8px;
    padding: 10px 12px;
  }

  &__row {
    display: flex;
    padding: 3px 0;
    font-size: 13px;
  }

  &__label {
    color: #969799;
    width: 72px;
    flex-shrink: 0;
  }

  &__value {
    color: #323233;
    flex: 1;

    &--wrap {
      word-break: break-all;
    }
  }
}
</style>
