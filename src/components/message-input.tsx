'use client';

import { ModelSelect } from '@/components/model-select';
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
import { GlobeIcon } from 'lucide-react';
import { MAX_ATTACHMENTS } from '@/constants';
import { useUISettingContext } from '@/contexts/ui-settings-context';
import { MessageStreamDto } from '@/pojo/dto/agent/stream.dto';

interface MessageInputProps {
  sendMessage: (message: MessageStreamDto) => Promise<void>;
  isSending: boolean;
}

function MessageInputInner({ sendMessage, isSending }: MessageInputProps) {
  const { model, setModel } = useUISettingContext();
  const { textInput, attachments } = usePromptInputController();

  const isEmpty = textInput.value.trim() === '' && attachments.files.length === 0;

  return (
    <PromptInput
      globalDrop
      multiple
      onSubmit={(message) =>
        sendMessage({
          content: message.text,
          model: model.id,
          provider: model.chefSlug,
        })
      }>
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
            model={model}
            onModelChange={setModel}
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
