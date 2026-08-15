import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';
import { ServerOAuthProvider } from '@/lib/mcp/oauth-provider';
import { Result } from '@/types/common/result';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { getMCPHttpServer, updateMcpHttpServer } from '@/services/mcp/mcp.service';
import { getAppUrl } from '@/utils/get-url';
import { NextRequest, NextResponse } from 'next/server';
import { OAuthStatus } from '@/lib/mcp/oauth-detection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ serverId: string }> }) {
  try {
    return withAuth(req, async (payload) => {
      const userId = payload.sub as string;
      const { serverId } = await params;
      const { searchParams } = new URL(req.url);
      const appUrl = getAppUrl();

      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // 处理 OAuth 错误
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        return NextResponse.redirect(new URL(`/?oauth_error=${encodeURIComponent(errorDescription || error)}`, appUrl));
      }

      if (!code) {
        return NextResponse.redirect(new URL('/?oauth_error=missing_code', appUrl));
      }

      // 从数据库获取服务器
      const server = await getMCPHttpServer(serverId, userId);
      if (!server || !server.url) {
        return NextResponse.redirect(new URL('/?oauth_error=server_not_found', appUrl));
      }

      const authProvider = new ServerOAuthProvider(serverId, server.name!, userId);

      try {
        // 创建 transport 并完成 OAuth 流程
        const transport = new StreamableHTTPClientTransport(new URL(server.url), {
          authProvider,
        });

        await transport.finishAuth(code);

        // 更新服务器状态为已连接
        await updateMcpHttpServer(serverId, userId, {
          oauthStatus: OAuthStatus.CONNECTED,
          requiresAuth: true,
          codeVerifier: null,
        });

        // 成功返回应用
        return NextResponse.redirect(new URL(`/?oauth_success=true&server=${encodeURIComponent(server.name)}`, appUrl));
      } catch (err) {
        console.error('OAuth callback error:', err);

        // 更新服务器状态以显示认证失败
        await updateMcpHttpServer(serverId, userId, {
          oauthStatus: OAuthStatus.REQUIRED,
          requiresAuth: true,
          codeVerifier: null,
        });

        return NextResponse.redirect(
          new URL(
            `/?oauth_error=${encodeURIComponent(err instanceof Error ? err.message : 'Token exchange failed')}`,
            appUrl,
          ),
        );
      }
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json<Result<null>>(
      {
        code: HttpBusinessCode.FAIL,
        message: error instanceof Error ? error.message : HttpMessage.INTERNAL_SERVER_ERROR,
        data: null,
      },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}
