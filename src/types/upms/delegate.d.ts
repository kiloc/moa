/**
 * 流程被委托用户的VO对象
 */
export interface FlowDelegatedUser {
  // 被委托用户id
  userId: string;
  // 是否确认，0: 待确认，1: 已同意，2: 已拒绝
  confirmStatus: number;
}

/**
 * 流程委托用户的VO对象
 */
export interface FlowDelegateUser {
  // 主键Id
  id?: number;
  // 委托用户的登录名，多个用户之间逗号分隔
  delegateUsers?: string;
  // 流程定义标识，多个流程之间逗号分隔
  processDefinitionKeys?: string;
  // 委托范围。可取值user,dept,post,dept_post,role，多个值之间逗号分隔
  delegateScope?: string;
  // 开始时间
  startTime?: string;
  // 结束时间
  endTime?: string;
  // 委托说明
  memo?: string;
  // 创建时间
  createTime?: string;
  // 创建者
  createUserId?: number;
  // 修改时间
  updateTime?: string;
  // 更新者
  updateUserId?: number;
  // 委托人查询列表中包含的被委托用户列表数据
  flowDelegatedUserList?: FlowDelegatedUser[];
  // 被委托人查询列表中会包含该字段
  flowDelegatedUser?: FlowDelegatedUser;
}
