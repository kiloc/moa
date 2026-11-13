import { defineStore } from 'pinia';
import { ANY_OBJECT } from '@/types/generic';

const STORAGE_KEY = 'partnerEvaluation_selectedPartners';

interface PartnerEvaluationState {
  partners: ANY_OBJECT[];
  evaluationType: string;
}

// 从 localStorage 加载数据
const loadFromStorage = (): ANY_OBJECT[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// 保存数据到 localStorage
const saveToStorage = (partners: ANY_OBJECT[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
  } catch (e) {
    console.error('保存到 localStorage 失败：', e);
  }
};

export const usePartnerEvaluationStore = defineStore('partnerEvaluation', {
  state: (): PartnerEvaluationState => ({
    partners: loadFromStorage(),
    evaluationType: '',
  }),

  getters: {
    getPartners: (state) => state.partners,
    getEvaluationType: (state) => state.evaluationType,
  },

  actions: {
    // 设置合作伙伴数据
    setPartners(partners: ANY_OBJECT[]) {
      this.partners = partners;
      saveToStorage(partners);
    },

    // 设置评估类型
    setEvaluationType(type: string) {
      this.evaluationType = type;
    },

    // 设置完整数据
    setEvaluationData(partners: ANY_OBJECT[], type: string) {
      this.partners = partners;
      this.evaluationType = type;
      saveToStorage(partners);
    },

    // 清空数据
    clearData() {
      this.partners = [];
      this.evaluationType = '';
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});
