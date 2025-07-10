import Link from 'next/link';
import Image from 'next/image';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

// 页脚链接组件
const FooterLink = ({ href, children }: FooterLinkProps) => (
  <Link
    href={href}
    className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm"
  >
    {children}
  </Link>
);

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="text-white"
                />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">短途旅行</span>
            </div>
            <p className="text-gray-500 text-sm">
              发现完美短途旅行，探索身边的美好世界
            </p>
          </div>

          {/* 功能链接 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">功能</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/map">旅行地图</FooterLink></li>
              <li><FooterLink href="/guides">旅行指南</FooterLink></li>
              <li><FooterLink href="/routes">推荐路线</FooterLink></li>
              <li><FooterLink href="/planner">行程规划</FooterLink></li>
            </ul>
          </div>

          {/* 支持链接 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">支持</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/help">帮助中心</FooterLink></li>
              <li><FooterLink href="/about">关于我们</FooterLink></li>
              <li><FooterLink href="/contact">联系我们</FooterLink></li>
              <li><FooterLink href="/feedback">意见反馈</FooterLink></li>
            </ul>
          </div>

          {/* 法律链接 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">法律</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/terms">服务条款</FooterLink></li>
              <li><FooterLink href="/privacy">隐私政策</FooterLink></li>
              <li><FooterLink href="/cookies">Cookie政策</FooterLink></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© 2023 短途旅行. 保留所有权利.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <FooterLink href="/social/weibo">微博</FooterLink>
            <FooterLink href="/social/wechat">微信</FooterLink>
            <FooterLink href="/social/instagram">Instagram</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}