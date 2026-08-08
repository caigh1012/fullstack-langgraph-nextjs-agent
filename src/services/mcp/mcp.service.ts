import 'server-only';
import { Prisma } from '../../../generated/prisma/client';
import prisma from '@/lib/database/prisma';
import { MCPServerType } from '@/types/mcp';
import { OAuthStatus } from '@/lib/mcp/oauth-detection';

/**
 * MCP Server 类型字符串字面量
 */
export type MCPServerTypeLiteral = 'stdio' | 'http';

/**
 * MCP Server 创建参数
 */
export interface CreateMCPServerParams {
  name: string;
  type: MCPServerTypeLiteral;
  enabled?: boolean;
  command?: string | null;
  args?: string[] | null;
  env?: Record<string, string> | null;
  url?: string | null;
  headers?: Record<string, string> | null;
}

/**
 * MCP Server 更新参数
 */
export interface UpdateMCPServerParams {
  name?: string;
  type?: MCPServerTypeLiteral;
  enabled?: boolean;
  command?: string | null;
  args?: string[] | null;
  env?: Record<string, string> | null;
  url?: string | null;
  headers?: Record<string, string> | null;
}

/**
 * 获取当前用户的 MCP Server 列表
 */
export async function getMCPServerList(userId: string) {
  try {
    return await prisma.mCPServer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 查询某个 http 的 MCP Server 详情
 */
export async function getMCPHttpServer(id: string, userId: string) {
  try {
    const server = await prisma.mCPServer.findFirst({
      where: {
        userId,
        id: id,
        type: 'http',
        url: { not: null },
      },
    });
    return server;
  } catch (error) {
    throw error;
  }
}

/**
 * 创建 MCP Server
 */
export async function createMCPServer(userId: string, params: CreateMCPServerParams) {
  try {
    return await prisma.mCPServer.create({
      data: {
        userId,
        name: params.name,
        type: params.type,
        enabled: params.enabled ?? true,
        command: params.type === MCPServerType.stdio ? (params.command ?? null) : null,
        args: params.type === MCPServerType.stdio ? (params.args ?? Prisma.JsonNull) : Prisma.JsonNull,
        env: params.type === MCPServerType.stdio ? (params.env ?? Prisma.JsonNull) : Prisma.JsonNull,
        url: params.type === MCPServerType.http ? (params.url ?? null) : null,
        headers: params.type === MCPServerType.http ? (params.headers ?? Prisma.JsonNull) : Prisma.JsonNull,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 更新 MCP Server
 */
export async function updateMCPServer(id: string, userId: string, params: UpdateMCPServerParams) {
  try {
    const { type, ...rest } = params;
    const data: Record<string, unknown> = { ...rest };

    if (type !== undefined) {
      data.type = type;
      if (type === MCPServerType.stdio) {
        data.url = null;
        data.headers = Prisma.JsonNull;
        if (params.command !== undefined) data.command = params.command;
        if (params.args !== undefined) data.args = params.args;
        if (params.env !== undefined) data.env = params.env;
      } else if (type === MCPServerType.http) {
        data.command = null;
        data.args = Prisma.JsonNull;
        data.env = Prisma.JsonNull;
        if (params.url !== undefined) data.url = params.url;
        if (params.headers !== undefined) data.headers = params.headers;
      }
    }

    return await prisma.mCPServer.update({
      where: { id, userId },
      data,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 更改 MCP Server 的 OAuth 状态
 * @param serverId
 * @param status
 */
export async function updateServerOAuthStatus(serverId: string, userId: string, status: OAuthStatus): Promise<void> {
  try {
    await prisma.mCPServer.update({
      where: { id: serverId, userId },
      data: { oauthStatus: status },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 更新 MCP 的 type 为 http 时的相关信息
 */
export async function updateMcpHttpServer(
  serverId: string,
  userId: string,
  params: { oauthStatus?: OAuthStatus; requiresAuth?: boolean; codeVerifier?: string | null },
) {
  try {
    await prisma.mCPServer.update({
      where: { id: serverId, userId },
      data: params,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * 删除 MCP Server
 */
export async function deleteMCPServer(id: string, userId: string) {
  try {
    await prisma.mCPServer.delete({
      where: { id, userId },
    });
  } catch (error) {
    throw error;
  }
}
