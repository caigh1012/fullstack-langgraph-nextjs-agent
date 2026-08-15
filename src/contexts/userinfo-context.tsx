'use client';

import { HttpBusinessCode } from '@/constants/http';
import { UserInfo } from '@/types/vo/user.vo';
import { redirect } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export interface UserInfoContextType {
  userInfo: UserInfo | null;
  loading: boolean;
  loggingOut: boolean;
  logout: () => Promise<void>;
  refreshUserInfo: () => void;
}

const UserInfoContext = createContext<UserInfoContextType | null>(null);

/**
 * 用户登录信息存储
 * @returns
 */
export function UserInfoProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  /**
   * 获取用户信息
   */
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

  /**
   * 退出登录
   */
  const logout = useCallback(async () => {
    setLoggingOut(true);
    const response = await fetch('/api/user/logout', { method: 'POST' });
    const data = await response.json();
    if (response.ok && data.code === HttpBusinessCode.SUCCESS) {
      setUserInfo(null);
      setLoggingOut(false);
      toast.success('退出成功');
      redirect('/login');
    } else {
      setLoggingOut(false);
      toast.error('退出失败');
    }
  }, []);

  /**
   * 刷新用户信息
   */
  const refreshUserInfo = useCallback(() => {
    getUserInfo();
  }, [getUserInfo]);

  useEffect(() => {
    getUserInfo();
  }, []);

  const value = useMemo<UserInfoContextType>(
    () => ({
      userInfo,
      loading,
      loggingOut,
      logout,
      refreshUserInfo,
    }),
    [userInfo, loading, loggingOut, logout, refreshUserInfo],
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
