import { defineStore } from 'pinia';
import { UserInfo } from '@/types/upms/user';
import { initUserInfo } from './utils';

export default defineStore('login', {
  state: () => {
    return {
      token: '' as string | null,
      userInfo: {} as UserInfo | null,
      loginInfo: {} as any,
      hideLeftMenu: false as any,
    };
  },
  getters: {
    getPermCodeList(): Set<string> {
      if (this.userInfo == null) return new Set<string>();
      return new Set<string>(this.userInfo.permCodeList);
    },
  },
  actions: {
    setUserInfo(info: UserInfo) {
      this.userInfo = initUserInfo(info);
      // this.userInfo.area = '1' // 假数据
    },
    setHeadImage(headImage: (string & { downloadUri: string; filename: string }) | null) {
      if (this.userInfo == null) return;
      this.userInfo.headImageUrl = headImage;
    },
    setLoginInfo(info: any) {
      this.loginInfo = info;
    },
    setHideLeftMenu(info: any) {
      this.hideLeftMenu = info;
    },
  },
  persist: {
    // 开启持久存储
    enabled: true,
    // 指定哪些state的key需要进行持久存储
    // storage默认是 sessionStorage存储
    // paths需要持久存储的key
    strategies: [{ key: 'userInfo', paths: ['userInfo'] }, { key: 'loginInfo', paths: ['loginInfo'] }, { key: 'hideLeftMenu', paths: ['hideLeftMenu'] }],
  },
});
