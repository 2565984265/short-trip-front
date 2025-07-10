'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';

// 定义指南数据类型
interface Guide {
  id: string;
  title: string;
  author: string;
  date: string;
  rating: number;
  views: number;
  category: string;
  imageUrl: string;
  excerpt: string;
}

// 模拟指南数据
const mockGuides: Guide[] = [
  {
    id: '1',
    title: '北京周边露营完全指南',
    author: '户外达人小李',
    date: '2023-10-15',
    rating: 4.8,
    views: 1243,
    category: '露营',
    imageUrl: '/images/guides/camping.jpg',
    excerpt: '详细介绍北京周边10个最佳露营地点，包含装备清单和注意事项',
  },
  {
    id: '2',
    title: '城市徒步路线规划技巧',
    author: '徒步爱好者老王',
    date: '2023-09-28',
    rating: 4.6,
    views: 876,
    category: '徒步',
    imageUrl: '/images/guides/hiking.jpg',
    excerpt: '如何规划一条安全又有趣的城市徒步路线，适合初学者的实用技巧',
  },
  {
    id: '3',
    title: '骑行装备选购指南',
    author: '骑行专家小张',
    date: '2023-11-02',
    rating: 4.9,
    views: 1567,
    category: '骑行',
    imageUrl: '/images/guides/cycling.jpg',
    excerpt: '从入门到专业的骑行装备选购建议，帮你避开常见误区',
  },
  {
    id: '4',
    title: '摄影技巧：如何拍出绝美风景照',
    author: '摄影大师小陈',
    date: '2023-08-17',
    rating: 4.7,
    views: 2134,
    category: '摄影',
    imageUrl: '/images/guides/photography.jpg',
    excerpt: '掌握这些摄影技巧，让你的旅行照片在朋友圈脱颖而出',
  },
  {
    id: '5',
    title: '轻量化旅行打包指南',
    author: '旅行达人小赵',
    date: '2023-10-30',
    rating: 4.5,
    views: 987,
    category: '旅行',
    imageUrl: '/images/guides/packing.jpg',
    excerpt: '如何在不牺牲舒适度的前提下，实现真正的轻量化旅行',
  },
  {
    id: '6',
    title: '户外急救知识大全',
    author: '急救专家刘医生',
    date: '2023-09-05',
    rating: 4.9,
    views: 3210,
    category: '安全',
    imageUrl: '/images/guides/firstaid.jpg',
    excerpt: '户外旅行必备的急救知识，关键时刻能救自己也能帮别人',
  },
];

// 提取所有分类
const allCategories = ['全部', ...Array.from(new Set(mockGuides.map(guide => guide.category)))];

// 排序选项
const sortOptions = [
  { value: 'rating', label: '评分从高到低' },
  { value: 'newest', label: '最新发布' },
  { value: 'popular', label: '最多浏览' },
];

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>(mockGuides);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedSort, setSelectedSort] = useState('rating');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 应用筛选和排序
  useEffect(() => {
    let result = [...mockGuides];

    // 搜索筛选
    if (searchTerm) {
      result = result.filter(guide => 
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        guide.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 分类筛选
    if (selectedCategory !== '全部') {
      result = result.filter(guide => guide.category === selectedCategory);
    }

    // 排序
    switch (selectedSort) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    setGuides(result);
  }, [searchTerm, selectedCategory, selectedSort]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">旅行指南</h1>
        <p className="text-lg text-gray-600">探索专业的旅行攻略和技巧，让你的每一次出行都更加完美</p>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 搜索框 */}
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="搜索指南..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* 排序下拉菜单 */}
          <div className="w-full md:w-auto">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* 移动端筛选按钮 */}
          <div className="md:hidden w-full">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {isFilterOpen ? '关闭筛选' : '打开筛选'}
            </button>
          </div>

          {/* 桌面端分类筛选 */}
          <div className={`hidden md:flex flex-wrap gap-2 ${isFilterOpen ? 'block' : 'hidden'} md:block`}>
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === category
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 指南列表 */}
      {guides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">没有找到符合条件的指南，请尝试其他搜索词或分类</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('全部');
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  );
}

// 指南卡片组件
function GuideCard({ guide }: { guide: Guide }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={guide.imageUrl}
          alt={guide.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
          {guide.category}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-500 transition-colors">
          {guide.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{guide.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{guide.author}</span>
          <span>{guide.date}</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{guide.rating}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <EyeIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">{guide.views}</span>
          </div>
          <button className="px-4 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors">
            阅读全文
          </button>
        </div>
      </div>
    </div>
  );
}