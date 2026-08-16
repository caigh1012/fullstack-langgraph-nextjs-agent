import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ServerOAuthProvider } from '@/lib/mcp/oauth-provider';
import { getMCPServerList } from '@/services/mcp/mcp.service';
import type { HttpMCPServerConfig, MCPServersConfig, StdioMCPServerConfig } from '@/types/dto/mcp-tools.dto';
import { OAuthStatus } from '../mcp/oauth-detection';
import { sanitizeTool } from './util';

export async function getMCPServerConfigs(userId: string): Promise<MCPServersConfig> {
  try {
    const servers = (await getMCPServerList(userId)).filter((server) => server.enabled);
    const configs: MCPServersConfig = {};

    for (const server of servers) {
      if (server.type === 'stdio' && server.command) {
        const config: StdioMCPServerConfig = {
          transport: 'stdio',
          command: server.command,
          args: [],
        };

        if (server.args && Array.isArray(server.args)) {
          config.args = server.args.filter((arg): arg is string => typeof arg === 'string');
        }
        if (server.env && typeof server.env === 'object' && server.env !== null) {
          config.env = server.env as Record<string, string>;
        }

        configs[server.name] = config;
      } else if (server.type === 'http' && server.url) {
        const config: HttpMCPServerConfig = {
          transport: 'http',
          url: server.url,
        };

        if (server.headers && typeof server.headers === 'object' && server.headers !== null) {
          config.headers = server.headers as Record<string, string>;
        }

        // 仅当服务器需要 OAuth 并且已连接时添加添加 authProvider
        if (server.requiresAuth && server.oauthStatus === OAuthStatus.CONNECTED) {
          config.authProvider = new ServerOAuthProvider(server.id, server.name, userId);
        }

        configs[server.name] = config;
      }
    }

    return configs;
  } catch (error) {
    console.error('Failed to fetch MCP server configs:', error);
    return {};
  }
}

export async function createMCPClient(userId: string): Promise<MultiServerMCPClient | null> {
  try {
    const mcpServers = await getMCPServerConfigs(userId);

    if (Object.keys(mcpServers).length === 0) {
      return null;
    }

    const client = new MultiServerMCPClient({
      mcpServers,
      throwOnLoadError: false, // 不在加载时抛出错误
      prefixToolNameWithServerName: true, // 防止工具名称冲突
    });

    return client;
  } catch (error) {
    console.error('Failed to create MCP client:', error);
    return null;
  }
}

export async function getMCPTools(userId: string) {
  try {
    const client = await createMCPClient(userId);
    if (!client) {
      return [];
    }

    const tools = await client.getTools();

    const sanitizedTools = tools.map((tool) => sanitizeTool(tool));

    console.log(`Loaded ${sanitizedTools.length} tools from MCP servers`);
    return sanitizedTools;
  } catch (error) {
    console.error('Failed to get MCP tools:', error);
    return [];
  }
}
