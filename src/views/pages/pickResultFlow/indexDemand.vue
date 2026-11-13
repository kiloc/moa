<template>
  <div class="mobile-partner-list">
    <div v-if="label" class="section-title">
      {{ label }}
    </div>

    <div v-if="paginatedPartners.length > 0" class="partner-cards">
      <van-card
        v-for="(partner, idx) in paginatedPartners"
        :key="idx"
        class="partner-card"
      >
        <template #title>
          <div class="partner-name">
            {{ partner.partnerName }}
          </div>
        </template>
        <template #desc>
          <div class="partner-info">
            <div>联系人：{{ partner.linkName || '-' }}</div>
            <div>联系方式：{{ partner.linkPhone|| '-' }}</div>
          </div>
        </template>
      </van-card>
    </div>
    <van-empty v-else description="暂无合作伙伴数据" />
    <!-- 分页组件 -->
    <van-pagination
      class="pagination"
      v-model="partnerPage.currentPage"
      :total-items="selectedPartners.length"
      :show-page-size="3"
      force-ellipses
    />
  </div>
</template>


<script lang="ts" setup>
import { computed } from 'vue';
import { ANY_OBJECT } from '@/types/generic';

const props = withDefaults(
  defineProps<{
    data?: ANY_OBJECT;
    partners?: ANY_OBJECT[];
    label?: string;
  }>(),
  {
    data: () => ({}),
    partners: () => [],
    label: '合作伙伴列表',
  },
);

const emit = defineEmits<{
  onSubmit: [ANY_OBJECT | null];
  'update:data': [ANY_OBJECT];
  'update:partners': [ANY_OBJECT[]];
}>();

const selectedPartners = computed({
  get: () => props.partners || [],
  set: val => {
    emit('update:partners', val);
  },
});

const partnerPage = reactive({
  currentPage: 1,
  pageSize: 10
});

const paginatedPartners = computed(() => {
  const start = (partnerPage.currentPage - 1) * partnerPage.pageSize;
  const end = start + partnerPage.pageSize;
  return selectedPartners.value.slice(start, end);
});
</script>

<style scoped lang="scss">
.mobile-partner-list {
  background-color: #f5f5f5;
  padding: 12px;
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #323233;
  }
  .action-bar {
    margin-bottom: 12px;
  }
  .partner-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .partner-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    .partner-name {
      font-weight: bold;
      font-size: 16px;
      color: #323233;
    }
    .partner-info {
      font-size: 14px;
      color: #646566;
      line-height: 1.5;
      div{
        margin: 16px 0 ;
      }
      .response-files {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 6px;
        .file-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #4A90E5;
          cursor: pointer;
          span {
            text-decoration: underline;
          }
        }
      }
    }
    .card-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
  }
  
  .pagination {
    margin-top: 16px;
    justify-content: center;
  }
}

.popup-header {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}
.popup-content {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}
.popup-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebedf0;
}
</style>
