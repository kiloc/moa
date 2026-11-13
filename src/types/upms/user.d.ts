export interface OnlineUser {
  deptId: string;
  deviceType: number;
  isAdmin: boolean;
  loginIp: string;
  loginName: string;
  loginTime: string;
  sessionId: string;
  showName: string;
  userId: string;
}

/**
 * 登录返回的用户信息
 */
export type UserInfo = {
  showName: string;
  permCodeList: Array<string>;
  menuList?: Array<MenuItem>;
  userType: number;
  isAdmin: boolean;
  deptName: string;
  tokenData?: string;
  // Jie. 20250723 增加部门ID和用户ID
  deptId?: string;
  userId?: string;
  workbenchIds?: string[];
  headImageUrl: (string & { downloadUri: string; filename: string }) | null;
  userCode: string;
  regionCode: string;
  regionName: string;
  comments: string;
  cityName: string;
  // 1省、2市、3区
  area: string;
};

export interface User {
  userId?: string | number;
  loginName?: string;
  password?: string;
  passwordRepeat?: string;
  showName?: string;
  userType?: number;
  userStatus?: number;
  deptId?: string;
  dataPermIdList?: string[];
  deptPostIdList?: string[];
  roleIdList?: string[];
  sysDataPermUserList?: T[];
  sysUserPostList?: T[];
  sysUserRoleList?: T[];
}
