import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>当前访问的页面不存在，请检查URL是否正确。</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            <Link
              href="/"
              className="text-sm text-primary underline underline-offset-4 transition-colors hover:text-primary/80">
              返回首页
            </Link>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}
