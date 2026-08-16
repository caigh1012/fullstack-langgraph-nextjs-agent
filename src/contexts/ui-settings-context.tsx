'use client';

import { DEFAULT_MODEL_NAME, DEFAULT_MODEL_PROVIDER } from '@/constants';
import { Model } from '@/types/entity/model.entity';
import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';

const STORAGE_KEY = 'model_settings';

const defaultModels: Model = {
  id: 'deepseek-v4-pro',
  group: 'DeepSeek',
  model: DEFAULT_MODEL_NAME,
  provider: DEFAULT_MODEL_PROVIDER,
  name: 'DeepSeek V4 Pro',
  isMultiModal: false,
};

export interface UISettingContextType {
  model: Model;
  setModel: (model: Model) => void;
}

export const UISettingContext = createContext<UISettingContextType>({
  model: defaultModels,
  setModel: () => {},
});

export function UISettingContextProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useLocalStorage<Model>(STORAGE_KEY, defaultModels);
  // 客户端挂载完成前使用默认模型，避免服务端与客户端首次渲染不一致导致的 hydration 警告
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <UISettingContext.Provider value={{ model: mounted ? model || defaultModels : defaultModels, setModel }}>
      {children}
    </UISettingContext.Provider>
  );
}

export function useUISettingContext() {
  const context = useContext(UISettingContext);

  if (!context) {
    throw new Error('useUISettingContext must be used within a UISettingContextProvider');
  }
  return context;
}
