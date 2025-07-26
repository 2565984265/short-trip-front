'use client';

import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

// 富文本显示组件
export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '' 
}) => {
  // 处理换行符并转换为 HTML
  const formatContent = (text: string) => {
    if (!text) return '';
    
    // 将换行符转换为 <br> 标签
    return text
      .replace(/\n/g, '<br>')
      .replace(/\r\n/g, '<br>')
      .replace(/\r/g, '<br>');
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: formatContent(content) 
      }}
    />
  );
};

// 富文本编辑器组件（可选，如果需要编辑功能）
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入内容...',
  className = ''
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] ${className}`}
      rows={5}
    />
  );
};

export default RichTextEditor; 