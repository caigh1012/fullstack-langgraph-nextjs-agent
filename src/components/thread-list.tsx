'use client';

import { Check, CirclePlus, Loader2, MoreHorizontal, Pencil, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useThreads } from '@/hooks/use-threads';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

/**
 * 会话列表组件
 */
export function ThreadList() {
  const router = useRouter();
  const { threads, createThread, activeThreadId, deleteThread, refetchThreads } = useThreads();
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [savingRename, setSavingRename] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();

  /**
   * 本地搜索过滤
   */
  const filtered = threads.filter((t) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (t.title || '').toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
  });

  /**
   * 删除会话
   */
  const handleDeleteThread = async (threadId: string) => {
    setPendingDeleteId(threadId);
    setOpen(true);
  };

  /**
   * 确认删除会话
   */
  const confirmDeleteThread = async () => {
    if (!pendingDeleteId) {
      return;
    }
    setDeletingId(pendingDeleteId);
    try {
      await deleteThread(pendingDeleteId);
      setPendingDeleteId(null);
    } catch (e) {
      console.error('Delete failed', e);
      alert('Failed to delete thread. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * 进入当前会话详情
   */
  const handleClickSession = (id: string) => {
    if (renamingId) {
      return;
    }
    router.push(`/thread/${id}`);
  };

  /**
   * 刷新会话
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchThreads();
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * 保存命名会话名称
   */
  const saveRename = async () => {
    if (!renamingId) return;
    setSavingRename(true);
    try {
      const nextTitle = renameValue.trim() || 'Untitled thread';
      const response = await fetch('/api/agent/threads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: renamingId, title: nextTitle }),
      });
      if (!response.ok) {
        throw new Error('Failed to rename thread');
      }
      // 刷新会话列表
      await refetchThreads();
      setRenamingId(null);
      setRenameValue('');
    } catch (e) {
      console.error('Rename failed', e);
    } finally {
      setSavingRename(false);
    }
  };

  /**
   * 开始命名会话
   */
  const startRename = (id: string, title?: string | null) => {
    setRenamingId(id);
    setRenameValue(title || '');
  };

  /**
   * 取消命名会话
   */
  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  useEffect(() => {
    if (!renamingId || !inputRef.current) {
      return;
    }
    inputRef.current.focus();
    inputRef.current.select();
  }, [renamingId]);

  return (
    <>
      <SidebarGroup className="flex flex-row flex-nowrap items-center gap-2 py-0">
        {/* 侧边栏内容：添加会话按钮 */}
        <Button
          className="shrink-0 grow"
          variant="outline"
          onClick={() => router.push('/')}>
          <CirclePlus className="h-4 w-4" />
          <span>添加会话</span>
        </Button>
        <Button
          className="shrink-0"
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          title="Refresh">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
        </Button>
      </SidebarGroup>
      <SidebarGroup className="flex min-h-0 flex-1 flex-col py-0">
        <SidebarGroupLabel>会话</SidebarGroupLabel>
        {/* 侧边栏内容：搜索会话 */}
        <div className="relative shrink-0 group-data-[collapsible=icon]:hidden">
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="搜索会话…"
            className="pl-8"
          />
        </div>
        <AlertDialog open={open}>
          <SidebarGroupContent className="mt-2 min-h-0 flex-1 overflow-y-auto group-data-[collapsible=icon]:hidden">
            {/* 侧边栏内容：会话列表 */}
            <SidebarMenu>
              {filtered.length === 0 ? (
                <SidebarMenuItem>
                  <div className="text-center px-4 py-4 text-xs text-muted-foreground">暂无会话</div>
                </SidebarMenuItem>
              ) : (
                <>
                  {filtered.map((thread) => {
                    const isRenaming = renamingId === thread.id;
                    return (
                      <SidebarMenuItem key={thread.id}>
                        {!isRenaming ? (
                          <>
                            <SidebarMenuButton
                              size="lg"
                              isActive={pathname === `/thread/${thread.id}`}
                              onClick={() => handleClickSession(thread.id)}
                              className="h-auto items-start py-2">
                              <div className="flex min-w-0 flex-1 flex-col">
                                <div className="truncate leading-5 font-medium">
                                  {thread.title || `Thread ${thread.id.slice(0, 8)}`}
                                </div>
                                <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                                  {/* <div className="min-w-0 flex-1 truncate">{session.preview}</div> */}
                                  <div className="shrink-0 tabular-nums">
                                    {new Date(thread.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </SidebarMenuButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction
                                  className="top-[50%]! translate-y-[-50%] mr-1"
                                  onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                side="right"
                                sideOffset={6}
                                className="w-44">
                                <DropdownMenuItem onSelect={() => startRename(thread.id, thread.title)}>
                                  <Pencil />
                                  重命名
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() => handleDeleteThread(thread.id)}>
                                    <Trash2 />
                                    删除会话
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        ) : (
                          <div
                            className="bg-sidebar-accent/40 border-sidebar-border/60 flex items-center gap-2 rounded-md border p-2"
                            onClick={(e) => e.stopPropagation()}>
                            <Input
                              ref={inputRef}
                              value={renameValue}
                              disabled={savingRename}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRename();
                                if (e.key === 'Escape') cancelRename();
                              }}
                              placeholder="输入会话名称"
                              className="h-8 flex-1 text-sm"
                            />
                            <Button
                              disabled={savingRename}
                              onClick={saveRename}
                              size="icon-xs">
                              {savingRename ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={cancelRename}
                              size="icon-xs">
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>你确定要删除会话吗？</AlertDialogTitle>
              <AlertDialogDescription>删除后将无法恢复，是否继续？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button onClick={() => setOpen(false)}>取消</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button onClick={() => confirmDeleteThread()}>确认</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarGroup>
    </>
  );
}
