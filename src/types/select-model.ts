/**
 * 选择的LLM模型
 */
export interface SelectLLMModel {
  id: string;
  name: string;
  group: string;
  model: string;
  provider: string;
  // 是否支持多模态
  isMultiModal: boolean;
}
