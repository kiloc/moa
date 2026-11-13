<template>
  <van-popup
    :show="modelValue"
    position="bottom"
    round
    closeable
    close-icon-position="top-right"
    :style="{ maxHeight: '85%' }"
    @update:show="emit('update:modelValue', $event)"
  >
    <div class="partner-join-dialog">
      <div class="dialog-title">合作伙伴入库信息详情</div>

      <div v-if="loading" class="dialog-loading">
        <van-loading type="spinner" />
      </div>

      <div v-else-if="data" class="dialog-content">
        <div class="partner-header">
          <div class="header-row">
            <span class="header-label">合作伙伴名称：</span>
            <span class="header-value">{{ data.partnerName || '-' }}</span>
          </div>
          <div class="header-row">
            <span class="header-label">统一社会信用代码：</span>
            <span class="header-value">{{ data.uscc || '-' }}</span>
          </div>
        </div>

        <div v-if="flattenedJoinRows.length === 0" class="dialog-empty">
          <van-empty description="暂无入库信息" />
        </div>

        <div v-else class="join-list">
          <div
            v-for="(join, index) in joinGroups"
            :key="join.joinId"
            class="join-card"
          >
            <div class="join-card-header">
              <van-tag plain type="primary">{{ join.dictBusiLevelName || '-' }}</van-tag>
              <van-tag plain>{{ join.joinTypeName || '-' }}</van-tag>
              <van-tag plain :type="join.joinStateName === '在库' ? 'success' : 'warning'">
                {{ join.joinStateName || '-' }}
              </van-tag>
            </div>
            <van-cell title="入库时间" :value="formatDate(join.joinTime, 'YYYY-MM-DD HH:mm:ss') || '-'" />
            <template
              v-for="(region, rIdx) in join.regionList"
              :key="region.regionId ?? `region-${rIdx}`"
            >
              <div
                class="region-section"
                :class="{ 'region-section--bordered': rIdx > 0 }"
              >
                <div
                  v-for="(industry, iIdx) in region.industryList"
                  :key="`${region.regionId}-${iIdx}`"
                  class="industry-block"
                >
                  <van-cell title="区域" :value="region.regionName || '-'" />
                  <van-cell title="行业" :value="industry.industryName || '-'" />
                  <van-cell title="行业领域" :value="industry.fieldName || '-'" />
                  <van-cell title="场景子库" :value="industry.scenceName || '-'" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <van-button block type="primary" @click="emit('update:modelValue', false)">关闭</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import 'vant/es/toast/style'
import 'vant/es/loading/style'
import 'vant/es/tag/style'
import 'vant/es/cell/style'
import 'vant/es/empty/style'
import 'vant/es/popup/style'
import 'vant/es/button/style'
import { ANY_OBJECT } from '@/types/generic'
import { PartnerEvaluationController } from '@/api/partnerEvaluation'
import { formatDate } from '@/common/utils'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    partnerCode?: string
  }>(),
  {
    modelValue: false,
    partnerCode: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const data = ref<ANY_OBJECT | null>(null)
const loading = ref(false)

interface JoinGroup {
  joinId: string | number
  seq: number
  dictBusiLevelName: string
  joinTypeName: string
  joinTime: string
  joinStateName: string
  regionList: Array<{
    regionId: string | number
    regionName: string
    industryList: ANY_OBJECT[]
  }>
}

const joinGroups = computed<JoinGroup[]>(() => {
  const d = data.value
  if (!d || !Array.isArray(d.joinList) || d.joinList.length === 0) return []
  return d.joinList.map((join: ANY_OBJECT) => ({
    joinId: join.joinId,
    seq: join.seq,
    dictBusiLevelName: join.dictBusiLevelName || '',
    joinTypeName: join.joinTypeName || '',
    joinTime: join.joinTime || '',
    joinStateName: join.joinStateName || '',
    regionList: Array.isArray(join.regionList)
      ? join.regionList.map((region: ANY_OBJECT) => ({
          regionId: region.regionId,
          regionName: region.regionName || '',
          industryList: Array.isArray(region.industryList) ? region.industryList : [],
        }))
      : [],
  }))
})

// 保留扁平行结构用于统计空态判断
const flattenedJoinRows = computed<ANY_OBJECT[]>(() => {
  const groups = joinGroups.value
  const rows: ANY_OBJECT[] = []
  groups.forEach((g) => {
    if (g.regionList.length === 0) {
      rows.push({ joinId: g.joinId })
      return
    }
    g.regionList.forEach((r) => rows.push({ joinId: g.joinId, regionId: r.regionId }))
  })
  return rows
})

const loadData = async (code: string) => {
  if (!code) {
    showToast('合作伙伴编码为空')
    return
  }
  data.value = null
  loading.value = true
  try {
    const res = (await PartnerEvaluationController.queryPartnerJoinInfo({
      partnerCode: code,
    })) as ANY_OBJECT
    if (res?.success === false) {
      showToast(res?.errorMessage || '加载入库信息失败')
      return
    }
    data.value = res?.data || {}
  } catch (error) {
    console.error('加载入库信息失败：', error)
    showToast('加载入库信息失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.partnerCode] as const,
  ([visible, code]) => {
    if (visible && code) {
      loadData(code)
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.partner-join-dialog {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
  color: #323233;
}

.dialog-loading {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

.dialog-content {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

.partner-header {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.header-row {
  display: flex;
  font-size: 14px;
  line-height: 1.8;
}

.header-label {
  color: #646566;
  flex-shrink: 0;
}

.header-value {
  color: #323233;
  font-weight: 500;
  word-break: break-all;
}

.join-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.join-card {
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  overflow: hidden;
}

.join-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: #f7f8fa;
  border-bottom: 1px solid #ebedf0;
  flex-wrap: wrap;
}

.industry-block {
  padding: 0 12px;
}

.region-section {
  &--bordered {
    border-top: 1px dashed #ebedf0;
    margin-top: 8px;
    padding-top: 8px;
  }
}

.dialog-empty {
  padding: 20px 0;
}

.dialog-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebedf0;
  background: #ffffff;
}
</style>
