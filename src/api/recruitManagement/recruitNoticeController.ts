import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class RecruitNoticeController extends BaseController {
  static queryList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentAnnouncement/queryList',
      params,
      httpOptions,
    );
  }

  static queryDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/recruitmentAnnouncement/getByPlanCode',
      params,
      httpOptions,
    );
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/recruitmentAnnouncement/delete', params, httpOptions);
  }

  static submit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentAnnouncement/submit',
      params,
      httpOptions,
    );
  }

  static save(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentAnnouncement/save',
      params,
      httpOptions,
    );
  }
}