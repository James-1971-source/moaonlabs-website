import type { NextConfig } from 'next';
const nextConfig: NextConfig = { output: 'export', images: { unoptimized: true }, turbopack: { root: process.cwd() }, poweredByHeader: false, trailingSlash: true };
export default nextConfig;
