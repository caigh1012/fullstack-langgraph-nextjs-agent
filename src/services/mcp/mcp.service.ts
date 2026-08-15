import 'server-only';
import { Prisma } from '../../../generated/prisma/client';
import prisma from '@/lib/database/prisma';
import { OAuthStatus } from '@/lib/mcp/oauth-detection';
import { CreateMCPServerBo, UpdateMCPServerBo } from '@/types/bo/mcp.bo';
import { MCPServerType } from '@/types/vo/mcp.vo';

/**
 * 获取当前用户的 MCP Server 列表
 */
export async function getMCPServerList(userId: string) {
  return await prisma.mCPServer.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * 查询某个 http 的 MCP Server 详情
 */
export async function getMCPHttpServer(id: string, userId: string) {
  return await prisma.mCPServer.findFirst({
    where: {
      userId,
      id: id,
      type: 'http',
      url: { not: null },
    },
  });
}

/**
 * 创建 MCP Server
 */
export async function createMCPServer(userId: string, params: CreateMCPServerBo) {
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
}

/**
 * 更新 MCP Server
 */
export async function updateMCPServer(id: string, userId: string, params: UpdateMCPServerBo) {
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
}

/**
 * 更改 MCP Server 的 OAuth 状态
 * @param serverId
 * @param status
 */
export async function updateServerOAuthStatus(serverId: string, userId: string, status: OAuthStatus): Promise<void> {
  await prisma.mCPServer.update({
    where: { id: serverId, userId },
    data: { oauthStatus: status },
  });
}

/**
 * 更新 MCP 的 type 为 http 时的相关信息
 */
export async function updateMcpHttpServer(
  serverId: string,
  userId: string,
  params: { oauthStatus?: OAuthStatus; requiresAuth?: boolean; codeVerifier?: string | null },
) {
  await prisma.mCPServer.update({
    where: { id: serverId, userId },
    data: params,
  });
}

/**
 * 删除 MCP Server
 */
export async function deleteMCPServer(id: string, userId: string) {
  await prisma.mCPServer.delete({
    where: { id, userId },
  });
}
