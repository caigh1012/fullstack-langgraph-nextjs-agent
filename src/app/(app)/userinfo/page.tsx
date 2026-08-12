'use client';

import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpBusinessCode } from '@/constants/http';
import { AtSign, Trash2, Upload, UserRound } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
  avatarUrl: z.string(),
});

type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;

export default function UserInfoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userInfo, refreshUserInfo } = useUserInfoContext();

  const updateUserFun = async (values: UserProfileFormValues) => {
    const response = await fetch('/api/user', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nickname: values.nickname,
        email: values.email || undefined,
        gender: values.gender,
        avatarUrl: values.avatarUrl || undefined,
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
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadAvatarFun = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/user/upload', {
      method: 'POST',
      credentials: 'same-origin',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = '上传头像失败';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      throw new Error(data.message || '上传头像失败');
    }
    return data.data.url as string;
  };

  const uploadMutation = useMutation({
    mutationFn: uploadAvatarFun,
    onSuccess: (url) => {
      setValue('avatarUrl', url, { shouldDirty: true });
      toast.success('上传头像成功');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      nickname: userInfo?.nickname || '',
      email: userInfo?.email || '',
      gender: (userInfo?.gender as 'MALE' | 'FEMALE' | 'UNKNOWN') || 'UNKNOWN',
      avatarUrl: userInfo?.avatarUrl || '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    reset({
      nickname: userInfo?.nickname || '',
      email: userInfo?.email || '',
      gender: (userInfo?.gender as 'MALE' | 'FEMALE' | 'UNKNOWN') || 'UNKNOWN',
      avatarUrl: userInfo?.avatarUrl || '',
    });
  }, [userInfo, reset]);

  const avatarUrl = useWatch({ control, name: 'avatarUrl' });
  const resolvedAvatarUrl = avatarUrl;

  const resetAvatar = () => {
    setValue('avatarUrl', '', { shouldDirty: true });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (!file) {
      return;
    }
    uploadMutation.mutate(file);
  };

  const onSubmit = async (values: UserProfileFormValues) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="flex items-center gap-2">
          <h1 className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
            <UserRound className="size-4" />
            修改个人信息
          </h1>
        </div>

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

          <div className="space-y-3">
            <Label>头像</Label>
            <div className="flex flex-col items-center gap-3">
              <Avatar className="size-24">
                {resolvedAvatarUrl ? (
                  <AvatarImage
                    src={resolvedAvatarUrl}
                    alt="avatar"
                  />
                ) : null}
                <AvatarFallback>
                  <UserRound className="size-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                type="file"
                onChange={handleAvatarChange}
              />
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  className="cursor-pointer"
                  disabled={!avatarUrl}
                  onClick={resetAvatar}
                  type="button"
                  variant="outline">
                  <Trash2 data-icon="inline-start" />
                  删除头像
                </Button>
                <Button
                  className="cursor-pointer"
                  disabled={uploadMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  variant="outline">
                  {uploadMutation.isPending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload data-icon="inline-start" />
                      更换头像
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline">
              <Link href="/">返回</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                reset({
                  nickname: userInfo?.nickname || '',
                  email: userInfo?.email || '',
                  gender: (userInfo?.gender as 'MALE' | 'FEMALE' | 'UNKNOWN') || 'UNKNOWN',
                  avatarUrl: userInfo?.avatarUrl || '',
                })
              }>
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
      </div>
    </div>
  );
}
