<template>
  <div class="negative-behavior-form">
    <van-cell-group class="card-section" inset>
      <div class="card-section__title">供应商负面信息</div>
      <van-form ref="formRef">
        <!-- 负面行为编号 -->
        <van-field label="负面行为编号">
          <template #input>
            <span class="plain-text">{{ formData.negativeBehaviorCode || '-' }}</span>
          </template>
        </van-field>
        <!-- 负面行为单据名称 -->
        <van-field label="负面行为单据名称">
          <template #input>
            <span class="plain-text">{{ formData.negativeBehaviorName || '-' }}</span>
          </template>
        </van-field>

        <!-- 供应商信息 -->
        <van-field label="供应商信息">
        </van-field>
        <div v-if="formData.partnerList.length" class="supplier-list">
          <div v-for="(item, index) in formData.partnerList" :key="index" class="supplier-card">
            <div class="supplier-card__header">
              <span class="supplier-card__index">{{ index + 1 }}</span>
              <span class="supplier-card__name">{{ item.partnerName || '-' }}</span>
              <template v-if="currentType === 'add' || currentType === 'edit'">
                <van-button size="mini" type="danger" plain @click="handleDeleteSupplier(index)" :disabled="formData.partnerList.length <= 1">删除</van-button>
                <van-button size="mini" type="primary" plain @click="handleEditSupplier(index)">修改</van-button>
              </template>
            </div>
            <div class="supplier-card__body">
              <div class="supplier-card__row">
                <span class="supplier-card__label">负面行为等级</span>
                <span class="supplier-card__value">{{ getDictName(dictMapStore.getDictMap.negativeBehaviorLevel, item.negativeBehaviorLevel) }}</span>
              </div>
              <div class="supplier-card__row">
                <span class="supplier-card__label">负面行为内容</span>
                <span class="supplier-card__value">{{ item.negativeBehaviorContent || '-' }}</span>
              </div>
              <div class="supplier-card__row">
                <span class="supplier-card__label">涉及项目/产品</span>
                <span class="supplier-card__value">{{ item.productContent || '-' }}</span>
              </div>
              <div class="supplier-card__row">
                <span class="supplier-card__label">责任追究</span>
                <span class="supplier-card__value">{{ item.negativeBehaviorAccountabilityContent || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="currentType === 'add' || currentType === 'edit'" class="add-supplier-btn">
          <van-button block type="primary" plain size="small" @click="handleAddSupplier">+ 添加供应商</van-button>
        </div>

        <!-- 决策文号 -->
        <van-field label="决策文号">
          <template #input>
            <span class="plain-text">{{ formData.decisionNumber || '-' }}</span>
          </template>
        </van-field>
        <!-- 决策会议纪要 -->
        <van-field label="决策会议纪要">
          <template #input>
            <div v-if="formData.decisionMinutesFiles?.length" class="file-list">
              <div v-for="item in formData.decisionMinutesFiles" :key="item.fileName" class="file-name">
                {{ item.originalName }}
              </div>
            </div>
            <span v-else class="plain-text">-</span>
          </template>
        </van-field>
        <!-- 其它负面行为 -->
        <van-field label="其它负面行为">
          <template #input>
            <span class="plain-text">{{ formData.otherNegativeBehavior || '-' }}</span>
          </template>
        </van-field>
        <!-- 是否涉及金额处罚 -->
        <van-field label="金额处罚">
          <template #input>
            <span class="plain-text">{{ isAmountPenaltyText || '-' }}</span>
          </template>
        </van-field>
        <!-- 处罚金额 -->
        <van-field v-if="formData.isAmountPenalty === '1'" label="处罚金额">
          <template #input>
            <span class="plain-text">{{ formData.penaltyAmount ? formData.penaltyAmount + ' 元' : '-' }}</span>
          </template>
        </van-field>
        <!-- 禁止合作时间 -->
        <van-field label="禁止合作时间">
          <template #input>
            <span class="plain-text">{{ formData.banCooperationStartTime && formData.banCooperationEndTime ? formData.banCooperationStartTime + ' 至 ' + formData.banCooperationEndTime : '-' }}</span>
          </template>
        </van-field>
        <!-- 禁止合作区域 -->
        <van-field label="禁止合作区域">
          <template #input>
            <template v-if="currentType !== 'auth' && currentType !== 'info'">
              <van-checkbox-group v-model="formData.regionList" class="region-checkbox-group">
                <van-checkbox name="全选" @change="handleSelectAll">全选</van-checkbox>
                <van-checkbox
                  v-for="item in dictMapStore.getDictMap.coopRegion"
                  :key="item.id"
                  :name="item.id"
                >{{ item.name }}</van-checkbox>
              </van-checkbox-group>
            </template>
            <div v-else class="region-tags">
              <van-tag
                v-for="name in getRegionNames(formData.regionList, dictMapStore.getDictMap.coopRegion)"
                :key="name"
                type="primary"
                plain
                size="medium"
                class="region-tag"
              >{{ name }}</van-tag>
              <span v-if="!getRegionNames(formData.regionList, dictMapStore.getDictMap.coopRegion).length" class="plain-text">-</span>
            </div>
          </template>
        </van-field>
      </van-form>
    </van-cell-group>

    <!-- 是否涉及金额处罚 Picker -->
    <van-popup v-model:show="showPenaltyPicker" position="bottom" round>
      <van-picker
        :columns="penaltyOptions"
        @confirm="onPenaltyConfirm"
        @cancel="showPenaltyPicker = false"
      />
    </van-popup>

    <!-- 开始日期 Picker -->
    <van-popup v-model:show="showStartDatePicker" position="bottom" round>
      <van-date-picker
        v-model="startDatePickerValue"
        title="选择开始日期"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date(2030, 11, 31)"
        @confirm="onStartDateConfirm"
        @cancel="showStartDatePicker = false"
      />
    </van-popup>

    <!-- 结束日期 Picker -->
    <van-popup v-model:show="showEndDatePicker" position="bottom" round>
      <van-date-picker
        v-model="endDatePickerValue"
        title="选择结束日期"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date(2030, 11, 31)"
        @confirm="onEndDateConfirm"
        @cancel="showEndDatePicker = false"
      />
    </van-popup>

    <!-- 供应商弹窗 -->
    <van-popup v-model:show="supplierDialogVisible" position="bottom" round :style="{ maxHeight: '90%' }">
      <div class="supplier-popup">
        <div class="supplier-popup__header">
          <span class="supplier-popup__title">{{ supplierDialogTitle }}</span>
          <van-icon name="cross" @click="supplierDialogVisible = false" />
        </div>
        <div class="supplier-popup__body">
          <!-- 供应商名称 -->
          <van-field
            v-model="supplierForm.partnerName"
            is-link
            readonly
            label="供应商名称"
            placeholder="请选择供应商"
            required
            @click="showSupplierPicker = true"
          />
          <!-- 负面行为等级 -->
          <van-field
            v-model="negativeBehaviorLevelText"
            is-link
            readonly
            label="负面行为等级"
            placeholder="请选择负面行为等级"
            required
            @click="showLevelPicker = true"
          />
          <!-- 负面行为内容 -->
          <van-field
            v-model="supplierForm.negativeBehaviorContent"
            label="负面行为内容"
            type="textarea"
            rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请输入负面行为内容"
            required
          />
          <!-- 涉及项目/产品 -->
          <van-field
            v-model="supplierForm.productContent"
            label="涉及项目/产品"
            maxlength="100"
            show-word-limit
            placeholder="请输入涉及项目/产品"
            required
          />
          <!-- 负面行为责任追究 -->
          <van-field
            v-model="supplierForm.negativeBehaviorAccountabilityContent"
            label="责任追究"
            type="textarea"
            rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请输入负面行为责任追究"
            required
          />
        </div>
        <div class="supplier-popup__footer">
          <van-button block @click="supplierDialogVisible = false">关闭</van-button>
          <van-button block type="primary" @click="handleSupplierSubmit">确定</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 供应商选择 Picker -->
    <van-popup v-model:show="showSupplierPicker" position="bottom" round>
      <div class="supplier-search-popup">
        <van-search v-model="supplierSearchQuery" placeholder="搜索供应商" @search="remoteMethod" @update:model-value="onSupplierSearchInput" />
        <div class="supplier-search-list">
          <van-cell
            v-for="item in options"
            :key="item.partnerCode"
            :title="item.partnerName"
            clickable
            @click="onSupplierSelect(item)"
          />
          <van-empty v-if="!options.length && supplierSearchQuery" description="无搜索结果" />
        </div>
      </div>
    </van-popup>

    <!-- 负面行为等级 Picker -->
    <van-popup v-model:show="showLevelPicker" position="bottom" round>
      <van-picker
        :columns="levelOptions"
        @confirm="onLevelConfirm"
        @cancel="showLevelPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { showToast } from 'vant';
import { useLoginStore, useDictMapStore } from '@/store';
import { getToken } from '@/common/utils';
import { API_CONTEXT } from '@/api/config';
import DataBaseController from '@/api/dataBase/DataBaseController';
// import { useUpload } from '@/common/hooks/useUpload';

const loginStore = useLoginStore();
const dictMapStore = useDictMapStore();
// const { getUploadHeaders, getUploadActionUrl, fileListToJson } = useUpload();

const currentType = ref('add');
const decisionMinutesFiles = ref<any[]>([]);

// Picker 状态
const showPenaltyPicker = ref(false);
const showStartDatePicker = ref(false);
const showEndDatePicker = ref(false);
const showSupplierPicker = ref(false);
const showLevelPicker = ref(false);
const supplierSearchQuery = ref('');

// 金额处罚选项
const penaltyOptions = [
  { text: '是', value: '1' },
  { text: '否', value: '0' },
];

// 等级选项
const levelOptions = computed(() =>
  (dictMapStore.getDictMap.negativeBehaviorLevel || []).map(item => ({
    text: item.name,
    value: item.id,
  }))
);

// 日期选择器值
const startDatePickerValue = ref(['2024', '01', '01']);
const endDatePickerValue = ref(['2024', '01', '01']);

// 弹窗相关
const supplierDialogVisible = ref(false);
const supplierDialogTitle = ref('新增供应商负面信息');
const editingIndex = ref(-1);

// 表单数据
const formData = reactive({
  partnerList: [] as any[],
  negativeBehaviorCode: '',
  negativeBehaviorName: '',
  decisionNumber: '',
  otherNegativeBehavior: '',
  isAmountPenalty: '',
  penaltyAmount: '',
  banCooperationStartTime: '',
  banCooperationEndTime: '',
  regionList: [] as any,
  decisionMinutesFiles: [] as any[],
});

// 供应商表单数据
const supplierForm = reactive({
  partnerCode: '',
  partnerName: '',
  negativeBehaviorLevel: '',
  negativeBehaviorContent: '',
  productContent: '',
  negativeBehaviorAccountabilityContent: '',
});

// 计算属性：显示文本
const isAmountPenaltyText = computed(() => {
  if (formData.isAmountPenalty === '1') return '是';
  if (formData.isAmountPenalty === '0') return '否';
  return '';
});

const negativeBehaviorLevelText = computed(() => {
  return getDictName(dictMapStore.getDictMap.negativeBehaviorLevel, supplierForm.negativeBehaviorLevel);
});

const banCooperationStartTimeText = computed(() => formData.banCooperationStartTime || '');
const banCooperationEndTimeText = computed(() => formData.banCooperationEndTime || '');

// 金额处罚确认
const onPenaltyConfirm = ({ selectedOptions }) => {
  formData.isAmountPenalty = selectedOptions[0].value;
  showPenaltyPicker.value = false;
};

// 开始日期确认
const onStartDateConfirm = ({ selectedValues }) => {
  formData.banCooperationStartTime = selectedValues.join('-');
  showStartDatePicker.value = false;
};

// 结束日期确认
const onEndDateConfirm = ({ selectedValues }) => {
  formData.banCooperationEndTime = selectedValues.join('-');
  showEndDatePicker.value = false;
};

// 供应商搜索
const loading = ref(false);
const options = ref<any[]>([]);
let searchTimer: any = null;

const onSupplierSearchInput = (val: string) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    remoteMethod(val);
  }, 300);
};

const remoteMethod = (query: string) => {
  if (query) {
    loading.value = true;
    DataBaseController.searchPartnerAll({
      pageNum: 1,
      pageSize: 20,
      partnerName: query,
      partnerCode: '',
      state: 0,
    })
      .then(res => {
        loading.value = false;
        options.value = res.data.dataList || [];
      })
      .catch(() => {
        loading.value = false;
      });
  } else {
    options.value = [];
  }
};

// 供应商选择
const onSupplierSelect = (item: any) => {
  supplierForm.partnerCode = item.partnerCode;
  supplierForm.partnerName = item.partnerName;
  showSupplierPicker.value = false;
};

// 负面行为等级确认
const onLevelConfirm = ({ selectedOptions }) => {
  supplierForm.negativeBehaviorLevel = selectedOptions[0].value;
  showLevelPicker.value = false;
};

// 获取区域名称
const getRegionNames = (regionList: string[], allRegions: any[]) => {
  if (!regionList || !allRegions) return [];
  return allRegions
    .filter(region => regionList.includes(region.id))
    .map(region => region.name);
};

// 全选禁止合作区域
const handleSelectAll = (val: boolean) => {
  if (val) {
    const list = (dictMapStore.getDictMap as any).coopRegion || [];
    formData.regionList = ['全选', ...list.map(item => item.id)];
  } else {
    formData.regionList = [];
  }
};

// 文件上传
// const onAnnounceFileUpload = (file: any) => {
//   const formDataObj = new FormData();
//   formDataObj.append('uploadFile', file.file);
//   formDataObj.append('fieldName', 'decisionMinutesFiles');
//   formDataObj.append('asImage', 'false');
//
//   fetch(getUploadActionUrl(`${API_CONTEXT}/manage/file/upload`), {
//     method: 'POST',
//     headers: getUploadHeaders,
//     body: formDataObj,
//   })
//     .then(res => res.json())
//     .then(res => {
//       if (res.data) {
//         decisionMinutesFiles.value.push({
//           url: res.data.downloadUri,
//           fileName: res.data.filename,
//           originalName: res.data.originalName,
//           downloadUri: res.data.downloadUri,
//           uploadFailed: '0',
//           uploadPath: res.data.uploadPath,
//         });
//         formData.decisionMinutesFiles = decisionMinutesFiles.value;
//         showToast('文件上传成功');
//       }
//     })
//     .catch(() => {
//       showToast('文件上传失败');
//     });
// };

const onAnnounceFileDelete = (file: any, index: number) => {
  decisionMinutesFiles.value.splice(index, 1);
  formData.decisionMinutesFiles = decisionMinutesFiles.value;
};

const onUploadOversize = () => {
  showToast('文件大小不能超过10MB');
};

// 文件下载
const downloadFile = (fieldName: string, filename: string, displayName: string) => {
  const token = getToken();
  const url = `${API_CONTEXT}/manage/file/download?fieldName=${encodeURIComponent(fieldName)}&filename=${encodeURIComponent(filename)}&asImage=false&Authorization=${encodeURIComponent(token || '')}`;
  window.open(url, '_blank');
};

// 添加供应商
const handleAddSupplier = () => {
  Object.assign(supplierForm, {
    partnerCode: '',
    partnerName: '',
    negativeBehaviorLevel: '',
    negativeBehaviorContent: '',
    productContent: '',
    negativeBehaviorAccountabilityContent: '',
  });
  supplierDialogTitle.value = '新增供应商负面信息';
  editingIndex.value = -1;
  supplierDialogVisible.value = true;
};

// 删除供应商
const handleDeleteSupplier = (index: number) => {
  if (formData.partnerList.length <= 1) {
    showToast('至少保留一条供应商信息');
    return;
  }
  formData.partnerList.splice(index, 1);
};

// 编辑供应商
const handleEditSupplier = (index: number) => {
  const supplier = formData.partnerList[index];
  Object.assign(supplierForm, {
    partnerCode: supplier.partnerCode,
    partnerName: supplier.partnerName,
    negativeBehaviorLevel: supplier.negativeBehaviorLevel,
    negativeBehaviorContent: supplier.negativeBehaviorContent,
    productContent: supplier.productContent,
    negativeBehaviorAccountabilityContent: supplier.negativeBehaviorAccountabilityContent,
  });
  supplierDialogTitle.value = '修改供应商负面信息';
  editingIndex.value = index;
  supplierDialogVisible.value = true;
};

// 供应商表单提交
const handleSupplierSubmit = () => {
  if (!supplierForm.partnerCode) {
    showToast('请选择供应商');
    return;
  }
  if (!supplierForm.negativeBehaviorLevel) {
    showToast('请选择负面行为等级');
    return;
  }
  if (!supplierForm.negativeBehaviorContent) {
    showToast('请输入负面行为内容');
    return;
  }
  if (!supplierForm.productContent) {
    showToast('请输入涉及项目/产品');
    return;
  }
  if (!supplierForm.negativeBehaviorAccountabilityContent) {
    showToast('请输入负面行为责任追究');
    return;
  }

  if (editingIndex.value === -1) {
    formData.partnerList.push({ ...supplierForm });
  } else {
    formData.partnerList[editingIndex.value] = { ...supplierForm };
  }
  supplierDialogVisible.value = false;
  showToast('操作成功');
};

// 获取字典名称
const getDictName = (dictList: any[], value: string) => {
  if (!dictList || !value) return '-';
  const item = dictList.find(item => item.id === value);
  return item ? item.name : '-';
};

// 显示数据
const showData = (data: any, type: string) => {
  currentType.value = type;
  formData.negativeBehaviorCode = data.negativeBehaviorCode;
  formData.negativeBehaviorName = data.negativeBehaviorName;
  formData.partnerList = [];

  (data.partnerList || []).forEach(item => {
    if (!item.partnerCode) {
      item.partnerCode = item.partnerName;
    }
    formData.partnerList.push({ ...item });
    options.value.push({
      partnerCode: item.partnerCode,
      partnerName: item.partnerName,
    });
  });

  formData.decisionNumber = data.decisionNumber;
  formData.otherNegativeBehavior = data.otherNegativeBehavior;
  formData.isAmountPenalty = data.isAmountPenalty;
  formData.penaltyAmount = data.penaltyAmount;
  formData.banCooperationStartTime = data.banCooperationStartTime;
  formData.banCooperationEndTime = data.banCooperationEndTime;
  formData.regionList = [];

  (data.regionList || []).forEach(item => {
    formData.regionList.push(item.regionCode);
  });

  (data.decisionMinutesFiles || []).forEach(item => {
    item.name = item.originalName;
  });

  decisionMinutesFiles.value = [...(data.decisionMinutesFiles || [])];
  formData.decisionMinutesFiles = data.decisionMinutesFiles || [];

  // 初始化日期选择器
  if (data.banCooperationStartTime) {
    const parts = data.banCooperationStartTime.split('-');
    startDatePickerValue.value = parts;
  }
  if (data.banCooperationEndTime) {
    const parts = data.banCooperationEndTime.split('-');
    endDatePickerValue.value = parts;
  }
};

// 表单提交
const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.partnerList.length) {
      showToast('请添加供应商');
      reject();
      return;
    }
    // 校验供应商信息完整性
    let isValid = true;
    formData.partnerList.forEach(row => {
      if (!row.partnerCode || !row.partnerName || !row.negativeBehaviorLevel || !row.negativeBehaviorContent || !row.negativeBehaviorAccountabilityContent || !row.productContent) {
        isValid = false;
      }
    });
    if (!isValid) {
      showToast('请填写完整的供应商信息');
      reject();
      return;
    }
    if (!formData.decisionNumber) {
      showToast('请输入决策文号');
      reject();
      return;
    }
    if (!formData.decisionMinutesFiles?.length) {
      showToast('请上传决策会议纪要');
      reject();
      return;
    }

    let params = { ...formData } as any;
    params.regionList = [];
    const list = (dictMapStore.getDictMap as any).coopRegion || [];
    formData.regionList.forEach(val => {
      list.forEach(item => {
        if (val === item.id) {
          params.regionList.push({
            regionCode: item.id,
            regionName: item.name,
          });
        }
      });
    });
    resolve(params);
  });
};

defineExpose({
  handleSubmit,
  showData,
});

onMounted(() => {});
</script>

<style lang="scss" scoped>
.negative-behavior-form {
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

  .plain-text {
    font-size: 14px;
    color: #323233;
    line-height: 1.5;
  }

  .unit-text {
    font-size: 14px;
    color: #969799;
  }

  // 供应商列表
  .supplier-list {
    padding: 0 16px 8px;
  }

  .supplier-card {
    background: #f7f8fa;
    border-radius: 8px;
    margin-bottom: 8px;
    overflow: hidden;

    &__header {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      gap: 6px;
    }

    &__index {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #4A90E5;
      color: #fff;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    &__name {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #323233;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__body {
      padding: 0 12px 10px 42px;
    }

    &__row {
      display: flex;
      align-items: flex-start;
      padding: 3px 0;
      font-size: 13px;
    }

    &__label {
      color: #969799;
      width: 80px;
      flex-shrink: 0;
    }

    &__value {
      color: #323233;
      flex: 1;
      word-break: break-all;
    }
  }

  .add-supplier-btn {
    padding: 8px 16px;
  }

  // 上传提示
  .upload-tip {
    font-size: 12px;
    color: #969799;
    margin-top: 4px;
  }

  // 文件列表
  .file-list {
    width: 100%;
  }

  .file-name {
    font-size: 13px;
    color: #4A90E5;
    padding: 2px 0;
  }

  .file-link {
    color: #4A90E5;
    font-size: 13px;
    padding: 2px 0;
  }

  // 区域复选框
  .region-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .region-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .region-tag {
    margin: 0;
  }

  // 供应商弹窗
  .supplier-popup {
    padding: 16px;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    &__title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }

    &__body {
      max-height: 60vh;
      overflow-y: auto;
    }

    &__footer {
      display: flex;
      gap: 12px;
      margin-top: 16px;

      .van-button {
        flex: 1;
      }
    }
  }

  // 供应商搜索弹窗
  .supplier-search-popup {
    max-height: 50vh;
    overflow-y: auto;
  }
}
</style>
