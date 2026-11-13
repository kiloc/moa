import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export interface PickDecisionData {
  id?: string | number;
  noticeId?: number;
  decisionTime?: string;
  resultDecisionFiles?: ANY_OBJECT[];
  __cascade_add_temp_id__?: string | number | undefined;
}

export default class PickDecisionController extends BaseController {
  static addPickDecision(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickDecision/addPickDecision', params, httpOptions);
  }
}
