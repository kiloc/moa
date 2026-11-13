import { DictData } from '@/common/staticDict/types';

interface PickDemand {
  // 主键
  id?: number | undefined;
  // 商机名称
  oppoId?: number | undefined;
  // 甄选需求编号
  demandNumber?: string | undefined;
  // 甄选需求名称
  demandName?: string | undefined;
  // 要求完成时间
  completeTime?: string | undefined;
  // 甄选不含税预算金额(万)
  budgetAmount?: number | undefined;
  // 甄选含税预算金额(万)
  budgetAmountTax?: number | undefined;
  // 是否标后甄选;1.是；0否
  pickBidFlag?: string | undefined;
  pickBidFlagDictMap?: DictData;
  // 行业名称
  demandIndustry?: string | undefined;
  // 场景;支持多选
  demandScene?: string | undefined;
  // 实施区域
  demandArea?: string | undefined;
  // 是否涉及集成服务包;1.是；0否
  servicePackageFlag?: string | undefined;
  servicePackageFlagDictMap?: DictData;
  // 集成服务包金额含税（万）
  servicePackageAmount?: number | undefined;
  // 是否划分标包;1.是；0否
  bidPackageFlag?: string | undefined;
  bidPackageFlagDictMap?: DictData;
  // 当前环节
  currentStage?: string | undefined;
  // 需求状态
  demandStatus?: number | undefined;
  // 需求发起人名称
  launchName?: string | undefined;
  // 需求发起人部门
  launchOrg?: string | undefined;
  // 需求发起人时间
  launchTime?: string | undefined;
  // 需求发起人联系方式
  launchPhone?: string | undefined;
  // 需求发起人地市
  launchCity?: string | undefined;
  // 创建时间
  createTime?: string | undefined;
  // 创建人
  createUserId?: number | undefined;
  // 更新时间
  updateTime?: string | undefined;
  // 更新人id
  updateUserId?: number | undefined;
}

export default PickDemand;
