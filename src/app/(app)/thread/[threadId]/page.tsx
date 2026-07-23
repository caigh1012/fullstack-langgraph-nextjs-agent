'use client';
import Thread from '@/components/thread';
import { useParams } from 'next/navigation';

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  return <Thread threadId={threadId} />;
}
