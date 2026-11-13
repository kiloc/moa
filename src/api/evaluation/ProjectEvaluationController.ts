import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class ProjectEvaluationController extends BaseController {
  // 项目后评估任务列表查询接口
  static projectEvaluationList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/projectEvaluation/list',
      params,
      httpOptions,
    );
  }
  // 项目后评估任务详情接口
  static taskDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/projectEvaluation/taskDetail',
      params,
      httpOptions,
    );
  }
  // 后评估审批信息查询接口
  static approvalInfo(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/projectEvaluation/approvalInfo',
      params,
      httpOptions,
    );
  }
  // 后评估打分快照详情接口
  static scoreDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/projectEvaluation/scoreDetail',
      params,
      httpOptions,
    );
  }
  // 后评估打分保存接口
  static saveScore(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/projectEvaluation/saveScore',
      params,
      httpOptions,
    );
  }
  // 审批提交接口
  static approvalSubmit(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/manage/projectEvaluation/approvalSubmit',
      params,
      httpOptions,
    );
  }
  // 考核人员待办详情 / 查看考核情况
  static assessmentDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/manage/projectEvaluation/assessmentDetail',
      params,
      httpOptions,
    );
  }
}
