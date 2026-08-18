import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.3'],
  reactCompiler: true,
  reactStrictMode: false,
  logging: {
    browserToTerminal: true,
  },
};

export default nextConfig;
