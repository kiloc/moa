import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persist';
import useLoginStore from './login';
import useLayoutStore from './layout';
import useOtherStore from './other';
import useMessage from './message';
import useStaticDictStore from './staticDict';
import useDictMapStore from './dictMap';
import { usePartnerEvaluationStore } from './partnerEvaluation';

const pinia = createPinia();
pinia?.use(piniaPersist);
export {
  useLoginStore,
  useLayoutStore,
  useMessage,
  useOtherStore,
  useStaticDictStore,
  useDictMapStore,
  usePartnerEvaluationStore,
};
export default pinia;
