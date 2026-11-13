import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../../config';

export default class RecruitDemandManagerController extends BaseController {
  static recruitmentDemandList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDemand/list',
      params,
      httpOptions,
    );
  }
  static submitBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDemand/submitAndStartFlow',
      params,
      httpOptions,
    );
  }
  static logicalDelete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDemand/logicalDelete?demandCode=' + params.demandCode,
      params,
      httpOptions,
    );
  }
  static saveDraftBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDemand/submit',
      params,
      httpOptions,
    );
  }
  static resubmit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDemand/resubmitAfterReject',
      params,
      httpOptions,
    );
  }
  static queryNegativeBehaviorBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDemand/getDetailByCode',
      params,
      httpOptions,
    );
  }
  static selectByAll(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerList/selectByAll',
      params,
      httpOptions,
    );
  }
  static industries(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/cascade/industries',
      params,
      httpOptions,
    );
  }
  static fields(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/cascade/fields',
      params,
      httpOptions,
    );
  }
  static scences(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/cascade/scences',
      params,
      httpOptions,
    );
  }
  static cancel(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDemand/cancel?businessCode=' + params.businessCode,
      params,
      httpOptions,
    );
  }
  static getPanoramaDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/recruitmentDemand/getPanoramaDetail',
      params,
      httpOptions,
    );
  }
}
