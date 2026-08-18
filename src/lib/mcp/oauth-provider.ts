import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';

import type {
  OAuthClientInformation,
  OAuthClientMetadata,
  OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import prisma from '../database/prisma';
import { getAppUrl } from '@/utils/get-app-url';
import { OAuthStatus } from '@/constants/mcp-oauth-status';

export class ServerOAuthProvider implements OAuthClientProvider {
  private serverId: string;
  private serverName: string;
  private userId: string;

  constructor(serverId: string, serverName: string, userId: string) {
    this.serverId = serverId;
    this.serverName = serverName;
    this.userId = userId;
  }

  get redirectUrl(): string {
    return `${getAppUrl()}/api/oauth/callback/${this.serverId}`;
  }

  get clientMetadata(): OAuthClientMetadata {
    const appUrl = getAppUrl();
    return {
      client_uri: appUrl,
      client_name: `LangGraph Agent - ${this.serverName}`,
      redirect_uris: [this.redirectUrl],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      scope: 'read write',
      token_endpoint_auth_method: 'none',
    };
  }

  // 查找数据中是否存在 clientInfo
  async clientInformation(): Promise<OAuthClientInformation | undefined> {
    const server = await prisma.mCPServer.findUnique({
      where: { id: this.serverId, userId: this.userId },
      select: { clientInfo: true },
    });
    return server?.clientInfo as OAuthClientInformation | undefined;
  }

  // 保存客户信息
  // 保存客户信息以备将来使用
  async saveClientInformation(info: OAuthClientInformation): Promise<void> {
    await prisma.mCPServer.update({
      where: { id: this.serverId, userId: this.userId },
      data: { clientInfo: info },
    });
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    const server = await prisma.mCPServer.findUnique({
      where: { id: this.serverId, userId: this.userId },
      select: { authTokens: true },
    });
    const tokens = server?.authTokens as OAuthTokens | undefined;
    return tokens;
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    await prisma.mCPServer.update({
      where: { id: this.serverId, userId: this.userId },
      data: {
        authTokens: tokens,
        oauthStatus: OAuthStatus.CONNECTED,
      },
    });
  }

  async redirectToAuthorization(url: URL): Promise<void> {
    throw new Error(`REDIRECT_REQUIRED:${url.toString()}`);
  }

  async saveCodeVerifier(verifier: string): Promise<void> {
    await prisma.mCPServer.update({
      where: { id: this.serverId, userId: this.userId },
      data: { codeVerifier: verifier },
    });
  }

  async codeVerifier(): Promise<string> {
    const server = await prisma.mCPServer.findUnique({
      where: { id: this.serverId, userId: this.userId },
      select: { codeVerifier: true },
    });
    if (!server?.codeVerifier) {
      throw new Error('No code verifier stored');
    }
    return server.codeVerifier;
  }
}
