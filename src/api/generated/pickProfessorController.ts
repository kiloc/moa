import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export interface PickProfessorData {
  id?: string | number;
  professorName?: string;
  professorOrg?: string;
  professorPhone?: string;
  professorType?: string; // 1.专家 2.经理人员 3.项目经办人
  professorEmail?: string;
  attendFlag?: number; // 是否参加：0-未反馈，1-参加，2-不参加
  professorNoticeId?: string | number; // 专家公告关联ID，用于删除
  __cascade_add_temp_id__?: string | number | undefined;
}

export default class PickProfessorController extends BaseController {
  static selectByAll(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickProfessorData>>(
      API_CONTEXT + '/manage/pickProfessor/selectByAll',
      params,
      httpOptions,
    );
  }

  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickProfessorData>>(
      API_CONTEXT + '/manage/pickProfessor/list',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PickProfessorData>(
      API_CONTEXT + '/manage/pickProfessor/view',
      params,
      httpOptions,
    );
  }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickProfessor/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickProfessor/update', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickProfessor/delete', params, httpOptions);
  }

  static deleteBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickProfessor/deleteBatch', params, httpOptions);
  }

  static getProfessorRandom(
    params: { getNumber: number; cityCode?: string ; extractMethod?: string },
    httpOptions?: RequestOption,
  ) {
    return super.get<PickProfessorData[]>(
      API_CONTEXT + '/manage/pickProfessor/getProfessorRandom',
      params,
      httpOptions,
    );
  }

  static professorSubmit(
    params: { professorIds: number[]; noticeNumber: string | number },
    httpOptions?: RequestOption,
  ) {
    return super.post(API_CONTEXT + '/manage/pickProfessor/professorSubmit', params, httpOptions);
  }

  static getProfessorResult(
    params: { noticeNumber: string | number },
    httpOptions?: RequestOption,
  ) {
    return super.get<PickProfessorData[]>(
      API_CONTEXT + '/manage/pickProfessor/getProfessorResult',
      params,
      httpOptions,
    );
  }

  static delProfessorResult(
    params: { professorNoticeId: string | number },
    httpOptions?: RequestOption,
  ) {
    return super.get(API_CONTEXT + '/manage/pickProfessor/delProfessorResult', params, httpOptions);
  }

  static phoneConfirm(
    params: {
      noticeNumber: string;
      expertLoginName: string;
      confirmStatus: number;
      reason: string;
      taskComment: string;
    },
    httpOptions?: RequestOption,
  ) {
    return super.post(API_CONTEXT + '/manage/pickProfessor/phoneConfirm', params, httpOptions);
  }
}
