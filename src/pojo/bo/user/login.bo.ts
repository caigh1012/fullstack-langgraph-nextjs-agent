import { Gender } from '../../../../generated/prisma/client';

/**
 * 登录用户 BO
 */
export interface LoginBo {
  username: string;
  password: string;
}

/**
 * 注册用户 BO
 */
export interface RegisterUserBo {
  username: string;
  password: string;
  email?: string;
  gender?: Gender;
  avatarUrl?: string;
}
