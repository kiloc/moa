<template>
  <div class="section">
    <div class="section-subtitle">招募结果</div>
    <div class="mobile-partner-list">
      <div v-if="label" class="section-title">
        {{ label }}
      </div>
      <div v-if="recruitResults.length > 0" class="partner-cards">
        <van-card
          v-for="(partner, idx) in recruitResults"
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
              <div  v-if="props.isDividePackage">标段名称:{{ partner.packageName || '-' }}</div>
              <div>行业：{{ partner.contactPerson || '-' }}</div>
              <div>行业领域：{{ partner.fieldName|| '-' }}</div>
              <div>场景子库：{{ partner.scenceName|| '-' }}</div>
              <div>联系人：{{ partner.linkName|| '-' }}</div>
              <div>联系电话：{{ partner.linkPhone|| '-' }}</div>
            </div>
          </template>
        </van-card>
      </div>
      <van-empty v-else description="暂无数据" />
    </div>
  </div>
</template>


<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    isDividePackage?: any
    data: any
    label?: string;
  }>(),
  {
    isDividePackage: false,
    data: () => {},
    label: '列表信息',
  },
);

const planCode = ref('')
const recruitResults = ref<any[]>([])
// 显示数据
const showData = (data:any) => {
  // 处理传入的数据，更新招募结果
  planCode.value = data.planCode;
  // 优先使用 decisionItemList，其次使用 recruitmentResult
  const decisionData = data && (data.decisionItemList || data.recruitmentResult);
  if (decisionData && Array.isArray(decisionData)) {
    recruitResults.value = decisionData.map(item => ({
      partnerCode: item.partnerCode,
      partnerName: item.partnerName,
      industryCode: item.industryCode,
      industryName: item.industryName,
      fieldCode: item.fieldCode,
      fieldName: item.fieldName,
      scenceCode: item.scenceCode,
      scenceName: item.scenceName,
      linkName: item.linkName,
      linkPhone: item.linkPhone,
      packageCode: item.packageCode,
      packageName: item.packageName,
      decisionCode: item.decisionCode,
      state: item.state,
      id: item.id,
    }));
  }
};

watch(() => props.data, (newVAl) => {
  showData(newVAl || {})
}, {immediate: true})
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
