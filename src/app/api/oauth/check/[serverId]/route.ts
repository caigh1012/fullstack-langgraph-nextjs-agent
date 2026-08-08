import { OAuthStatusType } from '@/components/oauth-status-badge';
import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';
import { detectOAuthRequirement, isTokenExpired, OAuthStatus } from '@/lib/mcp/oauth-detection';
import { ServerOAuthProvider } from '@/lib/mcp/oauth-provider';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { getMCPHttpServer, updateServerOAuthStatus } from '@/services/mcp/mcp.service';
import {
  discoverAuthorizationServerMetadata,
  discoverOAuthProtectedResourceMetadata,
  registerClient,
  startAuthorization,
} from '@modelcontextprotocol/sdk/client/auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CheckOAuthResponse {
  serverId: string;
  requiresAuth: boolean;
  connected: boolean;
  oauthStatus: OAuthStatusType;
  authorizationUrl?: string;
  error?: string;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    return withAuth(req, async (_req, payload) => {
      const userId = payload.sub as string;
      const { serverId } = await params;

      // 日志记录
      console.log(`[OAuth API] Fetching server with id: ${serverId} from database...`);

      // 从数据库中获取MCP服务器信息
      const server = await getMCPHttpServer(serverId, userId);

      // 先检查 http 的 server 是否存在，同时 url 是否存在
      if (!server || !server.url) {
        throw new Error('HTTP server not found');
      }

      // 检查是否已经连接，并且已经授权token未过期
      if (server.oauthStatus === OAuthStatus.CONNECTED && server.authTokens) {
        const tokens = server.authTokens as { expires_at?: number };
        if (!isTokenExpired(tokens)) {
          return NextResponse.json<ResultVO<CheckOAuthResponse>>(
            {
              data: {
                serverId,
                requiresAuth: true,
                connected: true,
                oauthStatus: OAuthStatus.CONNECTED,
              },
              code: HttpBusinessCode.SUCCESS,
              message: HttpMessage.REQUEST_SUCCESS,
            },
            { status: HttpCode.SUCCESS },
          );
        }

        // Token 过期，更新状态为 EXPIRED
        await updateServerOAuthStatus(serverId, userId, OAuthStatus.EXPIRED);
      }

      const serverUrl = server.url!;

      // 检查MCP服务器是否需要OAuth认证
      const detection = await detectOAuthRequirement(serverUrl);

      // 无需OAuth认证
      if (!detection.requiresAuth) {
        await updateServerOAuthStatus(serverId, userId, OAuthStatus.NOT_REQUIRED);
        return NextResponse.json<ResultVO<CheckOAuthResponse>>(
          {
            data: {
              serverId,
              requiresAuth: false,
              connected: false,
              oauthStatus: OAuthStatus.NOT_REQUIRED,
            },
            code: HttpBusinessCode.SUCCESS,
            message: HttpMessage.REQUEST_SUCCESS,
          },
          { status: HttpCode.SUCCESS },
        );
      }

      // 需要OAuth认证, 更新状态为 REQUIRED
      await updateServerOAuthStatus(serverId, userId, OAuthStatus.REQUIRED);

      try {
        const authProvider = new ServerOAuthProvider(serverId, server.name!, userId);

        // Step 1: 查找受保护资源的元数据以找到授权服务器
        const serverUrlObj = new URL(serverUrl);

        const resourceMetadata = await discoverOAuthProtectedResourceMetadata(
          serverUrlObj,
          detection.resourceMetadataUrl ? { resourceMetadataUrl: detection.resourceMetadataUrl } : undefined,
        );

        // Step 2: 获取授权服务器的URL并查看其元数据
        const authServerUrl = resourceMetadata.authorization_servers?.[0]; // 示例： https://mcp.prisma.io

        if (!authServerUrl) {
          throw new Error('authServerUrl not found');
        }

        const metadata = await discoverAuthorizationServerMetadata(authServerUrl);

        if (!metadata) {
          throw new Error('未发现授权服务器元数据');
        }

        // 查找数据中是否存在 clientInfo
        let clientInfo = await authProvider.clientInformation();

        if (!clientInfo) {
          // 如果尚未注册，则动态注册客户
          if (metadata.registration_endpoint) {
            clientInfo = await registerClient(authServerUrl, {
              metadata,
              clientMetadata: authProvider.clientMetadata,
            });
            // 保存客户信息以备将来使用
            await authProvider.saveClientInformation(clientInfo);
          } else {
            throw new Error('服务器不支持动态客户端注册');
          }
        }

        // 开始授权并获取URL
        const { authorizationUrl, codeVerifier } = await startAuthorization(authServerUrl, {
          metadata,
          clientInformation: clientInfo,
          redirectUrl: authProvider.redirectUrl,
        });

        // 保存回调的验证码
        await authProvider.saveCodeVerifier(codeVerifier);

        return NextResponse.json(
          {
            data: {
              serverId,
              requiresAuth: true,
              connected: false,
              oauthStatus: OAuthStatus.REQUIRED,
              authorizationUrl: authorizationUrl.toString(),
            },
            code: HttpBusinessCode.SUCCESS,
            message: HttpMessage.REQUEST_SUCCESS,
          },
          { status: HttpCode.SUCCESS },
        );
      } catch (error) {
        console.error('[OAuth API] Error:', error);
        return NextResponse.json(
          {
            data: {
              serverId,
              requiresAuth: true,
              connected: false,
              oauthStatus: OAuthStatus.REQUIRED,
              error: error instanceof Error ? error.message : '生成授权URL失败',
            },
            code: HttpBusinessCode.FAIL,
            message: HttpMessage.REQUEST_FAILED,
          },
          { status: HttpCode.SUCCESS },
        );
      }
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json<ResultVO<null>>(
      {
        code: HttpBusinessCode.FAIL,
        message: error instanceof Error ? error.message : HttpMessage.INTERNAL_SERVER_ERROR,
        data: null,
      },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}
