import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';


export interface PartnerGrayFileDto {
  filename?: string;
  fileName?: string;
  originalName?: string;
  downloadUri?: string;
  uploadPath?: string;
  uploadFailed?: string;
  businessId?: string;
  kind?: string;
  type?: string;
  status?: string;
  sortNo?: number;
}

export interface PartnerGrayListQueryDto {
  partnerName?: string;
  uscc?: string;
  controlTimeStart?: string;
  controlTimeEnd?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface PartnerGrayCurrentVo {
  id?: number | string;
  partnerId?: number | string;
  partnerCode?: string;
  partnerName?: string;
  uscc?: string;
  status?: number;
  controlReason?: string;
  controlUserId?: number | string;
  controlUserName?: string;
  controlTime?: string;
  removeReason?: string;
  removeUserId?: number | string;
  removeUserName?: string;
  removeTime?: string;
  changeRecordId?: number | string;
  createUserId?: number | string;
  createUserName?: string;
  createTime?: string;
  updateUserId?: number | string;
  updateUserName?: string;
  updateTime?: string;
  controlEvidenceFiles?: PartnerGrayFileDto[];
  removeEvidenceFiles?: PartnerGrayFileDto[];
}

export default class PartnerGrayListController extends BaseController {
  static getDetail(params: { id: number | string }, httpOptions?: RequestOption) {
    return super.post<PartnerGrayCurrentVo>(
      API_CONTEXT + '/manage/partnerGrayList/getDetail',
      params,
      httpOptions,
    );
  }
}
