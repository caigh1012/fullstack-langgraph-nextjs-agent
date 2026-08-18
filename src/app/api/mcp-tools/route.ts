import { withAuth } from '@/lib/auth/with-auth';
import { NextRequest, NextResponse } from 'next/server';
import { MCPToolsData, MCPToolsGrouped } from '@/types/vo/mcp-tools.vo';
import { MCPClientTool } from '@/types/dto/mcp-tools.dto';
import { Result } from '@/types/common/result';
import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { getMCPTools } from '@/lib/mcp/mcp-tools';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function createEmptyResponse(): MCPToolsData {
  return {
    serverGroups: {},
    totalCount: 0,
  };
}

/**
 * 分组 MCP 工具
 * @param tools MCP 工具数组
 * @returns 分组后的 MCP 工具数据
 */
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
