'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isPrimary?: boolean;
}

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}

// 导航链接组件
const NavLink = ({ href, children, isPrimary = false }: NavLinkProps) => (
  <Link
    href={href}
    className={`font-medium transition-colors hover:text-blue-500 ${isPrimary
      ? 'text-blue-500' 
      : 'text-gray-700'}
    `}
  >
    {children}
  </Link>
);

// 移动端导航链接组件
const MobileNavLink = ({ href, children, onClick }: MobileNavLinkProps) => (
  <Link
    href={href}
    className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 监听滚动事件，改变导航栏样式
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/90 backdrop-blur-md shadow-sm py-2'
        : 'bg-transparent py-4'}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo和标题 */}
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3 ${scrolled ? 'scale-100' : 'scale-110'}`}>
              <span className="text-white font-bold text-lg">旅</span>
            </div>
            <span className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 transition-all ${scrolled ? 'text-xl' : 'text-2xl'}`}>短途旅行</span>
          </div>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/">首页</NavLink>
            <NavLink href="/map">地图</NavLink>
            <NavLink href="/guides">指南</NavLink>
            <NavLink href="/planner" isPrimary>行程规划</NavLink>
          </nav>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-blue-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1">
            <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>首页</MobileNavLink>
            <MobileNavLink href="/map" onClick={() => setMobileMenuOpen(false)}>地图</MobileNavLink>
            <MobileNavLink href="/guides" onClick={() => setMobileMenuOpen(false)}>指南</MobileNavLink>
            <MobileNavLink href="/planner" onClick={() => setMobileMenuOpen(false)}>行程规划</MobileNavLink>
          </div>
        )}
      </div>
    </header>
  );
}