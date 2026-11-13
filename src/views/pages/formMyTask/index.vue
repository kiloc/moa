<template>
  <div class="my-task-page">
    <van-nav-bar title="待办任务" fixed placeholder />
    <van-search
      v-model="processDefinitionName"
      placeholder="搜索流程名称/业务单据号"
      shape="round"
      @search="onSearch"
      @clear="onClear"
    />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="!loading && dataList.length === 0" description="暂无待办任务" />

        <van-cell-group
          v-for="(item, index) in dataList"
          :key="index"
          class="task-card"
          inset
        >
          <div class="task-card__header">
            <span class="task-card__title">{{ item.processDefinitionName || '未命名流程' }}</span>
            <van-tag type="primary" size="medium">{{ item.taskName }}</van-tag>
          </div>
          <div class="task-card__body">
            <div class="task-card__row">
              <span class="task-card__label">业务单据号</span>
              <span class="task-card__value">{{ item.businessKey || '-' }}</span>
            </div>
            <div class="task-card__row">
              <span class="task-card__label">发起人</span>
              <span class="task-card__value">{{ item.showName || '-' }}</span>
            </div>
            <div class="task-card__row">
              <span class="task-card__label">发起时间</span>
              <span class="task-card__value">{{ item.processInstanceStartTime || '-' }}</span>
            </div>
          </div>
          <div class="task-card__footer">
            <van-button
              type="primary"
              size="small"
              round
              @click="onSubmit(item)"
            >
              办理
            </van-button>
          </div>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { showFailToast ,showDialog } from 'vant';
import { FlowOperationController } from '@/api/flow';
import { ANY_OBJECT } from '@/types/generic';
import { SysFlowTaskOperationType } from '@/common/staticDict/flow';
import { initEruda } from '@/utils/eruda';


defineOptions({ name: 'FormMyTask' });

const router = useRouter();

const processDefinitionName = ref('');
const dataList = ref<ANY_OBJECT[]>([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const currentPage = ref(1);
const pageSize = 10;

const fetchList = async (isRefresh = false) => {
  await initEruda();
  if (isRefresh) {
    currentPage.value = 1;
    finished.value = false;
  }

  const params: ANY_OBJECT = {
    pageParam: {
      pageNum: currentPage.value,
      pageSize,
    },
    orderParam: [
      {
        fieldName: 'entryId',
        asc: true,
      },
    ],
  };

  if (processDefinitionName.value) {
    params.processDefinitionName = processDefinitionName.value;
  }
  
  FlowOperationController.listRuntimeTask(params)
  // FlowOperationController.listHistoricTask(params)
    .then(res => {
      const list = res.data.dataList || [];
      const total = res.data.totalCount || 0;

      if (isRefresh) {
        dataList.value = list;
      } else {
        dataList.value.push(...list);
      }

      if (dataList.value.length >= total || list.length < pageSize) {
        finished.value = true;
      }

      currentPage.value++;
    })
    .catch(e => {
      console.error(e);
      showFailToast('获取待办列表失败');
      finished.value = true;
    })
    .finally(() => {
      loading.value = false;
      refreshing.value = false;
    });
};

const onLoad = () => {
  fetchList();
};

const onRefresh = () => {
  fetchList(true);
};

const onSearch = () => {
  fetchList(true);
};

const onClear = () => {
  processDefinitionName.value = '';
  fetchList(true);
};

const onSubmit = (row: ANY_OBJECT) => {
  // let params = {
  //   taskId: row.id,
  //   processDefinitionId: row.processDefinitionId,
  //   processInstanceId: row.processInstanceId,
  // };

  // FlowOperationController.viewHistoricTaskInfo(params).then(res => {

  //   router.push({
  //     name: res.data.routerName || 'handlerFlowTask',
  //     query: {
  //       processDefinitionKey: row.processDefinitionKey,
  //       taskId: row.id,
  //       processInstanceId: row.processInstanceId,
  //       taskDefinitionKey:row.taskDefinitionKey,
  //       processDefinitionId: row.processDefinitionId,
  //       showName: row.showName, // 流程实例发起人显示名
  //       processInstanceInitiatorCityName: row.processInstanceInitiatorCityName, // 流程实例发起人城市
  //       processInstanceInitiatorMobile: row.processInstanceInitiatorMobile, // 流程实例发起人电话
  //       processInstanceInitiatorDeptName: row.processInstanceInitiatorDeptName, // 流程实例发起部门
  //       processInstanceStartTime: row.processInstanceStartTime || row.createTime, // 流程实例发起时间
  //       formId: (row.formInfo || {}).formId,
  //       routerName: row.routerName,
  //       readOnly: 'true',
  //       isInfo: 'true',
  //       flowEntryName: row.processDefinitionName,
  //       processInstanceInitiator: row.showName,
  //       businessKey: row.businessKey,
  //       // 在已办理任务中仅显示加签、减签和撤销操作
  //       operationList: JSON.stringify(
  //         (res.data.operationList || []).filter((item: ANY_OBJECT) => {
  //           return (
  //             item.type === SysFlowTaskOperationType.CO_SIGN ||
  //             item.type === SysFlowTaskOperationType.REVOKE ||
  //             item.type === SysFlowTaskOperationType.SIGN_REDUCTION
  //           );
  //         }),
  //       ),
  //     },
  //   });
  // });
  // let path = 'objectDatabase' // 不同页面换不同的路由，看能不能row里面有没有值判断
  // router.push({
  //   name: path,
  //   query: {
  //     processInstanceId: row.processInstanceId,
  //     processDefinitionId: row.processDefinitionId,
  //     taskId: row.taskId,
  //     processDefinitionKey: row.processDefinitionKey,
  //     businessKey: row.businessKey,
  //     taskName: row.taskName,
  //     showName: row.showName,
  //     processInstanceStartTime: row.processInstanceStartTime,
  //     isInfo: 'true',
  //     readOnly: 'true',
  //   },
  // });
  if(row.processDefinitionKey=="agentEvaluationMetrics"){
      let params = {
        processInstanceId: row.processInstanceId,
        processDefinitionId: row.processDefinitionId,
        taskId: row.taskId,
        receiveId:row.receiveId,
        businessKey:row.businessKey,
        taskKey:row.taskKey
      };
       switch (row.taskKey){
         case "Activity_Handle":{
           router.push({
             // 要跳转表单的路由名称
             name: 'taskDeal',
             // 要跳转的路由参数, subPage表示是否是子页面
             query: {
               ...params,
               disabledList: ['审批人'],
             },
           });
         }break;
         case "Activity_Level3":{
           router.push({
             // 要跳转表单的路由名称
             name: 'taskLevel3Approver',
             // 要跳转的路由参数, subPage表示是否是子页面
             query: {
               ...params,
               disabledList: ['审批人'],
             },
           });
         }break;
         case "Activity_OpsManager":{
           router.push({
             // 要跳转表单的路由名称
             name: 'taskOtherApproverFlow',
             // 要跳转的路由参数, subPage表示是否是子页面
             query: { ...params },
           });
         }break;
         case "Activity_DeptManager":{
           router.push({
             // 要跳转表单的路由名称
             name: 'taskOtherApproverFlow',
             // 要跳转的路由参数, subPage表示是否是子页面
             query: { ...params },
           });
         }break;
       }

  }else{
    let params = {
      processInstanceId: row.processInstanceId,
      processDefinitionId: row.processDefinitionId,
      taskId: row.taskId,
    };

    FlowOperationController.viewRuntimeTaskInfo(params)
      .then(res => {
        console.log('......', res);
        if (res.data) {
          console.log('待办跳转路由: ');
          console.log(res.data.routerName || 'handlerFlowTask');
          const targetRouteName = res.data.routerName || 'handlerFlowTask';
          const targetTaskKey = res.data.taskKey || '';
          console.log(router.hasRoute, ' targetRouteName---router')
            // 检查路由是否存在，不存在则弹框提示
            if (!router.hasRoute(targetRouteName) || targetRouteName == 'decisionManageDetailFlow' || targetTaskKey === 'Activity_0rifix' ) {
              showDialog({
                title: '提示',
                message: '此类待办暂不支持移动办公处理，请您登录pc端处理',
              })
              return;
            }

           // 特殊处理
           // 公告审批只有taskName为直属三级经理审批才可以审批，否则走pc端
           if (targetRouteName === 'PortalNotice' && row.taskName !== '直属三级经理审批') {
            showDialog({
              title: '提示',
              message: '此类待办暂不支持移动办公处理，请您登录pc端处理',
            })
            return;
          }

          router.push({
            name: res.data.routerName || 'handlerFlowTask',
            query: {
              isRuntime: 'true',
              isDraft: row.isDraft,
              taskId: row.taskId,
              processDefinitionKey: row.processDefinitionKey,
              processInstanceId: row.processInstanceId,
              processDefinitionId: row.processDefinitionId,
              showName: row.showName, // 流程实例发起人显示名
              processInstanceInitiatorCityName: row.processInstanceInitiatorCityName, // 流程实例发起人城市
              processInstanceInitiatorMobile: row.processInstanceInitiatorMobile, // 流程实例发起人电话
              processInstanceInitiatorDeptName: row.processInstanceInitiatorDeptName, // 流程实例发起部门
              processInstanceStartTime: row.processInstanceStartTime, // 流程实例发起时间
              formId: res.data.formId,
              routerName: res.data.routerName,
              readOnly: res.data.readOnly,
              taskName: row.taskName,
              taskKey: res.data.taskKey,
              flowEntryName: row.processDefinitionName,
              processInstanceInitiator: row.showName,
              businessKey: row.businessKey ? (row.businessKey.includes('-') && row.businessKey.indexOf('PC-UUID') === -1 ? row.businessKey.split('-')[1] : row.businessKey) : '',
              businessKeyOrigin: row.businessKey,
              // 过滤掉加签、减签操作，加签、减签只有在已完成任务里可以操作
              operationList: JSON.stringify(
                (res.data.operationList || []).filter((item: ANY_OBJECT) => {
                  return (
                    item.type !== SysFlowTaskOperationType.CO_SIGN &&
                    item.type !== SysFlowTaskOperationType.REVOKE &&
                    item.type !== SysFlowTaskOperationType.SIGN_REDUCTION
                  );
                }),
              ),
              variableList: JSON.stringify(res.data.variableList),
              isCopy: String(res.data.routerName != 'pickNoticeAdd'),
              isApprover: String(res.data.routerName != 'pickNoticeAdd'),
            },
          });
        }
      })
      .catch(e => {
        console.warn(e);
      });
  }
  
};
</script>

<style lang="scss" scoped>
.my-task-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.task-card {
  margin: 8px 16px !important;
  border-radius: 12px !important;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 8px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #323233;
    flex: 1;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__body {
    padding: 0 16px 12px;
  }

  &__row {
    display: flex;
    align-items: center;
    padding: 4px 0;
    font-size: 13px;
    line-height: 1.5;
  }

  &__label {
    flex-shrink: 0;
    width: 76px;
    color: #969799;
  }

  &__value {
    flex: 1;
    color: #646566;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    padding: 8px 16px 14px;
    border-top: 1px solid #f5f5f5;
  }
}
</style>
