import { DEFAULT_MODEL_NAME, DEFAULT_MODEL_PROVIDER } from '@/constants/models';
import { SelectLLMModel } from '@/types/select-model';
import { createContext, useContext } from 'react';
import { useLocalStorage } from 'react-use';

const STORAGE_KEY = 'model_settings';

const defaultModels: SelectLLMModel = {
  id: 'deepseek-v4-pro',
  group: 'DeepSeek',
  model: DEFAULT_MODEL_NAME,
  provider: DEFAULT_MODEL_PROVIDER,
  name: 'DeepSeek V4 Pro',
  isMultiModal: false,
};

export interface UISettingContextType {
  model: SelectLLMModel;
  setModel: (model: SelectLLMModel) => void;
}

export const UISettingContext = createContext<UISettingContextType>({
  model: defaultModels,
  setModel: () => {},
});

export function UISettingContextProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useLocalStorage<SelectLLMModel>(STORAGE_KEY, defaultModels);

  return (
    <UISettingContext.Provider value={{ model: model || defaultModels, setModel }}>
      {children}
    </UISettingContext.Provider>
  );
}

export const useUISettingContext = () => useContext(UISettingContext);
