'use client';
import ThreadComponent from '@/components/thread';
import { useParams } from 'next/navigation';

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  return (
    <ThreadComponent
      key={threadId}
      threadId={threadId}
    />
  );
}
