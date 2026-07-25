import { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import React, { createContext, useContext, useState } from 'react';

interface ThreadContextType {
  firstMessage: PromptInputMessage | null;
  setFirstMessage: (message: PromptInputMessage | null) => void;
}

const ThreadContext = createContext<ThreadContextType | null>(null);

export function ThreadProvider({ children }: { children: React.ReactNode }) {
  const [firstMessage, setFirstMessage] = useState<PromptInputMessage | null>(null);

  return <ThreadContext.Provider value={{ firstMessage, setFirstMessage }}>{children}</ThreadContext.Provider>;
}

export function useThreadContext() {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error('useThreadContext must be used within a ThreadProvider');
  }
  return context;
}
