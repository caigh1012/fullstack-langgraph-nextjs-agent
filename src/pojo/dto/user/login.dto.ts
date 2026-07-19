import { Gender } from '../../../../generated/prisma/client';

/**
 * 登录用户 DTO
 */
export interface LoginDto {
  username: string;
  password: string;
}

/**
 * 注册用户 DTO
 */
export interface RegisterUserDto {
  username: string;
  password: string;
  email?: string;
  gender?: Gender;
  avatarUrl?: string;
}
