/**
 * 系统配置VO对象
 */
export interface SysConf {
  // 配置编码。目前的可能值包含：loginPolicy，passwordPolicy
  confCode: string;
  // 配置值
  conf: string;
  // 更新者Id
  updateUserId?: number;
  // 更新时间
  updateTime?: string;
}

/**
 * 登录策略配置对象
 */
export interface SysConfLoginPolicy {
  // 是否排除登录
  excludeLogin: boolean;
  // 登录超时时间，单位为分钟
  loginTimeout?: number;
  // 密码错误次数
  passwordErrorCount?: number;
  // 密码错误时是否延迟登录。如果是false，则直接锁定账号
  delayLoginWhenError: boolean;
  // 密码错误时延迟登录时间，单位为分钟
  delayLoginTime?: number;
  // Jie. 20250802 超时延期
  timeoutExtend?: boolean;
}

/**
 * 密码策略配置对象
 */
export interface SysConfPasswordPolicy {
  // 密码是否定时更新
  passwordExpired?: boolean;
  // 密码过期更新周期，单位：天
  updateInterval?: number;
  // 提前提醒天数
  remindDays?: number;
  // 密码强度限制
  passwordComplexity?: boolean;
  // 最小长度是否启用
  minLengthEnabled?: boolean;
  // 最小长度
  minLength?: number;
  // 包含数字
  includeDigit?: boolean;
  // 包含小写字母
  includeLowerCase?: boolean;
  // 包含大写字母
  includeUpperCase?: boolean;
  // 密码包含特殊字符
  includeSpecialChar?: boolean;
  // 禁止使用旧密码
  banOldPassword?: boolean;
  // 旧密码禁用个数
  banOldPasswordCount?: number;
  // 修改初始密码提醒
  modifyInitPassword?: boolean;
  // 初始密码
  initPassword?: string;
}

/**
 * Jie. 20250804 增加常用话术配置项
 */
export interface CommonExpression {
  // 话术内容
  content: string;
}
