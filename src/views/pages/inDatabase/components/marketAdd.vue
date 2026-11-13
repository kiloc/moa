<template>
  <van-cell-group class="card-section" inset>
    <div class="card-section__title">区域市场扩充</div>
    <van-form>
      <van-field label="扩充区域">
        <template #input>
          <div v-if="regionGroupList.length" class="region-list">
            <div v-for="(item, index) in regionGroupList" :key="item.joinId + '-' + item.regionCode + '-' + index" class="region-item">
              <div class="region-item__summary" @click="toggleExpand(item.joinId, item.regionCode)">
                <span class="region-item__index">{{ index + 1 }}</span>
                <span class="region-item__text">{{ item.regionName || '-' }}</span>
                <van-icon :name="expandedKeys.has(buildExpandKey(item.joinId, item.regionCode)) ? 'arrow-up' : 'arrow-down'" class="region-item__arrow" />
              </div>
              <div v-if="expandedKeys.has(buildExpandKey(item.joinId, item.regionCode))" class="region-item__detail">
                <div class="detail-row">
                  <span class="detail-row__label">库级别</span>
                  <span class="detail-row__value">{{ item.dictBusiLevelName || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-row__label">入库方式</span>
                  <span class="detail-row__value">{{ item.joinTypeName || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-row__label">区域</span>
                  <span class="detail-row__value">{{ item.regionName || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-row__label">行业</span>
                  <span class="detail-row__value">{{ item._industryName || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-row__label">行业领域</span>
                  <span class="detail-row__value">{{ item._fieldName || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-row__label">场景子库</span>
                  <span class="detail-row__value">{{ item._scenceName || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="region-empty">暂无数据</div>
        </template>
      </van-field>
<!--      <van-field label="入库依据" required>-->
<!--        <template #input>-->
<!--          <van-uploader-->
<!--            v-if="currentType === 'add' || currentType === 'edit'"-->
<!--            v-model="vantFiles"-->
<!--            :max-count="10"-->
<!--            :after-read="onAnnounceFileUploadSuccess"-->
<!--            @delete="onAnnounceFileRemove"-->
<!--          />-->
<!--          <div v-else>-->
<!--            <div v-for="item in formData.inboundFiles" :key="item.fileName" class="file-link" @click="downloadFile('inboundFiles', item.fileName, item.originalName)">-->
<!--              {{ item.originalName }}-->
<!--            </div>-->
<!--          </div>-->
<!--        </template>-->
<!--      </van-field>-->
      <van-field label="申请说明">
        <template #input>
          <span class="plain-text">{{ formData.outRemark || '-' }}</span>
        </template>
      </van-field>
    </van-form>
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { showToast } from 'vant';
import { getToken } from '@/common/utils';
import { API_CONTEXT } from '@/api/config';
import { AUTH_SIGN } from '@/common/http/config';
import { useDictMapStore, useLoginStore } from '@/store';
import groupBy from 'lodash/groupBy';

const loginStore = useLoginStore();
const dictMapStore = useDictMapStore();
const userInfo = computed(() => loginStore.userInfo || {}) as any;

const currentType = ref('add');
const vantFiles = ref<any[]>([]);

const formData = reactive({
  regionIncInfoHisDtoList: [] as any[],
  inboundFiles: [] as any[],
  partnerCode: '',
  outRemark: '',
}) as any;

// 展开/收起状态（按 (joinId, regionCode) 联合 key）
const expandedKeys = reactive(new Set());
const buildExpandKey = (joinId: string, regionCode: string) => `${joinId}__${regionCode}`;
const toggleExpand = (joinId: string, regionCode: string) => {
  const key = buildExpandKey(joinId, regionCode);
  if (expandedKeys.has(key)) {
    expandedKeys.delete(key);
  } else {
    expandedKeys.add(key);
  }
};

// 入库方式字典翻译：兼容 数字编码（'1'/'2'/'3'） 和 字符串枚举（DIRECT_IN / PURCHASE_IN / RECRUIT_IN / URGENT_ORIENT_IN）
const JOIN_TYPE_NUMBER_MAP: Record<string, string> = {
  '1': 'PURCHASE_IN',
  '2': 'RECRUIT_IN',
  '3': 'URGENT_ORIENT_IN',
};
const getJoinTypeName = (code: string) => {
  if (!code) return '';
  const list = dictMapStore.getDictMap?.joinType || [];
  const lookupCode = JOIN_TYPE_NUMBER_MAP[String(code)] || String(code);
  const hit = list.find(
    (item: any) => String(item.id) === lookupCode || String(item.itemId) === lookupCode,
  );
  return hit ? hit.name : String(code);
};

// 区域聚合列表：按 (joinId, regionCode) 联合去重，每项附带 库级别 / 入库方式 信息
const regionGroupList = computed(() => {
  const list = formData.regionIncInfoHisDtoList || [];
  const map = new Map<string, any>();
  list.forEach((item: any) => {
    const joinId = String(item.joinId || '');
    const code = item.regionCode || '';
    if (!code) return;
    // 同一入库单（joinId）下的同一区域聚合为一项
    const key = `${joinId}__${code}`;
    const gp = groupBy(item.industryIncInfoHisList, (d: any) => `${d.industryCode}_${d.fieldCode}`);
    const vls = Object.values(gp);
    if (!map.has(key)) {
      map.set(key, {
        joinId,
        joinName: item.joinName || '',
        regionCode: code,
        regionName: item.regionName || '',
        dictBusiLevel: item.dictBusiLevel || '',
        dictBusiLevelName: item.dictBusiLevelName || '',
        joinType: item.joinType || '',
        joinTypeName: getJoinTypeName(item.joinType),
        _industryName: vls.map((item: any) => item[0]?.industryName)?.join('/'),
        _fieldName: vls.map((item: any) => item[0]?.fieldName)?.join('/'),
        _scenceName: vls.map((item: any) => item.map((d: any) => d?.scenceName)?.join('/'))?.join('/'),
      });
    }
  });
  return Array.from(map.values());
});

const buildDisplayRegionList = (regionRelList: any[] = []) => {
  const displayList = [...regionRelList];
  const loginRegionCode = userInfo.value?.regionCode;
  const loginRegionName = userInfo.value?.regionName;
  if (loginRegionCode && !displayList.some(item => item?.regionCode === loginRegionCode)) {
    displayList.push({ regionCode: loginRegionCode, regionName: loginRegionName });
  }
  return displayList;
};

const showData = (data: any, type: string) => {
  currentType.value = type;
  const rawInboundData = data?.inboundFiles ?? data?.inboundFile;
  const inboundList = Array.isArray(rawInboundData) ? rawInboundData : rawInboundData ? [rawInboundData] : [];
  const inboundFileKindList = inboundList.filter((item: any) => String(item?.kind) === '20');
  inboundFileKindList.forEach((item: any) => {
    item.name = item.originalName;
    if (item.fileName == null && item.filename != null) item.fileName = item.filename;
  });
  formData.inboundFiles = inboundFileKindList;
  vantFiles.value = inboundFileKindList.map((f: any) => ({ ...f, url: '', name: f.originalName }));
  formData.outRemark = data.remark;
  if (data.regionIncInfoHisList?.length) {
    formData.regionIncInfoHisDtoList = data.regionIncInfoHisList;
  } else {
    formData.regionIncInfoHisDtoList = buildDisplayRegionList(data.regionRelList || []);
  }
  // 切换数据后重置展开状态
  expandedKeys.clear();
};

const downloadFile = (fieldName: string, filename: string, displayName: string) => {
  const token = getToken();
  const url = `${API_CONTEXT}/manage/file/download?fieldName=${encodeURIComponent(fieldName)}&filename=${encodeURIComponent(filename)}&asImage=false&Authorization=${encodeURIComponent(token || '')}`;
  window.open(url, '_blank');
};

const onAnnounceFileUploadSuccess = async (file: any) => {
  file.status = 'uploading';
  const fd = new FormData();
  fd.append('uploadFile', file.file);
  fd.append('fieldName', 'inboundFiles');
  fd.append('asImage', 'false');
  fd.append('businessId', '');
  fd.append('kind', '');
  try {
    const token = getToken();
    const res = await fetch(`${API_CONTEXT}/manage/file/upload`, {
      method: 'POST',
      headers: { Authorization: token || '', 'Auth-Sign': AUTH_SIGN, Sourcesystem: 'moa' },
      body: fd,
    });
    const response = await res.json();
    if (response.data) {
      formData.inboundFiles.push({
        fileName: response.data.filename || response.data.fileName,
        originalName: response.data.originalName,
        downloadUri: response.data.downloadUri,
        uploadPath: response.data.uploadPath,
        kind: '20',
      });
      file.status = 'done';
      showToast('文件上传成功');
    }
  } catch {
    file.status = 'failed';
  }
};

const onAnnounceFileRemove = (file: any) => {
  const index = formData.inboundFiles.findIndex((item: any) => item.originalName === file.originalName || item.originalName === file.name);
  if (index > -1) formData.inboundFiles.splice(index, 1);
};

const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.inboundFiles?.length) {
      showToast('请上传文件');
      reject();
      return;
    }
    const params = { ...formData };
    params.inboundFiles = (params.inboundFiles || []).map((item: any) => {
      const normalizedFileName = item.fileName || item.filename;
      return { ...item, fileName: normalizedFileName, filename: normalizedFileName, kind: item.kind ?? '20' };
    });
    params.regionIncInfoHisDtoList = [{
      regionCode: userInfo.value?.regionCode,
      regionName: userInfo.value?.regionName,
      outRemark: params.outRemark,
    }];
    resolve(params);
  });
};

defineExpose({ handleSubmit, showData });

onActivated(() => {
  formData.regionIncInfoHisDtoList = [];
  formData.inboundFiles = [];
  formData.partnerCode = '';
  formData.outRemark = '';
  vantFiles.value = [];
  expandedKeys.clear();
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

.file-link {
  color: #4A90E5;
  font-size: 13px;
  padding: 2px 0;
}

.plain-text {
  font-size: 14px;
  color: #323233;
  line-height: 1.5;
  word-break: break-all;
}

.region-list {
  width: 100%;
}

.region-item {
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;

  &__summary {
    display: flex;
    align-items: center;
    padding: 12px;
    cursor: pointer;
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

  &__text {
    flex: 1;
    font-size: 14px;
    color: #323233;
    margin-left: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    font-size: 14px;
    color: #969799;
    flex-shrink: 0;
    margin-left: 8px;
  }

  &__detail {
    padding: 0 12px 12px;
  }
}

.detail-row {
  display: flex;
  padding: 4px 0;
  font-size: 13px;

  &__label {
    color: #969799;
    width: 64px;
    flex-shrink: 0;
  }

  &__value {
    color: #323233;
    flex: 1;
    word-break: break-all;
  }
}

.region-empty {
  font-size: 13px;
  color: #969799;
  text-align: center;
  padding: 12px 0;
}
</style>
