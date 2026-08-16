import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { withAuth } from '@/lib/auth/with-auth';
import { ServerOAuthProvider } from '@/lib/mcp/oauth-provider';
import { OAuthStatus } from '@/lib/mcp/oauth-detection';
import { getMCPServerList } from '@/services/mcp/mcp.service';
import { NextRequest, NextResponse } from 'next/server';
import { MCPToolsData, MCPToolsGrouped } from '@/types/vo/mcp-tools.vo';
import { sanitizeTool } from '@/lib/agent/util';
import { HttpMCPServerConfig, MCPClientTool, MCPServersConfig, StdioMCPServerConfig } from '@/types/dto/mcp-tools.dto';
import { Result } from '@/types/common/result';
import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function createEmptyResponse(): MCPToolsData {
  return {
    serverGroups: {},
    totalCount: 0,
  };
}

async function getMCPServerConfigs(userId: string): Promise<MCPServersConfig> {
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

        if (server.env && typeof server.env === 'object' && server.env !== null && !Array.isArray(server.env)) {
          config.env = Object.fromEntries(
            Object.entries(server.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
          );
        }

        configs[server.name] = config;
      } else if (server.type === 'http' && server.url) {
        const config: HttpMCPServerConfig = {
          transport: 'http',
          url: server.url,
        };

        if (
          server.headers &&
          typeof server.headers === 'object' &&
          server.headers !== null &&
          !Array.isArray(server.headers)
        ) {
          config.headers = Object.fromEntries(
            Object.entries(server.headers).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
          );
        }

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

async function createMCPClient(userId: string): Promise<MultiServerMCPClient | null> {
  try {
    const mcpServers = await getMCPServerConfigs(userId);

    if (Object.keys(mcpServers).length === 0) {
      return null;
    }

    return new MultiServerMCPClient({
      mcpServers: mcpServers,
      throwOnLoadError: false,
      prefixToolNameWithServerName: true,
    });
  } catch (error) {
    console.error('Failed to create MCP client:', error);
    return null;
  }
}

async function getMCPTools(userId: string): Promise<MCPClientTool[]> {
  try {
    const client = await createMCPClient(userId);
    if (!client) {
      return [];
    }

    const tools = await client.getTools();
    return tools.map((tool) => sanitizeTool(tool));
  } catch (error) {
    console.error('Failed to get MCP tools:', error);
    return [];
  }
}

function groupMCPTools(tools: MCPClientTool[]): MCPToolsData {
  if (tools.length === 0) {
    return createEmptyResponse();
  }

  const serverGroups: MCPToolsGrouped = {};

  for (const tool of tools) {
    const toolName = tool.name || 'unknown';
    const parts = toolName.split('__');
    const serverName = parts.length > 1 ? parts[0] : 'default';
    const cleanToolName = parts.length > 1 ? parts.slice(1).join('__') : toolName;

    if (!serverGroups[serverName]) {
      serverGroups[serverName] = {
        tools: [],
        count: 0,
      };
    }

    serverGroups[serverName].tools.push({
      name: cleanToolName,
      description: tool.description || undefined,
    });
    serverGroups[serverName].count++;
  }

  return {
    serverGroups,
    totalCount: tools.length,
  };
}

export async function GET(req: NextRequest) {
  try {
    return withAuth(req, async (payload) => {
      const userId = payload.sub as string;
      const tools = await getMCPTools(userId);
      return NextResponse.json<Result<MCPToolsData>>({
        data: groupMCPTools(tools),
        message: HttpMessage.REQUEST_SUCCESS,
        code: HttpCode.SUCCESS,
      });
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        data: null,
        message: HttpMessage.REQUEST_FAILED,
        code: HttpBusinessCode.FAIL,
      },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}
