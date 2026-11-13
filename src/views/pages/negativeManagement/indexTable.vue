import listUser from "*.vue";
<template>
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formNoticeTable"
      label-width="150px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormOperationType(true)" @reset="onReset">
        <el-form-item label="公告标题" prop="formFilter.announcementTitle">
          <el-input
            class="filter-item"
            v-model="formNoticeTable.formFilter.announcementTitle"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="供应商名称" prop="formFilter.partnerName">
          <el-input
            class="filter-item"
            v-model="formNoticeTable.formFilter.partnerName"
            :clearable="true"
          />
        </el-form-item>
<!--        <el-form-item label="集采类型" prop="formFilter.centralizedPurchaseType">-->
<!--          <el-select-->
<!--            v-model="formNoticeTable.formFilter.centralizedPurchaseType"-->
<!--            placeholder="请选择集采类型"-->
<!--            :clearable="true"-->
<!--          >-->
<!--            <el-option-->
<!--              v-for="item in dictMapStore.getDictMap.centralizedPurchaseType"-->
<!--              :label="item.name"-->
<!--              :value="item.id"-->
<!--            />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
        <el-form-item label="状态" prop="formFilter.state">
          <el-select
            v-model="formNoticeTable.formFilter.state"
            placeholder="请选择状态"
            :clearable="true"
          >
            <el-option
              v-for="item in dictMapStore.getDictMap.negativeStatus"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负面行为等级" prop="formFilter.negativeBehaviorLevel">
          <el-select
            v-model="formNoticeTable.formFilter.negativeBehaviorLevel"
            placeholder="请选择负面行为等级"
            :clearable="true"
          >
            <el-option
              v-for="item in dictMapStore.getDictMap.negativeBehaviorLevel"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="涉及项目/产品" prop="formFilter.productContent">
          <el-input
            class="filter-item"
            v-model="formNoticeTable.formFilter.productContent"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="发布人" prop="formFilter.createUserName">
          <el-input
            class="filter-item"
            v-model="formNoticeTable.formFilter.createUserName"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="发布时间" prop="formFilter.createTime">
          <date-range
            class="filter-item"
            :size="layoutStore.defaultFormItemSize"
            :hideTypeOnlyOne="true"
            v-model="formNoticeTable.formFilter.createTime"
            :clearable="true"
            :allowTypes="['day']"
            align="left"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      ref="teacher"
      :data="formNoticeTable.operationLog.impl.dataList"
      :size="layoutStore.defaultFormItemSize"
      :hasExtend="false"
      header-cell-class-name="table-header-gray"
      @sort-change="formNoticeTable.operationLog.impl.onSortChange"
      @refresh="refreshFormOperationType(true)"
      :seq-config="{
        startIndex:
          (formNoticeTable.operationLog.impl.currentPage - 1) *
          formNoticeTable.operationLog.impl.pageSize,
      }"
    >
      <template #operator>
        <el-button type="primary" :size="layoutStore.defaultFormItemSize" @click="addNegative({}, 'add')">
          录入负面行为
        </el-button>
        <el-button
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          @click="
            uploadStatus = '';
            dialogVisible = true;
          "
        >
          导入负面行为
        </el-button>
      </template>
      <vxe-column
        title="序号"
        type="seq"
        width="55px"
        :index="formNoticeTable.operationLog.impl.getTableIndex"
      />
      <vxe-column title="负面行为编号" field="negativeBehaviorCode" width="150px" />
      <vxe-column title="公告标题" field="announcementTitle" min-width="200px" />
      <vxe-column title="供应商名称" field="partnerName" width="150px" />
      <vxe-column title="涉及项目/产品" field="productContent" width="150px" />
<!--      <vxe-column title="集采类型" field="centralizedPurchaseType" width="150px">-->
<!--        <template v-slot="scope">-->
<!--          {{-->
<!--            dictMapStore.getDictMap.centralizedPurchaseType.filter(-->
<!--              item => item.id == scope.row.centralizedPurchaseType,-->
<!--            )[0]?.name || ''-->
<!--          }}-->
<!--        </template>-->
<!--      </vxe-column>-->
      <vxe-column title="负面行为等级" field="negativeBehaviorLevel" width="150px">
        <template v-slot="scope">
          {{
            dictMapStore.getDictMap.negativeBehaviorLevel.filter(
              item => item.id == scope.row.negativeBehaviorLevel,
            )[0]?.name || ''
          }}
        </template>
      </vxe-column>
      <vxe-column title="状态" field="state" width="150px">
        <template v-slot="scope">
          {{
            dictMapStore.getDictMap.negativeStatus.filter(item => item.id == scope.row.state)[0]
              ?.name || ''
          }}
        </template>
      </vxe-column>
      <vxe-column title="发布人" field="createUserName" width="150px" />
      <vxe-column title="发布单位" field="createDeptName" width="150px" />
      <vxe-column title="创建时间" field="createTime" width="150px" />
      <vxe-column title="操作"  fixed="right" width="200px">
        <template v-slot="scope">
          <el-button
            link
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            @click="addNegative(scope.row, 'detail')"
          >
            查看
          </el-button>
          <el-button
            link
            type="primary"
            v-if="scope.row.state == 0"
            :size="layoutStore.defaultFormItemSize"
            @click="addNegative(scope.row, 'edit')"
          >
            编辑
          </el-button>
          <el-button
            v-if="scope.row.state == 1"
            link
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            @click="responseName(scope.row)"
          >
            流程信息
          </el-button>
<!--          公告field1：0，草稿，1、审批中，2、审批完成-->
          <el-button
            link
            v-if='scope.row.state == 2 && (scope.row.field1 == 0 || !scope.row.field1)'
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            @click="publishNotice(scope.row)"
          >
            发布公告
          </el-button>
          <el-button
            link
            v-if='scope.row.field1 == 1 || scope.row.field1 == 2'
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            @click="publishNotice(scope.row, '1')"
          >
            查看公告
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="formNoticeTable.operationLog.impl.totalCount"
            :current-page="formNoticeTable.operationLog.impl.currentPage"
            :page-size="formNoticeTable.operationLog.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formNoticeTable.operationLog.impl.onCurrentPageChange"
            @size-change="formNoticeTable.operationLog.impl.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
    <el-dialog v-model="dialogVisible" :z-index='10' title="导入负面行为" width="500" @closed="onClosed">
      <el-upload
        ref="upload"
        class="btn-import"
        :auto-upload="false"
        action=""
        :limit="1"
        :show-file-list="true"
        accept=".xls,.xlsx"
        style="display: inline-block"
        :on-change="onImportClick"
        :on-exceed="handleExceed"
      >
        <template #trigger>
          <el-button type="primary" :size="layoutStore.defaultFormItemSize"> 上传 </el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip">
            支持上传文件格式：.xls,.xlsx
            <a href="javascript:;" @click="handleExport" style="color: #0a84ff">下载模版</a>
          </div>
        </template>
      </el-upload>
      <div v-if="uploadStatus === 'fail'" class="errorBox">
        <span
          >导入失败！失败原因：点击
          <el-link type="primary" @click="errorDialog = true">查看详情</el-link></span
        >
        <span class="close" @click="uploadStatus = ''">x</span>
      </div>
      <div v-if="uploadStatus === 'success'" class="successBox">
        <span>
          导入成功！合作伙伴数据导入成功，导入的数据请到
          <el-link type="primary" @click="goInfoQuery">我的已办（点击进入）</el-link>
          进行查看。
          <el-link type="primary" @click="uploadStatus = ''">继续导入</el-link>
        </span>
        <span class="close" @click="uploadStatus = ''">x</span>
      </div>
<!--      失败原因弹框 -->
      <el-dialog v-model="errorDialog" title="错误信息" width="80%">
        <el-table :data="errorDetails" style="width: 100%">
          <el-table-column prop="rowNum" label="行号" width="60" />
          <el-table-column prop="negativeBehaviorCode" label="负面行为编号" width="120" />
<!--          <el-table-column prop="centralizedPurchaseType" label="采集类型" width="80" />-->
          <el-table-column prop="productContent" label="涉及项目/产品" width="120" />
          <el-table-column prop="negativeBehaviorLevel" label="负面行为等级" width="120" />
          <el-table-column prop="negativeBehaviorContent" label="负面行为内容" width="120" />
          <el-table-column prop="errors" label="错误信息">
            <template v-slot="scope">
              <p v-for="(err, errIndex) in scope.row.errors" :key="errIndex" style="color: #F56C6C">
                {{ err }}
              </p>
            </template>
          </el-table-column>
        </el-table>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="errorDialog = false">关闭</el-button>
          </div>
        </template>
      </el-dialog>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleImport">确定</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'noticeTable',
};
</script>

<script setup lang="ts">
import { useCommon } from '@/common/hooks/useCommon';
import { DropdownOptions, ListData } from '@/common/types/list';
import { SysOperationType } from '@/common/staticDict';
import { TableOptions } from '@/common/types/pagination';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { DictData } from '@/common/staticDict/types';
import { NegativeController } from '@/api/negativeManagement';
import listUser from '@/pages/inDatabase/components/listUser.vue';
import { useDictMapStore, useLayoutStore, useLoginStore } from '@/store';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import {computed, reactive} from 'vue';
import DataBaseController from '@/api/dataBase/DataBaseController';
const dictMapStore = useDictMapStore();
const layoutStore = useLayoutStore();
const { useDropdown, useTable, Dialog } = useCommon();
const loginStore = useLoginStore();
const userInfo = computed(() => loginStore.userInfo || {})
const form = ref();
const router = useRouter();

// 上传状态 ('success': '成功', 'fail': '失败')
const uploadStatus = ref('');
// 失败原因弹框
const errorDialog = ref(false);
// 失败原因数据
const errorDetails = ref([]);

const dialogVisible = ref(false);
const formData = reactive({
  appointedAssignee: '' as any,
  importFile: '' as any, // 入库依据文件
});
const upload = ref<UploadInstance>();
const handleExceed: UploadProps['onExceed'] = files => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  upload.value!.handleStart(file);
};
const onImportClick = file => {
  formData.importFile = file.raw;
};
const onClosed = () => {
  dialogVisible.value = false;
  formData.importFile = '';
  upload.value!.clearFiles();
};
const handleExport = () => {
  NegativeController.downloadTemplate({}, '负面行为导入模板.xlsx')
    .then(res => {})
    .catch(e => {});
};
// 导入操作
const handleImport = () => {
  if (!formData.importFile) {
    ElMessage.warning('请先上传附件');
    return;
  }

  let roleId = ''
  if(userInfo.value.area == 1){
    roleId = '2034602005636321280'  // 省
  }
  if(userInfo.value.area == 2){
    roleId = '2036280205496029184'  // 市
  }
  if(userInfo.value.area == 3){
    roleId = '2036280313365139456'  // 区
  }
  Dialog.show(
    '选择下一步审批人',
    listUser,
    { area: '500px'},
    {
      params: {
        "roleId": roleId,
        "deptFlag":"current"
      }
    },
  )
    .then((res) => {
      formData.appointedAssignee = res
      uploadStatus.value = '';
      NegativeController.portalNegativeBehaviorImport(formData)
        .then(res => {
          if (res.data.failCount) {
            // 有未填写的必填项
            errorDetails.value = res.data.errorDetails;
            uploadStatus.value = 'fail';
          } else {
            // dialogVisible.value = false;
            ElMessage.success('导入成功');
            // formData.importFile = '';
            refreshFormOperationType(true);
            uploadStatus.value = 'success';
          }
        })
        .catch(e => {
          // TODO: 异常处理
          console.error(e);
        });
    })
    .catch((e) => {
      console.error(e);
    });

};
/**
 * 操作类型下拉数据获取函数
 */
const loadOperationTypeDropdownList = (): Promise<ListData<DictData>> => {
  return new Promise(resolve => {
    resolve({ dataList: SysOperationType.getList() });
  });
};

const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadOperationTypeDropdownList,
};
// 流程信息
const responseName = (row: any, type: any) => {
  router.push({
    name: 'portalNegativeBehaviorApply',
    query: {
      isCopy: 'true',
      isApprover: 'true',
      isInfo: 'true',
      isRuntime: 'true',
      isDraft: row.isDraft,
      taskId: row.taskId,
      businesskey: row.businessKey,
      negativeBehaviorCode: row.negativeBehaviorCode,
      processDefinitionKey: row.processDefinitionKey,
      processInstanceId: row.processInstanceId,
      processDefinitionId: row.processDefinitionId,
      taskName: type === 'edit' ? '编辑' : type === 'detail' ? '查看' : row.taskName,
      flowEntryName: row.processDefinitionName,
      processInstanceInitiator: row.showName,
    },
  });
};
/**
 * 操作日志数据数据获取函数，返回Promise
 */
const loadOperationLogWidgetData = (params: ANY_OBJECT): Promise<TableData<ANY_OBJECT>> => {
  if (params == null) params = {};
  const requestParams = {
    pageNum: params.pageParam?.pageNum || 1,
    pageSize: params.pageParam?.pageSize || 10,
    announcementTitle: formNoticeTable.formFilterCopy.announcementTitle,
    partnerName: formNoticeTable.formFilterCopy.partnerName,
    // centralizedPurchaseType: formNoticeTable.formFilterCopy.centralizedPurchaseType,
    state: formNoticeTable.formFilterCopy.state,
    negativeBehaviorLevel: formNoticeTable.formFilterCopy.negativeBehaviorLevel,
    productContent: formNoticeTable.formFilterCopy.productContent,
    createUserName: formNoticeTable.formFilterCopy.createUserName,
    createTimeStart: formNoticeTable.formFilterCopy.createTimeStart,
    createTimeEnd: formNoticeTable.formFilterCopy.createTimeEnd,
  };
  return new Promise((resolve, reject) => {
    NegativeController.NegativeList(requestParams)
      .then(res => {
        resolve({
          dataList: res.data.dataList.map(item => {
            return { ...item };
          }),
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 操作日志数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadOperationLogVerify = () => {
  formNoticeTable.formFilterCopy = {
    ...formNoticeTable.formFilter,
  };
  // 处理日期范围，转换为开始时间和结束时间
  if (formNoticeTable.formFilter.createTime && formNoticeTable.formFilter.createTime.length === 2) {
    formNoticeTable.formFilterCopy.createTimeStart =
      formNoticeTable.formFilter.createTime[0] + ' 00:00:00';
    formNoticeTable.formFilterCopy.createTimeEnd =
      formNoticeTable.formFilter.createTime[1] + ' 00:00:00';
  } else {
    formNoticeTable.formFilterCopy.createTimeStart = undefined;
    formNoticeTable.formFilterCopy.createTimeEnd = undefined;
  }
  return true;
};

const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadOperationLogWidgetData,
  verifyTableParameter: loadOperationLogVerify,
  paged: true,
};

const formNoticeTable = reactive({
  formFilter: {
    announcementTitle: undefined,
    partnerName: undefined,
    // centralizedPurchaseType: undefined,
    state: undefined,
    negativeBehaviorLevel: undefined,
    productContent: undefined,
    createUserName: undefined,
    createTime: undefined,
  },
  formFilterCopy: {
    announcementTitle: undefined,
    partnerName: undefined,
    // centralizedPurchaseType: undefined,
    state: undefined,
    negativeBehaviorLevel: undefined,
    productContent: undefined,
    createUserName: undefined,
    createTime: undefined,
  },
  operationType: {
    impl: useDropdown(dropdownOptions),
  },
  operationLog: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

/**
 * 更新操作日志
 */
const refreshFormOperationType = (reloadData = false) => {
  if (reloadData) {
    formNoticeTable.operationLog.impl.refreshTable(true, 1);
  } else {
    formNoticeTable.operationLog.impl.refreshTable();
  }
  if (!formNoticeTable.isInit) {
    // 初始化下拉数据
  }
  formNoticeTable.isInit = true;
};

const onReset = () => {
  form.value.resetFields();
  // 手动重置日期范围等可能无法被 resetFields 重置的字段
  formNoticeTable.formFilter.createTime = undefined;
  formNoticeTable.formFilterCopy.createTime = undefined;
  formNoticeTable.formFilterCopy.createTimeStart = undefined;
  formNoticeTable.formFilterCopy.createTimeEnd = undefined;
  refreshFormOperationType(true);
};

const formInit = () => {
  refreshFormOperationType();
};
const addNegative = (row, type) => {
  if(type === 'add'){
    router.push({
      name: 'negativeAdd',
      query: {},
    });
  }else if(type === 'edit'){
    router.push({
      name: 'negativeAdd',
      query: {
        isInfo: false,
        isRuntime: 'true',
        isDraft: row.isDraft,
        taskId: row.taskId,
        businesskey: row.businessKey,
        negativeBehaviorCode: row.negativeBehaviorCode,
        processDefinitionKey: row.processDefinitionKey,
        processInstanceId: row.processInstanceId,
        processDefinitionId: row.processDefinitionId,
        taskName: '编辑',
        flowEntryName: row.processDefinitionName,
        processInstanceInitiator: row.showName,
      },
    });
  }else if(type === 'detail'){
    router.push({
      name: 'negativeAdd',
      query: {
        isInfo: true,
        isRuntime: 'true',
        isDraft: row.isDraft,
        taskId: row.taskId,
        businesskey: row.businessKey,
        negativeBehaviorCode: row.negativeBehaviorCode,
        processDefinitionKey: row.processDefinitionKey,
        processInstanceId: row.processInstanceId,
        processDefinitionId: row.processDefinitionId,
        taskName: '查看',
        readOnly: 'true',
        flowEntryName: row.processDefinitionName,
        processInstanceInitiator: row.showName,
      },
    });
  }
};

// 发布公告
const publishNotice = (row, type) => {
  router.push({
    name: 'noticeAdd',
    query: {
      negativeBehaviorCode: row.negativeBehaviorCode,
      partnerName: row.partnerName,
      isInfo: type === '1' ? 'true' : 'false'
    },
  });
};

onMounted(() => {
  formInit();
});
</script>

<style scoped>
.errorBox,
.successBox {
  position: relative;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #ff4b52;
  background: #ff000012;
  border-radius: 5px;
  .close {
    position: absolute;
    right: 0px;
    top: 0px;
    color: #333333;
    font-size: 30px;
    cursor: pointer;
    padding: 0 10px;
    font-family: cursive;
    &:hover {
      color: #555555;
    }
  }
}
.successBox {
  border: 1px solid #25e610;
  background: rgb(0 255 22 / 7%);
}
</style>
