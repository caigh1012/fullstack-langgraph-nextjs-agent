import { AgentBuilder } from './builder';
import { postgresCheckpointer } from './memory';
import { createChatModel } from './utils';

let setupPromise: Promise<void> | null = null;

export interface AgentConfigOptions {
  model?: string;
  provider?: string; // 'google' | 'openai' etc.
  systemPrompt?: string; // system prompt override
  tools?: unknown[]; // tools from registry or direct tool objects
  approveAllTools?: boolean; // if true, skip tool approval prompts
}

export const DEFAULT_MODEL_PROVIDER = 'deepseek';
export const DEFAULT_MODEL_NAME = 'deepseek-v4-pro';

async function setupOnce() {
  if (!setupPromise) {
    setupPromise = postgresCheckpointer.setup().catch((err) => {
      setupPromise = null;
      console.error('Failed to setup postgres checkpointer:', err);
      throw err;
    });
  }
  await setupPromise;
}

async function createAgent(cfg?: AgentConfigOptions) {
  const provider = cfg?.provider || DEFAULT_MODEL_PROVIDER; // 提供商
  const modelName = cfg?.model || DEFAULT_MODEL_NAME; // 模型名称

  const llm = createChatModel({ provider, model: modelName, temperature: 1 });

  const agent = new AgentBuilder({
    llm,
    checkpointer: postgresCheckpointer,
  }).build();

  return agent;
}

export async function ensureAgent(cfg?: AgentConfigOptions) {
  await setupOnce();
  return createAgent(cfg);
}

export async function getAgent(cfg?: AgentConfigOptions) {
  return ensureAgent(cfg);
}

export const defaultAgent = await ensureAgent();
