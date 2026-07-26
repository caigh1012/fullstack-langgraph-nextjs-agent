/**
 * MessageResponse 消息响应体
 */
export interface MessageResponse {
  type: 'human' | 'ai' | 'tool' | 'error' | 'system';
  data: BasicMessageData | AIMessageData;
}

export interface FileAttachment {
  url: string;
  key: string;
  name: string;
  type: string;
  size: number;
}

export interface ContentItem {
  text?: string;
  functionCall?: FunctionCall;
  thoughtSignature?: string;
}

export interface ToolCallChunk {
  name: string;
  args: string;
  index: number;
  type: 'tool_call_chunk';
  id: string;
}

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  id: string;
  type: 'tool_call';
}

export interface BasicMessageData {
  id: string;
  content: string;
  attachments?: FileAttachment[];
}

export interface AIMessageData {
  id: string;
  content: string;
  tool_calls?: ToolCall[];
  tool_call_chunks?: ToolCallChunk[];
  additional_kwargs?: Record<string, unknown>;
  invalid_tool_calls?: unknown[];
  response_metadata?: Record<string, unknown>;
}

export interface MessageOptions {
  model?: string;
  provider?: string;
}
