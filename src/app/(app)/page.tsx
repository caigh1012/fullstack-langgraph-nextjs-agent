'use client';

import Thread from '@/components/thread';
import { useThreads } from '@/hooks/use-threads';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function App() {
  const { createThread, refetchThreads } = useThreads();
  const router = useRouter();
  const threadId = nanoid(36);

  const firstMessageSent = useCallback(
    async (content: string) => {
      try {
        await createThread(threadId, content.slice(0, 12));
        // 暂时使用 refetchThreads 刷新会话列表
        refetchThreads();
        // setFirstMessage(content);
        router.replace(`/thread/${threadId}`);
      } finally {
      }
    },
    [threadId, createThread, router, refetchThreads],
  );

  return (
    <>
      {threadId && (
        <Thread
          threadId={threadId}
          onFirstMessageSent={firstMessageSent}
        />
      )}
    </>
  );
}
