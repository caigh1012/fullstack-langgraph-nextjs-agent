import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatOpenAI } from '@langchain/openai';

export interface CreateChatModelOptions {
  provider?: string;
  model: string;
  temperature?: number;
}

export function createChatModel({
  provider = 'deepseek',
  model,
  temperature = 1,
}: CreateChatModelOptions): BaseChatModel {
  switch (provider) {
    case 'glm': {
      return new ChatOpenAI({
        model: 'glm-5v-turbo',
        apiKey: process.env.ZAI_API_KEY,
        temperature,
        configuration: { baseURL: 'https://open.bigmodel.cn/api/paas/v4/' },
        streaming: true,
      });
    }
    default:
      return new ChatDeepSeek({ model, temperature, streaming: true });
  }
}
