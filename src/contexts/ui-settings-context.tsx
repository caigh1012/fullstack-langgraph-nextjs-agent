import { models } from '@/constants/models';
import { SelectLLMModel } from '@/types/select-model';
import { createContext, useContext } from 'react';
import { useLocalStorage } from 'react-use';

const STORAGE_KEY = 'model_settings';

export interface UISettingContextType {
  model: SelectLLMModel;
  setModel: (model: SelectLLMModel) => void;
}

export const UISettingContext = createContext<UISettingContextType>({
  model: models[0],
  setModel: () => {},
});

export function UISettingContextProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useLocalStorage<SelectLLMModel>(STORAGE_KEY, models[0]);

  return (
    <UISettingContext.Provider value={{ model: model || models[0], setModel }}>{children}</UISettingContext.Provider>
  );
}

export const useUISettingContext = () => useContext(UISettingContext);
