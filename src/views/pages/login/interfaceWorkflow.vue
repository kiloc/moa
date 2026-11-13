<template>
  <div class="login-form">

  </div>
</template>

<script lang="ts">
  export default {
    name: 'interfaceWorkflow',
  };
</script>

<script setup lang="ts">
import { Router, useRouter } from 'vue-router';
import { useLoginStore, useLayoutStore, useDictMapStore } from '@/store';
// import {useCommon} from '@/common/hooks/useCommon';
import {ANY_OBJECT} from "@/types/generic";
import {FlowOperationController} from "@/api/flow";
import {SysFlowTaskOperationType} from "@/common/staticDict/flow";
import { showDialog  } from 'vant';
import 'vant/es/toast/style';
import { appBack } from '@/common/utils';
import { onMounted } from 'vue';
import { initEruda } from '@/utils/eruda';
import { initMapDict } from '@/router';
// import { savePortalParams } from '@/common/utils';

// const {Dialog} = useCommon();

const loginStore = useLoginStore();
const dictMapStore = useDictMapStore();
const layoutStore = useLayoutStore();
const router: Router = useRouter();
const route = useRoute();
const onSubmit = (row: ANY_OBJECT) => {
    // 回调appBack用
    // savePortalParams()
    console.log(row)
    if (row.processDefinitionKey == "agentEvaluationMetrics") {
      let params = {
        processInstanceId: row.processInstanceId,
        processDefinitionId: row.processDefinitionId,
        taskId: row.taskId,
        receiveId: row.receiveId,
        businessKey: row.businessKey,
        taskKey: row.taskKey
      };
      switch (row.taskKey) {
        case "Activity_Handle": {
          router.push({
            // 要跳转表单的路由名称
            name: 'taskDeal',
            // 要跳转的路由参数, subPage表示是否是子页面
            query: {
              ...params,
              disabledList: ['审批人'],
            },
          });
        }
          break;
        case "Activity_Level3": {
          router.push({
            // 要跳转表单的路由名称
            name: 'taskLevel3Approver',
            // 要跳转的路由参数, subPage表示是否是子页面
            query: {
              ...params,
              disabledList: ['审批人'],
            },
          });
        }
          break;
        case "Activity_OpsManager": {
          router.push({
            // 要跳转表单的路由名称
            name: 'taskOtherApproverFlow',
            // 要跳转的路由参数, subPage表示是否是子页面
            query: {...params},
          });
        }
          break;
        case "Activity_DeptManager": {
          router.push({
            // 要跳转表单的路由名称
            name: 'taskOtherApproverFlow',
            // 要跳转的路由参数, subPage表示是否是子页面
            query: {...params},
          });
        }
          break;
      }

    } else {
      let params = {
        processInstanceId: row.processInstanceId,
        processDefinitionId: row.processDefinitionId,
        taskId: row.taskId,
      };

      FlowOperationController.viewRuntimeTaskInfo(params)
        .then(res => {
          console.log('......', res);
          if (res.data && res.data.routerName) { // 待办路由没有就请求已办的接口
            console.log('待办跳转路由: ');
            console.log(res.data.routerName || 'handlerFlowTask');
            const targetRouteName = res.data.routerName || 'handlerFlowTask';
            console.log(router.hasRoute, ' targetRouteName---router')
            // 检查路由是否存在，不存在则跳转到404
            if (!router.hasRoute(targetRouteName)||targetRouteName == 'decisionManageDetailFlow') {
              showDialog({
                title: '提示',
                message: '此类待办暂不支持移动办公处理，请您登录pc端处理',
              }).then(() => {
                appBack()
              })
              return;
            }
            router.push({
              name: targetRouteName,
              query: {
                isRuntime: 'true',
                isDraft: row.isDraft,
                taskId: row.taskId || row.id,
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
                isCopy: res.data.routerName == 'pickNoticeAdd' ? false : true, //抄送显示
                isApprover: res.data.routerName == 'pickNoticeAdd' ? false : true, //审批人
              },
            });
          } else {
            onTaskDetail(row)
          }
        })
        .catch(e => {
          console.warn(e);
        });
    }
  };

  /**
   * 已办详情
   */
  const onTaskDetail = (row: ANY_OBJECT) => {
    let params = {
      taskId: row.taskId || row.id,
      processDefinitionId: row.processDefinitionId,
      processInstanceId: row.processInstanceId,
    };

    FlowOperationController.viewHistoricTaskInfo(params).then(res => {

      const targetRouteName = res.data.routerName || 'handlerFlowTask';
      // 检查路由是否存在，不存在则弹框提示
      if (!router.hasRoute(targetRouteName)||targetRouteName == 'decisionManageDetailFlow') {
        showDialog({
          title: '提示',
          message: '此类待办暂不支持移动办公处理，请您登录pc端处理',
        }).then(() => {
          appBack()
        })
        return;
      }
      router.push({
        name: targetRouteName,
        query: {
          processDefinitionKey: row.processDefinitionKey,
          taskId: row.taskId || row.id,
          processInstanceId: row.processInstanceId,
          taskDefinitionKey:row.taskDefinitionKey,
          processDefinitionId: row.processDefinitionId,
          showName: row.showName, // 流程实例发起人显示名
          processInstanceInitiatorCityName: row.processInstanceInitiatorCityName, // 流程实例发起人城市
          processInstanceInitiatorMobile: row.processInstanceInitiatorMobile, // 流程实例发起人电话
          processInstanceInitiatorDeptName: row.processInstanceInitiatorDeptName, // 流程实例发起部门
          processInstanceStartTime: row.processInstanceStartTime || row.createTime, // 流程实例发起时间
          formId: (row.formInfo || {}).formId,
          routerName: row.routerName,
          readOnly: 'true',
          isInfo: 'true',
          flowEntryName: row.processDefinitionName,
          processInstanceInitiator: row.showName,
          businessKey: row.businessKey,
          // 在已办理任务中仅显示加签、减签和撤销操作
          operationList: JSON.stringify(
            (res.data.operationList || []).filter((item: ANY_OBJECT) => {
              return (
                item.type === SysFlowTaskOperationType.CO_SIGN ||
                item.type === SysFlowTaskOperationType.REVOKE ||
                item.type === SysFlowTaskOperationType.SIGN_REDUCTION
              );
            }),
          ),
        },
      });
    });
  };

  const initPath = async ()=>{
  await initEruda();
    let fromPath = sessionStorage.getItem('fromPath') // 路由去向在路由守卫那里保存
    let toPath = sessionStorage.getItem('toPath')
    if(fromPath && toPath){
      console.log(fromPath, '这是from')
      console.log(toPath, '这是to')
      if(fromPath === '/' && toPath === '/interface/workflow'){ // 从DICT系统待办进来中转页的
        console.log('从DICT系统待办进来中转页的,转发到目标路由')
        onSubmit(route.query)
      }else{ // 从本系统路由返回中转页的，调用DICT系统提供的关闭标签页方法
        window.parent.postMessage({type: 'closePartner', data: ''}, window.location.origin);
        console.log('DICT系统提供的关闭标签页方法，调用closePartner了')
      }
    }else{ // 如果本地还没保存路由去向，说明是第一次进系统，所以正常转发路由
      onSubmit(route.query)
    }
  }
  onMounted(() => {
    initPath();
  })

</script>

<style lang="scss">

</style>
