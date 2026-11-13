import { ANY_OBJECT } from '../generic';

/**
 * 在线表单API对象
 */
export interface OnlineApi {
  // 主键Id
  id?: number | undefined;
  // API编码
  apiCode: string | undefined;
  // API名称
  apiName: string | undefined;
  // 分组Id
  groupId: number | undefined;
  // API脚本
  apiScript?: string | undefined;
  // API描述
  apiDesc?: string | undefined;
  // 附加数据
  extraData?: string | undefined;
  // 更新时间
  updateTime?: string | undefined;
  // 更新者
  updateUserId?: number | undefined;
  // 创建时间
  createTime?: string | undefined;
  // 创建者
  createUserId?: number | undefined;
}

/**
 * 在线表单API分组对象
 */
export interface OnlineApiGroup {
  // 主键Id
  groupId?: number | undefined;
  // 应用编码。为空时，表示非第三方应用接入
  appCode?: string | undefined;
  // 父级Id
  parentId?: number | undefined;
  // 分组名称
  groupName: string | undefined;
  // 更新时间
  updateTime?: string | undefined;
  // 更新者
  updateUserId?: number | undefined;
  // 创建时间
  createTime?: string | undefined;
  // 创建者
  createUserId?: number | undefined;
}
