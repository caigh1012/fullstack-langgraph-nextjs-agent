'use client';

import { Edit, Globe, Link2, Loader2, Plus, RefreshCcw, Server, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { OAuthStatusBadge, OAuthStatusType } from './oauth-status-badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MCPServerForm from './mcp-server-form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { HttpBusinessCode } from '@/constants/http';
import { OAuthStatus } from '@/constants/mcp-oauth-status';
import { MCPServer } from '@/types/vo/mcp.vo';

interface MCPServerListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MCPServerList({ isOpen, onClose }: MCPServerListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingServer, setEditingServer] = useState<MCPServer | undefined>();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: servers = [],
    isLoading: loading,
    refetch: fetchServers,
  } = useQuery<MCPServer[]>({
    queryKey: ['mcp-servers'],
    enabled: isOpen,
    queryFn: async () => {
      const response = await fetch('/api/mcp-servers');
      let errorMessage = '获取MCP服务器列表失败';
      if (!response.ok) {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.code === HttpBusinessCode.FAIL) {
        toast.error(data.message || errorMessage);
        throw new Error(data.message || errorMessage);
      }

      return data.data as MCPServer[];
    },
  });

  // 启用/禁用 MCP 服务器
  const toggleServer = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/mcp-servers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });

      let errorMessage = 'MCP Server Toggle Failed';

      if (!response.ok) {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.code === HttpBusinessCode.FAIL) {
        toast.error(data.message || errorMessage);
        throw new Error(data.message || errorMessage);
      }

      if (response.ok) {
        queryClient.setQueryData<MCPServer[]>(['mcp-servers'], (old = []) =>
          old.map((s) => (s.id === id ? { ...s, enabled } : s)),
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteServer = async (id: string) => {
    try {
      const response = await fetch(`/api/mcp-servers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      let errorMessage = 'MCP Server Delete Failed';

      if (!response.ok) {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.code === HttpBusinessCode.FAIL) {
        toast.error(data.message || errorMessage);
        throw new Error(data.message || errorMessage);
      }

      if (response.ok) {
        queryClient.setQueryData<MCPServer[]>(['mcp-servers'], (old = []) => old.filter((s) => s.id !== id));
      }
    } catch (error) {
      throw error;
    } finally {
      setPendingDelete(null);
    }
  };

  const handleDeleteServer = (id: string, serverName: string) => {
    setPendingDelete({ id, name: serverName });
  };

  /**
   * 对type为 http 的 MCP 服务器进行OAuth认证
   */
  const checkAndConnectOAuth = async (serverId: string) => {
    setConnectingId(serverId);
    try {
      const response = await fetch(`/api/oauth/check/${serverId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      let errorMessage = 'MCP Server OAuth Check Failed';

      if (!response.ok) {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.code === HttpBusinessCode.FAIL) {
        toast.error(data.message || errorMessage);
        throw new Error(data.message || errorMessage);
      }

      const { connected, authorizationUrl, error } = data.data;
      if (authorizationUrl) {
        // 保存当前路径以便在 OAuth 返回后返回
        sessionStorage.setItem('oauth_return_path', window.location.pathname);
        // 重定向到 OAuth 认证页面
        window.location.assign(authorizationUrl);
      } else if (error) {
        toast.error(error);
      } else {
        queryClient.setQueryData<MCPServer[]>(['mcp-servers'], (old = []) =>
          old.map((s) => {
            if (s.id === serverId) {
              let newStatus: OAuthStatusType;
              if (connected) {
                newStatus = OAuthStatus.CONNECTED;
              } else if (s.oauthStatus === OAuthStatus.REQUIRED) {
                // Preserve REQUIRED status if we are still not connected
                newStatus = OAuthStatus.REQUIRED;
              } else {
                newStatus = OAuthStatus.NOT_REQUIRED;
              }
              return { ...s, oauthStatus: newStatus };
            }
            return s;
          }),
        );
      }
    } catch (error) {
      throw error;
    } finally {
      setConnectingId(null);
    }
  };

  const handleFormSaved = () => {
    fetchServers();
    setShowForm(false);
    setEditingServer(undefined);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingServer(undefined);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-card text-card-foreground shadow-xl">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold text-card-foreground">MCP 配置列表</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowForm(true)}
                className="h-auto gap-2 rounded-md px-3 py-1.5 hover:bg-primary/90">
                <Plus size={16} />
                添加 MCP 配置
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await fetchServers();
                  toast.success('刷新成功');
                }}
                disabled={loading}
                className="size-auto h-auto w-auto cursor-pointer p-1.5 text-muted-foreground hover:bg-transparent hover:text-foreground"
                title="Refresh">
                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCcw size={16} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="size-auto h-auto w-auto cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground">
                <X size={20} />
              </Button>
            </div>
          </div>

          <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-4">
            {loading && servers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  size={24}
                  className="animate-spin text-muted-foreground"
                />
              </div>
            ) : servers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Server
                  size={48}
                  className="mx-auto mb-4 text-muted-foreground/50"
                />
                <p className="text-lg font-medium text-card-foreground">No MCP servers configured</p>
                <p className="text-sm">Add your first MCP server to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servers.map((server) => (
                  <div
                    key={server.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {server.type === 'stdio' ? (
                          <Server
                            size={20}
                            className="text-primary"
                          />
                        ) : (
                          <Globe
                            size={20}
                            className="text-primary"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-card-foreground">{server.name}</h3>
                            {server.type === 'http' && <OAuthStatusBadge status={server.oauthStatus} />}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="mr-2 inline-block rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                              {server.type}
                            </span>
                            {server.type === 'stdio' ? <span>{server.command}</span> : <span>{server.url}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 测试连接按钮 */}
                      {server.type === 'http' &&
                        (server.oauthStatus === 'REQUIRED' ||
                          server.oauthStatus === 'EXPIRED' ||
                          server.oauthStatus === 'UNKNOWN') && (
                          <Button
                            onClick={() => checkAndConnectOAuth(server.id)}
                            disabled={connectingId === server.id}
                            className="h-auto gap-1.5 rounded-md px-2.5 py-1 text-xs hover:bg-primary/90"
                            title="Connect with OAuth">
                            {connectingId === server.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Link2 size={14} />
                            )}
                            Connect
                          </Button>
                        )}

                      <Switch
                        checked={server.enabled}
                        onCheckedChange={(checked) => toggleServer(server.id, checked)}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingServer(server);
                          setShowForm(true);
                        }}
                        className="size-auto h-auto w-auto cursor-pointer p-1.5 text-muted-foreground hover:bg-transparent hover:text-foreground"
                        title="Edit">
                        <Edit size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteServer(server.id, server.name)}
                        disabled={pendingDelete?.id === server.id}
                        className="size-auto h-auto w-auto cursor-pointer p-1.5 text-muted-foreground hover:bg-transparent hover:text-destructive"
                        title="Delete">
                        {pendingDelete?.id === server.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 “{pendingDelete?.name}” MCP 配置吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDelete(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  deleteServer(pendingDelete.id);
                }
                setPendingDelete(null);
              }}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 添加或编辑MCP服务器表单 */}
      <MCPServerForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSaved={handleFormSaved}
        server={editingServer}
      />
    </>
  );
}
