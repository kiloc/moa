import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export interface FileInfo {
  fileName: string;
  originalName: string;
  downloadUri: string;
  uploadFailed: string;
  uploadPath: string;
}

export interface PickResourceApplyParams {
  demandNumber: string;
  bidDocs?: FileInfo[];
  schemeDocs?: FileInfo[];
  decisionMeetings?: FileInfo[];
  resultDecisionFiles?: FileInfo[];
  assignee?: string;
}

export default class PickResourceApplyController extends BaseController {
  static resourceApplySave(params: PickResourceApplyParams, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickResourceApply/resourceApplySave',
      params,
      httpOptions,
    );
  }
  static insertOrUpdate(params: PickResourceApplyParams, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickResourceApply/insertOrUpdate',
      params,
      httpOptions,
    );
  }

  static resourceApplySubmit(params: PickResourceApplyParams, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickResourceApply/resourceApplySubmit',
      params,
      httpOptions,
    );
  }

  static queryResourceApply(params: { businessId: string }, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickResourceApply/queryResourceApply',
      params,
      httpOptions,
    );
  }
  static queryResourceApplyStatus(params: { businessId: string }, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/pickResourceApply/queryResourceApplyStatus',
      params,
      httpOptions,
    );
  }
}
