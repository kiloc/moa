<template>
  <div class="mobile-partner-list">
    <!-- 标题（可选） -->
    <div v-if="label" class="section-title">
      {{ label }}
    </div>

    <!-- 合作伙伴列表（卡片列表，替代表格） -->
    <div v-if="paginatedPartners.length > 0" class="partner-cards">
      <van-card
        v-for="(partner, idx) in paginatedPartners"
        :key="idx"
        class="partner-card"
      >
        <template #title>
          <div class="partner-name">
            <span
              v-if="partner.inGrayControl"
              class="partner-name-risk"
              @click="onViewGrayDetail(partner)"
            >
              {{ partner.partnerName }}
              <span class="risk-text">(合作伙伴存在风险)</span>
            </span>
            <span v-else>{{ partner.partnerName }}</span>
          </div>
        </template>
        <template #desc>
          <div class="partner-info">
            <div>联系人：{{ partner.linkName || '-' }}</div>
            <div>联系方式：{{ partner.partnerMobile|| '-' }}</div>
            <!-- 评分模式：显示应答文件列表和得分 -->
            <!-- <template v-if="props.score">
              <div class="response-files">
                <span>应答文件：</span>
                <div v-for="file in partner.responseRaseFiles" :key="file.id" class="file-link">
                  <van-icon name="description" />
                  <span @click="downloadAppFile(file.name || file.originalName, 'responseFiles', file.filename||file.fileName)">
                    {{ file.originalName || file.fileName }}
                  </span>
                </div>
              </div>
              <div>得分：{{ partner.partnerScore ?? '-' }}</div>
            </template> -->
          </div>
        </template>
        <!-- <template #tags>
          <div v-if="showActions" class="card-actions">
            <van-button
              v-if="formData.pickType !== '竞争性甄选' && !readOnly"
              type="danger"
              size="small"
              plain
              @click="onRemovePartner(getRealIndex(idx))"
            >
              删除
            </van-button>
            <van-button
              v-if="props.score"
              type="primary"
              size="small"
              plain
              @click="handleScoreClick(partner)"
            >
              评分
            </van-button>
          </div>
        </template> -->
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
    <!-- 评分弹窗 -->
    <van-popup
      v-model:show="scoreDialogVisible"
      position="bottom"
      round
      closeable
      :style="{ height: '70%' }"
    >
      <div class="popup-header">
        专家评分
      </div>
      <div class="popup-content">
        <!-- <PartnerScore
          v-if="scoreDialogVisible"
          :partner-data="currentPartner"
          :notice-number="props.noticeNumber"
          @confirm="handleScoreConfirm"
          @score-updated="handleScoreUpdated"
        /> -->
      </div>
      <div class="popup-footer">
        <van-button block @click="scoreDialogVisible = false">
          关闭
        </van-button>
      </div>
    </van-popup>

    <GreyListDetailDialog
      v-model="grayDetailVisible"
      :record-id="grayRecordId"
    />
  </div>
</template>


<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { ANY_OBJECT } from '@/types/generic';
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { post } from '@/common/http/request';
import { API_CONTEXT } from '@/api/config';
import GreyListDetailDialog from '@/views/pages/components/common/detailDialog.vue';

const props = withDefaults(
  defineProps<{
    data?: ANY_OBJECT;
    package?: ANY_OBJECT;
    partners?: ANY_OBJECT[];
    industry?: string;
    readOnly?: boolean;
    score?: boolean; // 是否需要评分
    noticeNumber?: number; // 公告编码 评分需要传
    noOptions?: boolean; // 直接关闭操作列, 其他的有无操作列的逻辑太麻烦了, 加个直接完全关闭的参数
    label?: string;
    bidPackageFlag?: string;
    demandNumber?: string;
  }>(),
  {
    data: null,
    package: null,
    partners: [],
    industry: '',
    readOnly: false,
    score: false,
    noticeNumber: 0,
    noOptions: false,
    label: '合作伙伴列表',
    bidPackageFlag: '0',
    demandNumber: '',
  },
);

const emit = defineEmits<{
  onSubmit: [ANY_OBJECT | null];
  'update:data': [ANY_OBJECT];
  'update:partners': [ANY_OBJECT[]];
  'refresh-data': [];
}>();

// 表单数据
const formData = computed({
  get: () => props.data || {},
  set: val => {
    emit('update:data', val);
  },
});

// 评分对话框Visible
const scoreDialogVisible = ref(false);
const grayDetailVisible = ref(false);
const grayRecordId = ref<number | string | null>(null);

// 监听formData的属性变化，清空合作伙伴列表 (仅在非只读模式下)
watch(
  () => [
    formData.value.demandIndustry,
    formData.value.industryField,
    formData.value.demandScene,
    formData.value.pickType,
  ],
  () => {
    if (!props.readOnly) {
      selectedPartners.value = [];
    }
  },
);

// 监听甄选方式变更
watch(
  () => formData.value.pickType,
  newV => {
    console.log(newV === '竞争性甄选', 'formData.value.pickType---1')
    if (newV === '竞争性甄选') {
      // 查询竞争性甄选合作伙伴列表分页数据
      queryCompetitionData();
    }
  },
);

// 查询竞争性甄选合作伙伴列表分页数据
const queryCompetitionData = () => {
  let param = {
    "demandId": '',
    "demandNumber": props.demandNumber,
    "partnerName": "",
    "pageNum": 1,
    "pageSize": 9999
  }
  console.log(props.bidPackageFlag, 'props.bidPackageFlag----')
  let url = `${API_CONTEXT}/manage/pickDemand/queryDemandSelectedPartnerPage`
  if(props.bidPackageFlag == '1'){
    param = {
      pageNum: 1,
      pageSize: 9999,
      partnerIndustry: props.industry || formData.value?.demandIndustry,
      partnerField: formData.value?.industryField,
      partnerScene: formData.value?.demandScene,
      bidPackageId: formData.value?.id,
    };
    url = `${API_CONTEXT}/manage/pickDemand/queryBidPackagePartnerPage`
  }
  // post(`${API_CONTEXT}/manage/pickPartner/queryPartnerMatchList`, param)
  post(url, param)
    .then(res => {
      // 有地方会把selectedPartners重新覆盖成[], 故暂时加了一个500ms的延迟, 后续需要找到是哪里对selectedPartners重新赋值了
      setTimeout(() => {
        selectedPartners.value = res.data?.dataList || [];
      }, 500);
    })
    .catch(e => {
      showToast('加载数据失败');
      console.error(e);
    });
};

// 已选择的合作伙伴列表
const selectedPartners = computed({
  get: () => props.partners || [],
  set: val => {
    emit('update:partners', val);
  },
});
// 分页配置
const partnerPage = reactive({
  currentPage: 1,
  pageSize: 10
});

// 分页后的数据
const paginatedPartners = computed(() => {
  const start = (partnerPage.currentPage - 1) * partnerPage.pageSize;
  const end = start + partnerPage.pageSize;
  console.log(selectedPartners.value, 'selectedPartners---284')
  return selectedPartners.value.slice(start, end);
});

const onViewGrayDetail = (row: ANY_OBJECT) => {
  grayRecordId.value = row.grayRecordId;
  grayDetailVisible.value = true;
};
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
.partner-name-risk {
  color: #f56c6c;
  cursor: pointer;
}
.risk-text {
  margin-left: 6px;
}
</style>
