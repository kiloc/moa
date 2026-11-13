<!--直接入库（批量）-->
<template>
  <div class="import-modal">
    <div v-if='dialogVisible' class='errorBox'>
      <span>导入失败！失败原因：点击 <el-link type='primary' @click='errorDialog = true'>查看详情</el-link></span>
      <span class='close' @click='dialogVisible = false'>x</span>
    </div>
    <div v-if='dialogSuccess' class='successBox'>
      <span>
        导入成功！合作伙伴数据导入成功
<!--        ，导入的数据请到-->
<!--         <el-link type='primary' @click='goInfoQuery'>我的已办（点击进入）</el-link>-->
<!--        进行查看。-->
        <el-link type='primary' @click='dialogSuccess = false'>继续导入</el-link>
      </span>
      <span class='close' @click='dialogSuccess = false'>x</span>
    </div>
    <el-form ref="formRef" :model="formData" label-width="120px" class="form-container">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-form-item label="上传附件" prop="importFile">
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
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="DICT集成库级别" prop="dictBusiLevel">
            <el-select v-model="dictBusiLevel" disabled class="readonly-select">
              <el-option label="一级库" value="1" />
              <el-option label="二级库" value="2" />
              <el-option label="三级库" value="3" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 操作按钮 -->
    <div style="text-align: center">
      <el-button type="primary" @click="handleImport">导入</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </div>
    <el-dialog v-model="errorDialog" title="错误信息" width="80%">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="rowNum" label="行号" />
        <el-table-column prop="partnerName" label="合作伙伴名称" />
        <el-table-column prop="uscc" label="统一社会信用代码" width="180px" />
        <el-table-column prop="industryCode" label="所属行业" />
        <el-table-column prop="dictBusiLevel" label="DICT集成库级别" width="150px">
          <template v-slot="scope">{{
            scope.row.dictBusiLevel === '1'
              ? '一级库'
              : scope.row.dictBusiLevel === '2'
              ? '二级库'
              : scope.row.dictBusiLevel === '3'
              ? '三级库'
              : ''
          }}</template>
        </el-table-column>
        <el-table-column prop="fieldCode" label="行业领域" />
        <el-table-column prop="scenceCode" label="场景子库" />
        <el-table-column prop="errors" label="错误信息">
          <template v-slot="scope">{{ scope.row.errors.join('，') }}</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="errorDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { useUpload } from '@/common/hooks/useUpload';
import DataBaseController from '@/api/dataBase/DataBaseController';
import { useLayoutStore } from '@/store';
import listUser from '@/pages/inDatabase/components/listUser.vue';
import {useCommon} from "@/common/hooks/useCommon";
const { Dialog } = useCommon();
import { PartnerSign } from '@/api/partnerSign';
const router = useRouter();
const layoutStore = useLayoutStore();
const formData = reactive({
  appointedAssignee: '' as any,
  importFile: '' as any, // 入库依据文件
});
const dictBusiLevel = ref('1');
const dialogSuccess = ref(false);
const dialogVisible = ref(false);
const errorDialog = ref(false);
const tableData = ref([]) as any;

const upload = ref<UploadInstance>();
const handleExceed: UploadProps['onExceed'] = files => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  upload.value!.handleStart(file);
};
const onImportClick = file => {
  formData.importFile = file.raw;
};
const handleExport = () => {
  DataBaseController.downloadTemplate({}, '入库批量导入模板.xlsx')
    .then(res => {})
    .catch(e => {});
};
// 导入操作
const handleImport = () => {
  if (!formData.importFile) {
    ElMessage.error('请先上传附件');
    return;
  }
  if (formData.importFile.name.indexOf('.xls') === -1 || formData.importFile.name.indexOf('.xlsx') === -1 ) {
    ElMessage.error('只能上传.xls .xlsx文件');
    return;
  }

  Dialog.show(
    '选择下一步审批人',
    listUser,
    { area: '500px' },
    {
      params: {
        "roleId": '2036281370577211392',
        "deptFlag":"current"
      }
    },
  )
    .then((res) => {
      formData.appointedAssignee = res
      DataBaseController.portalPartnerImport(formData)
        .then(res => {
          let data = res as any;
          if (data.data.errorDetails && data.data.errorDetails.length) {
            dialogVisible.value = true;
            tableData.value = data.data.errorDetails || [];
          } else {
            dialogSuccess.value = true;
            ElMessage.success('导入成功');
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

  // 取消操作
  const handleCancel = () => {
    // 可关闭弹窗或重置表单
    formData.importFile = [];
    // router.back();
    router.push({ name: 'formMyTask' });
  };
  const goInfoQuery = ()=>{
    router.push({
      name: 'formMyApprovedTask',
      query: {}
    });
  }
</script>

<style lang="scss" scoped>
.import-modal {
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  margin: 0 auto;
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
}
</style>
