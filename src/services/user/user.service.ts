import 'server-only';
import prisma from '@/lib/database/prisma';
import { UserInfo } from '@/types/vo/user.vo';
import { UpdateUserBo } from '@/types/bo/user.bo';

/**
 * 查询用户信息
 */
export async function getUserInfo(bo: { id: string; username: string }): Promise<UserInfo> {
  const { id, username } = bo;
  const user = await prisma.user.findUnique({
    where: { id, AND: { username } },
  });

  // 密码不返回
  return {
    id,
    username,
    gender: user?.gender || 'UNKNOWN',
    nickname: user?.nickname,
    email: user?.email || undefined,
    avatarUrl: user?.avatarUrl || undefined,
  };
}

/**
 * 更新用户信息
 */
export async function updateUser(bo: UpdateUserBo): Promise<void> {
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
}
