import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // 添加webpack配置以避免构建错误
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // 优化构建
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };
    
    return config;
  },
  
  // 其他配置
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  
  // 输出配置
  output: 'standalone',
};

export default nextConfig;
