import { HttpBusinessCode } from '@/constants/http';
import { useThreadContext } from '@/contexts/thread-context';
import { getUrl } from '@/utils/get-fetch-url';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

export interface Thread {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseThreadsReturn {
  threads: Thread[];
  activeThreadId: string | null;
  isLoadingThreads: boolean;
  threadError: Error | null;
  updateThreadTitle: (threadId: string, title: string) => Promise<void>;
  createThread: (threadId: string, title?: string) => Promise<void>;
  setActiveThreadId: (threadId: string) => void;
  deleteThread: (threadId: string) => Promise<void>;
  refetchThreads: () => Promise<unknown>;
}

/**
 * Thread Hooks
 */
export function useThreads(): UseThreadsReturn {
  const { activeThreadId, setActiveThreadId } = useThreadContext();

  // 获取 Thread 列表
  const fetchThreads = useCallback(async () => {
    const response = await fetch(getUrl('threads'), {
      method: 'GET',
    });
    if (!response.ok) {
      let errorMessage = 'Failed to load threads';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
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
    const response = await fetch(getUrl('threads'), {
      method: 'POST',
      body: JSON.stringify({ threadId, title: title?.slice(0, 12) || 'New thread' }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to load threads';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      toast.error(data.message || 'Failed to create thread');
      throw new Error(data.message || 'Failed to create thread');
    }
  }, []);

  // 修改 Thread 标题
  const updateThreadTitle = useCallback(async (threadId: string, title: string): Promise<void> => {
    const response = await fetch(getUrl('threads'), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: threadId, title: title }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to update thread title';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      toast.error(data.message || 'Failed to update thread title');
      throw new Error(data.message || 'Failed to update thread title');
    }
  }, []);

  // 删除 Thread
  const deleteThread = useCallback(async (threadId: string): Promise<void> => {
    const response = await fetch(getUrl('threads'), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: threadId }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to delete thread';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      toast.error(data.message || 'Failed to delete thread');
      throw new Error(data.message || 'Failed to delete thread');
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

  return {
    threads,
    activeThreadId,
    isLoadingThreads: isLoadingThreads,
    threadError: threadError as Error | null,
    updateThreadTitle,
    createThread,
    setActiveThreadId,
    deleteThread,
    refetchThreads: refetchThreadsQuery,
  };
}
