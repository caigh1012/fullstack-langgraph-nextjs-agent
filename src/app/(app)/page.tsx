'use client';

import Thread from '@/components/thread';
import { useThreadContext } from '@/contexts/thread-context';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';

export default function App() {
  const { setActiveThreadId } = useThreadContext();
  const threadId = nanoid(36);

  useEffect(() => {
    setActiveThreadId(threadId);
  }, [threadId, setActiveThreadId]);

  return <>{threadId && <Thread threadId={threadId} />}</>;
}
