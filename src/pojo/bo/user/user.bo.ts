/**
 * 查询用户信息 BO
 */
export interface GetUserInfoBo {
  id: string;
  username: string;
}

/**
 * 更新用户信息 BO
 */
export interface UpdateUserBo {
  id: string;
  username: string;
  nickname?: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  avatarUrl?: string;
}
