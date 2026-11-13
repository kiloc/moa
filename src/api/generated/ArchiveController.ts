import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export interface ArchiveData {
  id?: string | number;
  demandName?: string;
  schemeName?: string;
  editUserName?: string;
  receiverUserName?: string;
  editStartTime?: string;
  editEndTime?: string;
  receiverStartTime?: string;
  receiverEndTime?: string;
  [key: string]: any;
}
export default class ArchiveController extends BaseController {
  /**
   * 归档列表查询
   */
  static selectArchiveList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ArchiveData>>(
      API_CONTEXT + '/manage/pickArchive/selectArchiveList',
      params,
      httpOptions,
    );
  }

  /**
   * 归档详情查询
   */
  static queryDemand(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ArchiveData>(
      API_CONTEXT + '/manage/pickArchive/selectByDemandNumber',
      params,
      httpOptions,
    );
  }

  /**
   * 归档列表导出
   */
  static exportArchiveList(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/manage/pickArchive/exportArchiveList', params, fileName);
  }

  /**
   * 归档编辑保存
   */
  static edit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickArchive/edit', params, httpOptions);
  }
}
