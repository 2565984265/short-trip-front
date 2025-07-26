'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUser } from '@/contexts/UserContext';
import { getAvatarUrl } from '@/utils/avatar';

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
  const { user, logout, isAuthenticated } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 调试信息
  console.log('Navbar render - isAuthenticated:', isAuthenticated, 'user:', user);

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

  // 处理下拉菜单的延迟关闭
  const handleMouseEnter = () => {
    // 清除之前的延迟关闭定时器
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setUserDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // 设置延迟关闭定时器，1秒后关闭
    dropdownTimeoutRef.current = setTimeout(() => {
      setUserDropdownOpen(false);
    }, 1000);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
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
            <NavLink href="/community">社区</NavLink>
            <NavLink href="/kml-manager">KML管理</NavLink>
            <NavLink href="/ai">AI助手</NavLink>
            <NavLink href="/planner" isPrimary>行程规划</NavLink>
            
            {/* 用户认证状态 */}
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="relative"
                >
                  <button
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                  {/* 用户头像 */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {user?.avatar && getAvatarUrl(user.avatar) ? (
                      <img 
                        src={getAvatarUrl(user.avatar)!} 
                        alt="用户头像" 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          // 如果头像加载失败，隐藏图片显示默认图标
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    {(!user?.avatar || user.avatar === '' || !getAvatarUrl(user.avatar)) && (
                      <UserIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  {/* 用户昵称 */}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.nickname || user?.username}
                  </span>
                  
                  {/* 下拉箭头 */}
                  <ChevronDownIcon 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* 下拉菜单 */}
                <div 
                  className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transition-all duration-300 ${
                    userDropdownOpen 
                      ? 'opacity-100 translate-y-0 pointer-events-auto' 
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-3" />
                      查看个人资料
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      退出登录
                    </button>
                  </div>
                  </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                登录
              </Link>
            )}
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
            <MobileNavLink href="/community" onClick={() => setMobileMenuOpen(false)}>社区</MobileNavLink>
            <MobileNavLink href="/kml-manager" onClick={() => setMobileMenuOpen(false)}>KML管理</MobileNavLink>
            <MobileNavLink href="/ai" onClick={() => setMobileMenuOpen(false)}>AI助手</MobileNavLink>
            <MobileNavLink href="/planner" onClick={() => setMobileMenuOpen(false)}>行程规划</MobileNavLink>
            
            {/* 移动端用户认证状态 */}
            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="px-4 py-2">
                  <div className="flex items-center space-x-3 mb-3">
                    {/* 用户头像 */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      {user?.avatar && getAvatarUrl(user.avatar) ? (
                        <img 
                          src={getAvatarUrl(user.avatar)!} 
                          alt="用户头像" 
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            // 如果头像加载失败，隐藏图片显示默认图标
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      {(!user?.avatar || user.avatar === '' || !getAvatarUrl(user.avatar)) && (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {user?.nickname || user?.username}
                      </div>
                      <div className="text-xs text-gray-500">已登录</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-3" />
                      查看个人资料
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full py-2 px-4 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      退出登录
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block py-2 px-4 text-blue-600 hover:bg-blue-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}