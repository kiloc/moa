import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../../config';

export default class RecruitPlanManagerController extends BaseController {
  static recruitmentDemandList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPlan/queryList',
      params,
      httpOptions,
    );
  }
  static submitBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPlan/submitAndStartFlow',
      params,
      httpOptions,
    );
  }
  static logicalDelete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPlan/logicalDelete?planCode=' + params.planCode,
      params,
      httpOptions,
    );
  }
  static saveDraftBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPlan/submit',
      params,
      httpOptions,
    );
  }
  static fileSaveDraftBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentFileUpload/save',
      params,
      httpOptions,
    );
  }
  static resubmit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPlan/resubmitAfterReject',
      params,
      httpOptions,
    );
  }
  static queryPlanNegativeBehaviorBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPlan/queryDetail',
      params,
      httpOptions,
    );
  }
  static recruitmentPublicityDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPublicity/queryDetail',
      params,
      httpOptions,
    );
  }
  static recruitmentPublicitySave(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPublicity/publicitySave',
      params,
      httpOptions,
    );
  }
  static recruitmentPublicitySub(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPublicity/publicitySubmit',
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
  static selectByFieldCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/qualificationConfigInfo/selectByFieldCode',
      params,
      httpOptions,
    );
  }
  static uploadAndCompleteTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentFileUpload/uploadAndCompleteTask',
      params,
      httpOptions,
    );
  }
  static resubmitFileAfterReject(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentFileUpload/resubmitAfterReject',
      params,
      httpOptions,
    );
  }
}
