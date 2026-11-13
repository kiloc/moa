import { ThirdProps } from '@/components/thirdParty/types';
import { DialogProp } from '@/components/Dialog/types';

export interface IPrintViewProps extends ThirdProps {
  printId: string;
  printName: string;
  printParam?: ANY_OBJECT[];
  isBatch?: boolean;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<boolean>;
}

export type PrintViewParamType = {
  paramName: string;
  paramValue: string | null;
};
