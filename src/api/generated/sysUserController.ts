import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { useUrlBuilder } from '@/common/hooks/useUrl';
import SysUser from '@/types/table/sysUser';
import { API_CONTEXT } from '../config';

const { buildGetUrl } = useUrlBuilder();

export interface SysUserData extends SysUser {
  __cascade_add_temp_id__?: string | number | undefined;
}

export default class SysUserController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<SysUserData>>(
      API_CONTEXT + '/upms/sysUser/list',
      params,
      httpOptions,
    );
  }
  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysUserData>(API_CONTEXT + '/upms/sysUser/view', params, httpOptions);
  }
  static export(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/upms/sysUser/export', params, fileName);
  }
  static import(params: ANY_OBJECT) {
    return super.upload(API_CONTEXT + '/upms/sysUser/import', params);
  }
  static printUrl(params: ANY_OBJECT) {
    return buildGetUrl(API_CONTEXT + '/upms/sysUser/print', params);
  }
  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysUser/add', params, httpOptions);
  }
  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysUser/update', params, httpOptions);
  }
  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysUser/delete', params, httpOptions);
  }
  static deleteBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysUser/deleteBatch', params, httpOptions);
  }
  static getSysUserListByRoleIds(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysUserData[]>(
      API_CONTEXT + '/upms/sysUser/getSysUserListByRoleIds',
      params,
      httpOptions,
    );
  }
  static getSysUserListByRoleIdsAndCityCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysUserData[]>(
      API_CONTEXT + '/upms/sysUser/getSysUserListByRoleIdsAndCityCode',
      params,
      httpOptions,
    );
  }
  static getUserWithDeptByUserId(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysUserData[]>(
      API_CONTEXT + '/upms/sysUser/getUserWithDeptByUserId',
      params,
      httpOptions,
    );
  }
  static getUserWithDeptListByRoleIdAndCityCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysUserData[]>(
      API_CONTEXT + '/upms/sysUser/getUserWithDeptListByRoleIdAndCityCode',
      params,
      httpOptions,
    );
  }
  static listUserByRoleAndDeptFlag(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<SysUserData[]>(
      API_CONTEXT + '/upms/sysDept/listUserByRoleAndDeptFlag',
    params,
      httpOptions,
    );
  }
  static listUserRole(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<SysUserData[]>(
      API_CONTEXT + '/upms/sysRole/listUserRole',
      params,
      httpOptions,
    );
  }
  static getSysUserListByDeptIds(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysUserData[]>(
      API_CONTEXT + '/upms/sysUser/getSysUserListByDeptIds',
      params,
      httpOptions,
    );
  }
  static getSysUserLeader(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysUserData>(
      API_CONTEXT + '/upms/sysUser/getSysUserLeader',
      params,
      httpOptions,
    );
  }
  static getSysUserListByRoleId(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysUserData>(
      API_CONTEXT + '/upms/sysUser/getSysUserListByRoleId',
      params,
      httpOptions,
    );
  }
  static getById(params: ANY_OBJECT, httpOptions?: RequestOption) {
    // 将参数拼接到 URL 中，因为这个 POST 接口需要查询参数
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return super.post<SysUserData>(
      API_CONTEXT + `/upms/sysUser/getById?${queryString}`,
      {},
      httpOptions,
    );
  }
  static addMoaRequestLog(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/moaRequestLog/add',
      params,
      httpOptions,
    );
  }
}
