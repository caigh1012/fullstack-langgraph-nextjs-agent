import 'server-only';
import prisma from '@/lib/database/prisma';
import { GetUserInfoBo, UpdateUserBo } from '@/pojo/bo/user/user.bo';

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

/**
 * 更新用户信息
 */
export async function updateUser(bo: UpdateUserBo) {
  try {
    const { id, username, ...data } = bo;
    const updateData: {
      nickname?: string;
      email?: string | null;
      gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
      avatarUrl?: string | null;
    } = {};

    if (data.nickname !== undefined) updateData.nickname = data.nickname;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;

    await prisma.user.update({
      where: { id, AND: { username } },
      data: updateData,
    });
  } catch (error) {
    throw error;
  }
}
