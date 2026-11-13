import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class RecruitController extends BaseController {
  static queryDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentResult/queryDetail',
      params,
      httpOptions,
    );
  }
  // 下载模板
  static downloadTemplate(params: ANY_OBJECT, fileName: string) {
    return super.download(
      API_CONTEXT + '/manage/recruitmentResult/downloadImportTemplate',
      params,
      fileName,
      'get',
    );
  }
  // 导入评审结果
   static recruitResultImport(params: ANY_OBJECT, httpOptions?: RequestOption) {
      return super.upload(API_CONTEXT + '/manage/recruitmentResult/importPreview', params, httpOptions,);
    }
  //招募结果维护保存接口
  static saveDraftBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentResult/resultSave',
      params,
      httpOptions,
    )
  };
    static submitBatch(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentResult/resultSubmit',
      params,
      httpOptions,
    );
    }
// 招募结果决策管理列表
  static NegativeList(params: ANY_OBJECT, httpOptions?: RequestOption) {
      return super.post<TableData<ANY_OBJECT>>(
        API_CONTEXT + '/manage/recruitmentDecision/listManage',
        params,
        httpOptions,
      );
    }

  //募公示管理列表查询
   static PublicityList(params: ANY_OBJECT, httpOptions?: RequestOption) {
      return super.post<TableData<ANY_OBJECT>>(
        API_CONTEXT + '/manage/recruitmentDecision/listManage',
        params,
        httpOptions,
      );
    }
  //方案编码查询招募结果决策详情接口文档
  static queryDetailByCaseCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDecision/queryDetail',
      params,
      httpOptions,
    );
  }

  static recruitmentDecisionDownload(params: ANY_OBJECT, fileName: string) {
    return super.download(
      API_CONTEXT + '/manage/recruitmentDecision/downloadImportTemplate',
      params,
      fileName,
      'get',
    );
  }
  static exportDecisionItemList(params: ANY_OBJECT, fileName: string) {
    return super.download(
      API_CONTEXT + '/manage/recruitmentDecision/exportDecisionItemList',
      params,
      fileName,
      'get',
    );
  }
   static recruitmentDecisionImport(params: ANY_OBJECT, httpOptions?: RequestOption) {
      return super.upload(API_CONTEXT + '/manage/recruitmentDecision/importPreview', params, httpOptions,);
   }
  //招募结果决策保存接口
  static saveRecruitmentDecision(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDecision/decisionSave',
      params,
      httpOptions,
    )
  };
  //募结果决策提交接口
  static submitRecruitmentDecision(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentDecision/decisionSubmit',
      params,
      httpOptions,
    )
  };


  //招募公示管理列表查询
  static RecruitmentPublicityList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/manage/recruitmentPublicity/listManage',
      params,
      httpOptions,
    );
  }

}
