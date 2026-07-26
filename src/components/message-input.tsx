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
  usePromptInputController,
} from '@/components/ai-elements/prompt-input';
import { models } from '@/constants/models';
import { GlobeIcon } from 'lucide-react';
import { useState } from 'react';
import { MAX_ATTACHMENTS } from '@/constants';

interface MessageInputProps {
  sendMessage: (message: PromptInputMessage) => Promise<void>;
  isSending: boolean;
}

function MessageInputInner({ sendMessage, isSending }: MessageInputProps) {
  const { textInput, attachments } = usePromptInputController();
  const [model, setModel] = useState<string>(models[0].id);

  const isEmpty = textInput.value.trim() === '' && attachments.files.length === 0;

  return (
    <PromptInput
      globalDrop
      multiple
      onSubmit={sendMessage}>
      <PromptInputBody>
        <PromptInputTextarea placeholder="请输入..." />
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
        <PromptInputSubmit
          disabled={isSending || isEmpty || attachments.files.length > MAX_ATTACHMENTS}
          status={isSending ? 'submitted' : 'ready'}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}

export default function MessageInput(props: MessageInputProps) {
  return (
    <PromptInputProvider>
      <MessageInputInner {...props} />
    </PromptInputProvider>
  );
}
