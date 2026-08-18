import 'server-only';

/**
 * 生成会话id
 * 使用用户id和 threadId 组成 sessionId，用于短暂防止（当前用户可以请求到其他用户的 threadId）
 * @param userId
 * @param threadId
 * @returns
 */
export function generateThreadId(userId: string, threadId: string) {
  return `user_${userId}_${threadId}`;
}
