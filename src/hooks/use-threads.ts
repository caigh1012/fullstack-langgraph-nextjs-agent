import { HttpBusinessCode } from '@/constants/http';
import { useUserInfoContext } from '@/contexts/userinfo-context';
import { ThreadVO } from '@/pojo/vo/thread/thread.vo';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface UseThreadsReturn {
  threads: ThreadVO[];
  isLoadingThreads: boolean;
  threadError: Error | null;
  updateThread: (threadId: string, title: string) => Promise<void>;
  createThread: (threadId: string, title?: string) => Promise<void>;
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
    const response = await fetch('/api/agent/threads', {
      method: 'GET',
    });
    if (!response.ok) {
      let errorMessage = 'Failed to load threads';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      toast.error(data.message || 'Failed to load threads');
      throw new Error(data.message || 'Failed to load threads');
    }
    return data?.data;
  }, []);

  // 添加 Thread
  const createThread = useCallback(async (threadId: string, title?: string): Promise<void> => {
    const response = await fetch('/api/agent/threads', {
      method: 'POST',
      body: JSON.stringify({ threadId, title: title?.substring(0, 100) || '新会话' }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to load threads';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      toast.error(data.message || '创建会话失败');
      throw new Error(data.message || '创建会话失败');
    }
  }, []);

  // 修改 Thread 标题
  const updateThread = useCallback(async (threadId: string, title: string): Promise<void> => {
    const response = await fetch('/api/agent/threads', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ threadId, title }),
    });
    if (!response.ok) {
      let errorMessage = '修改会话失败';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      toast.error(data.message || '修改会话失败');
      throw new Error(data.message || '修改会话失败');
    }
  }, []);

  // 删除 Thread
  const deleteThread = useCallback(async (threadId: string): Promise<void> => {
    const response = await fetch('/api/agent/threads', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ threadId }),
    });
    if (!response.ok) {
      let errorMessage = '删除会话失败';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      toast.error(data.message || '删除会话失败');
      throw new Error(data.message || '删除会话失败');
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
  } = useQuery<ThreadVO[]>({
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
    createThread,
    deleteThread,
    refetchThreads: refetchThreadsQuery,
  };
}
