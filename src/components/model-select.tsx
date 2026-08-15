'use client';

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';
import { PromptInputButton } from '@/components/ai-elements/prompt-input';
import { HttpBusinessCode } from '@/constants/http';
import { Model } from '@/types/entity/model.entity';
import { useQuery } from '@tanstack/react-query';
import { CheckIcon } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { toast } from 'sonner';

interface ModelItemProps {
  m: Model;
  selectedModel: string;
  onSelect: (id: string) => void;
}

const ModelItem = memo(({ m, selectedModel, onSelect }: ModelItemProps) => {
  const handleSelect = useCallback(() => onSelect(m.id), [onSelect, m.id]);
  return (
    <ModelSelectorItem
      key={m.id}
      onSelect={handleSelect}
      value={m.id}>
      <ModelSelectorLogo provider={m.provider} />
      <ModelSelectorName>{m.name}</ModelSelectorName>
      <ModelSelectorLogoGroup>
        <ModelSelectorLogo provider={m.provider} />
      </ModelSelectorLogoGroup>
      {selectedModel === m.id ? <CheckIcon className="ml-auto size-4" /> : <div className="ml-auto size-4" />}
    </ModelSelectorItem>
  );
});

ModelItem.displayName = 'ModelItem';

interface ModelSelectProps {
  model: Model;
  onModelChange: (model: Model) => void;
}

export function ModelSelect({ model, onModelChange: onModelChange }: ModelSelectProps) {
  const [open, setOpen] = useState(false);

  const handleModelSelect = useCallback(
    (model: Model) => {
      onModelChange(model);
      setOpen(false);
    },
    [onModelChange],
  );

  const { data: groupedModels = [] } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/model');
        const data = await response.json();
        if (data.code === HttpBusinessCode.FAIL) {
          toast.error(data.message || '获取模型列表失败');
          throw new Error(data.message || '获取模型列表失败');
        }
        return data.data as Model[][];
      } catch (error) {
        toast.error((error as { message?: string })?.message || '获取模型列表失败');
      }
    },
  });

  return (
    <ModelSelector
      onOpenChange={setOpen}
      open={open}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton>
          {model.provider && <ModelSelectorLogo provider={model.provider} />}
          {model.name && <ModelSelectorName>{model.name}</ModelSelectorName>}
        </PromptInputButton>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="搜索模型或选择模型..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>未找到模型</ModelSelectorEmpty>
          {groupedModels.map((group) => (
            <ModelSelectorGroup
              heading={group[0]?.group ?? ''}
              key={group[0]?.group}>
              {group.map((m) => (
                <ModelItem
                  key={m.id}
                  m={m}
                  onSelect={() => handleModelSelect(m)}
                  selectedModel={model.id}
                />
              ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
