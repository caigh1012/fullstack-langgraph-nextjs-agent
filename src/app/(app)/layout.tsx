'use client';

import { ThreadProvider } from '@/contexts/thread-context';
import { UserInfoProvider } from '@/contexts/userinfo-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { SvgIcon } from '@/components/svg-icon';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { LeftSidebar } from '@/components/left-sidebar';
/**
 * 用户登录后的布局
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <UserInfoProvider>
      <TooltipProvider>
        <ThreadProvider>
          <SidebarProvider>
            {/* 左边侧边栏 */}
            <LeftSidebar />
            {/* 主内容区域 */}
            <main className="min-w-0 flex-1">
              {/* 主内容区域的导航栏 */}
              <div className="h-12 flex items-center justify-between gap-2 p-2">
                <div className="flex min-w-0 items-center gap-2">
                  {/* 侧边栏触发器 */}
                  <SidebarTrigger />
                  <span className="truncate">Fullstack Next.js Agent</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* 切换主题按钮 */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="切换主题"
                    // 切换主题
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="relative">
                    <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>

                  {/* GitHub 按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="GitHub">
                    <a
                      href="https://github.com/caigh1012/fullstack-langgraph-nextjs-agent"
                      target="_blank"
                      rel="noreferrer">
                      <SvgIcon iconName="github" />
                    </a>
                  </Button>
                </div>
              </div>
              {/* 主内容区域的内容 */}
              <div className="relative h-[calc(100vh-3rem)] flex-1">{children}</div>
            </main>
          </SidebarProvider>
        </ThreadProvider>
      </TooltipProvider>
    </UserInfoProvider>
  );
}
