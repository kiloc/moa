import { defineStore } from 'pinia';
import { UserInfo } from '@/types/upms/user';
import { findMenuItem, initUserInfo } from './utils';
import { MenuItem } from '@/types/upms/menu';

export default defineStore('dict', {
  state: () => {
    return {
      dictMap: {
        // 合作伙伴行业领域   portalRealm
        // 合作伙伴入库形式   joinType
        // DICT集成级别        dictBusiLevel
        // 合作伙伴类别         partnerType
        // 合作伙伴行业         portalIndustry
        // 公司类型                companyType
        // 注册资本币种         registeredCapitalType
        // 国家                       countryCode
        // 省份                       provinceCode
        // 纳税标识                taxIdentification
        // 合作伙伴入库状态   partnerJoinState
        // 合作伙伴退库状态   partnerReturnState
        // 是否上市公司          isListed
        // 场景子库的字典编码          partnerScence
        // negativeBehaviorLevel	负面行为等级
        // centralizedPurchaseType 集采类型
        // coopRegion 合作区域
        // negativeStatus 负面行为状态
        // quiSource 商机来源
        // quiStage 商机阶段
      },
    };
  },
  getters: {
    getDictMap(): object {
      return this.dictMap;
    },
  },
  actions: {
    setDictMap(key: string, list) {
      this.dictMap[key] = list;
    },
  },
  persist: {
    // 开启持久存储
    enabled: true,
    // 指定哪些state的key需要进行持久存储
    // storage默认是 sessionStorage存储
    // paths需要持久存储的key
    strategies: [{ paths: ['dictMap'] }],
  },
});
