import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { useUrlBuilder } from '@/common/hooks/useUrl';
import PickDemand from '@/types/table/pickDemand';
import { PickBidPackageData } from '@/api/generated/pickBidPackageController';
import { API_CONTEXT } from '../config';

const { buildGetUrl } = useUrlBuilder();

export interface PickDemandData extends PickDemand {
  pickBidPackageList?: PickBidPackageData[];
  __cascade_add_temp_id__?: string | number | undefined;
}

export default class PickDemandController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickDemandData>>(
      API_CONTEXT + '/manage/pickDemand/list',
      params,
      httpOptions,
    );
  }
  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PickDemandData>(API_CONTEXT + '/manage/pickDemand/view', params, httpOptions);
  }
  static export(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/manage/pickDemand/export', params, fileName);
  }
  static import(params: ANY_OBJECT) {
    return super.upload(API_CONTEXT + '/manage/pickDemand/import', params);
  }
  static printUrl(params: ANY_OBJECT) {
    return buildGetUrl(API_CONTEXT + '/manage/pickDemand/print', params);
  }
  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickDemand/add', params, httpOptions);
  }
  static addPickDemand(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickDemand/addPickDemand', params, httpOptions);
  }
  static updatePickDemand(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickDemand/updatePickDemand', params, httpOptions);
  }
  static demandSubmit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickDemand/demandSubmit', params, httpOptions);
  }
  static selectByAll(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickDemandData>>(
      API_CONTEXT + '/manage/pickDemand/selectByAll',
      params,
      httpOptions,
    );
  }
  static queryDemand(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickDemand/queryDemand',
      params,
      httpOptions,
    );
  }
  static selectByNoticeNumber(params: ANY_OBJECT, httpOptions?: RequestOption) {
    // 特殊处理：POST 请求但参数放在 URL 查询参数中
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickDemand/selectByNoticeNumber',
      {},
      httpOptions,
      { params }, // 通过 axiosOption 将参数放到 URL 上
    );
  }
  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickDemand/update', params, httpOptions);
  }
  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickDemand/deletePickDemand', params, httpOptions);
  }
  static deleteBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickDemand/deleteBatch', params, httpOptions);
  }
  static startOnlyPickDemandFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickDemand/startOnly/PickDemandFlow',
      params,
      httpOptions,
    );
  }
  static startWithBusinessKeyPickDemandFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickDemand/startWithBusinessKey/PickDemandFlow',
      params,
      httpOptions,
    );
  }
  static startAndTakeUserTaskPickDemandFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickDemand/startAndTakeUserTask/PickDemandFlow',
      params,
      httpOptions,
    );
  }
  static startAndSaveDraftPickDemandFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickDemand/startAndSaveDraft/PickDemandFlow',
      params,
      httpOptions,
    );
  }
  static submitUserTaskPickDemandFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickDemand/submitUserTask/PickDemandFlow',
      params,
      httpOptions,
    );
  }
  static viewTaskBusinessDataPickDemandFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(
      API_CONTEXT + '/manage/pickDemand/viewTaskBusinessData/PickDemandFlow',
      params,
      httpOptions,
    );
  }
  static viewHistoricTaskBusinessDataPickDemandFlow(
    params: ANY_OBJECT,
    httpOptions?: RequestOption,
  ) {
    return super.get(
      API_CONTEXT + '/manage/pickDemand/viewHistoricTaskBusinessData/PickDemandFlow',
      params,
      httpOptions,
    );
  }
  static listWorkOrderPickDemandFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickDemand/listWorkOrder/PickDemandFlow',
      params,
      httpOptions,
    );
  }
  static nextStringId(params: ANY_OBJECT, httpOptions?: RequestOption) {
    // return super.post<string>(API_CONTEXT + '/manage/pickDemand/nextStringId', params, httpOptions);
    return super.get<string>(API_CONTEXT + '/manage/pickScheme/generateCode', params, httpOptions);
  }
  static rePickSubmit(
    params: { demandNumber: string; noticeId: number },
    httpOptions?: RequestOption,
  ) {
    // POST 请求但参数放在 URL 查询参数中
    return super.post(
      API_CONTEXT + '/manage/pickDemand/rePickSubmit',
      {},
      httpOptions,
      { params }, // 通过 axiosOption 将参数放到 URL 上
    );
  }
  static queryBidResult(
    params: { demandNumber: string; noticeId: number; successFlag: number },
    httpOptions?: RequestOption,
  ) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickDemand/queryBidResult',
      params,
      httpOptions,
    );
  }
  static queryFirstReviewTimeDemand(params: { demandNumber: string }, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickDemand/queryFirstReviewTimeDemand',
      params,
      httpOptions,
    );
  }
  // 部门
  static getOrgStructureByCurrentUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/upms/sysUser/getOrgStructureByCurrentUser',
      params,
      httpOptions,
    );
  }
  // 地市  /upms/sysUser/getCityDropdownByCurrentUser
  static getCityDropdownByCurrentUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/upms/sysUser/getCityDropdownByCurrentUser',
      params,
      httpOptions,
    );
  }
  //新增常用意见/manage/pickCommonOpinion/add
  static addPickCommonOpinion(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickCommonOpinion/add', params, httpOptions);
  }
  //常用意见列表/manage/pickCommonOpinion/list
  static listPickCommonOpinion(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickCommonOpinion/list', params, httpOptions);
  }

  //评审专家 manage/pickProfessor/getProfessorResultByCategory
  static getProfessorResultByCategory(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickProfessor/getProfessorResultByCategory',
      params,
      httpOptions,
    );
  }
  //   应答列表 /manage/pickDemand/queryPartnerPage
  static queryPartnerPage(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickDemand/queryPartnerPage',
      params,
      httpOptions,
    );
  }
  //   二次甄选 公告 公示/manage/pickDemand/queryDemandReview
  static queryDemandReview(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickDemand/queryDemandReview',
      params,
      httpOptions,
    );
  }
//  二次甄选应答/manage/pickDemand/queryPartnerPageReview
  static queryPartnerPageReview(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickDemand/queryPartnerPageReview',
      params,
      httpOptions,
    );
  }
//  二次甄选评审结果/manage/pickDemand/queryBidResultReview
  static queryBidResultReview(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickDemand/queryBidResultReview',
      params,
      httpOptions,
    );
  }
//   二次甄选评审专家/manage/pickProfessor/getProfessorResultByCategoryReview
  static getProfessorResultByCategoryReview(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickProfessor/getProfessorResultByCategoryReview',
      params,
      httpOptions
    )
  }

}
