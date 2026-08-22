import { DEFAULT_MODEL_NAME, DEFAULT_MODEL_PROVIDER } from '@/constants';
import { AgentBuilder } from './agent-builder';
import { postgresCheckpointer } from './memory';
import { createChatModel } from './create-chat-models';
import { SYSTEM_PROMPT } from './prompt';
import { getMCPTools } from '../mcp/mcp-tools';
import { DynamicTool, StructuredToolInterface } from '@langchain/core/tools';

export interface AgentConfigOptions {
  userId: string;
  model?: string;
  provider?: string; // 'google' | 'openai' etc.
  systemPrompt?: string; // 系统提示覆盖
  tools?: unknown[]; // 来自注册表或直接工具对象的工具
  approveAllTools?: boolean; // 如果为真，则跳过工具审批提示
}

let setupPromise: Promise<void> | null = null;

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
  const model = cfg?.model || DEFAULT_MODEL_NAME; // 模型名称
  const userId = cfg?.userId || ''; // 用户获取用户 MCP tools 的用户 ID

  /**
   * 创建模型
   * @param cfg 智能体配置选项
   * @returns 模型实例
   */
  const llm = createChatModel({ provider, model, temperature: 1 });

  // Load MCP tools
  const mcpTools = await getMCPTools(userId);
  const configTools = (cfg?.tools || []) as StructuredToolInterface[];
  const allTools = [...configTools, ...mcpTools] as DynamicTool[];

  /**
   * 创建智能体
   * @param cfg 智能体配置选项
   * @returns 智能体实例
   */
  const agent = new AgentBuilder({
    llm,
    checkpointer: postgresCheckpointer,
    tools: allTools,
    prompt: cfg?.systemPrompt || SYSTEM_PROMPT,
    approveAllTools: cfg?.approveAllTools,
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
