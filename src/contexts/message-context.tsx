import { Message } from '@/types/common/message';
import React, { createContext, useContext, useState } from 'react';

export interface MessageContextType {
  firstMessage: Message | null;
  setFirstMessage: (message: Message | null) => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

export function MessageContextProvider({ children }: { children: React.ReactNode }) {
  const [firstMessage, setFirstMessage] = useState<Message | null>(null);

  return <MessageContext.Provider value={{ firstMessage, setFirstMessage }}>{children}</MessageContext.Provider>;
}

export function useMessageContext() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageContextProvider');
  }
  return context;
}
