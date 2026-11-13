import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class NegativeController extends BaseController {
  static NegativeList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalNegativeBehaviorInfo/list',
      params,
      httpOptions,
    );
  }
  static submitBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalNegativeBehaviorInfo/submitBatch',
      params,
      httpOptions,
    );
  }

    static recruitmentPublicitySubmit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPublicity/publicitySubmit',
      params,
      httpOptions,
    );
  }
  static saveDraftBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalNegativeBehaviorInfo/saveDraftBatch',
      params,
      httpOptions,
    );
  }
  static saveNoticeDraft(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalNegativeBehaviorInfo/saveNoticeDraft',
      params,
      httpOptions,
    );
  }

  //招募公示保存
  static recruitmentPublicitySave(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPublicity/publicitySave',
      params,
      httpOptions,
    );
  }

  static queryNegativeBehaviorBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalNegativeBehaviorInfo/queryNegativeBehaviorBatch',
      params,
      httpOptions,
    );
  }
  //根据方案编码查询招募公示详情
    static recruitmentPublicityDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPublicity/queryDetail',
      params,
      httpOptions,
    );
  }
  static resubmit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalNegativeBehaviorInfo/resubmitBatch',
      params,
      httpOptions,
    );
  }
  static resubmitNotice(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/portalNegativeBehaviorInfo/resubmitNotice',
      params,
      httpOptions,
    );
  }
  static portalNegativeBehaviorImport(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.upload(
      API_CONTEXT + '/manage/portalNegativeBehaviorImport/import?appointedAssignee=' + params.appointedAssignee,
      {importFile:params.importFile},
      httpOptions,
    );

  }
  static downloadTemplate(params: ANY_OBJECT, fileName: string) {
    return super.download(
      API_CONTEXT + '/manage/portalNegativeBehaviorImport/downloadTemplate',
      params,
      fileName,
      'get',
    );
  }

  // 发布公告
  static publishNotice(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/portalNegativeBehaviorInfo/publishNotice',
      params,
      httpOptions,
    );
  }
  // 发布公告
  static submitNotice(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/portalNegativeBehaviorInfo/submitNotice',
      params,
      httpOptions,
    );
  }
}
