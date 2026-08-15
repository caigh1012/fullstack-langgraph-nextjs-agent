export enum MCPServerType {
  stdio = 'stdio',
  http = 'http',
}

export type OAuthStatusType = 'UNKNOWN' | 'NOT_REQUIRED' | 'REQUIRED' | 'CONNECTED' | 'EXPIRED';

export interface MCPServer {
  id: string;
  name: string;
  type: MCPServerType;
  enabled: boolean;
  command?: string;
  args?: unknown[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  // OAuth fields
  requiresAuth?: boolean;
  oauthStatus?: OAuthStatusType;
  createdAt: string;
  updatedAt: string;
}
