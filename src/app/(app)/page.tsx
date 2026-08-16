'use client';

import ThreadComponent from '@/components/thread';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Thread } from '@/types/vo/thread.vo';

export default function App() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const firstMessageSent = useCallback(
    async (title: string) => {
      const threadId = nanoid(36);
      router.replace(`/thread/${threadId}`);
      // 添加客户端的 threadId 到 queryClient
      queryClient.setQueryData<Thread[]>(['threads'], (prev = []) => [
        { id: threadId, title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ...prev,
      ]);
    },
    [router, queryClient],
  );

  return <ThreadComponent onFirstMessageSent={firstMessageSent} />;
}
