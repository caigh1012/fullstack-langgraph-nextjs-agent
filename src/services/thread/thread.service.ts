import 'server-only';
import prisma from '@/lib/database/prisma';

/**
 * 获取当前用户的 Thread 列表
 */
export async function getThreadList(userId: string) {
  try {
    return await prisma.thread.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 创建 Thread
 */
export async function createThread(threadId: string, title: string, userId: string) {
  try {
    return await prisma.thread.create({
      data: {
        id: threadId,
        title,
        userId,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 更新 Thread
 */
export async function updateThread(threadId: string, title: string, userId: string) {
  try {
    return await prisma.thread.update({
      where: {
        id: threadId,
        userId,
      },
      data: {
        title,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 删除 Thread
 */
export async function deleteThread(threadId: string, userId: string) {
  try {
    await prisma.thread.delete({
      where: {
        id: threadId,
        userId,
      },
    });
  } catch (error) {
    throw error;
  }
}
