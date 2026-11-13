import { BaseController } from '@/api/BaseController';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { FlowDelegateUser } from '@/types/upms/delegate';
import { API_CONTEXT } from '../config';

export default class FlowDelegateUserController extends BaseController {
  static addDelegateUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowDelegateUser/add', params, httpOptions);
  }

  static updateDelegateUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowDelegateUser/update', params, httpOptions);
  }

  static deleteDelegateUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowDelegateUser/delete', params, httpOptions);
  }

  static listMyDelegate(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<FlowDelegateUser>>(
      API_CONTEXT + '/flow/flowDelegateUser/listMyDelegate',
      params,
      httpOptions,
    );
  }

  static updateDelegatedUserConfirm(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/flow/flowDelegateUser/updateDelegatedUserConfirm',
      params,
      httpOptions,
    );
  }

  static listMyDelegated(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<FlowDelegateUser>>(
      API_CONTEXT + '/flow/flowDelegateUser/listMyDelegated',
      params,
      httpOptions,
    );
  }

  static listDictEffectiveDelegate(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT[]>(
      API_CONTEXT + '/flow/flowDelegateUser/listDictEffectiveDelegate',
      params,
      httpOptions,
    );
  }
}
