import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { useUrlBuilder } from '@/common/hooks/useUrl';
import PickManageProfessor from '@/types/table/pickManageProfessor';
import { API_CONTEXT } from '../config';

const { buildGetUrl } = useUrlBuilder();

export interface PickManageProfessorData extends PickManageProfessor {
  __cascade_add_temp_id__?: string | number | undefined;
}

export default class PickManageProfessorController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickManageProfessorData>>(
      API_CONTEXT + '/manage/pickManageProfessor/list',
      params,
      httpOptions,
    );
  }
  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PickManageProfessorData>(
      API_CONTEXT + '/manage/pickManageProfessor/view',
      params,
      httpOptions,
    );
  }
  static export(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/manage/pickManageProfessor/export', params, fileName);
  }
  static import(params: ANY_OBJECT) {
    return super.upload(API_CONTEXT + '/manage/pickManageProfessor/import', params);
  }
  static printUrl(params: ANY_OBJECT) {
    return buildGetUrl(API_CONTEXT + '/manage/pickManageProfessor/print', params);
  }
  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickManageProfessor/add', params, httpOptions);
  }
  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickManageProfessor/update', params, httpOptions);
  }
  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickManageProfessor/delete', params, httpOptions);
  }
  static deleteBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickManageProfessor/deleteBatch', params, httpOptions);
  }
  static startAndTakeUserTaskPickProfessorAddFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickManageProfessor/startAndTakeUserTask/pickProfessorAddFlow',
      params,
      httpOptions,
    );
  }
  static startAndSaveDraftPickProfessorAddFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickManageProfessor/startAndSaveDraft/pickProfessorAddFlow',
      params,
      httpOptions,
    );
  }
  static submitUserTaskPickProfessorAddFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + `/manage/pickManageProfessor/submitUserTask/${params.processDefinitionKey}`,
      params,
      httpOptions,
    );
  }
  static viewTaskBusinessDataPickProfessorAddFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(
      API_CONTEXT + `/manage/pickManageProfessor/viewTaskBusinessData/${params.processDefinitionKey}`,
      params,
      httpOptions,
    );
  }
  static viewHistoricTaskBusinessDataPickProfessorAddFlow(
    params: ANY_OBJECT,
    httpOptions?: RequestOption,
  ) {
    return super.get(
      API_CONTEXT + `/manage/pickManageProfessor/viewHistoricTaskBusinessData/${params.processDefinitionKey}`,
      params,
      httpOptions,
    );
  }
  static listWorkOrderPickProfessorAddFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickManageProfessor/listWorkOrder/pickProfessorAddFlow',
      params,
      httpOptions,
    );
  }
  static submitUserTaskPickProfessorImportFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickManageProfessor/submitUserTask/pickProfessorImportFlow',
      params,
      httpOptions,
    );
  }
  static viewTaskBusinessDataPickProfessorImportFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(
      API_CONTEXT + '/manage/pickManageProfessor/viewTaskBusinessData/pickProfessorImportFlow',
      params,
      httpOptions,
    );
  }
  static viewHistoricTaskBusinessDataPickProfessorImportFlow(
    params: ANY_OBJECT,
    httpOptions?: RequestOption,
  ) {
    return super.get(
      API_CONTEXT + '/manage/pickManageProfessor/viewHistoricTaskBusinessData/pickProfessorImportFlow',
      params,
      httpOptions,
    );
  }
  static reImportSubmitPickProfessorImportFlow(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/manage/pickManageProfessor/reImportSubmit/pickProfessorImportFlow',
      params,
      httpOptions,
    );
  }
  static listApprovalRecord(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(
      API_CONTEXT + '/manage/pickManageProfessor/listApprovalRecord',
      params,
      httpOptions,
    );
  }
}
