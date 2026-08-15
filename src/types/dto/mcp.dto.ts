/**
 * MCP Server 类型字符串字面量
 */
export type MCPServerTypeLiteral = 'stdio' | 'http';

/**
 * MCP Server 创建参数
 */
export interface CreateMCPServerDto {
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
export interface UpdateMCPServerDto {
  name?: string;
  type?: MCPServerTypeLiteral;
  enabled?: boolean;
  command?: string | null;
  args?: string[] | null;
  env?: Record<string, string> | null;
  url?: string | null;
  headers?: Record<string, string> | null;
}
