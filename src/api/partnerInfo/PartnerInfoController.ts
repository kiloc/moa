import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class PartnerInfoController extends BaseController {
  // 合作伙伴画像详情（按入库流程历史 partnerCode 反查）：移动端入库审批详情页使用
  // 入参：{ partnerCode }；出参仅含 foundationInfoList（不含 candidateList / hitSource）
  static searchPartnerByHisPartnerCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/portalPartnerFoundationInfo/searchPartnerByHisPartnerCode',
      params,
      httpOptions,
    );
  }
}