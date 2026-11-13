import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class PickSmsSendRecordController extends BaseController {
  /**
   * 短信发送记录列表
   * 接口路径: /gov/admin/partner/pickSmsSendRecord/list
   */
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/partner/pickSmsSendRecord/list',
      params,
      httpOptions,
    );
  }

  /**
   * 短信发送记录详情
   * 接口路径: /gov/admin/partner/pickSmsSendRecord/view
   */
  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/partner/pickSmsSendRecord/view',
      params,
      httpOptions,
    );
  }

  /**
   * 新增短信发送记录
   * 接口路径: /gov/admin/partner/pickSmsSendRecord/add
   */
  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/partner/pickSmsSendRecord/add',
      params,
      httpOptions,
    );
  }

  /**
   * 更新短信发送记录
   * 接口路径: /gov/admin/partner/pickSmsSendRecord/update
   */
  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/partner/pickSmsSendRecord/update',
      params,
      httpOptions,
    );
  }

  /**
   * 导出短信列表
   * 接口路径: /gov/admin/partner/pickSmsSendRecord/export
   */
  static export(
    params: ANY_OBJECT,
    fileName = '短信列表.xlsx',
    httpOptions?: RequestOption,
  ) {
    return super.download(
      API_CONTEXT + '/partner/pickSmsSendRecord/export',
      params,
      fileName,
      'post',
      httpOptions,
    );
  }

  /**
   * 重发短信
   * 接口路径: /gov/admin/partner/pickSmsSendRecord/resend
   */
  static resend(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/partner/pickSmsSendRecord/resend',
      params,
      httpOptions,
    );
  }

  /**
   * 删除短信记录
   * 接口路径: /gov/admin/partner/pickSmsSendRecord/delete
   */
  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/partner/pickSmsSendRecord/delete',
      params,
      httpOptions,
    );
  }
}
