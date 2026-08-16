import { HttpBusinessCode } from '@/constants/http';
import { useUserInfoContext } from '@/contexts/userinfo-context';
import { Thread } from '@/types/vo/thread.vo';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface UseThreadsReturn {
  threads: Thread[];
  isLoadingThreads: boolean;
  threadError: Error | null;
  updateThread: (threadId: string, title: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  refetchThreads: () => Promise<unknown>;
}

/**
 * Thread Hooks
 */
export function useThreads(): UseThreadsReturn {
  const { userInfo } = useUserInfoContext();

  // 获取 Thread 列表
  const fetchThreads = useCallback(async () => {
    try {
      const response = await fetch('/api/agent/threads', {
        method: 'GET',
      });
      const data = await response.json();
      if (data.code === HttpBusinessCode.FAIL) {
        throw new Error(data.message || '获取会话列表失败');
      }
      return data?.data;
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message || '获取会话列表失败');
    }
  }, []);

  // 修改 Thread 标题
  const updateThread = useCallback(async (threadId: string, title: string): Promise<void> => {
    try {
      const response = await fetch('/api/agent/threads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId, title }),
      });
      const data = await response.json();
      if (data.code === HttpBusinessCode.FAIL) {
        throw new Error(data.message || '修改会话失败');
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message || '修改会话失败');
    }
  }, []);

  // 删除 Thread
  const deleteThread = useCallback(async (threadId: string): Promise<void> => {
    try {
      const response = await fetch('/api/agent/threads', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId }),
      });
      const data = await response.json();
      if (data.code === HttpBusinessCode.FAIL) {
        throw new Error(data.message || '删除会话失败');
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message || '删除会话失败');
    }
  }, []);

  /**
   * 获取 Thread 列表
   */
  const {
    data: threads = [],
    isLoading: isLoadingThreads,
    error: threadError,
    refetch: refetchThreadsQuery,
  } = useQuery<Thread[]>({
    queryKey: ['threads'],
    queryFn: () => fetchThreads(),
  });

  /**
   * 监听用户信息变化，刷新会话列表
   */
  useEffect(() => {
    if (!userInfo?.id) return;
    refetchThreadsQuery();
  }, [userInfo?.id, refetchThreadsQuery]);

  return {
    threads,
    isLoadingThreads: isLoadingThreads,
    threadError: threadError as Error | null,
    updateThread,
    deleteThread,
    refetchThreads: refetchThreadsQuery,
  };
}
