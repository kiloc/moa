import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export interface PartnerFileDto {
  fileName?: string;
  originalName?: string;
  downloadUri?: string;
  uploadPath?: string;
  remark?: string;
}

export interface ResourceInquiryReplyVo {
  id?: number;
  partnerName?: string;
  contactName?: string;
  linkName?: string;
  contactPhone?: string;
  linkPhone?: string;
  replyTime?: string;
  applyTime?: string;
  createTime?: string;
  files?: PartnerFileDto[];
  replyFiles?: PartnerFileDto[];
}

export interface ResourceInquiryVo {
  id?: number;
  inquiryCode?: string;
  title?: string;
  content?: string;
  taskType?: string;
  taskTypeName?: string;
  applyStartTime?: string;
  applyEndTime?: string;
  showStartTime?: string;
  showEndTime?: string;
  isTop?: number;
  publishUnit?: string;
  industryLimitType?: number;
  industryCodes?: string[];
  regionLimitType?: number;
  regionCodes?: string[];
  reason?: string;
  status?: number;
  statusName?: string;
  approveTime?: string;
  processInstanceId?: string;
  taskId?: string;
  appointedAssignee?: string;
  appointedAssigneeName?: string;
  createUserName?: string;
  createTime?: string;
  publishFiles?: PartnerFileDto[];
  replyList?: ResourceInquiryReplyVo[];
  responseList?: ResourceInquiryReplyVo[];
}

export interface ResourceInquiryQueryDto {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  taskType?: string;
  status?: number;
  industryCode?: string;
}

export interface ResourceInquirySubmitDto {
  id?: number;
  title: string;
  content: string;
  taskType: string;
  applyStartTime: string;
  applyEndTime: string;
  showEndTime: string;
  isTop?: number;
  industryLimitType: number;
  industryCodes?: string[];
  regionLimitType: number;
  regionCodes?: string[];
  reason?: string;
  publishFiles?: PartnerFileDto[];
  appointedAssignee?: string;
  reAppointedAssignee?: string;
}

export interface ResourceInquiryResubmitDto extends ResourceInquirySubmitDto {
  id: number;
  processInstanceId: string;
  taskId: string;
  taskComment?: string;
  reAppointedAssignee?: string;
}

export interface ResourceInquiryTaskListResponse {
  dataList: ResourceInquiryVo[];
  totalCount: number;
  extra?: ANY_OBJECT;
}

export interface ResourceInquiryAnswerVo {
  id?: number | string;
  inquiryId?: number | string;
  partnerCode?: string;
  partnerName?: string;
  contactName?: string;
  contactPhone?: string;
  answerDesc?: string;
  answerTime?: string;
  submitCount?: number;
  answerFiles?: PartnerFileDto[];
}

export default class ResourceInquiryController extends BaseController {
  static list(params: ResourceInquiryQueryDto, httpOptions?: RequestOption) {
    return super.post<ResourceInquiryTaskListResponse>(
      API_CONTEXT + '/manage/resourceInquiry/list',
      params,
      httpOptions,
    );
  }

  static submit(params: ResourceInquirySubmitDto, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/resourceInquiry/submit', params, httpOptions);
  }

  /**
   * 驳回修改后重新提交
   * POST /gov/admin/manage/resourceInquiry/resubmit
   */
  static resubmit(params: ResourceInquiryResubmitDto, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/resourceInquiry/resubmit', params, httpOptions);
  }

  static detail(params: { id: string }, httpOptions?: RequestOption) {
    return super.get<ResourceInquiryVo>(
      API_CONTEXT + '/manage/resourceInquiry/detail',
      params,
      httpOptions,
    );
  }

  static listReply(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<{ dataList?: ResourceInquiryReplyVo[]; totalCount?: number }>(
      API_CONTEXT + '/manage/resourceInquiry/listReply',
      params,
      httpOptions,
    );
  }

  /**
   * 查询任务应答列表
   * POST /gov/admin/manage/resourceInquiry/listAnswers?inquiryId=
   */
  static listAnswers(params: { inquiryId: number | string }, httpOptions?: RequestOption) {
    return super.post<ResourceInquiryAnswerVo[]>(
      `${API_CONTEXT}/manage/resourceInquiry/listAnswers?inquiryId=${encodeURIComponent(String(params.inquiryId))}`,
      params,
      httpOptions,
    );
  }

  static resourceInquiryFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<{ dataList?: ResourceInquiryReplyVo[]; totalCount?: number }>(
      API_CONTEXT + '/manage/resourceInquiry/viewTaskBusinessData/ResourceInquiryFlow',
      params,
      httpOptions,
    );
  }

  /**
   * 全量应答附件 ZIP 下载
   * GET /gov/admin/manage/resourceInquiry/downloadAllAnswers?id=
   * 压缩包名称：{任务标题}全量应答附件.zip
   */
  static downloadAllAnswers(params: { id: number | string }, fileName = '', httpOptions?: RequestOption) {
    return super.download(
      API_CONTEXT + '/manage/resourceInquiry/downloadAllAnswers',
      { id: params.id },
      fileName,
      'get',
      httpOptions,
    );
  }

  static listApprover(params?: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/resourceInquiry/listApprover', params || {}, httpOptions);
  }

  static discard(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/resourceInquiry/discard', params, httpOptions);
  }
}
