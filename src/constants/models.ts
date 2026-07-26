import { SelectLLMModel } from '@/types/select-model';

export const DEFAULT_MODEL_PROVIDER = 'deepseek';
export const DEFAULT_MODEL_NAME = 'deepseek-v4-pro';

export const models: SelectLLMModel[] = [
  {
    chef: 'DeepSeek',
    chefSlug: 'deepseek',
    id: 'deepseek-v4-pro',
    name: 'Deepseek v4 Pro',
    providers: ['deepseek'],
  },
  {
    chef: 'DeepSeek',
    chefSlug: 'deepseek',
    id: 'deepseek-v4-flash',
    name: 'Deepseek v4 Flash',
    providers: ['deepseek'],
  },
  {
    chef: 'GLM',
    chefSlug: 'zai',
    id: 'glm-5v-turbo',
    name: 'GLM 5 Turbo',
    providers: ['zai'],
  },
];
