export interface OAuthDetectionResult {
  requiresAuth: boolean;
  resourceMetadataUrl?: string;
  error?: string;
}

/**
 * 用于检测MCP HTTP 服务器是否需要OAuth认证
 */
export async function detectOAuthRequirement(url: string): Promise<OAuthDetectionResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.status === 401) {
      // 获取 WWW-Authenticate 头
      const wwwAuth = response.headers.get('WWW-Authenticate');
      if (wwwAuth && wwwAuth.toLowerCase().includes('bearer')) {
        return {
          requiresAuth: true,
          resourceMetadataUrl: extractResourceMetadataUrl(wwwAuth),
        };
      }

      return { requiresAuth: true };
    }

    return { requiresAuth: false };
  } catch (error) {
    return {
      requiresAuth: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function extractResourceMetadataUrl(wwwAuthHeader: string): string | undefined {
  // 示例1：Bearer realm="https://mcp.prisma.io/.well-known/oauth-protected-resource
  const resourceMetadataMatch = wwwAuthHeader.match(/resource_metadata="([^"]+)"/);
  // 示例1获取 resourceMetadataMatch 的是 null
  if (resourceMetadataMatch) {
    return resourceMetadataMatch[1];
  }

  const realmMatch = wwwAuthHeader.match(/realm="([^"]+)"/);
  return realmMatch?.[1]; // 获取到的是 https://mcp.prisma.io/.well-known/oauth-protected-resource
}

export function isTokenExpired(tokens: { expires_at?: number } | null | undefined): boolean {
  if (!tokens || !tokens.expires_at) {
    return true; // 未设置过期时间，默认过期为 true
  }
  // Add 60 second buffer before actual expiry
  return Date.now() / 1000 > tokens.expires_at - 60;
}
