import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class DataBaseController extends BaseController {
  static portalPartnerSubmit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalPartnerFoundationInfo/portalPartnerSubmit',
      params,
      httpOptions,
    );
  }
  static industryScenceIncSubmit(params: ANY_OBJECT, httpOptions?: RequestOption) { // 合作伙伴行业或专业能力扩充提交
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerMaintenance/industryScenceIncSubmit',
      params,
      httpOptions,
    );
  }
  static regionIncSubmit(params: ANY_OBJECT, httpOptions?: RequestOption) { // 合作伙伴区域扩充提交
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerMaintenance/regionIncSubmit',
      params,
      httpOptions,
    );
  }
  static renewalSubmit(params: ANY_OBJECT, httpOptions?: RequestOption) { // 合作伙伴续约提交
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerMaintenance/renewalSubmit',
      params,
      httpOptions,
    );
  }
  static getPartnerOtherDetail(params: ANY_OBJECT, httpOptions?: RequestOption) { // 合作伙伴信息维护历史详情查询
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerMaintenance/getPartnerOtherDetail',
      params,
      httpOptions,
    );
  }
  static infoChangeSubmit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerMaintenance/infoChangeSubmit',
      params,
      httpOptions,
    );
  }
  static resubmitPartnerInfo(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalPartnerFoundationInfo/resubmitPartnerInfo',
      params,
      httpOptions,
    );
  }
  static resubmitMaintenance(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerMaintenance/resubmitMaintenance',
      params,
      httpOptions,
    );
  }
  static searchPartner(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerOutStorage/searchPartner',
      params,
      httpOptions,
    );
  }
  static searchPartnerAll(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerOutStorage/searchPartnerAll',
      params,
      httpOptions,
    );
  }
  static submitOutStorage(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerOutStorage/submitIndustryReturn',
      params,
      httpOptions,
    );
  }
  static resubmitOutStorage(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerOutStorage/resubmitIndustryReturn',
      params,
      httpOptions,
    );
  }
  static cancelBatchImport(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalPartnerImport/cancelBatchImport?joinCode=' + params.joinCode + '&processDefinitionId=' + params.processDefinitionld,
      params,
      httpOptions,
    );
  }
  static portalPartnerImportReimport(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.upload(API_CONTEXT + '/manage/portalPartnerImport/reimport', params, httpOptions,);
  }
  static portalNegativeBehaviorImport(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.upload(API_CONTEXT + '/manage/portalNegativeBehaviorImport/reImport', params, httpOptions,);
  }
  static downloadTemplate(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/manage/portalPartnerImport/downloadTemplate', params, fileName, 'get');
  }
  static exportListByJoinCode(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/manage/portalPartnerImport/exportListByJoinCode', params, fileName, 'get');
  }
  static portalPartnerImport(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.upload(API_CONTEXT + '/manage/portalPartnerImport/import?appointedAssignee=' + params.appointedAssignee, {importFile:params.importFile}, httpOptions,);
  }
  static getPartnerDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalPartnerFoundationInfo/getPartnerDetail',
      params,
      httpOptions,
    );
  }
  /**
   * 按合作伙伴名称搜索（用于入库页合作伙伴名称远程搜索 / 行业扩充 / 区域扩充）
   * 入参：{ portalPartnerSearchByJoin: { partnerName?, partnerNameLike?, joinCode?, queryCandidate? } }
   * 三种查询互斥：partnerName(精确) / partnerNameLike(模糊) / joinCode(入库单据编号)
   * queryCandidate: false=只查已入库合作伙伴，true=同时查候选
   * 返回：{ hitSource, foundationInfoList: [{ foundationInfo, joinList: [{ industryList, areaList }] }] }
   */
  static searchByPartnerName(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalPartnerFoundationInfo/searchByPartnerName',
      params,
      httpOptions,
    );
  }
  static partnerOutStorageDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerOutStorage/getPartnerDetail',
      params,
      httpOptions,
    );
  }
  static getIndustryReturnByBatchCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerOutStorage/getIndustryReturnByBatchCode',
      params,
      httpOptions,
    );
  }
  static getPartnerHisDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerMaintenance/getPartnerHisDetail',
      params,
      httpOptions,
    );
  }
  static getPartnerOutDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerOutStorage/getPartnerDetail',
      params,
      httpOptions,
    );
  }
  static outbaseList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/partnerOutStorage/listWorkOrder/PartnerReturnFlow',
      params,
      httpOptions,
    );
  }
  static partnerJoinSubApprovalFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalPartnerFoundationInfo/listWorkOrder/PartnerJoinSubApprovalFlow',
      params,
      httpOptions,
    );
  }
  static listByJoinCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalPartnerImport/listByJoinCode',
      params,
      httpOptions,
    );
  }

  static viewbusinessKey(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/partner/feedbackSuggestion/view/businessKey',
      params,
      httpOptions,
    );
  }

  static queryByBatchNo(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalNegativeBehaviorImport/queryByBatchNo',
      params,
      httpOptions,
    );
  }

 static doExportByBatchNo(params: ANY_OBJECT) {

    return super.download(API_CONTEXT + '/manage/portalNegativeBehaviorImport/exportByBatchNo', params, params.fileName, 'get');

  }
}
