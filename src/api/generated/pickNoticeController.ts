import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export interface PickNoticeData {
  id?: string | number;
  schemeId?: number;
  noticeNumber?: string;
  noticeTitle?: string;
  loseTime?: string;
  applyDeadlineTime?: string;
  replyDeadlineTime?: string;
  noticeStatus?: number;
  notice?: string;
  bidAuditTime?: string;
  bidAuditPlace?: string;
  bidAuditLinkman?: string;
  bidAuditPhone?: string;
  demandNumber?: string;
  demandName?: string;
  oppoName?: string;
  oppoCode?: string;
  budgetAmount?: number;
  budgetAmountTax?: number;
  pickBidFlag?: string;
  bidPackageFlag?: string;
  openTime?: string;
  createUserName?: string;
  createUserOrg?: string;
  createTime?: string;
  createUserPhone?: string;
  createUserCityName?: string;
  __cascade_add_temp_id__?: string | number | undefined;
}

export default class PickNoticeController extends BaseController {
  static insertOrUpdate(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<PickNoticeData>(
      API_CONTEXT + '/manage/pickNotice/insertOrUpdate',
      params,
      httpOptions,
    );
  }

  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickNoticeData>>(
      API_CONTEXT + '/manage/pickNotice/list',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PickNoticeData>(API_CONTEXT + '/manage/pickNotice/view', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickNotice/delete', params, httpOptions);
  }

  static deleteBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickNotice/deleteBatch', params, httpOptions);
  }

  // 流程相关接口
  static startPickNoticeFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickNotice/start/PickNoticeFlow', params, httpOptions);
  }

  static submitUserTaskPickNoticeFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickNotice/submitUserTask/PickNoticeFlow',
      params,
      httpOptions,
    );
  }
}
