import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class PartnerEvaluationController extends BaseController {
  static queryPartnerInfoList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerEvaluationTask/queryPartnerInfoList',
      params,
      httpOptions,
    );
  }

  static insertOrUpdateEvaluationTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationTask/insertOrUpdateEvaluationTask',
      params,
      httpOptions,
    );
  }

  static queryPartnerEvaluationList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerEvaluationTask/queryPartnerEvaluationList',
      params,
      httpOptions,
    );
  }

  static evaluationScoreView(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationTask/evaluationScoreView',
      params,
      httpOptions,
    );
  }

  static addOrUpEvaluationScore(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationTask/addOrUpEvaluationScore',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationTask/view',
      params,
      httpOptions,
    );
  }

  static getEvaluationDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationTask/getEvaluationDetail',
      params,
      httpOptions,
    );
  }

  static queryPartnerJoinInfo(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationTask/queryPartnerJoinInfo',
      params,
      httpOptions,
    );
  }

  static submitEvaluationScore(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationTask/submitEvaluationScore',
      params,
      httpOptions,
    );
  }

  static summary(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationAutoScore/summary',
      params,
      httpOptions,
    );
  }

  static saveEvaluationResult(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationTask/saveEvaluationResult',
      params,
      httpOptions,
    );
  }
  static submitEvaluationResult(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/partnerEvaluationTask/submitEvaluationResult',
      params,
      httpOptions,
    );
  }
}
