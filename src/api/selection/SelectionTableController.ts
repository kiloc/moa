import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class SelectionTableController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/pickNotice/selectNoticeList',
      params,
      httpOptions,
    );
  }
  static submitFeedback(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/pickFeedback/submitFeedback',
      params,
      httpOptions,
    );
  }
  static selectInvitedPartnersByNoticeNumber(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/pickNotice/selectInvitedPartnersByNoticeNumber',
      params,
      httpOptions,
    );
  }
  //   二次报价  /manage/pickNotice/secondaryQuotation
  static secondaryQuotation(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/pickNotice/secondaryQuotation',
      params,
      httpOptions,
    );
  }
  //   合作伙伴应答接口  合作伙伴二次报价接口
  static queryPartnerPage(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/pickDemand/queryPartnerPage',
      params,
      httpOptions,
    );
  }
  //   甄选结果决策信息列表接口/manage/pickNotice/selectDecisionNoticeList
  static selectDecisionNoticeList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/pickNotice/selectDecisionNoticeList',
      params,
      httpOptions,
    );
  }

  //   资料补传 保存 /manage/pickDecision/addPickDecisionFile
  static addPickDecisionFile(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/pickDecision/addPickDecisionFile',
      params,
      httpOptions,
    );
  }
  // 获取决策信息  /manage/pickDemand/queryBidResult
  static queryBidResult(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickDemand/queryBidResult',
      params,
      httpOptions,
    );
  }
  //   资料补全提交/manage/pickResourceApply/resourceApplySubmit
  static resourceApplySubmit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/pickResourceApply/resourceApplySubmit',
      params,
      httpOptions,
    );
  }
  //   甄选结果列表接口 /gov/admin/manage/pickAnnounce/queryAnnounceList
  static queryAnnounceList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/pickAnnounce/queryAnnounceList',
      params,
      httpOptions,
    );
  }

  //   导出公示列表 /gov/admin/manage/pickAnnounce/exportAnnounceList
  static exportAnnounceList(
    params: ANY_OBJECT,
    fileName = '公示列表.xlsx',
    httpOptions?: RequestOption,
  ) {
    return super.download(
      API_CONTEXT + '/manage/pickAnnounce/exportAnnounceList',
      params,
      fileName,
      'post',
      httpOptions,
    );
  }

  //   删除公示 /gov/admin/manage/pickAnnounce/delete
  static deleteAnnounce(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(API_CONTEXT + '/manage/pickAnnounce/delete', params, httpOptions);
  }
}
