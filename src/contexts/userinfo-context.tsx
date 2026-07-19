import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserInfoContextType {
  userInfo: string | null;
}

const UserInfoContext = createContext<UserInfoContextType | null>(null);

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<string | null>(null);

  useEffect(() => {
    const data = fetch('/api/user', { method: 'GET' });
    data.then((res) => res.json().then((json) => setUserInfo(json))).catch(() => toast.error('获取用户信息失败'));
  }, []);

  return <UserInfoContext.Provider value={{ userInfo }}>{children}</UserInfoContext.Provider>;
}

export function useUserInfoContext() {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error('useUserInfoContext must be used within a UserInfoProvider');
  }
  return context;
}
