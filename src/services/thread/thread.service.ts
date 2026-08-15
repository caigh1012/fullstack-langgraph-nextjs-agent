import 'server-only';
import prisma from '@/lib/database/prisma';

/**
 * 获取当前用户的 Thread 列表
 */
export async function getThreadList(userId: string) {
  return await prisma.thread.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * 创建 Thread
 */
export async function createThread(threadId: string, title: string, userId: string) {
  return await prisma.thread.create({
    data: {
      id: threadId,
      title,
      userId,
    },
  });
}

/**
 * 更新 Thread
 */
export async function updateThread(threadId: string, title: string, userId: string) {
  return await prisma.thread.update({
    where: {
      id: threadId,
      userId,
    },
    data: {
      title,
    },
  });
}

/**
 * 删除 Thread
 */
export async function deleteThread(threadId: string, userId: string) {
  await prisma.thread.delete({
    where: {
      id: threadId,
      userId,
    },
  });
}
