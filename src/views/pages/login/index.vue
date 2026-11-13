<template>
  <div class="login-form">
    <div class="logo-box logo-right">
      <span style="display: none">低代码生成工具</span>
    </div>
    <div class="login-box">
      <div class="login-input">
        <span class="title">欢迎登录</span>
        <span class="desc">管理系统</span>
        <van-form
          @submit="onSubmit"
          @failed="onFailed"
        >
          <van-field
            v-model="dataForm.mobilePhone"
            name="mobilePhone"
            placeholder="请输入帐号"
            :rules="[{ required: true, message: '帐号不能为空' }]"
            class="login-field"
          />
          <van-field
            v-model="dataForm.password"
            name="password"
            type="password"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '密码不能为空' }]"
            class="login-field"
          />
          <van-button
            type="primary"
            block
            native-type="submit"
            class="login-btn-submit"
            loading-type="spinner" 
            :loading="loading"
          >
            登录
          </van-button>
        </van-form>
      </div>
    </div>
    <div class="login-footer">
      <p>Copyright © 2026</p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Login',
};
</script>

<script setup lang="ts">
import { Router, useRouter } from 'vue-router';
import { encrypt, setToken } from '@/common/utils/index';
import { loginParam } from '@/types/upms/login';
import { useLoginStore, useDictMapStore } from '@/store';
import LoginController from '@/api/system/LoginController';
import { DictionaryController, LoginUserController } from '@/api/system';

const loginStore = useLoginStore();
const dictMapStore = useDictMapStore();
const router: Router = useRouter();

const loading = ref(false);
const dataForm = reactive({
  mobilePhone: '',
  password: '',
});

const onSubmit = () => {
  login();
};

const onFailed = () => {};

const login = function (verifyParams: { captchaVerification: string } | null = null) {
  let params: loginParam = {
    loginName: encrypt(dataForm.mobilePhone),
    password: encrypt(dataForm.password),
    captchaVerification: verifyParams?.captchaVerification,
  };
  setToken(null);
  loading.value = true;
  LoginController.login(params)
    .then(data => {
      setToken(data.data.tokenData);
      if (data.data.tokenData) {
        delete data.data.tokenData;
      }
      loginStore.setUserInfo(data.data);
      LoginUserController.getLoginInfo().then(res => {
        if (res.data) {
          loginStore.setLoginInfo(res.data);
        }
      });
      router.push({
        name: 'formMyTask',
        query: {},
      });
      initMapDict();
    })
    .catch(e => {
      console.error(e);
    }).finally(() => {
      loading.value = false;
    });
};
const initMapDict = () => {
  [
    { dictCode: 'portalRealm', itemIdType: 'Integer' },
    { dictCode: 'partnerScence', itemIdType: 'Integer' },
    { dictCode: 'joinType', itemIdType: 'String' },
    { dictCode: 'dictBusiLevel', itemIdType: 'Integer' },
    { dictCode: 'partnerType', itemIdType: 'Integer' },
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
    { dictCode: 'recruitmentCityRole', itemIdType: 'String' },
    { dictCode: 'agencyName', itemIdType: 'Long' },
    { dictCode: 'workOrderType', itemIdType: 'String' },
    { dictCode: 'PURCHASE_SHOW', itemIdType: 'String' },
    { dictCode: 'regionCityCode', itemIdType: 'String' },
  ].forEach(item => {
    DictionaryController.dictGlobalDict({ dictCode: item.dictCode, itemIdType: item.itemIdType })
      .then(res => {
        dictMapStore.setDictMap(item.dictCode, res.getList());
        if (item.dictCode === 'coopRegion' && loginStore.userInfo?.regionCode) {
          const regionName = res.getValue(loginStore.userInfo.regionCode);
          if (regionName) {
            loginStore.userInfo.regionName = regionName;
          }
        }
      })
      .catch(e => {});
  });
  DictionaryController.scenceRelChildren({ typeCode: 'portalIndustry' })
    .then(res => {
      res.data.forEach(item => {
        item.id = item.codeId;
        item.name = item.codeName;
      });
      dictMapStore.setDictMap('portalIndustryList', res.data);
    })
    .catch(e => {});
};
</script>

<style lang="scss" scoped>
.login-form {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  background: center center;
  background-size: cover;

  .logo-box {
    position: absolute;
    top: 6.66vh;
    right: 5.5vw;
    left: 5.5vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 28px;
    color: #333;
    font-weight: bold;

    img {
      margin-right: 11px;
    }
  }

  .login-box {
    display: flex;
    align-items: center;
    height: 499px;
    border-radius: 3px;

    .login-input {
      display: flex;
      width: 348px;
      padding: 46px 40px;
      background-color: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 20px 1px rgb(79 79 79 / 10%);
      flex-direction: column;

      .title {
        margin-bottom: 5px;
        font-size: 32px;
        color: #333;
        font-weight: bold;
      }

      .desc {
        margin-bottom: 24px;
        font-size: 18px;
        color: #666;
      }
    }

    .img-box {
      position: relative;
      height: 100%;
      margin-right: 109px;

      .img-title {
        position: absolute;
        top: -80px;
        right: 0;
        left: 0;
        display: none;
        width: 375px;
        margin: 0 auto;
      }
    }
  }

  .login-field {
    margin-top: 12px;
    margin-bottom: 12px;

    :deep(.van-field__control) {
      height: 40px;
      font-size: 14px;
    }
  }

  .login-btn-submit {
    width: 100%;
    margin-top: 28px;
    height: 50px;
    font-size: 16px;
    border-radius: 8px;
  }

  .login-footer {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 44px;
    font-size: 14px;
    color: #666;
    background-color: #f7fafe;

    p {
      text-align: center;
      line-height: 44px;
    }
  }
}

.logo-right {
  a,
  span {
    font-size: 16px;
    font-weight: normal;
    color: #666;
  }
}
</style>
