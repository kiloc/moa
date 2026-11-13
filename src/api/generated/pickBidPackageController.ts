import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { useUrlBuilder } from '@/common/hooks/useUrl';
import PickBidPackage from '@/types/table/pickBidPackage';
import { API_CONTEXT } from '../config';

const { buildGetUrl } = useUrlBuilder();

export interface PickBidPackageData extends PickBidPackage {
  __cascade_add_temp_id__?: string | number | undefined;
}

export default class PickBidPackageController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PickBidPackageData>>(
      API_CONTEXT + '/manage/pickBidPackage/list',
      params,
      httpOptions,
    );
  }
  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PickBidPackageData>(
      API_CONTEXT + '/manage/pickBidPackage/view',
      params,
      httpOptions,
    );
  }
  static export(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/manage/pickBidPackage/export', params, fileName);
  }
  static import(params: ANY_OBJECT) {
    return super.upload(API_CONTEXT + '/manage/pickBidPackage/import', params);
  }
  static printUrl(params: ANY_OBJECT) {
    return buildGetUrl(API_CONTEXT + '/manage/pickBidPackage/print', params);
  }
  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickBidPackage/add', params, httpOptions);
  }
  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickBidPackage/update', params, httpOptions);
  }
  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickBidPackage/delete', params, httpOptions);
  }
  static deleteBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickBidPackage/deleteBatch', params, httpOptions);
  }
}
