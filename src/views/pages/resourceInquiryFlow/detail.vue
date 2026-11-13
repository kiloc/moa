<script setup lang="ts">
import type { ANY_OBJECT } from '@/types/generic'
import { ref } from 'vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'
import InfoHeader from '@/views/pages/components/common/info-header.vue'
import { useDictMapStore } from '@/store'
import { getToken } from '@/common/utils'
import { API_CONTEXT } from '@/api/config';

const _props = withDefaults(
  defineProps<{
    flowEntryName: string
    taskName: string
    flowTaskCommentList?: any[]
    formData?: ANY_OBJECT
    /** true=禁用修改，false=可修改 */
    readonly?: boolean,
    announceFormData?: ANY_OBJECT
  }>(),
  {
    flowEntryName: '',
    taskName: '甄选项目情况摸底审批',
    flowTaskCommentList: () => [],
    formData: () => ({}),
    readonly: true,
    announceFormData: () => ({}),
  },
)

const dictMapStore = useDictMapStore()
const activeName = ref('1')

const DEFAULT_TASK_TYPE_LIST = [
  { id: '1', itemId: '1', name: '产品询价' },
  { id: '2', itemId: '2', name: '其他' },
]

/** 任务类型单选，统一为字符串避免回显不匹配 */
const taskType = computed({
  get: () => {
    const val = _props.formData?.taskType
    return val === undefined || val === null ? '' : String(val)
  },
  set: (val: string) => {
    if (_props.formData)
      _props.formData.taskType = val
  },
})

const industryList = computed(
  () => ((dictMapStore.dictMap as ANY_OBJECT).portalIndustryList || []) as ANY_OBJECT[],
)

const regionList = computed(
  () => ((dictMapStore.dictMap as ANY_OBJECT).regionCityCode || []) as ANY_OBJECT[],
)

/** 全部（空数组等价于选中全部） */
const SELECT_ALL = '__ALL__'

function getOptionId(item: ANY_OBJECT) {
  return item.id ?? item.codeId
}

function getOptionName(item: ANY_OBJECT) {
  return item.name || item.codeName || ''
}

function getCodesText(codes: unknown, list: ANY_OBJECT[]) {
  if (!Array.isArray(codes) || !codes.length)
    return '全部'
  const codeSet = new Set(codes.map(String))
  return list
    .filter(item => codeSet.has(String(getOptionId(item))))
    .map(item => getOptionName(item))
    .filter(Boolean)
    .join('、')
}

function normalizeAllSelection(current: string[], vals: Array<string | number>) {
  const next = vals.map(String)
  const hadAll = current.includes(SELECT_ALL)
  const hasAll = next.includes(SELECT_ALL)

  if (hasAll && !hadAll)
    return [SELECT_ALL]
  if (hasAll && next.length > 1)
    return next.filter(v => v !== SELECT_ALL)
  if (!next.length)
    return [SELECT_ALL]
  return next.filter(v => v !== SELECT_ALL)
}

function toTempCodes(codes: unknown) {
  return (!Array.isArray(codes) || !codes.length)
    ? [SELECT_ALL]
    : codes.map(String)
}

function fromTempCodes(tempCodes: string[]) {
  const isAll = !tempCodes.length || tempCodes.includes(SELECT_ALL)
  return isAll ? [] : tempCodes.filter(code => code !== SELECT_ALL)
}

/** 已选行业展示文案，空数组显示「全部」 */
const industryCodesText = computed(() =>
  getCodesText(_props.formData?.industryCodes, industryList.value),
)

const showIndustryPicker = ref(false)
const tempIndustryCodes = ref<string[]>([])

function onIndustryCodesUpdate(vals: Array<string | number>) {
  tempIndustryCodes.value = normalizeAllSelection(tempIndustryCodes.value, vals)
}

function openIndustryPicker() {
  if (_props.readonly)
    return
  tempIndustryCodes.value = toTempCodes(_props.formData?.industryCodes)
  showIndustryPicker.value = true
}

function confirmIndustryPicker() {
  if (_props.formData)
    _props.formData.industryCodes = fromTempCodes(tempIndustryCodes.value)
  showIndustryPicker.value = false
}

function toggleIndustry(id: string | number) {
  const key = String(id)
  const current = [...tempIndustryCodes.value]
  const idx = current.findIndex(code => code === key)
  const next = idx > -1
    ? current.filter((_, i) => i !== idx)
    : [...current, key]
  onIndustryCodesUpdate(next)
}

/** 已选区域展示文案，空数组显示「全部」 */
const regionCodesText = computed(() =>
  getCodesText(_props.formData?.regionCodes, regionList.value),
)

const showRegionPicker = ref(false)
const tempRegionCodes = ref<string[]>([])

function onRegionCodesUpdate(vals: Array<string | number>) {
  tempRegionCodes.value = normalizeAllSelection(tempRegionCodes.value, vals)
}

function openRegionPicker() {
  if (_props.readonly)
    return
  tempRegionCodes.value = toTempCodes(_props.formData?.regionCodes)
  showRegionPicker.value = true
}

function confirmRegionPicker() {
  if (_props.formData)
    _props.formData.regionCodes = fromTempCodes(tempRegionCodes.value)
  showRegionPicker.value = false
}

function toggleRegion(id: string | number) {
  const key = String(id)
  const current = [...tempRegionCodes.value]
  const idx = current.findIndex(code => code === key)
  const next = idx > -1
    ? current.filter((_, i) => i !== idx)
    : [...current, key]
  onRegionCodesUpdate(next)
}

/** 只保留年月日 YYYY-MM-DD */
function formatDateOnly(val?: string) {
  if (!val)
    return ''
  return String(val).slice(0, 10)
}

type DateFieldKey = 'applyStartTime' | 'applyEndTime' | 'showStartTime' | 'showEndTime'

const showDatePicker = ref(false)
const datePickerField = ref<DateFieldKey>('applyStartTime')
const datePickerValue = ref<string[]>(['2025', '01', '01'])
const datePickerTitle = computed(() => {
  const map: Record<DateFieldKey, string> = {
    applyStartTime: '选择应答开始日期',
    applyEndTime: '选择应答结束日期',
    showStartTime: '选择展示开始日期',
    showEndTime: '选择展示结束日期',
  }
  return map[datePickerField.value]
})

const downloadFile = (file: any) => {
  const token = getToken()
  const url = `${API_CONTEXT}/manage/file/download?fieldName=recruitmentPlanFiles&filename=${encodeURIComponent(file.fileName)}&asImage=false&Authorization=${encodeURIComponent(token || '')}`
  window.open(url, '_blank')
}

function toPickerValue(val?: string) {
  const dateStr = formatDateOnly(val)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
    return dateStr.split('-')
  const now = new Date()
  return [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ]
}

function openDatePicker(field: DateFieldKey) {
  if (_props.readonly)
    return
  datePickerField.value = field
  datePickerValue.value = toPickerValue(_props.formData?.[field])
  showDatePicker.value = true
}

function onDatePickerConfirm({ selectedValues }: { selectedValues: string[] }) {
  const val = selectedValues.join('-')
  if (_props.formData)
    _props.formData[datePickerField.value] = val
  showDatePicker.value = false
}
</script>

<template>
  <div class="mobile-detail">
    <div class="mobile-detail-content-wrapper">
      <div class="page-title">
        {{ flowEntryName }}{{ taskName ? `-${taskName}` : '' }}
      </div>
      <InfoHeader
        :create-user-name="announceFormData.createUserName"
        :create-user-phone="announceFormData.createUserPhone"
        :create-time="announceFormData.createTime"
        :create-user-org="announceFormData.createUserOrg"
        :create-user-city-name="announceFormData.createUserCityName"
      />

      <van-tabs v-model:active="activeName" type="card">
        <van-tab title="业务信息" name="1">
          <div class="tab-content">
            <div class="section">
              <div class="section-subtitle">
                甄选需求信息
              </div>
              <van-field v-model="formData.title" label="任务标题" :readonly="readonly">
                <template #input>
                  <div class="rich-text" v-html="formData.title || '-'" />
                </template>
              </van-field>
              <van-field name="taskType" label="任务类型">
                <template #input>
                  <van-radio-group
                    v-model="taskType"
                    direction="horizontal"
                    v-if="!readonly"
                  >
                    <van-radio
                      v-for="item in DEFAULT_TASK_TYPE_LIST"
                      :key="item.id"
                      :name="item.id"
                    >
                      {{ item.name }}
                    </van-radio>
                  </van-radio-group>
                  <div v-else>
                    {{ taskType === '1' ? '产品询价' : '其他' }}
                  </div>
                </template>
              </van-field>
              <van-field label="任务正文">
                <template #input>
                  <div class="rich-text" v-html="formData.content || '-'" />
                </template>
              </van-field>
              <van-field
                :model-value="formatDateOnly(formData.applyStartTime)"
                label="任务开始时间"
                readonly
                :is-link="!readonly"
                :placeholder="readonly ? '' : '请选择日期'"
                @click="openDatePicker('applyStartTime')"
              />
              <van-field
                :model-value="formatDateOnly(formData.applyEndTime)"
                label="任务结束时间"
                readonly
                :is-link="!readonly"
                :placeholder="readonly ? '' : '请选择日期'"
                @click="openDatePicker('applyEndTime')"
              />
              <!-- <van-field
                :model-value="formatDateOnly(formData.showStartTime)"
                label="展示开始时间"
                readonly
                :is-link="!readonly"
                :placeholder="readonly ? '' : '请选择日期'"
                @click="openDatePicker('showStartTime')"
              /> -->
              <van-field
                :model-value="formatDateOnly(formData.showEndTime)"
                label="展示结束时间"
                readonly
                :is-link="!readonly"
                :placeholder="readonly ? '' : '请选择日期'"
                @click="openDatePicker('showEndTime')"
              />
              <van-field name="isTop" label="是否置顶">
                <template #input>
                  <van-radio-group
                    v-model="formData.isTop"
                    direction="horizontal"
                    v-if="!readonly"
                  >
                    <van-radio v-if="!readonly" :name="0">
                      是
                    </van-radio>
                    <van-radio v-if="!readonly" :name="1">
                      否
                    </van-radio>
                  </van-radio-group>
                  <div v-else>
                    {{ formData.isTop === 0 ? '是' : '否' }}
                  </div>
                </template>
              </van-field>
              <van-field v-model="formData.createUserName" label="创建人" readonly />
              <van-field v-model="formData.publishUnit" label="发布单位" readonly />
              <van-field
                :model-value="industryCodesText"
                label="应答行业限制"
                readonly
                :is-link="!readonly"
                :placeholder="readonly ? '' : '请选择行业'"
                @click="openIndustryPicker"
              >
                <template #input>
                  <div class="rich-text" v-html="industryCodesText || '-'" />
                </template>
              </van-field>
              <van-field
                :model-value="regionCodesText"
                label="应答区域限制"
                readonly
                :is-link="!readonly"
                :placeholder="readonly ? '' : '请选择区域'"
                @click="openRegionPicker"
              >
                <template #input>
                  <div class="rich-text" v-html="regionCodesText || '-'" />
                </template>
              </van-field>
              <van-field v-model="formData.aa" label="附件" :readonly="readonly">
                <template #input>
                  <div class="file-list">
                    <div v-for="file in formData.publishFiles" :key="file.fileName" class="file-item">
                      <span @click="downloadFile(file)">{{ file.originalName }}</span>
                    </div>
                  </div>
                </template>
              </van-field>
              <van-field v-model="formData.reason" label="发起原因" :readonly="readonly">
                <template #input>
                  <div class="rich-text" v-html="formData.reason || '-'" />
                </template>
              </van-field>
            </div>
          </div>
        </van-tab>

        <van-tab title="流程信息" name="2">
          <div class="tab-content">
            <approvalTimeline :list="flowTaskCommentList" />
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <van-popup v-model:show="showDatePicker" round position="bottom">
      <van-date-picker
        v-model="datePickerValue"
        :title="datePickerTitle"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date(2035, 11, 31)"
        @confirm="onDatePickerConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup
      v-model:show="showIndustryPicker"
      round
      position="bottom"
      :style="{ maxHeight: '70%' }"
    >
      <div class="multi-picker">
        <div class="multi-picker__toolbar">
          <button type="button" class="multi-picker__btn" @click="showIndustryPicker = false">
            取消
          </button>
          <div class="multi-picker__title">
            选择行业
          </div>
          <button type="button" class="multi-picker__btn multi-picker__btn--confirm" @click="confirmIndustryPicker">
            确定
          </button>
        </div>
        <van-checkbox-group
          :model-value="tempIndustryCodes"
          class="multi-picker__list"
          @update:model-value="onIndustryCodesUpdate"
        >
          <van-cell
            clickable
            title="全部"
            @click="toggleIndustry(SELECT_ALL)"
          >
            <template #right-icon>
              <van-checkbox :name="SELECT_ALL" @click.stop />
            </template>
          </van-cell>
          <van-cell
            v-for="item in industryList"
            :key="getOptionId(item)"
            clickable
            :title="getOptionName(item)"
            @click="toggleIndustry(getOptionId(item))"
          >
            <template #right-icon>
              <van-checkbox :name="String(getOptionId(item))" @click.stop />
            </template>
          </van-cell>
        </van-checkbox-group>
      </div>
    </van-popup>

    <van-popup
      v-model:show="showRegionPicker"
      round
      position="bottom"
      :style="{ maxHeight: '70%' }"
    >
      <div class="multi-picker">
        <div class="multi-picker__toolbar">
          <button type="button" class="multi-picker__btn" @click="showRegionPicker = false">
            取消
          </button>
          <div class="multi-picker__title">
            选择区域
          </div>
          <button type="button" class="multi-picker__btn multi-picker__btn--confirm" @click="confirmRegionPicker">
            确定
          </button>
        </div>
        <van-checkbox-group
          :model-value="tempRegionCodes"
          class="multi-picker__list"
          @update:model-value="onRegionCodesUpdate"
        >
          <van-cell
            clickable
            title="全部"
            @click="toggleRegion(SELECT_ALL)"
          >
            <template #right-icon>
              <van-checkbox :name="SELECT_ALL" @click.stop />
            </template>
          </van-cell>
          <van-cell
            v-for="item in regionList"
            :key="getOptionId(item)"
            clickable
            :title="getOptionName(item)"
            @click="toggleRegion(getOptionId(item))"
          >
            <template #right-icon>
              <van-checkbox :name="String(getOptionId(item))" @click.stop />
            </template>
          </van-cell>
        </van-checkbox-group>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.multi-picker {
  display: flex;
  flex-direction: column;
  max-height: 70vh;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    padding: 0 16px;
    border-bottom: 1px solid #ebedf0;
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    color: #323233;
  }

  &__btn {
    border: none;
    background: transparent;
    font-size: 14px;
    color: #969799;
    padding: 0;

    &--confirm {
      color: #1989fa;
    }
  }

  &__list {
    overflow-y: auto;
    flex: 1;
  }
}
</style>
