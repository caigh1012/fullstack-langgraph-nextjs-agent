'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpBusinessCode } from '@/constants/http';
import { AtSign, UserRound } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { EMAIL_REGEX, GENDER_OPTIONS } from '@/constants';
import { useUserInfoContext } from '@/contexts/userinfo-context';

const userProfileFormSchema = z.object({
  nickname: z.string().trim().min(1, '昵称不能为空').max(12, '昵称长度不能超过12位'),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || EMAIL_REGEX.test(value), '请输入有效邮箱'),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
});

type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;

interface UserProfileFormProps {
  trigger?: React.ReactNode;
}

export function UserProfileForm({ trigger }: UserProfileFormProps) {
  const [open, setOpen] = useState(false);
  const { userInfo, refreshUserInfo } = useUserInfoContext();

  const updateUserFun = async (values: UserProfileFormValues) => {
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        nickname: values.nickname,
        email: values.email || undefined,
        gender: values.gender,
      }),
    });

    if (!response.ok) {
      let errorMessage = '更新用户信息失败';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      throw new Error(data.message || '更新用户信息失败');
    }
  };

  const updateMutation = useMutation({
    mutationFn: updateUserFun,
    onSuccess: () => {
      toast.success('更新用户信息成功');
      refreshUserInfo();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      nickname: userInfo?.nickname || '',
      email: userInfo?.email || '',
      gender: (userInfo?.gender as 'MALE' | 'FEMALE' | 'UNKNOWN') || 'UNKNOWN',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: UserProfileFormValues) => {
    await updateMutation.mutateAsync(values);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      reset({
        nickname: userInfo?.nickname || '',
        email: userInfo?.email || '',
        gender: (userInfo?.gender as 'MALE' | 'FEMALE' | 'UNKNOWN') || 'UNKNOWN',
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="size-4" />
            修改个人信息
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="nickname">昵称</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Controller
                control={control}
                name="nickname"
                render={({ field }) => (
                  <Input
                    id="nickname"
                    placeholder="请输入昵称"
                    className="h-10 pl-10 text-sm"
                    {...field}
                  />
                )}
              />
            </div>
            {errors.nickname ? <p className="text-xs text-destructive">{errors.nickname.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="请输入邮箱（选填）"
                    className="h-10 pl-10 text-sm"
                    {...field}
                  />
                )}
              />
            </div>
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-3">
            <Label>性别</Label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-2 sm:grid-cols-3">
                  {GENDER_OPTIONS.map((option) => (
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset({ nickname: '', email: '', gender: 'UNKNOWN' })}>
              重置
            </Button>
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}>
              {isSubmitting || updateMutation.isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
