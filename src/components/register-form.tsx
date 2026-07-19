'use client';

import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpBusinessCode, HttpMessage } from '@/constants/http';
import type { ResultVO } from '@/pojo/vo/common/result.vo';
import { AtSign, LoaderCircle, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  EMAIL_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@/constants';
import { cn } from '@/lib/utils';

const genderOptions = [
  { label: '男', value: 'MALE' },
  { label: '女', value: 'FEMALE' },
  { label: '保密', value: 'UNKNOWN' },
] as const;

const registerFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, `用户名长度需为 ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} 位`)
    .max(USERNAME_MAX_LENGTH, `用户名长度需为 ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} 位`),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || EMAIL_REGEX.test(value), '请输入有效邮箱'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `密码长度需为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位`)
    .max(PASSWORD_MAX_LENGTH, `密码长度需为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位`),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

async function registerRequest(values: RegisterFormValues) {
  const response = await fetch('/api/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      ...values,
      email: values.email || undefined,
    }),
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

export default function RegisterForm() {
  const router = useRouter();
  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onError: (error) => {
      toast.error(error.message, {});
    },
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      gender: 'MALE',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(values);

      reset({
        username: '',
        email: '',
        password: '',
        gender: 'MALE',
      });
      router.replace('/login');
    } catch {}
  };

  return (
    <Card className={cn('w-full max-w-md border-border/60 bg-card/95 py-0 gap-0 shadow-xl backdrop-blur')}>
      <CardHeader className="gap-2 border-b border-border/60 py-6">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-4" />
          <span className="text-xs font-medium tracking-wide uppercase">Create Account</span>
        </div>
        <CardTitle className="text-2xl">Register</CardTitle>
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

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="请输入邮箱（选填）"
                className="h-10 pl-10 text-sm"
                {...register('email')}
              />
            </div>
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-3">
            <Label>Gender</Label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-2 sm:grid-cols-3">
                  {genderOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm transition-colors hover:border-primary/50">
                      <RadioGroupItem
                        value={option.value}
                        aria-label={option.label}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.gender ? <p className="text-xs text-destructive">{errors.gender.message}</p> : null}
          </div>

          <Button
            className="h-10 w-full text-sm cursor-pointer"
            type="submit"
            disabled={isSubmitting || registerMutation.isPending}>
            {isSubmitting || registerMutation.isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
