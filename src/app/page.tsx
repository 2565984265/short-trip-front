'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const { user, isAuthenticated } = useUser();
  
  // 调试信息
  console.log('Home page render - isAuthenticated:', isAuthenticated, 'user:', user);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 pt-28 pb-16">
        {/* 英雄区域 - 增强视觉效果和动画 */}
        <div className="text-center mb-20 max-w-4xl mx-auto animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            发现你的完美<span className="text-blue-600">短途旅行</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            结合AI能力与创作者社区，打造轻量、高效、真实、有趣的短途旅行规划平台
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PrimaryButton href="/map">开始探索地图</PrimaryButton>
                            <SecondaryButton href="/guides">浏览指南</SecondaryButton>
            <TertiaryButton href="/community">加入社区</TertiaryButton>
            <TertiaryButton href="/ai/assistant">AI助手</TertiaryButton>
          </div>
          
          {/* 用户状态提示 - 仅对未登录用户显示 */}
          {!isAuthenticated && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-center">
                💡 登录后可以保存个人偏好、收藏指南、参与社区讨论
                <Link href="/login" className="ml-2 text-blue-600 hover:text-blue-800 font-medium underline">
                  立即登录
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* 功能特色 - 增强卡片设计和交互效果 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[{
            icon: '🗺️',
            title: '智能地图',
            desc: '基于OpenStreetMap的轻量级地图，支持景点标注、路线规划、补给点标记等功能',
            href: '/map',
            color: 'from-red-500 to-pink-500'
          }, {
            icon: '🤖',
            title: 'AI规划',
            desc: '智能路线推荐，根据你的时间、偏好和出行方式，生成个性化旅行方案',
            href: '/ai/assistant',
            color: 'from-green-500 to-teal-500'
          }, {
            icon: '📖',
                    title: '指南中心',
        desc: '精选旅行指南，包含详细路线、装备建议、注意事项，助你轻松规划行程',
            href: '/guides',
            color: 'from-orange-500 to-amber-500'
          }, {
            icon: '👥',
            title: '社区分享',
            desc: '创作者分享真实路线指南，支持图文、视频内容，打造活跃的旅行社区',
            href: '/community',
            color: 'from-purple-500 to-indigo-500'
          }].map((item, index) => (
            <FeatureCard key={index} {...item} />
          ))}
        </div>

        {/* 出行方式 - 改进布局和视觉效果 */}
        <div className="mb-20 scroll-mt-24" id="travel-modes">
          <SectionTitle>支持多种出行方式</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {[
              { icon: '🚶', name: '徒步', desc: '适合短距离探索' },
              { icon: '🚴', name: '骑行', desc: '灵活自由的出行' },
              { icon: '🏍️', name: '摩托', desc: '速度与激情' },
              { icon: '🚗', name: '自驾', desc: '舒适便捷' },
              { icon: '🏕️', name: '房车', desc: '移动的家' },
            ].map((item, index) => (
              <TravelModeCard key={index} {...item} />
            ))}
          </div>
        </div>

        {/* 快速开始 - 增强视觉层次和交互 */}
        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow mb-16 scroll-mt-24" id="quick-start">
          <SectionTitle>快速开始</SectionTitle>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {[
              { step: '1', title: '选择目的地', desc: '输入你的出发地和目的地，或选择感兴趣的区域' },
              { step: '2', title: '设置偏好', desc: '选择出行方式、时间安排和兴趣偏好' },
              { step: '3', title: '获取路线', desc: 'AI为你生成个性化路线，包含景点、补给点等' },
            ].map((item, index) => (
              <StepCard key={index} {...item} />
            ))}
          </div>
          <div className="text-center mt-10">
            <PrimaryButton href="/map" size="lg">立即开始规划</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// 导航链接组件
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  secondary?: boolean;
}

function NavLink({ href, children, primary = false, secondary = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 font-medium transition-all duration-200 ${primary
        ? 'bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md'
        : secondary
        ? 'bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:shadow-md'
        : 'text-gray-700 hover:text-blue-600'}
      `}
    >
      {children}
    </Link>
  );
}

// 移动端导航链接
interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  secondary?: boolean;
}

function MobileNavLink({ href, children, primary = false, secondary = false }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`block px-4 py-3 rounded-lg transition-all ${primary
        ? 'bg-blue-600 text-white'
        : secondary
        ? 'bg-purple-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'}
      `}
    >
      {children}
    </Link>
  );
}

// 主要按钮组件
interface PrimaryButtonProps {
  href: string;
  children: React.ReactNode;
  size?: 'md' | 'lg';
}

function PrimaryButton({ href, children, size = 'md' }: PrimaryButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5';
  const sizes = {
    md: 'px-8 py-4 text-lg',
    lg: 'px-10 py-5 text-xl'
  };

  return (
    <Link href={href} className={`${baseClasses} ${sizes[size]}`}>
      {children}
    </Link>
  );
}

// 次要按钮组件
interface SecondaryButtonProps {
  href: string;
  children: React.ReactNode;
}

function SecondaryButton({ href, children }: SecondaryButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg transition-all duration-200 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-md transform hover:-translate-y-0.5"
    >
      {children}
    </Link>
  );
}

// 第三按钮组件
interface TertiaryButtonProps {
  href: string;
  children: React.ReactNode;
}

function TertiaryButton({ href, children }: TertiaryButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg transition-all duration-200 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 hover:shadow-md transform hover:-translate-y-0.5"
    >
      {children}
    </Link>
  );
}

// 功能特色卡片组件
interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
  href: string;
  color: string;
}

function FeatureCard({ icon, title, desc, href, color }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-5 text-white text-2xl shadow-md`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-gray-600 mb-5">{desc}</p>
      <Link href={href} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group-hover:translate-x-1 transition-transform">
        开始探索 →
      </Link>
    </div>
  );
}

// 出行方式卡片组件
interface TravelModeCardProps {
  icon: string;
  name: string;
  desc: string;
}

function TravelModeCard({ icon, name, desc }: TravelModeCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:border-blue-200 border border-transparent">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="font-semibold text-gray-900 text-lg mb-1">{name}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </div>
  );
}

// 步骤卡片组件
interface StepCardProps {
  step: string;
  title: string;
  desc: string;
}

function StepCard({ step, title, desc }: StepCardProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold shadow-md">
        {step}
      </div>
      <h3 className="font-semibold text-gray-900 text-xl mb-3">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

// 页脚链接组件
interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className="block text-gray-400 hover:text-white mb-2 transition-colors"
    >
      {children}
    </Link>
  );
}

//  section标题组件
interface SectionTitleProps {
  children: React.ReactNode;
}

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
      {children}
    </h2>
  );
}
