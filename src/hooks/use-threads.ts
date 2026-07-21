import { useCallback } from 'react';

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
  createThread: () => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  // switchThread: (threadId: string) => void;
  refetchThreads: () => Promise<unknown>;
}

export function useThreads(): UseThreadsReturn {
  return {
    threads: [],
    activeThreadId: null,
    isLoadingThreads: false,
    threadError: null,
    createThread: useCallback(async () => {}, []),
    deleteThread: useCallback(async (threadId: string) => {}, []),
    refetchThreads: useCallback(async () => {}, []),
  };
}
