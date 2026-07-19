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
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Settings, Sparkles } from 'lucide-react';

export function LeftSidebar() {
  const { state, isMobile } = useSidebar();
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
      <SidebarContent></SidebarContent>
      {/* <ThreadList /> */}
      {/* 侧边栏底部内容 */}
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
                <span className="truncate font-semibold">shadcn</span>
                <span className="truncate text-xs text-muted-foreground">m@example.com</span>
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
                  <span className="truncate font-semibold">shadcn</span>
                  <span className="truncate text-xs text-muted-foreground">m@example.com</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Sparkles />
              Upgrade to Pro
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <BadgeCheck />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4" />
              Configure MCP Servers
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
