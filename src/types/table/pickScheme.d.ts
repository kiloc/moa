import { DictData } from '@/common/staticDict/types';

interface PickScheme {
  // 主键
  id?: number | undefined;
  // 甄选需求id
  demandId?: number | undefined;
  // 甄选方案名称
  schemeName?: string | undefined;
  // 甄选方案编码
  schemeNumber?: string | undefined;
  // 应答截止时间
  replyEndTime?: string | undefined;
  // 执行甄选办法;1.竞价法；2.综合评审法
  schemeMethod?: string | undefined;
  schemeMethodDictMap?: DictData;
  // 甄选组织方式;1.自行组织；2.委托代理
  schemeOrganization?: string | undefined;
  schemeOrganizationDictMap?: DictData;
  // 代理机构名称
  agencyName?: string | undefined;
  // 项目经理
  projectManager?: string | undefined;
  // 甄选方案描述
  schemeDesc?: string | undefined;
  // 甄选方案文件url
  schemeDocUrl?: string | undefined;
  // 决策层级
  decisionLevel?: string | undefined;
  // 方案决策时间
  decisionTime?: string | undefined;
  // 方案决策会议纪要url
  decisionMeetingUrl?: string | undefined;
  // 创建时间
  createTime?: string | undefined;
  // 创建人id
  createUserId?: number | undefined;
  // 创建人名称
  createUserName?: string | undefined;
  // 创建人发起人部门
  createUserOrg?: string | undefined;
  // 创建人联系方式
  createUserPhone?: string | undefined;
  // 创建人地市名称
  createUserCityName?: string | undefined;
  // 更新时间
  updateTime?: string | undefined;
  // 更新人id
  updateUserId?: number | undefined;
}

export default PickScheme;
