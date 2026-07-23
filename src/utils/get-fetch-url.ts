export interface ChatServiceConfig {
  baseUrl?: string;
  endpoints?: {
    history?: string;
    chat?: string;
    stream?: string;
    threads?: string;
  };
  headers?: Record<string, string>;
}

const config: ChatServiceConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/agent',
  endpoints: {
    history: '/history',
    chat: '/chat',
    stream: '/stream',
    threads: '/threads',
  },
};

export function getUrl(endpoint: keyof Required<ChatServiceConfig>['endpoints']): string {
  return `${config.baseUrl}${config.endpoints?.[endpoint] || ''}`;
}
