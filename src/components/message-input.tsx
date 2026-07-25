'use client';

import { ModelSelect } from '@/components/model-select';
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { models } from '@/constants/models';
import { GlobeIcon } from 'lucide-react';
import { useState } from 'react';

interface MessageInputProps {
  sendMessage: (message: PromptInputMessage) => Promise<void>;
}

export default function MessageInput({ sendMessage }: MessageInputProps) {
  const [model, setModel] = useState<string>(models[0].id);
  const [status, setStatus] = useState<'submitted' | 'streaming' | 'ready' | 'error'>('ready');

  return (
    <PromptInputProvider>
      <PromptInput
        globalDrop
        multiple
        onSubmit={sendMessage}>
        <PromptInputBody>
          <PromptInputTextarea />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
                <PromptInputActionAddScreenshot />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputButton>
              <GlobeIcon size={16} />
              <span>Search</span>
            </PromptInputButton>
            <ModelSelect
              value={model}
              onValueChange={setModel}
            />
          </PromptInputTools>
          <PromptInputSubmit status={status} />
        </PromptInputFooter>
      </PromptInput>
    </PromptInputProvider>
  );
}
