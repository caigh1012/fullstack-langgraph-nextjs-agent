'use client';

import { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';

import { ModelSelect } from '@/components/model-select';
import { Attachment, AttachmentPreview, AttachmentRemove, Attachments } from '@/components/ai-elements/attachments';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
} from '@/components/ai-elements/prompt-input';
import { CameraIcon, PaperclipIcon } from 'lucide-react';
import { MAX_ATTACHMENTS } from '@/constants';
import { useUISettingContext } from '@/contexts/ui-settings-context';
import { Message } from '@/types/common/message';
import { toast } from 'sonner';
import { FileAttachment } from '@/types/dto/message.dto';

interface MessageInputProps {
  sendMessage: (message: Message) => Promise<void>;
  isSending: boolean;
}

function MessageInputInner({ sendMessage, isSending }: MessageInputProps) {
  const { model, setModel } = useUISettingContext();
  const { textInput, attachments } = usePromptInputController();

  // 远端回显文件元信息：attachment.id -> MinIO { url, key, size }
  const [remoteMeta, setRemoteMeta] = useSetState<Record<string, { url: string; key: string; size: number }>>({});
  // 已触发上传的 id，避免重复上传
  const uploadedRef = useRef<Set<string>>(new Set());

  // 监听 attachments.files，自动把新增的 blob 附件上传到 MinIO，
  // 成功后将 FileUIPart 的 url 替换为 MinIO URL 用于回显
  useEffect(() => {
    const currentIds = new Set(attachments.files.map((f) => f.id));

    // 清理已被移除附件对应的上传标记
    for (const id of Array.from(uploadedRef.current)) {
      if (!currentIds.has(id)) {
        uploadedRef.current.delete(id);
      }
    }

    // 触发新文件上传
    for (const file of attachments.files) {
      if (!file.url?.startsWith('blob:')) continue;
      if (uploadedRef.current.has(file.id)) continue;
      uploadedRef.current.add(file.id);

      const blobUrl = file.url;
      const fileId = file.id;
      const fileName = file.filename ?? 'upload';
      const mediaType = file.mediaType;

      void (async () => {
        try {
          const blob = await fetch(blobUrl).then((r) => r.blob());
          const formData = new FormData();
          formData.append('file', new File([blob], fileName, { type: mediaType }));
          const res = await fetch('/api/agent/upload', { method: 'POST', body: formData });
          if (!res.ok) {
            uploadedRef.current.delete(fileId);
            throw new Error('附件上传失败');
          }
          const json = (await res.json()) as { data?: { url?: string; key?: string } };
          const url = json?.data?.url;
          const key = json?.data?.key;
          if (url && key) {
            setRemoteMeta((prev) => ({ ...prev, [fileId]: { url, key, size: blob.size } }));
          } else {
            uploadedRef.current.delete(fileId);
          }
        } catch (error) {
          attachments.remove(fileId);
          toast.error(`附件 ${fileName} 上传失败，已从列表中移除`);
          console.warn(error);
          uploadedRef.current.delete(fileId);
        }
      })();
    }
  }, [attachments.files]);

  const isEmpty = textInput.value.trim() === '' && attachments.files.length === 0;

  return (
    <PromptInput
      globalDrop
      multiple
      onSubmit={(message) =>
        sendMessage({
          content: message.text,
          model: model.model,
          provider: model.provider,
          attachments: attachments.files.map<FileAttachment>((file) => {
            const meta = remoteMeta[file.id];
            return {
              url: meta?.url ?? file.url,
              key: meta?.key ?? '',
              name: file.filename ?? 'upload',
              type: file.mediaType,
              size: meta?.size ?? 0,
            };
          }),
        })
      }>
      <PromptInputBody>
        {attachments.files.length > 0 && (
          <PromptInputHeader>
            <Attachments className="ml-0 w-full">
              {attachments.files.map((file) => {
                const remoteUrl = remoteMeta[file.id]?.url;
                const data = remoteUrl ? { ...file, url: remoteUrl } : file;
                return (
                  <Attachment
                    className="size-12"
                    data={data}
                    key={file.id}
                    onRemove={() => attachments.remove(file.id)}>
                    <AttachmentPreview />
                    <AttachmentRemove className="top-0.5 right-0.5 size-4 rounded-full p-0.5 [&>svg]:size-2.5" />
                  </Attachment>
                );
              })}
            </Attachments>
          </PromptInputHeader>
        )}
        <PromptInputTextarea placeholder="请输入..." />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <ModelSelect
            model={model}
            onModelChange={setModel}
          />
        </PromptInputTools>
        <div className="flex items-center gap-1">
          {model?.isMultiModal && (
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger>{/* <LinkIcon className="size-4" /> */}</PromptInputActionMenuTrigger>
              <PromptInputActionMenuContent className="min-w-48">
                <PromptInputActionAddAttachments
                  icon={<PaperclipIcon className="mr-2 size-4" />}
                  label="上传文件或图片"
                />
                <PromptInputActionAddScreenshot
                  icon={<CameraIcon className="mr-2 size-4" />}
                  label="屏幕截图"
                />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          )}
          <PromptInputSubmit
            disabled={isSending || isEmpty || attachments.files.length > MAX_ATTACHMENTS}
            status={isSending ? 'submitted' : 'ready'}
          />
        </div>
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
