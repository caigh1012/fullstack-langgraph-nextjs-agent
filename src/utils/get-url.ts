export function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (appUrl) {
    // Remove trailing slash for consistency
    return appUrl.replace(/\/$/, '');
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Production requires explicit configuration
  throw new Error(
    'NEXT_PUBLIC_APP_URL environment variable is required in production. ' +
      "Set it to your application's public URL (e.g., https://myapp.com)",
  );
}

export function toProtocolRelativeUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `//${url.replace(/^\/+/, '')}`;
}
