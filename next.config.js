/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用严格模式
  reactStrictMode: false,
  
  // 简化 webpack 配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
