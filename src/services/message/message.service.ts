import 'server-only';

import { BaseMessage } from '@langchain/core/messages';
import { postgresCheckpointer } from '@/lib/agent/memory';
import prisma from '@/lib/database/prisma';
import { generateThreadId } from '@/services/utils';

/**
 * 获取 Threade 消息历史
 */
export async function fetchThreadHistory(userId: string, threadId: string) {
  // 先查找 thread 是否存在，若不存在则返回空数组
  const thread = await prisma.thread.findFirst({ where: { id: threadId, userId } });
  if (!thread) return [];

  // 从数据库中获取消息历史
  const history = await postgresCheckpointer.get({
    configurable: { thread_id: generateThreadId(userId, threadId) },
  });

  const messages: BaseMessage[] = Array.isArray(history?.channel_values?.messages)
    ? history.channel_values.messages
    : [];

  return messages.map((msg) => ({
    ...msg.toDict(),
  }));
}
