'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function getSafeReturnPath() {
  const returnPath = sessionStorage.getItem('oauth_return_path');

  if (!returnPath) {
    return '/';
  }

  if (!returnPath.startsWith('/') || returnPath.startsWith('//')) {
    return '/';
  }

  return returnPath;
}

export function OAuthToast() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success');
    const oauthError = searchParams.get('oauth_error');
    const serverName = searchParams.get('server');

    if (oauthSuccess !== 'true' && !oauthError) {
      return;
    }

    const returnPath = getSafeReturnPath();
    sessionStorage.removeItem('oauth_return_path');

    if (oauthSuccess === 'true') {
      toast.success(serverName ? `已成功连接 "${serverName}"` : 'OAuth 连接成功', {
        duration: 5000,
        id: 'oauth-toast',
      });
    }

    if (oauthError) {
      toast.error(`OAuth 错误：${oauthError}`, {
        duration: 5000,
        id: 'oauth-toast',
      });
    }

    router.replace(returnPath, { scroll: false });
  }, [router, searchParams]);

  return null;
}
