import type { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth';

export type MCPClientTool = Awaited<ReturnType<MultiServerMCPClient['getTools']>>[number];

export interface StdioMCPServerConfig {
  transport: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface HttpMCPServerConfig {
  transport: 'http';
  url: string;
  headers?: Record<string, string>;
  authProvider?: OAuthClientProvider;
}

export type MCPServerConfig = StdioMCPServerConfig | HttpMCPServerConfig;
