<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">发起人信息</div>
    <van-form ref="formRef">
      <van-field v-model="documentCodeText" label="单据编号" readonly />
      <van-field
        v-if="currentType === 'add'"
        v-model="formData.documentName"
        :label="props.documentTitle + '单据名称'"
        :placeholder="'请输入' + props.documentTitle + '单据名称'"
        required
      />
      <van-field v-else v-model="documentNameText" :label="props.documentTitle + '单据名称'" autosize
        type="textarea" readonly />
      <van-field v-model="formData.createUserName" label="发起人" readonly />
      <van-field v-model="formData.createDeptName" label="发起单位/部门" readonly />
      <van-field v-model="formData.createPhone" label="发起人联系方式" readonly />
      <van-field v-model="formData.deptName" label="地市" readonly />
      <van-field
        v-if="currentType === 'add'"
        v-model="formData.partnerName"
        is-link
        readonly
        label="选择合作伙伴"
        placeholder="请输入关键字搜索"
        required
        @click="openPartnerPicker"
      />
    </van-form>

    <van-popup v-model:show="showPartnerPopup" round position="bottom" :style="{ height: '60%' }">
      <div class="partner-popup">
        <van-search v-model="searchQuery" placeholder="请输入关键字搜索" @search="remoteMethod" @clear="onClearSearch" />
        <van-cell
          v-for="item in options"
          :key="item.partnerCode"
          :title="item.partnerName"
          is-link
          @click="selectPartner(item)"
        />
        <van-empty v-if="!options.length" description="暂无数据" />
      </div>
    </van-popup>
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { showToast } from 'vant';
import { useLoginStore } from '@/store';
import { useRouter } from 'vue-router';
import DataBaseController from '@/api/dataBase/DataBaseController';
import { FlowOperationController } from '@/api/flow'

const loginStore = useLoginStore();
const userInfo = computed(() => loginStore.userInfo || {}) as any;
const router = useRouter();

interface FormData {
  createUserName: string;
  createDeptName: string;
  createPhone: string;
  deptName: string;
  partnerCode: string;
  partnerId: string;
  partnerName: string;
  documentCode: string;
  documentName: string;
}

interface Props {
  documentTitle?: string;
}

const params = router.currentRoute.value.query || {};
const props = withDefaults(defineProps<Props>(), { documentTitle: '' });

const showPartnerPopup = ref(false);
const searchQuery = ref('');
const loading = ref(false);
const options = ref<any[]>([]);

const formData = reactive<FormData>({
  createUserName: userInfo.value?.showName,
  createDeptName: userInfo.value?.deptName,
  createPhone: userInfo.value?.loginName,
  deptName: userInfo.value?.deptName,
  partnerCode: '',
  partnerId: '',
  partnerName: '',
  documentCode: '',
  documentName: '',
});

const currentType = ref('add');
const formRef = ref();

const documentCodeText = computed(() => formData.documentCode || '-');
const documentNameText = computed(() => formData.documentName || '-');
const partnerNameText = computed(() => formData.partnerName || '-');

const emit = defineEmits(['changePartnerCode']);

const openPartnerPicker = () => {
  showPartnerPopup.value = true;
  searchQuery.value = '';
  options.value = [];
};

const onClearSearch = () => {
  options.value = [];
};

const remoteMethod = (query: string) => {
  if (!query) { options.value = []; return; }
  loading.value = true;
  DataBaseController.searchPartner({
    pageNum: 1,
    pageSize: 20,
    partnerName: query,
    partnerCode: '',
    state: 0,
  })
    .then((res: any) => {
      loading.value = false;
      options.value = res.data?.dataList || [];
    })
    .catch(() => { loading.value = false; });
};

const selectPartner = (item: any) => {
  formData.partnerCode = item.partnerCode;
  formData.partnerId = item.id;
  formData.partnerName = item.partnerName;
  emit('changePartnerCode', item.partnerCode, item.partnerName);
  showPartnerPopup.value = false;
};

const showData = (data: any, type: string) => {
  currentType.value = type;
  formData.partnerCode = data.partnerCode;
  formData.partnerId = data.id;
  formData.partnerName = data.partnerName;
  formData.documentCode = data.documentCode;
  formData.documentName = data.documentName;
  initiatorInfo();
};

const initiatorInfo = () =>{
  FlowOperationController.getRuntimeTaskInitiatorInfo({ taskId: params.taskId as string || '' })
    .then((res) => {
      if (res.data) {
        const obj = res.data
        formData.createUserName= obj.showName || ''
        formData.createDeptName= obj.processInstanceInitiatorDeptName || ''
        formData.createPhone= obj.processInstanceInitiatorMobile || ''
        formData.deptName= obj.processInstanceInitiatorCityName || ''
      }
    })
    .catch(e => console.error(e))
}

const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (currentType.value === 'add' && !formData.partnerCode) {
      showToast('请选择合作伙伴');
      reject();
      return;
    }
    if (!formData.documentName) {
      showToast('请输入单据名称');
      reject();
      return;
    }
    resolve(formData);
  });
};

defineExpose({ handleSubmit, showData });

onActivated(() => {
  formData.partnerCode = '';
  formData.partnerName = '';
});
</script>

<style lang="scss" scoped>
.card-section {
  margin: 12px 0 !important;

  &__title {
    padding: 14px 16px 6px;
    font-size: 15px;
    font-weight: 600;
    color: #323233;
  }
}

.partner-popup {
  padding: 16px;
}
</style>
