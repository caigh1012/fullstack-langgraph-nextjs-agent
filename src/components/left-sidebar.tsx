'use client';

import Image from 'next/image';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ChevronsUpDown, LogOut, MessageCircleCheck, Settings, Sparkles } from 'lucide-react';
import { useUserInfoContext } from '@/contexts/userinfo-context';
import { ThreadList } from './thread-list';
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
import { Button } from './ui/button';

export function LeftSidebar() {
  const { state, isMobile } = useSidebar();
  const { userInfo, loggingOut, logout } = useUserInfoContext();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar>
      {/* 侧边栏头部内容 */}
      <SidebarHeader className="flex flex-row items-center">
        <Image
          src="/logo.svg"
          alt="Fullstack Agent"
          width={40}
          height={40}
        />
        <div>Fullstack Next.js Agent</div>
      </SidebarHeader>
      {/* 侧边栏内容：会话列表 */}
      <SidebarContent className="overflow-hidden">
        <ThreadList />
      </SidebarContent>

      {/* 侧边栏底部内容 */}
      <AlertDialog>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center">
                <Image
                  src="/logo.svg"
                  alt="User avatar"
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-lg"
                />
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{userInfo?.nickname || '--'}</span>
                  <span className="truncate text-xs text-muted-foreground">{userInfo?.email || '--'}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </button>
            </DropdownMenuTrigger>

            {/* 侧边栏内容：用户信息下拉菜单 */}
            <DropdownMenuContent
              className="w-56"
              side={isMobile ? 'bottom' : state === 'collapsed' ? 'right' : 'top'}
              align={isMobile ? 'start' : 'end'}
              sideOffset={8}>
              <DropdownMenuLabel className="p-0 font-normal text-foreground">
                {/* 用户个人信息 */}
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
                  <Image
                    src="/logo.svg"
                    alt="User avatar"
                    width={32}
                    height={32}
                    className="size-8 shrink-0 rounded-lg"
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userInfo?.nickname || '--'}</span>
                    <span className="truncate text-xs text-muted-foreground">{userInfo?.email || '--'}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Sparkles />
                修改个人信息
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4" />
                MCP配置
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem disabled={loggingOut}>
                  <LogOut />
                  {loggingOut ? '退出中...' : '退出'}
                </DropdownMenuItem>
                {/* <Button variant="outline">Show Dialog</Button> */}
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center justify-center gap-2">
                <MessageCircleCheck />
                确认退出吗？
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>退出后将无法继续使用该账号，是否继续？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={logout}>确认退出</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SidebarRail />
    </Sidebar>
  );
}
