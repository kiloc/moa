import { Router, createRouter, createWebHashHistory } from 'vue-router';
import { getToken, getAppId, setToken,encrypt, treeDataTranslate  } from '@/common/utils/index';
// import { Dialog } from '@/components/Dialog';
import { ANY_OBJECT } from '@/types/generic';
import { routers } from './systemRouters';
import LoginController from '@/api/system/LoginController';
import { useLoginStore, useLayoutStore, useDictMapStore } from '@/store';

import { DictionaryController } from '@/api/system';
// 第三方页面路由跳转映射
const thirdRouteMap: ANY_OBJECT = {
  handlerFlowTask: 'thirdHandlerFlowTask',
};

// 处理token登录
const handleTokenLogin = async (token: string, oppoCode: string, next: Function, to: any) => {
  try {
    const layoutStore = useLayoutStore();
    const loginStore = useLoginStore();

    const res = await LoginController.doTokenLogin({ token, oppoCode });
    const data = res.data as any;
    if(data ){
      if (data.menuList) {
        layoutStore.setMenuList(treeDataTranslate(data.menuList, 'menuId', 'parentId'));
        delete data.menuList;
      }

      setToken(data.tokenData);
      layoutStore.setCurrentMenu(null);
      layoutStore.clearAllTags();

      if (data.tokenData) {
        delete data.tokenData;
      }

      loginStore.setUserInfo(data);

      // 初始化字典
      initMapDict();

      // 跳转至目标页面
      next();
    }

  } catch (error) {
    console.error('Token登录失败:', error);
    // 登录失败，跳转到登录页
    // Dialog.closeAll();
    next({ name: 'NotFound' });
  }
};
// 处理MOA登录
const handleMOALogin = async (staffCode: string, deputyNumber: string, next: Function, to: any) => {
  try {
    const layoutStore = useLayoutStore();
    const loginStore = useLoginStore();

    const res = await LoginController.doHandelLogin({ staffCode, deputyNumber });
    const data = res.data as any;
    if(data ){
      if (data.menuList) {
        layoutStore.setMenuList(treeDataTranslate(data.menuList, 'menuId', 'parentId'));
        delete data.menuList;
      }

      setToken(data.tokenData);
      layoutStore.setCurrentMenu(null);
      layoutStore.clearAllTags();

      if (data.tokenData) {
        delete data.tokenData;
      }

      loginStore.setUserInfo(data);

      // 初始化字典
      initMapDict();

      // 跳转至目标页面
      next();
    }

  } catch (error) {
    console.error('Token登录失败:', error);
    // 登录失败，跳转到登录页
    // Dialog.closeAll();
    next({ name: 'NotFound' });
  }
};
export const initMapDict = () => {
  const dictMapStore = useDictMapStore();
  const loginStore = useLoginStore();
  // 合作伙伴行业领域   portalRealm
  // 场景子库的字典编码          partnerScence
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
  // negativeBehaviorLevel	负面行为等级
  // centralizedPurchaseType 集采类型
  // coopRegion 合作区域
  // negativeStatus 负面行为状态
  // quiSource 商机来源
  // quiStage 商机阶段
  [
    { dictCode: 'portalRealm', itemIdType: 'Integer' },
    { dictCode: 'partnerScence', itemIdType: 'Integer' },
    { dictCode: 'joinType', itemIdType: 'String' },
    { dictCode: 'dictBusiLevel', itemIdType: 'Integer' },
    { dictCode: 'partnerType', itemIdType: 'Integer' },
    // {dictCode: 'portalIndustry', itemIdType: 'Integer'},
    { dictCode: 'companyType', itemIdType: 'Integer' },
    { dictCode: 'registeredCapitalType', itemIdType: 'String' },
    { dictCode: 'countryCode', itemIdType: 'String' },
    { dictCode: 'provinceCode', itemIdType: 'Integer' },
    { dictCode: 'taxIdentification', itemIdType: 'String' },
    { dictCode: 'partnerJoinState', itemIdType: 'Integer' },
    { dictCode: 'partnerReturnState', itemIdType: 'Integer' },
    { dictCode: 'isListed', itemIdType: 'String' },
    { dictCode: 'negativeBehaviorLevel', itemIdType: 'String' },
    { dictCode: 'centralizedPurchaseType', itemIdType: 'String' },
    { dictCode: 'coopRegion', itemIdType: 'String' },
    { dictCode: 'negativeStatus', itemIdType: 'String' },
    { dictCode: 'quiSource', itemIdType: 'String' },
    { dictCode: 'quiStage', itemIdType: 'String' },
    { dictCode: 'taxCreditLevel', itemIdType: 'String' },
    { dictCode: 'MIN_BID_QUANTITY', itemIdType: 'String' },
    { dictCode: 'ROOT_DEPT', itemIdType: 'String' },
    { dictCode: 'DEPT_TYPE', itemIdType: 'Integer' },
    { dictCode: 'recruitmentCityRole', itemIdType: 'Integer' },
    { dictCode: 'agencyName', itemIdType: 'Long' },
    { dictCode: 'workOrderType', itemIdType: 'String' },
    { dictCode: 'PURCHASE_SHOW', itemIdType: 'String' },
    { dictCode: 'cityAgentDict', itemIdType: 'String' },
    { dictCode: 'regionCityCode', itemIdType: 'String' },
  ].forEach(item => {
    DictionaryController.dictGlobalDict({ dictCode: item.dictCode, itemIdType: item.itemIdType })
        .then(res => {
          dictMapStore.setDictMap(item.dictCode, res.getList());
          // coopRegion 字典加载完成后，根据 regionCode 翻译 regionName 并回写到 userInfo
          if (item.dictCode === 'coopRegion' && loginStore.userInfo?.regionCode) {
            const regionName = res.getValue(loginStore.userInfo.regionCode);
            if (regionName) {
              loginStore.userInfo.regionName = regionName;
            }
          }
        })
        .catch(e => { console.error('initMapDict error:', e); });
  });

  DictionaryController.scenceRelChildren({ typeCode: 'portalIndustry' })
      .then((res: any) => {
        res.data.forEach(item => {
          item.id = item.codeId;
          item.name = item.codeName;
        });
        dictMapStore.setDictMap('portalIndustryList', res.data);
      })
      .catch(e => {});
};

// 创建路由实例
export const router: Router = createRouter({
  history: createWebHashHistory(), //createWebHistory(),
  routes: routers,
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition;
      }
      if (from.meta.saveSrollTop) {
        const top: number = document.documentElement.scrollTop || document.body.scrollTop;
        resolve({ left: 0, top });
      }
    });
  },
});
router.beforeEach((to, from, next) => {
  if(typeof from === 'string' && typeof to === 'string'){
    sessionStorage.setItem("fromPath", from);
    sessionStorage.setItem("toPath", to);
  }else{
    sessionStorage.setItem("fromPath", from.path);
    sessionStorage.setItem("toPath", to.path);
  }
  if (to.name === 'login' || to.name === 'NotFound') {
    next();
  } else {
    // 取token信息判断是否登录
    const token = getToken();
    const toName: string = to.name as string;

    console.log(to.query, ' to.query---router')
    // 检查URL中是否有token参数
    const urlToken = to.query.token as string;
    const oppoCode = to.query.oppoCode as string;
    const staffCode = to.query.staffCode as string;
    const deputyNumber = to.query.deputyNumber as string;
    if (staffCode && deputyNumber) { // MOA登陆
      // http://localhost:8086/#/interface/workflow?staffCode=94c2691764c5ea7792560770e3458abde1ff636a78233c20555bd12572dd988576fec250253b57032e44561a5c93faec3c7662cb73feb2bce948a6805e1fefcc3126c0a83d3c74e7b41a6a372ff18c53d70f58200c0714388d1236c4f6468773e1a805831ebf400b94212a8271fdadc17bd9183acfc3b134f9a042a0152ae076&deputyNumber=729ad99bd4fb0f27261acffcf06c713f1472dc8170ec4b2ce25de05c90ec005671a9889c266313357babfc62102bd033e497ce521203b9e51a46d82eaca05bd30769033c045b674c0c6947929107eeef94c73dbed6d2bf2e21f4ff5d1dfc8be20b1f3ac6a360a9bd5ee303429756b988dedb53ca8317f2a21a6048b0afba901a
      // http://localhost:8086/#/welcome?staffCode=94c2691764c5ea7792560770e3458abde1ff636a78233c20555bd12572dd988576fec250253b57032e44561a5c93faec3c7662cb73feb2bce948a6805e1fefcc3126c0a83d3c74e7b41a6a372ff18c53d70f58200c0714388d1236c4f6468773e1a805831ebf400b94212a8271fdadc17bd9183acfc3b134f9a042a0152ae076&deputyNumber=729ad99bd4fb0f27261acffcf06c713f1472dc8170ec4b2ce25de05c90ec005671a9889c266313357babfc62102bd033e497ce521203b9e51a46d82eaca05bd30769033c045b674c0c6947929107eeef94c73dbed6d2bf2e21f4ff5d1dfc8be20b1f3ac6a360a9bd5ee303429756b988dedb53ca8317f2a21a6048b0afba901a
      handleMOALogin(staffCode, deputyNumber, next, to)
    } else if (urlToken && !token) {
      // URL中有token，且本地没有token，进行token登录
      handleTokenLogin(urlToken, oppoCode, next, to);
    } else if (!token || !/\S/.test(token)) {
      // 没有token，跳转到404页面
      // Dialog.closeAll();
      next({ name: 'login' });
    } else {
      if (to.meta == null) {
        to.meta = {};
      }
      to.meta.refreshParentCachedPage = from.meta.refreshParentCachedPage;
      from.meta.refreshParentCachedPage = false;
      next();
    }
  }
});
export default router;
