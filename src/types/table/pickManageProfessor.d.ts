import { DictData } from '@/common/staticDict/types';

interface PickManageProfessor {
  // 主键
  id?: number | undefined;
  // 用户id
  userId?: number | undefined;
  // 用户登录名
  loginName?: string | undefined;
  // 地市编码
  cityCode?: string | undefined;
  // 地市名称
  cityName?: string | undefined;
  // 专家名称
  professorName?: string | undefined;
  // 专家类别;1.专家2.经理人员3.项目经办人
  professorType?: string | undefined;
  // 专家部门
  professorOrg?: string | undefined;
  // 专家电话
  professorPhone?: string | undefined;
  // 专家邮箱
  professorEmail?: string | undefined;
  // 专家状态;1有效，0失效
  professorStatus?: number | undefined;
  // 专家性别;1.男；2女
  professorGender?: string | undefined;
  // 工作单位简称
  workUnitShortName?: string | undefined;
  // 员工编号
  employeeId?: string | undefined;
  // 学历
  education?: string | undefined;
  // 毕业时间
  graduationDate?: string | undefined;
  // 职称/国家专业技术人员职业水平初级考试等相关类型认证
  professionalTitle?: string | undefined;
  // 现岗位名称
  currentPosition?: string | undefined;
  // 领域;政企、网络、工程、市场、采购、财务、法务、其他
  businessField?: string | undefined;
  // 在中国移动从事政企、法务、财务、采购、工程建设、网络5个相关线条工作年限（可累加）
  relevantWorkYears?: number | undefined;
  // 是否公司专家（含岗位能手）;1是，0否
  isCompanyExpert?: number | undefined;
  // 是否特殊推荐人才;1是，0否
  isSpeciallyRecommended?: number | undefined;
  // 特殊推荐理由
  specialRecommendationReason?: string | undefined;
  // 是否公司ES专家库专家;1是，0否
  isEsExpert?: number | undefined;
  // 2023年年度绩效
  performance2023?: string | undefined;
  // 2024年年度绩效
  performance2024?: string | undefined;
  // 2025年年度绩效（若无则填25年最新季度绩效）
  performance2025?: string | undefined;
  // 创建时间
  createTime?: string | undefined;
  // 创建人id
  createUserId?: number | undefined;
  // 更新时间
  updateTime?: string | undefined;
  // 更新人id
  updateUserId?: number | undefined;
}

export default PickManageProfessor;
