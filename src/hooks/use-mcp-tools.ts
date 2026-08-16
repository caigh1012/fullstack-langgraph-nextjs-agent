import { MCPToolsData } from '@/types/vo/mcp-tools.vo';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

async function fetchMCPTools() {
  try {
    const response = await fetch('/api/mcp-tools');
    if (!response.ok) {
      throw new Error('Failed to fetch MCP tools');
    }
    return await response.json();
  } catch (error: unknown) {
    toast.error((error as { message?: string }).message || '获取 MCP tools 失败');
  }
}

export function useMCPTools() {
  return useQuery<MCPToolsData>({
    queryKey: ['mcp-tools'],
    queryFn: fetchMCPTools,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}
