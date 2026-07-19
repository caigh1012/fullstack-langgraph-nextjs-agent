'use client';

import { LoaderCircle, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const loginFormSchema = z.object({
  username: z.string().trim().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  className?: string;
}

export default function LoginForm({ className }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: LoginFormValues) => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 400);
    });

    reset({
      username: values.username,
      password: '',
    });
  };

  return (
    <Card className={cn('w-full max-w-md border-border/60 bg-card/95 py-0 gap-0 shadow-xl backdrop-blur', className)}>
      <CardHeader className="gap-2 border-b border-border/60 py-6">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-4" />
          <span className="text-xs font-medium tracking-wide uppercase">Account Access</span>
        </div>
        <CardTitle className="text-2xl">Login</CardTitle>
      </CardHeader>
      <CardContent className="py-6">
        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                autoComplete="username"
                placeholder="请输入用户名"
                aria-invalid={Boolean(errors.username)}
                className="h-10 pl-10 text-sm"
                {...register('username')}
              />
            </div>
            {errors.username ? <p className="text-xs text-destructive">{errors.username.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="请输入密码"
                aria-invalid={Boolean(errors.password)}
                className="h-10 pl-10 text-sm"
                {...register('password')}
              />
            </div>
            {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
          </div>

          <Button
            className="h-10 w-full text-sm cursor-pointer"
            type="submit"
            disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
