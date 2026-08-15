import { Gender } from '../../../generated/prisma/enums';

/**
 * 登录用户 DTO
 */
export interface UserLoginDto {
  username: string;
  password: string;
}

/**
 * 注册用户 DTO
 */
export interface UserRegisterDto {
  username: string;
  password: string;
  email?: string;
  gender?: Gender;
  avatarUrl?: string;
}
