'use client';

import { HttpBusinessCode, HttpCode } from '@/constants/http';
import { redirect } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

/**
 * 存储用户信息
 */
interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  email?: string;
  avatar?: string;
  gender: string;
}

interface UserContextValue {
  userInfo: UserInfo | null;
  loading: boolean;
  loggingOut: boolean;
  logout: () => Promise<void>;
}

const UserInfoContext = createContext<UserContextValue | null>(null);

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const getUserInfo = useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/user', { method: 'GET' });
    const data = await response.json();
    if (response.ok && data.code === HttpBusinessCode.SUCCESS) {
      setUserInfo(data.data);
      setLoading(false);
    } else {
      setLoading(false);
      toast.error('获取用户信息失败');
    }
  }, []);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    const response = await fetch('/api/user/logout', { method: 'POST' });
    const data = await response.json();
    if (response.ok && data.code === HttpBusinessCode.SUCCESS) {
      setUserInfo(null);
      setLoggingOut(false);
      toast.success('退出成功');
      redirect('/');
    } else {
      setLoggingOut(false);
      toast.error('退出失败');
    }
  }, []);

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]);

  const value = useMemo<UserContextValue>(
    () => ({
      userInfo,
      loading,
      loggingOut,
      logout,
    }),
    [userInfo, loading, loggingOut, logout],
  );

  return <UserInfoContext.Provider value={value}>{children}</UserInfoContext.Provider>;
}

export function useUserInfoContext() {
  const context = useContext(UserInfoContext);

  if (!context) {
    throw new Error('useUserInfoContext must be used within a UserInfoProvider');
  }
  return context;
}
