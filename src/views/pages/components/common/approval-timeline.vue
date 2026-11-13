<template>
  <div class="approval-timeline">
    <van-cell-group title="">
      <div v-for="(item, index) in list" :key="index" class="timeline-item">
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="step-name">{{ item.taskName }}</span>
            <span v-if="item.approvalType" class="action-tag" :class="getOperationTagType(item.approvalType)">
              {{ SysFlowTaskOperationType.getValue(item.approvalType) }}
            </span>
            <span 
              v-if="item.delegateAssignee != null"
              class="action-tag tag-agree"
              style="margin-left: 10px"
            >
            {{ item.delegateAssignee }}
            </span>
          </div>
          <div class="timeline-info">
            <div class="info-row">
              <span class="label">实际审批人：</span>
              <span>{{ item.createUsername || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">受委托人：</span>
              <span>{{ item.delegateShowName || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">处理部门：</span>
              <span>{{ item.deptName || '-' }}</span>
            </div>
            <div v-if="item.taskComment" class="info-row">
              <span class="label">审批意见：</span>
              <span>{{ item.taskComment }}</span>
            </div>
            <div v-if="item.createTime" class="info-row time-row">
              <van-icon name="clock-o" />
              <span>{{ item.createTime }}</span>
            </div>
          </div>
        </div>
      </div>
      <van-empty v-if="!list.length" description="暂无审批记录" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { SysFlowTaskOperationType } from '@/common/staticDict/flow';
export interface ApprovalRecord {
  taskName: string;
  approver: string;
  createUsername: string;
  taskComment: string;
  createTime: string;
  approvalType: string;
  delegateShowName: any
  delegateAssignee: any
}

const props = withDefaults(
  defineProps<{
    list: ApprovalRecord[];
    title?: string;
    processingText?: string;
  }>(),
  {
    list: () => [],
    title: '审批记录',
    processingText: '处理中',
  }
);

const getOperationTagType = (type: string) => {
  switch (type) {
    case SysFlowTaskOperationType.AGREE:
    case SysFlowTaskOperationType.MULTI_AGREE:
    case SysFlowTaskOperationType.SET_ASSIGNEE:
      return 'tag-agree';
    case SysFlowTaskOperationType.REFUSE:
    case SysFlowTaskOperationType.PARALLEL_REFUSE:
    case SysFlowTaskOperationType.MULTI_REFUSE:
      return 'tag-warning';
    case SysFlowTaskOperationType.STOP:
    case SysFlowTaskOperationType.REJECT:
    case SysFlowTaskOperationType.REJECT_TO_START:
    case SysFlowTaskOperationType.REJECT_TO_TASK:
    case SysFlowTaskOperationType.REVOKE:
      return 'tag-reject';
    default:
      return '';
  }
};
</script>

<style scoped lang="scss">
:deep(.van-cell-group) {
  // background: transparent;
}
.approval-timeline {
  .timeline-item {
    display: flex;
    margin-bottom: 20px;
    position: relative;
  }

  .timeline-content {
    flex: 1;
    background: white;
    border-radius: 16px;
    padding: 14px 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .step-name {
      font-size: 16px;
      font-weight: 600;
      color: #1e2a3e;
      letter-spacing: -0.3px;
    }

    .action-tag {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 30px;
      // background-color: #f0f2f5;
      // color: #5a6874;
      color: var(--van-primary-color);
      background-color: rgba(64, 142, 241, 0.1);

      &.tag-agree {
        background-color: #e3f7ec;
        color: #1e7b48;
      }
      &.tag-warning {
        background: #fff7e6;
        color: #fa8c16;
      }
      &.tag-reject {
        background-color: #fee9e6;
        color: #c2412c;
      }
      &.tag-processing {
        background-color: #e8f0fe;
        color: #2c7be5;
      }
    }
  }

  .timeline-info {
    .info-row {
      font-size: 14px;
      color: #334155;
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;

      .label {
        width: 88px;
        color: #6c7a91;
        font-weight: 450;
        flex-shrink: 0;
      }
    }

    .time-row {
      margin-top: 8px;
      color: #94a3b8;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;

      .van-icon {
        font-size: 14px;
      }
    }
  }
}
</style>