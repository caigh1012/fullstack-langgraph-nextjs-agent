'use client';

import Thread from '@/components/thread';
import { useThreads } from '@/hooks/use-threads';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function App() {
  const { createThread, refetchThreads } = useThreads();
  const router = useRouter();

  const firstMessageSent = useCallback(
    async (content: string) => {
      try {
        const threadId = nanoid(36);
        await createThread(threadId, content);
        // todo：待优化
        await refetchThreads();
        router.replace(`/thread/${threadId}`);
      } finally {
      }
    },
    [createThread, refetchThreads, router],
  );

  return <Thread onFirstMessageSent={firstMessageSent} />;
}
