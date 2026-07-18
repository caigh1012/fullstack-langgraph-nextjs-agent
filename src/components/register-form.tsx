'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, LoaderCircle, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod/v3';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const genderOptions = [
  { label: '男', value: 'MALE' },
  { label: '女', value: 'FEMALE' },
  { label: '保密', value: 'UNKNOWN' },
] as const;

const registerFormSchema = z.object({
  username: z.string().trim().min(1, '请输入用户名'),
  nickname: z.string().trim().min(1, '请输入昵称'),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, '请输入有效邮箱'),
  password: z.string().min(1, '请输入密码'),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

interface RegisterFormProps {
  className?: string;
}

export default function RegisterForm({ className }: RegisterFormProps) {
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
      nickname: '',
      email: '',
      password: '',
      gender: 'UNKNOWN',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 400);
    });

    // setSubmittedUser({
    //   username: values.username,
    //   nickname: values.nickname,
    //   gender: values.gender,
    // });

    reset({
      username: values.username,
      nickname: values.nickname,
      email: values.email,
      password: '',
      gender: values.gender,
    });
  };

  return (
    <Card className={cn('w-full max-w-md border-border/60 bg-card/95 py-0 gap-0 shadow-xl backdrop-blur', className)}>
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
                autoComplete="username"
                placeholder="请输入用户名"
                aria-invalid={Boolean(errors.username)}
                className="h-10 pl-10 text-sm"
                {...register('username')}
              />
            </div>
            {errors.username ? <p className="text-xs text-destructive">{errors.username.message}</p> : null}
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nickname"
                autoComplete="nickname"
                placeholder="请输入昵称"
                aria-invalid={Boolean(errors.nickname)}
                className="h-10 pl-10 text-sm"
                {...register('nickname')}
              />
            </div>
            {errors.nickname ? <p className="text-xs text-destructive">{errors.nickname.message}</p> : null}
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="请输入密码"
                aria-invalid={Boolean(errors.password)}
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
                aria-invalid={Boolean(errors.email)}
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
            className="h-10 w-full text-sm"
            type="submit"
            disabled={isSubmitting}>
            {isSubmitting ? (
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
