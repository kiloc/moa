import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export interface PickAnnounceData {
  id?: number;
  noticeId?: number;
  demandNumber?: string;
  announceNumber?: string;
  announceTitle?: string;
  announcement?: string;
  announceStatus?: string;
  createTime?: string;
  createUserCityName?: string;
  createUserId?: number;
  createUserName?: string;
  createUserOrg?: string;
  createUserPhone?: string;
  demandName?: string;
  replyDeadlineTime?: string;
  schemeName?: string;
  announceFiles?: string;
}

export interface PickAnnounceListResponse {
  dataList: PickAnnounceData[];
  totalCount: number;
}

export default class PickAnnounceController extends BaseController {
  static selectByAll(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<PickAnnounceListResponse>(
      API_CONTEXT + '/manage/pickAnnounce/selectByAll',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PickAnnounceData>(
      API_CONTEXT + '/manage/pickAnnounce/view',
      params,
      httpOptions,
    );
  }

  static insertOrUpdate(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickAnnounce/insertOrUpdate', params, httpOptions);
  }
  //  公告延期
  static updateNotice(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/partner/portalNotice/updateNotice', params, httpOptions);
  }
  // 甄选公告删除
  static deleteNotice(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(API_CONTEXT + '/partner/portalNotice/delete', params, httpOptions);
  }
// 公告列表  /gov/admin/manage/pickNotice/queryNoticeList
  static queryNoticeList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickNotice/queryNoticeList', params, httpOptions);
  }
// 公告审批通过保存接口
  static passSave(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickAnnounce/pass', params, httpOptions);
  }

}
