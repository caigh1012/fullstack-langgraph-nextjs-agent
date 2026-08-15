import { Message } from '@/types/common/message';
import React, { createContext, useContext, useState } from 'react';

export interface FirstMessageContextType {
  firstMessage: Message | null;
  setFirstMessage: (message: Message | null) => void;
}

const FirstMessageContext = createContext<FirstMessageContextType | null>(null);

export function FirstMessageProvider({ children }: { children: React.ReactNode }) {
  const [firstMessage, setFirstMessage] = useState<Message | null>(null);

  return (
    <FirstMessageContext.Provider value={{ firstMessage, setFirstMessage }}>{children}</FirstMessageContext.Provider>
  );
}

export function useFirstMessageContext() {
  const context = useContext(FirstMessageContext);
  if (!context) {
    throw new Error('useFirstMessageContext must be used within a FirstMessageProvider');
  }
  return context;
}
