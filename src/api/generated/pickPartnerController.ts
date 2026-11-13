import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export interface PickPartnerData {
  id?: number;
  partnerName?: string;
  partnerIndustry?: string;
  partnerArea?: string;
  partnerScene?: string;
  linkName?: string;
  linkPhone?: string;
}

export default class PickPartnerController extends BaseController {
  static selectByAll(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickPartnerData>>(
      API_CONTEXT + '/manage/pickPartner/selectByAll',
      params,
      httpOptions,
    );
  }
}
