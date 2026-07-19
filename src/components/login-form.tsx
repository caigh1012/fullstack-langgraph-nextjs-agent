'use client';

import { useMutation } from '@tanstack/react-query';
import { HttpBusinessCode, HttpMessage } from '@/constants/http';
import type { ResultVO } from '@/pojo/vo/common/result.vo';
import { LoaderCircle, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@/constants';
import { cn } from '@/lib/utils';

const loginFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, `用户名长度需为 ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} 位`)
    .max(USERNAME_MAX_LENGTH, `用户名长度需为 ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} 位`),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `密码长度需为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位`)
    .max(PASSWORD_MAX_LENGTH, `密码长度需为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位`),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

async function loginRequest(values: LoginFormValues) {
  const response = await fetch('/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });

  let result: ResultVO<null>;

  try {
    result = (await response.json()) as ResultVO<null>;
  } catch {
    throw new Error(response.ok ? HttpMessage.INTERNAL_SERVER_ERROR : HttpMessage.REQUEST_FAILED);
  }

  if (!response.ok || result.code !== HttpBusinessCode.SUCCESS) {
    throw new Error(result.message || HttpMessage.REQUEST_FAILED);
  }

  return result;
}

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
    try {
      await loginMutation.mutateAsync(values);

      reset({
        username: values.username,
        password: '',
      });
      router.replace('/');
      router.refresh();
    } catch {}
  };

  return (
    <Card className={cn('w-full max-w-md border-border/60 bg-card/95 py-0 gap-0 shadow-xl backdrop-blur')}>
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
                placeholder="请输入用户名"
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
                placeholder="请输入密码"
                className="h-10 pl-10 text-sm"
                {...register('password')}
              />
            </div>
            {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
          </div>

          <Button
            className="h-10 w-full text-sm cursor-pointer"
            type="submit"
            disabled={isSubmitting || loginMutation.isPending}>
            {isSubmitting || loginMutation.isPending ? (
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
