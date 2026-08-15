/**
 * 模型实体
 */
export interface Model {
  id: string;
  name: string;
  group: string;
  model: string;
  provider: string;
  // 是否支持多模态
  isMultiModal: boolean;
}
