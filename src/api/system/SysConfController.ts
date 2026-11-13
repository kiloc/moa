import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { SysConf } from '@/types/upms/sysconf';
import { API_CONTEXT } from '../config';

export default class SysConfController extends BaseController {
  static updateSysConf(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysConf/update', params, httpOptions);
  }

  static getSysConf(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysConf>(API_CONTEXT + '/upms/sysConf/view', params, httpOptions);
  }
  static globalDict(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysConf>(API_CONTEXT + '/upms/globalDict/listAll', params, httpOptions);
  }
}
