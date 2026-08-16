import type { ClientConfig, MultiServerMCPClient } from '@langchain/mcp-adapters';

export type MCPServersConfig = ClientConfig['mcpServers'];
export type MCPServerConfig = MCPServersConfig[string];
export type StdioMCPServerConfig = Extract<MCPServerConfig, { transport?: 'stdio'; command: string }>;
export type HttpMCPServerConfig = Extract<MCPServerConfig, { url: string }>;
export type MCPClientTool = Awaited<ReturnType<MultiServerMCPClient['getTools']>>[number];
