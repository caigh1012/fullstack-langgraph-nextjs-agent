import 'server-only';
import prisma from '@/lib/database/prisma';
import { GetUserInfoBo } from '@/pojo/bo/user/user.bo';

/**
 * 查询用户信息
 */
export async function getUserInfo(bo: GetUserInfoBo) {
  try {
    const { id, username } = bo;
    const user = await prisma.user.findUnique({
      where: { id, AND: { username } },
    });

    // 密码不返回
    return {
      id,
      username,
      nickname: user?.nickname,
      email: user?.email,
      avatarUrl: user?.avatarUrl,
      gender: user?.gender,
    };
  } catch (error) {
    throw error;
  }
}
