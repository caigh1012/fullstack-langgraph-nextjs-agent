/**
 * 选择的LLM模型
 */
export interface SelectLLMModel {
  id: string;
  name: string;
  chef: string;
  chefSlug: string;
  providers: string[];
}
