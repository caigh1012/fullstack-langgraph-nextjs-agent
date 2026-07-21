'use client';

import Thread from '@/components/thread';

export default function App() {
  return (
    <Thread
      threadId="123"
      onFirstMessageSent={() => console.log('first message sent')}
    />
  );
}
