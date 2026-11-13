import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export interface PortalNoticeFileDto {
  fileName?: string;
  filename?: string;
  originalName?: string;
  name?: string;
  downloadUri?: string;
  fieldName?: string;
}

export interface PortalNoticeVo {
  id?: number | string;
  announcementContent: string;
  announcementTitle: string;
  announcementType: string;
  datasourceId: string;
  publishTime: string;
  publisher: string;
  validStartDate: string;
  validEndDate: string;
  announcementAttachment?: PortalNoticeFileDto[];
}

export default class PortalNoticeController extends BaseController {
  static portalNoticeDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PortalNoticeVo>(
      API_CONTEXT + '/partner/announcement/portalNoticeDetail1',
      params,
      httpOptions,
    );
  }
}
