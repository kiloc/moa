import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export interface AreaData {
  /**
   * 主键
   */
  id?: number;
  /**
   * 区域代码
   */
  areaCode?: string;
  /**
   * 区域名称
   */
  areaName?: string;
  /**
   * Pid
   */
  pid?: number;
  /**
   * 级别1省、2市、3县区
   */
  level?: string;
}

export default class AreaController extends BaseController {
  /**
   * 查询所有地市
   */
  static selectAllCity(params: ANY_OBJECT = {}, httpOptions?: RequestOption) {
    return super.get<AreaData[]>(API_CONTEXT + '/manage/area/selectAllCity', params, httpOptions);
  }
}
