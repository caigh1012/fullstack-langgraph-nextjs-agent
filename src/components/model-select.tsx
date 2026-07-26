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
import { models } from '@/constants/models';
import { SelectLLMModel } from '@/types/select-model';
import { CheckIcon } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

interface ModelItemProps {
  m: SelectLLMModel;
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
      <ModelSelectorLogo provider={m.chefSlug} />
      <ModelSelectorName>{m.name}</ModelSelectorName>
      <ModelSelectorLogoGroup>
        {m.providers.map((provider) => (
          <ModelSelectorLogo
            key={provider}
            provider={provider}
          />
        ))}
      </ModelSelectorLogoGroup>
      {selectedModel === m.id ? <CheckIcon className="ml-auto size-4" /> : <div className="ml-auto size-4" />}
    </ModelSelectorItem>
  );
});

ModelItem.displayName = 'ModelItem';

interface ModelSelectProps {
  model: SelectLLMModel;
  onModelChange: (model: SelectLLMModel) => void;
}

export function ModelSelect({ model, onModelChange: onModelChange }: ModelSelectProps) {
  const [open, setOpen] = useState(false);

  const handleModelSelect = useCallback(
    (model: SelectLLMModel) => {
      onModelChange(model);
      setOpen(false);
    },
    [onModelChange],
  );

  return (
    <ModelSelector
      onOpenChange={setOpen}
      open={open}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton>
          {model.chefSlug && <ModelSelectorLogo provider={model.chefSlug} />}
          {model.name && <ModelSelectorName>{model.name}</ModelSelectorName>}
        </PromptInputButton>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>未找到模型</ModelSelectorEmpty>
          {['DeepSeek', 'GLM'].map((chef) => (
            <ModelSelectorGroup
              heading={chef}
              key={chef}>
              {models
                .filter((m) => m.chef === chef)
                .map((m) => (
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
