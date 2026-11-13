import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { useUrlBuilder } from '@/common/hooks/useUrl';
import PickScheme from '@/types/table/pickScheme';
import { API_CONTEXT } from '../config';

const { buildGetUrl } = useUrlBuilder();

export interface PickSchemeData extends PickScheme {
  __cascade_add_temp_id__?: string | number | undefined;
}

export default class PickSchemeController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickSchemeData>>(
      API_CONTEXT + '/manage/pickScheme/list',
      params,
      httpOptions,
    );
  }
  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PickSchemeData>(API_CONTEXT + '/manage/pickScheme/view', params, httpOptions);
  }
  static export(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/manage/pickScheme/export', params, fileName);
  }
  static import(params: ANY_OBJECT) {
    return super.upload(API_CONTEXT + '/manage/pickScheme/import', params);
  }
  static printUrl(params: ANY_OBJECT) {
    return buildGetUrl(API_CONTEXT + '/manage/pickScheme/print', params);
  }
  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickScheme/add', params, httpOptions);
  }
  static selectByAll(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickSchemeData>>(
      API_CONTEXT + '/manage/pickScheme/selectPickSchemeList',
      params,
      httpOptions,
    );
  }
  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickScheme/update', params, httpOptions);
  }
  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickScheme/delete', params, httpOptions);
  }
  static deleteBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickScheme/deleteBatch', params, httpOptions);
  }
  static insertOrUpdate(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickScheme/insertOrUpdate', params, httpOptions);
  }
  static insert(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickArchive/insert', params, httpOptions);
  }
  static selectByNoticeNumber(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(API_CONTEXT + '/manage/pickArchive/selectByNoticeNumber', params, httpOptions);
  }
  static pickArchiveLaunch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/flow/api/flowOperation/submitUserTask/PickArchiveLaunch',
      params,
      httpOptions,
    );
  }
  //   方案详情 /gov/admin/manage/pickScheme/view
  static viewPickScheme(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(API_CONTEXT + '/manage/pickScheme/view', params, httpOptions);
  }
}
