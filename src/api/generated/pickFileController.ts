import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class PickFileController extends BaseController {
  static updatePickFile(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/manage/pickFile/updatePickFile', params, httpOptions);
  }
}
