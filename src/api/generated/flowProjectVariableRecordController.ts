import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { useUrlBuilder } from '@/common/hooks/useUrl';
import FlowProjectVariableRecord from '@/types/table/flowProjectVariableRecord';
import { API_CONTEXT } from '../config';

const { buildGetUrl } = useUrlBuilder();

export interface FlowProjectVariableRecordData extends FlowProjectVariableRecord {
  __cascade_add_temp_id__?: string | number | undefined;
}

export default class FlowProjectVariableRecordController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<FlowProjectVariableRecordData>>(
      API_CONTEXT + '/upms/flowProjectVariableRecord/list',
      params,
      httpOptions,
    );
  }
  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<FlowProjectVariableRecordData>(
      API_CONTEXT + '/upms/flowProjectVariableRecord/view',
      params,
      httpOptions,
    );
  }
  static export(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/upms/flowProjectVariableRecord/export', params, fileName);
  }
  static import(params: ANY_OBJECT) {
    return super.upload(API_CONTEXT + '/upms/flowProjectVariableRecord/import', params);
  }
  static printUrl(params: ANY_OBJECT) {
    return buildGetUrl(API_CONTEXT + '/upms/flowProjectVariableRecord/print', params);
  }
  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/flowProjectVariableRecord/add', params, httpOptions);
  }
  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/flowProjectVariableRecord/update', params, httpOptions);
  }
  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/flowProjectVariableRecord/delete', params, httpOptions);
  }
  static deleteBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/upms/flowProjectVariableRecord/deleteBatch',
      params,
      httpOptions,
    );
  }
}
