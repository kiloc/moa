import { DictData } from '@/common/staticDict/types';

interface PickBidPackage {
  // 主键
  id?: number | undefined;
  // 需求id
  demandId?: number | undefined;
  // 合作伙伴id(多个用逗号隔开);1，2，3，
  partnerIds?: number | undefined;
  // 甄选标段标题
  bidPackageTitle?: string | undefined;
  // 标段标识
  bidPackageNumber?: string | undefined;
  // 甄选方式;1.定向甄选；2竞争性甄选
  pickType?: string | undefined;
  // 最低应标数量
  minBidCount?: string | undefined;
  // 标段金额含税 （万）
  bidPackageTax?: number | undefined;
  // 标段金额不含税 （万）
  bidPackage?: number | undefined;
  // 甄选方式理由
  pickTypeReason?: string | undefined;
  // 标段信息描述
  bidPackageDesc?: string | undefined;
  // 中标合作伙伴id
  bidPartnerId?: number | undefined;
  // 中标合作伙伴名称
  bidPartnerName?: string | undefined;
  // 得分
  score?: string | undefined;
  // 报价含税（万元）
  quotePriceTax?: number | undefined;
  // 报价不含税（万元）
  quotePrice?: number | undefined;
  // 评审日期
  auditTime?: string | undefined;
  // 创建时间
  createTime?: string | undefined;
  // 创建人id
  createUserId?: number | undefined;
  // 更新时间
  updateTime?: string | undefined;
  // 更新人id
  updateUserId?: number | undefined;
}

export default PickBidPackage;
