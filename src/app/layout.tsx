import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '旅行轻指南 - 短途旅行规划平台',
  description: '结合AI能力与创作者社区，打造轻量、高效、真实、有趣的短途旅行规划平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 添加错误处理脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 全局错误处理 - 仅在客户端执行
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  console.warn('全局错误:', e.error);
                  // 如果是 React 相关的错误，尝试阻止传播
                  if (e.error && e.error.message && e.error.message.includes('Cannot read properties of null')) {
                    console.warn('检测到 React 错误，尝试处理...');
                    e.preventDefault();
                    return false;
                  }
                });
                
                // 未处理的 Promise 错误
                window.addEventListener('unhandledrejection', function(e) {
                  console.warn('未处理的 Promise 错误:', e.reason);
                  e.preventDefault();
                });
                
                // 确保在客户端环境
                window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
                window.__NEXT_DATA__.isClient = true;
                console.log('客户端环境已初始化');
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
