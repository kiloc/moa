<script setup lang="ts">
import type { DictData } from '@/common/staticDict/types'
import type { DropdownOptions, ListData } from '@/common/types/list'
import type { ANY_OBJECT } from '@/types/generic'
import 'vant/es/toast/style'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_CONTEXT } from '@/api/config'
import { DictionaryController } from '@/api/system'
import { get } from '@/common/http/request'
import { downloadAppFile } from '@/common/utils'
import PartnerList from '@/views/pages/components/common/partner-list.vue'
import approvalTimeline from '@/views/pages/components/common/approval-timeline.vue'

// 定义 props
interface Props {
  viewData: any
  demandNumber?: string
  hideHeader?: boolean
  hideBack?: boolean
  demandDetail?: boolean
  flowTaskCommentList?: any[]
  disabled?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  viewData: () => {},
  demandNumber: '',
  hideHeader: true,
  hideBack: true,
  demandDetail: false,
  flowTaskCommentList: () => [],
  disabled: () => [],
})

const bidPackages = ref([])
const activeName = ref('1')
const router = useRouter()
const route = useRoute()
const regionValue = ref([])
const regionOptions = ref([])
const formData = reactive<ANY_OBJECT>({
  cityName: '',
})

function getFormData() {
  return formData
}


// watch(
//   () => props.demandNumber,
//   (newVal) => {
//     if (newVal) {
//       loadDetail()
//     }
//   },
//   { immediate: false },
// )

function loadPickTypeDropdownList(): Promise<ListData<DictData>> {
  return new Promise((resolve, reject) => {
    DictionaryController.dictGlobalDict({ dictCode: 'PICK_TYPE', itemIdType: 'String' })
      .then((res) => {
        resolve({
          dataList: res.getList(),
        })
      })
      .catch((e) => {
        reject(e)
      })
  })
}

const pickTypeOptions: DropdownOptions<DictData> = {
  loadData: loadPickTypeDropdownList,
  isTree: false,
}

function scenceRelChildrenFn(parentCodeId: string, type: string) {
  let parame = parentCodeId
    ? {
        typeCode: type,
        parentCodeId,
      }
    : {
        typeCode: type,
      }
  DictionaryController.scenceRelChildren(parame)
    .then((resp) => {
      let res = resp as any
      if (res && res.data) {
        res.data.forEach((item) => {
          item.id = item.codeId
          item.name = item.codeName
        })
      }
      if (type === 'portalIndustry') {
        demandIndustryWidgetDropdownList.value = res.data
      }
      if (type === 'portalRealm') {
        industryFieldWidgetDropdownList.value = res.data
      }
      if (type === 'partnerScence') {
        demandSceneWidgetDropdownList.value = res.data
      }
    })
    .catch((e) => {})
}

const demandSceneWidgetDropdownList = ref([])
const demandIndustryWidgetDropdownList = ref([])
const industryFieldWidgetDropdownList = ref([])

async function queryRegionList() {
  const param = {}
  const res = await get(`${API_CONTEXT}/manage/area/selectCascadeByPid`, param)
  regionOptions.value = res.data
}
const uniqueById = (list: any[] = []) => {
  const map = new Map<string, any>();
  (list || []).forEach((it) => {
    if (!it || it.id == null) return;
    const k = String(it.id);
    if (!map.has(k)) map.set(k, it);
  });
  return Array.from(map.values());
};
const currentType = ref('')
const isrecruitToPlan = ref()
const fieldCodeList = ref([])
const scenceCodeList = ref([])
const industryCodeName = ref([])
const isMultiIndustry = ref(false)
const fieldNameToIndustryFieldCodeMap = ref({})
const scenceNameToIndustryScenceCodeMap = ref({})
const showData = (data = props.viewData, type: string, recruitToPlan: string) => {
  currentType.value = type
  if(recruitToPlan === 'recruitToPlan'){  // 需求变方案
    isrecruitToPlan.value = true
  }
  Object.assign(formData, data);
  if(data.initiatorInfo){
    formData.cityName = formData.cityName || data.initiatorInfo.createUserCityName
  }
  data.recruitmentFiles && data.recruitmentFiles.forEach(item=>{
    item.name = item.originalName
  })
  formData.recruitmentFiles = data.recruitmentFiles


  if (data.bidPackages?.length > 0) {
    bidPackages.value = data.bidPackages.map((bp: any) => {
      bp.sceneRels = bp.sceneRels || [];
      bp.sceneCode = [];
      bp.industryCode = [];
      bp.scenceCodeList = [];
      bp.scenceNameToIndustryScenceCodeMap = {};
      bp.fieldCode = [...new Set(bp.sceneRels.map((x: { fieldName: any }) => x.fieldName))].join('、')
      bp.sceneCode = [...new Set(bp.sceneRels.map((x: { sceneName: any }) => x.sceneName))].join('、')
      bp.industryCodeName = [...new Set(bp.sceneRels.map((x: { industryName: any }) => x.industryName))].join('、')
      bp.directedPartners = bp.directedPartners || []
      return bp
    })
    return
  }

  fieldCodeList.value = []
  scenceCodeList.value = []
  industryCodeName.value = []
  formData.industryCode = []
  formData.industryCodeName = ''
  formData.fieldCode = ''
  formData.sceneCode = []
  isMultiIndustry.value = false
  fieldNameToIndustryFieldCodeMap.value = {}
  scenceNameToIndustryScenceCodeMap.value = {}

  console.log(data.sceneRels, 'data.sceneRels && data.sceneRels--')
  data.sceneRels && data.sceneRels.forEach((item, index)=>{
    if(item.id){
      delete item.id
    }
    formData.industryCode.push(item.industryCode)
    console.log(item.industryName, 'item.industryName')
    industryCodeName.value.push(item.industryName)

    const fieldName = item.fieldName || item.fieldCode
    const scenceName = item.sceneName || item.scenceName || item.sceneCode
    if (fieldName) {
      fieldNameToIndustryFieldCodeMap.value[fieldName] = fieldNameToIndustryFieldCodeMap.value[fieldName] || {}
      fieldNameToIndustryFieldCodeMap.value[fieldName][item.industryCode] = item.fieldCode
      fieldCodeList.value.push({ id: fieldName, name: fieldName })
    }
    console.log(fieldCodeList, 'fieldCodeList----')
    if (scenceName) {
      scenceNameToIndustryScenceCodeMap.value[scenceName] =
        scenceNameToIndustryScenceCodeMap.value[scenceName] || {}
      scenceNameToIndustryScenceCodeMap.value[scenceName][item.industryCode] = item.sceneCode
      scenceCodeList.value.push({ id: scenceName, name: scenceName })
    }
  })

  console.log(formData.industryCode, 'industryCode----348')
  // formData.industryCode = Array.from(new Set(formData.industryCode as any))
  // isMultiIndustry.value = (formData.industryCode as any[]).length > 1
    formData.industryCodeName = [...new Set(industryCodeName.value)].join('、')
  // if (isMultiIndustry.value) {
    fieldCodeList.value = uniqueById(fieldCodeList.value)
    scenceCodeList.value = uniqueById(scenceCodeList.value)
    formData.fieldCode = fieldCodeList.value.map((x: { id: any }) => x.id).join('、')
    formData.sceneCode = scenceCodeList.value.map((x) => x.id).join('、')
  // } else {
  //   // 单行业回显：恢复为“编码”模式
  //   const onlyIndustry = (formData.industryCode as any[])[0]
  //   const fieldName = fieldCodeList.value?.[0]?.name
  //   const fieldCode =
  //     (fieldName && fieldNameToIndustryFieldCodeMap.value[fieldName]?.[onlyIndustry]) || ''
  //   formData.fieldCode = fieldCode

  //   // 下拉列表换成编码值
  //   fieldCodeList.value = fieldName ? [{ id: fieldCode, name: fieldName }] : []

  //   const sceneCodes = Object.keys(scenceNameToIndustryScenceCodeMap.value)
  //     .map((name) => scenceNameToIndustryScenceCodeMap.value[name]?.[onlyIndustry])
  //     .filter((x) => !!x)
  //   formData.sceneCode = Array.from(new Set(sceneCodes))
  //   scenceCodeList.value = Object.keys(scenceNameToIndustryScenceCodeMap.value)
  //     .map((name) => {
  //       const code = scenceNameToIndustryScenceCodeMap.value[name]?.[onlyIndustry]
  //       return code ? { id: code, name } : null
  //     })
  //     .filter((x) => !!x)
  // }

  console.log(formData.fieldCode, 'formData.fieldCode---')
}
onMounted(() => {
  // loadDetail()
})

// watch(() => props.viewData, () => {
//   showData(props.viewData)
// })

defineExpose({
  getFormData,
  showData,
})
</script>

<template>
  <van-tabs v-model:active="activeName" type="card">
    <van-tab title="业务信息" name="1">
      <div class="tab-content">
        <div class="section">
          <div class="section-subtitle">
            招募需求信息
          </div>
          <van-field v-model="viewData.name" label="招募需求名称" type="textarea" readonly />
          <van-field v-model="viewData.demandCode" label="招募需求编号" readonly />
          <van-field label="是否划分标包">
            <template #input>
              <span>{{ viewData.isDividePackage == 1 ? '是' : '否' }}</span>
            </template>
          </van-field>
          <template v-if='viewData.isDividePackage == 0'>
            <van-field label="入围行业">
              <template #input>
                <span>{{ formData.industryCodeName }}</span>
              </template>
            </van-field>
            <van-field label="行业领域">
              <template #input>
                <span>{{ formData.fieldCode }}</span>
              </template>
            </van-field>
            <van-field label="场景子库">
              <template #input>
                <span>{{ formData.sceneCode }}</span>
              </template>
            </van-field>
            <van-field label="招募类型">
              <template #input>
                <span>{{ viewData.recruitmentType == 1 ? '定向招募' : '公开招募' }}</span>
              </template>
            </van-field>
          </template>
          <van-field label="招募结束时间">
            <template #input>
              <span>{{ viewData.endTime }}</span>
            </template>
          </van-field>
          <van-field v-model="formData.cityName" label="地市" readonly />
          <van-field v-model="viewData.description" label="招募需求说明" type="textarea" readonly />
          <van-field v-model="viewData.content" label="招募内容" type="textarea" readonly />
        
          <template v-if="formData.recruitmentType == 1 && formData.isDividePackage == 0 && !isrecruitToPlan">
            <PartnerList
              :list-data="viewData.directedPartners"
              label="合作伙伴列表"
            />
          </template>
        </div>
        <div class="section" v-if="bidPackages.length">
          <div class="section-subtitle">
            标包划分情况
          </div>
          <div v-for="(pkg, index) in bidPackages" :key="index" class="bid-package-card">
              <div class="package-title">
                标包{{ index + 1 }}
              </div>
              <van-field :model-value="pkg.name" label="招募标段名称" type="textarea" readonly />
              <van-field :model-value="pkg.packageCode" label="招募标段编号" readonly />
              <van-field label="招募类型">
                <template #input>
                  <span>{{ pkg.recruitmentType == 1 ? '定向招募' : '公开招募' }}</span>
                </template>
              </van-field>
              <van-field label="入围行业">
                <template #input>
                  <span>{{ pkg.industryCodeName }}</span>
                </template>
              </van-field>
              <van-field label="行业领域">
                <template #input>
                  <span>{{ pkg.fieldCode }}</span>
                </template>
              </van-field>
              <van-field label="场景子库">
                <template #input>
                  <span>{{ pkg.sceneCode }}</span>
                </template>
              </van-field>
              <van-field v-model="pkg.description" label="招募需求说明" type="textarea" readonly />

              <PartnerList
                v-if="pkg.recruitmentType == 1 && pkg.directedPartners.length"
                :list-data="pkg.directedPartners || []"
                label="合作伙伴列表"
              />
          </div>
        </div>
      </div>
    </van-tab>
    <van-tab title="流程信息" name="2">
      <div class="tab-content">
        <div class="section">
          <approvalTimeline v-if="props.flowTaskCommentList.length > 0" :list="props.flowTaskCommentList" />
          <van-empty v-else description="暂无流程信息" />
        </div>
      </div>
    </van-tab>
    <van-tab title="附件信息" name="3">
      <div class="tab-content">
        <div class="section">
          <div class="section-subtitle">
            招募需求信息
          </div>
          <van-cell title="招募内容附件">
            <template #value>
              <div class="file-list">
                <div v-for="file in viewData.recruitmentFiles" :key="file.fileName" class="file-item" @click="downloadAppFile(file.name || file.originalName, 'recruitmentFiles', file.filename||file.fileName)">
                  <span>{{ file.originalName }}</span>
                </div>
                <span v-if="!viewData.recruitmentFiles.length">-</span>
              </div>
            </template>
          </van-cell>
        </div>
      </div>
    </van-tab>
  </van-tabs>
</template>

<style scoped lang="scss">
</style>
