import Link from 'next/link';

import LoginForm from '@/components/login-form';

export default function Login() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-background via-muted/50 to-secondary/20 px-4 py-12">
      <div className="absolute inset-0">
        <div className="absolute top-16 left-1/2 size-72 translate-x-[-140%] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 size-80 translate-x-1/4 translate-y-1/4 rounded-full bg-secondary/20 blur-3xl" />
      </div>
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-primary">欢迎回来</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">登录到你的账户</h1>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          还没有账号？{' '}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline">
            前往注册
          </Link>
        </p>
      </div>
    </main>
  );
}
