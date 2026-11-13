import { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router';
import Login from '@/views/pages/login/index.vue'


function getProps(route: RouteLocationNormalizedLoaded) {
  return route.query;
}

// 系统生成路由
export const routers: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: { name: 'login' },
  },
  {
    path: '/login',
    component: Login,
    name: 'login',
    meta: {
      title: '登录',
    },
  },
  {
    path: '/interface/workflow',
    component: () => import('@/views/pages/login/interfaceWorkflow.vue'),
    name: 'interfaceWorkflow',
    props: getProps,
    meta: { title: '待办', keepalive: false },
  },
  {
    path: '/formMyTask',
    name: 'formMyTask',
    component: () => import('@/views/pages/formMyTask/index.vue'),
    meta: {
      title: '待办任务',
    },
  },
  {
    path: '/partnerDemandApply',
    name: 'partnerDemandApply',
    component: () => import('@/views/pages/inDatabase/objectDatabase/index.vue'),
    meta: {
      title: '入库详情',
    },
  },
  {
    path: '/pickDemandFlowApply',
    component: () => import('@/views/pages/pickDemandFlow/pickDemandApproval.vue'),
    name: 'pickDemandFlowApply',
    props: getProps,
    meta: { title: '甄选需求审批', keepalive: false, commonTitle: '甄选整体流程' },
  },
  // 甄选方案三级经理审批
  {
    path: '/pickSchemeApproval',
    component: () => import('@/views/pages/pickSchemeFlow/pickSchemeApproval.vue'),
    name: 'pickSchemeApproval',
    props: getProps,
    meta: { title: '甄选方案审批', keepalive: false, commonTitle: '甄选整体流程'  },
  },
  {
    path: '/pickSchemeFileApproval',
    component: () => import('@/views/pages/pickSchemeFlow/pickSchemeFileApproval.vue'),
    name: 'pickSchemeFileApproval',
    props: getProps,
    meta: { title: '甄选文件审批', keepalive: false, commonTitle: '甄选整体流程'  },
  },
  {
    path: '/pickNoticeApproval',
    component: () => import('@/views/pages/pickNoticeFlow/pickNoticeApproval.vue'),
    name: 'pickNoticeApproval',
    props: getProps,
    meta: { title: '甄选公告审批', keepalive: false, commonTitle: '甄选整体流程'  },
  },
  {
    path: '/pickDecisionKeepApply',
    component: () =>
      import('@/views/pages/pickResultFlow/pickDecisionKeepApply.vue'),
    name: 'pickDecisionKeepApply',
    props: getProps,
    meta: { title: '甄选决策审批', keepalive: false, commonTitle: '甄选整体流程' },
  },
  {
    path: '/pickAnnounceApproval',
    component: () => import('@/views/pages/pickAnnounceFlow/pickAnnounceApproval.vue'),
    name: 'pickAnnounceApproval',
    props: getProps,
    meta: { title: '甄选结果公示审批', keepalive: false, commonTitle: '甄选整体流程'  },
  },
  // 资料补传流程-资料补传审批
  {
    path: '/resourceApplyApprove',
    component: () => import('@/views/pages/pickDemandFlow/pickDocCompleteApply.vue'),
    name: 'resourceApplyApprove',
    props: getProps,
    meta: { title: '甄选需求资料补传审批', keepalive: false, commonTitle: '资料补传流程' },
  },
  // 需求方案资料补全流程-资料补传审批
  {
    path: '/solutionApprove',
    component: () => import('@/views/pages/pickSchemeFlow/pickSchemeDocComplete.vue'),
    name: 'solutionApprove',
    props: getProps,
    meta: { title: '甄选方案资料补传审批', keepalive: false, commonTitle: '需求方案资料补全流程' },
  },
  // 结果决策资料补全流程-资料补传审批
  {
    path: '/decisionApprove',
    component: () => import('@/views/pages/selectionPlanManager/selectionResults/dataCompletion.vue'),
    name: 'decisionApprove',
    props: getProps,
    meta: { title: '甄选结果决策资料补传审批', keepalive: false, commonTitle: '结果决策资料补全流程' },
  },

  // 招募需求流程-招募需求流程发起
  {
    path: '/recruitmentDemandFlow',
    component: () => import('@/views/pages/recruitManager/recruitDemandManager/index.vue'),
    name: 'recruitmentDemandFlow',
    props: getProps,
    meta: { title: '招募申请审批', keepalive: false, commonTitle: '招募需求流程' },
  },
  // 招募方案流程-
  {
    path: '/RecruitmentPlanFlow',
    component: () => import('@/views/pages/recruitManager/recruitPlanManager/index.vue'),
    name: 'RecruitmentPlanFlow',
    props: getProps,
    meta: { title: '招募方案审批', keepalive: false, commonTitle: '招募方案流程' },
  },
  {
      path: '/RecruitmentPlanFileFlow',
      component: () => import('@/views/pages/recruitManager/recruitPlanFileManager/index.vue'),
      name: 'RecruitmentPlanFileFlow',
      props: getProps,
      meta: { title: '招募文件上传审批', keepalive: false, commonTitle: '招募文件上传流程' },
  },
  {
    path: '/recruitNoticeCompileFlow',
    component: () => import('@/views/pages/recruitManager/recruitNoticeManager/index.vue'),
    name: 'recruitNoticeCompileFlow',
    props: getProps,
    meta: { title: '招募公告编制审批页面', keepalive: false, commonTitle: '招募公告审批流程' },
  },
  {
    path: '/professorConfirmFlow',
    component: () => import('@/views/pages/recruitManager/recruitProfessorConfirm/index.vue'),
    name: 'professorConfirmFlow',
    props: getProps,
    meta: { title: '专家确认流程', keepalive: false, commonTitle: '专家确认审批流程' },
  },
  {
    path: '/decisionManageDetailFlow',
    component: () => import('@/views/pages/recruitManager/decisionManager/decisionDetail.vue'),
    name: 'decisionManageDetailFlow',
    props: getProps,
    meta: { title: '招募结果决策管理详情审批', keepalive: false, commonTitle: '招募结果决策维护审批流程'},
  },
  {
    path: '/publicityManageDetailFlow',
    component: () => import('@/views/pages/recruitManager/publicNoticeManager/noticeDetail.vue'),
    name: 'publicityManageDetailFlow',
    props: getProps,
    meta: { title: '招募公示管理详情', keepalive: false, commonTitle: '招募公示审批流程' },
  },
  {
    path: '/ProjectEvaluationApprovalFlow',
    component: () => import('@/views/pages/evaluate/projectEvaluate/approvalFlow.vue'),
    name: 'ProjectEvaluationApprovalFlow',
    props: getProps,
    meta: { title: '项目后评估审批', commonTitle: '项目后评估审批流程' },
  },
  {
    path: '/partnerEvaluationProvinceApply',
    component: () => import('@/views/pages/partnerEvaluation/view.vue'),
    name: 'partnerEvaluationProvinceApply',
    meta: { title: '合作伙伴后评估三级经理省公司审批', commonTitle: '合作伙伴后评估省公司审批流程' },
  },
  {
    path: '/partnerEvaluationCityApply',
    component: () => import('@/views/pages/partnerEvaluation/partnerEvaluationCityApply.vue'),
    name: 'partnerEvaluationCityApply',
    meta: { title: '合作伙伴后评估三级经理市公司审批', commonTitle: '合作伙伴后评估分公司审批流程' },
  },
  {
    path: '/partnerEvaluationScoreApply',
    component: () => import('@/views/pages/partnerEvaluation/scoreReview.vue'),
    name: 'partnerEvaluationScoreApply',
    meta: { title: '评估打分三级经理省公司审批',  commonTitle: '合作伙伴后评估打分审批流程' },
  },
  {
    path: '/partnerDatabaseBatchApply',
    name: 'partnerDatabaseBatchApply',
    component: () => import('@/views/pages/inDatabase/directDatabaseBatch/indexApply.vue'),
    meta: {
      title: '合作伙伴批量入库流程',
    },
  },
  {
    path: '/partnerOutDataApply',
    name: 'partnerOutDataApply',
    component: () => import('@/views/pages/outDatabase/outDataBaseReq/index.vue'),
    meta: {
      title: '合作伙伴退库流程',
    },
  },
  {
    path: '/infoChangeApply',
    component: () => import('@/views/pages/informationConfig/infoChange/index.vue'),
    name: 'infoChangeApply',
    meta: {
      title: '合作伙伴基本信息变更',
    },
  },
  {
    path: '/infoChangePortalApply',
    component: () => import('@/views/pages/informationConfig/infoChangePortalApply/index.vue'),
    name: 'infoChangePortalApply',
    meta: {
      title: '合作伙伴基本信息变更门户',
    },
  },
  {
    path: '/abilityAddApply',
    component: () => import('@/views/pages/informationConfig/abilityAdd/index.vue'),
    name: 'abilityAddApply',
    meta: {
      title: '合作伙伴行业或专业能力扩充',
    },
  },
  {
    path: '/marketAddApply',
    component: () => import('@/views/pages/informationConfig/marketAdd/index.vue'),
    name: 'marketAddApply',
    meta: {
      title: '合作伙伴区域市场扩充流程',
    },
  },
  {
    path: '/renewalApply',
    component: () => import('@/views/pages/informationConfig/renewal/index.vue'),
    name: 'renewalApply',
    meta: {
      title: '合作伙伴续约流程',
    },
  },
  {
    path: '/noticeAddApproverFlow',
    component: () => import('@/views/pages/negativeManagement/noticeAdd.vue'),
    name: 'noticeAddApproverFlow',
    meta: {
      title: '合作伙伴负面行为公共发布流程',
    },
  },
  {
    path: '/feedbackInfo',
    component: () => import('@/views/pages/inDatabase/feedbackInfo/index.vue'),
    name: 'feedbackInfo',
    meta: {
      title: '合作伙伴反馈建议流程',
    },
  },
  {
    path: '/portalNegativeBehaviorApply',
    component: () => import('@/views/pages/negativeManagement/index.vue'),
    name: 'portalNegativeBehaviorApply',
    meta: {
      title: '合作伙伴负面行为流程'
    },
  },
  {
    path: '/negativeBehaviorBatchFlow',
    component: () => import('@/views/pages/inDatabase/directDatabaseBatch/negativeApply.vue'),
    name: 'negativeBehaviorBatchFlow',
    meta: {
      title: '合作伙伴负面批量导入流程'
    },
  },
  {
    path: '/resourceInquiryFlow',
    component: () => import('@/views/pages/resourceInquiryFlow/index.vue'),
    name: 'resourceInquiryFlow',
    meta: {
      title: '甄选项目情况摸底流程'
    },
  },
  {
    path: '/portalNotice',
    component: () => import('@/views/pages/portalNotice/index.vue'),
    name: 'PortalNotice',
    props: getProps,
    meta: {
      title: '门户公告审批'
    },
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404.vue'),
    name: 'NotFound',
    meta: {
      title: '404',
    },
  },
];
