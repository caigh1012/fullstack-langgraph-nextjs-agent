'use client';

import Thread from '@/components/thread';
import { useThreads } from '@/hooks/use-threads';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';

export default function App() {
  const { createThread, refetchThreads } = useThreads();
  const router = useRouter();

  const firstMessageSent = useCallback(
    async (content: string) => {
      try {
        const threadId = nanoid(36);
        await createThread(threadId, content);
        refetchThreads();
        router.replace(`/thread/${threadId}`);
      } catch {
        toast.error('会话创建失败，请稍后重试');
      }
    },
    [createThread, refetchThreads, router],
  );

  return <Thread onFirstMessageSent={firstMessageSent} />;
}
