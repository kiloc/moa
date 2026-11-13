import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class RecruitReviewController extends BaseController {
  static queryReviewList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentReview/queryReviewList',
      params,
      httpOptions,
    );
  }

  static queryResponseList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentReview/queryResponseList',
      params,
      httpOptions,
    );
  }

  static queryResponseSummary(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentReview/queryResponseSummary',
      params,
      httpOptions,
    );
  }

  static exportResponseSummary(params: ANY_OBJECT, fileName: string) {
    return super.download(
      API_CONTEXT + '/manage/recruitmentReview/exportResponseSummary',
      params,
      fileName,
    );
  }

  static queryReviewGroupList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/recruitmentExpertSelection/queryReviewGroupList',
      params,
      httpOptions,
    );
  }

  static randomSelectProfessors(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentExpertSelection/randomSelectProfessors',
      params,
      httpOptions,
    );
  }

  static designatedSelectProfessors(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentExpertSelection/designatedSelectProfessors',
      params,
      httpOptions,
    );
  }

  static batchInsert(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/recruitmentExpertSelection/batchInsert',
      params,
      httpOptions,
    );
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/recruitmentExpertSelection/delete',
      params,
      httpOptions,
    );
  }

  static submit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentExpertSelection/submit',
      params,
      httpOptions,
    );
  }

  static confirm(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentExpertSelection/confirm',
      params,
      httpOptions,
    );
  }

  static phoneConfirm(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/recruitmentExpertSelection/phoneConfirm',
      params,
      httpOptions,
    );
  }
}