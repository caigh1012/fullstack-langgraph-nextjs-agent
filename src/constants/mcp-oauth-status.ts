/**
 * MCP服务器的OAuth状态常量
 */
export const OAuthStatus = {
  UNKNOWN: 'UNKNOWN',
  NOT_REQUIRED: 'NOT_REQUIRED',
  REQUIRED: 'REQUIRED',
  CONNECTED: 'CONNECTED',
  EXPIRED: 'EXPIRED',
} as const;
