/**
 * vconsole 移动端调试工具控制模块
 * 通过后端接口控制线上环境是否启用调试工具
 */

import { get } from '@/common/http/request';
import { API_CONTEXT } from '@/api/config';
import { useLoginStore } from '@/store';
import { storeToRefs } from 'pinia';
import VConsole from 'vconsole';

/**
 * 根据后端配置决定是否初始化 vconsole
 * 仅当 fullResultList 中存在 name === loginName 时启用
 */
export const initEruda = async () => {
  try {
    const loginStore = useLoginStore();
    const { userInfo } = storeToRefs(loginStore);
    const loginName = userInfo.value?.loginName;
    console.log('loginName:', loginName);
    if (!loginName) return;

    const res = await get(`${API_CONTEXT}/upms/globalDict/listAll`, { dictCode: 'CONSOLE_MOA' });
    const data = res.data as any;
    const fullResultList = data?.fullResultList || [];
    console.log('fullResultList:', fullResultList);
    const matched = fullResultList.some((item: any) => item.name === loginName);
    console.log('matched:', matched);
      if (matched) {
        new VConsole()
      }
  } catch (e) {
    console.error('获取eruda配置失败:', e);
  }
};
