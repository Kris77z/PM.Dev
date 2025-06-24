'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';
import '@/styles/markdown.css';

// 自定义表格列宽配置 - 用户可以根据需要调整
const tableColumnConfigs = {
  'user-scenarios': {
    minWidth: '1800px',
    columns: [
      { width: '100px' }, // 用户类型
      { width: '220px' }, // 使用场景 
      { width: '220px' }, // 痛点分析 
      { width: '120px' }, // 期望功能
      { width: '120px' }  // 使用频率
    ]
  },
  'competitors': {
    minWidth: '1800px',
    columns: [
      { width: '120px' }, // 产品名称
      { width: '320px' }, // 功能特点 
      { width: '220px' }, // 主要优势 
      { width: '220px' }, // 不足之处 
      { width: '220px' }, // 市场地位 
      { width: '120px' }, // 定价策略 
      { width: '120px' }  // 用户评价 
    ]
  },
  'requirements': {
    minWidth: '1800px',
    columns: [
      { width: '180px' }, // 需求名称
      { width: '80px' },  // 优先级
      { width: '220px' }, // 功能点/流程 
      { width: '180px' }, // 业务逻辑 
      { width: '180px' }, // 数据需求 
      { width: '180px' }, // 边缘处理 
      { width: '220px' }, // 解决痛点  
      { width: '220px' }, // 对应模块 
      { width: '220px' }  // 验收标准 
    ]
  }
};

// 生成动态列宽样式
const generateTableStyles = () => {
  let styles = '';
  
  Object.entries(tableColumnConfigs).forEach(([tableName, config]) => {
    config.columns.forEach((col, index) => {
      const colNum = index + 1;
      styles += `
        .table-${tableName} th:nth-child(${colNum}),
        .table-${tableName} td:nth-child(${colNum}) {
          width: ${col.width};
          min-width: ${col.width};
        }
      `;
    });
    
    // 第一列永远不换行
    styles += `
      .table-${tableName} th:nth-child(1),
      .table-${tableName} td:nth-child(1) {
        white-space: nowrap !important;
      }
    `;
  });
  
  // 滚动条样式优化 - 滑块默认隐藏，滚动时显示，去除边框
  styles += `
    .scrollable-table {
      border: 1px solid rgb(229, 231, 235);
      border-radius: 0.5rem;
      background: white;
    }
    
    .scrollable-table::-webkit-scrollbar {
      height: 8px;
      background: transparent;
    }
    
    .scrollable-table::-webkit-scrollbar-track {
      background: transparent;
      border: none;
      outline: none;
    }
    
    .scrollable-table::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      border: none;
      outline: none;
      transition: background 0.2s ease;
    }
    
    .scrollable-table:hover::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.3);
    }
    
    .scrollable-table::-webkit-scrollbar-thumb:active {
      background: rgba(0, 0, 0, 0.5);
    }
    
    .scrollable-table::-webkit-scrollbar-corner {
      background: transparent;
      border: none;
      outline: none;
    }
    
    /* 简单表格样式 - 与滚动表格保持一致 */
    .simple-table-wrapper {
      border: 1px solid rgb(229, 231, 235);
      border-radius: 0.5rem;
      background: white;
      margin: 1.5rem 0;
    }
  `;
  
  return styles;
};

interface PRDDocumentDisplayProps {
  content: string;
  onCopy?: () => void;
  onDownload?: () => void;
}

export const PRDDocumentDisplay: React.FC<PRDDocumentDisplayProps> = ({
  content,
  onCopy,
  onDownload
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // 内容预处理：清理杂乱符号，保持结构
  const processedContent = useMemo(() => {
    if (!content) return '';
    
    return content
      // 移除多余的引号和符号
      .replace(/^\"|\"$/g, '')
      .replace(/\"\"/g, '"')
      .replace(/\*\*/g, '')
      .replace(/\\\*/g, '*')
      .replace(/\\"/g, '"')
      // 清理JSON格式残留
      .replace(/\{|\}/g, '')
      .replace(/\[|\]/g, '')
      .replace(/,\s*"/g, '\n"')
      // 移除第一行的主标题
      .replace(/^#\s*产品需求文档\s*\n/g, '')
      // 优化标题格式 - 数字序号的保持为二级标题
      .replace(/^(\d+\.)\s*([^\n]+)/gm, '## $1 $2')
      // 带编号的功能点改为正文格式，不是标题
      .replace(/^(\d+\.\s*[^:：\n]*[:：])\s*([^\n]+)/gm, '**$1** $2')
      // 中文序号保持三级标题
      .replace(/^([一二三四五六七八九十]+[、.])\s*([^\n]+)/gm, '### $1 $2')
      // 优化列表格式，减少符号使用
      .replace(/^•\s*([^•\n]*)\s*[:：]\s*/gm, '**$1：** ')
      .replace(/^-\s*([^-\n]*)\s*[:：]\s*/gm, '**$1：** ')
      .replace(/^\*\s*([^*\n]*)\s*[:：]\s*/gm, '**$1：** ')
      // 处理剩余的简单列表符号
      .replace(/^•\s+/gm, '- ')
      .replace(/^-\s+-\s+/gm, '- ')
      .replace(/^\*\s+/gm, '- ')
      // 清理多余的空格和换行
      .replace(/ +/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();
  }, [content]);

  // 分段处理内容
  const contentSections = useMemo(() => {
    const sections = processedContent.split(/(?=##\s)/);
    return sections.filter(section => section.trim().length > 0);
  }, [processedContent]);



  // 复制整个文档
  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(processedContent);
      setCopiedSection('all');
      setTimeout(() => setCopiedSection(null), 2000);
      onCopy?.();
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="w-full max-w-none">
      {/* 动态样式注入 */}
      <style>{generateTableStyles()}</style>
      
      {/* 文档操作栏 */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900">产品需求文档</h3>
          <p className="text-gray-500 mt-1">您的PRD文档已生成完成</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors"
            title="复制全文"
          >
            {copiedSection === 'all' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onDownload}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors"
            title="下载文档"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 文档内容 */}
      <div className="space-y-10">
        {contentSections.map((section, index) => {
          const sectionId = `section-${index}`;
          
          return (
            <div 
              key={sectionId}
              className="prose prose-gray max-w-none"
            >
              {/* 段落内容 */}
              <div>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // 支持HTML div标签 - 区分简单表格和滚动表格
                    div: ({ children, style, className, ...props }: React.ComponentProps<'div'> & { 'data-table'?: string }) => {
                      // 检查是否是表格滚动容器
                      if (style && typeof style === 'object' && 'overflowX' in style && style.overflowX === 'auto') {
                        const tableType = props['data-table'];
                        const config = tableColumnConfigs[tableType as keyof typeof tableColumnConfigs];
                        const tableClass = tableType ? `table-${tableType}` : '';
                        
                        return (
                          <div className="overflow-x-auto scrollable-table my-6">
                            <div style={{ minWidth: config?.minWidth || '1000px' }}>
                              <div className={tableClass}>
                                {children}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      // 检查是否是简单表格容器
                      if (className === 'simple-table') {
                        return (
                          <div className="simple-table-wrapper">
                            <div className="overflow-hidden">
                              {children}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div {...props} style={style} className={className}>
                          {children}
                        </div>
                      );
                    },
                    // 标题样式 - 参考FAQ清晰层级
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-8 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium text-gray-800 mb-3 mt-6">
                        {children}
                      </h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-base font-medium text-gray-700 mb-2 mt-4">
                        {children}
                      </h4>
                    ),
                    // 段落样式 - 参考FAQ段落间距
                    p: ({ children }) => (
                      <p className="text-gray-900 text-sm leading-[2.8] mb-6 last:mb-0">
                        {children}
                      </p>
                    ),
                    // 列表样式 - 简洁无缩进
                    ul: ({ children }) => (
                      <ul className="space-y-2 mb-6">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-2 mb-6">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-900 text-sm leading-[2.8]">
                        {children}
                      </li>
                    ),
                    // 强调样式
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">
                        {children}
                      </strong>
                    ),
                    // 引用样式
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 py-2 bg-gray-50 text-gray-900 text-sm my-6">
                        {children}
                      </blockquote>
                    ),
                    // 表格样式 - 动态选择布局方式
                    table: ({ children }) => (
                      <table className="w-full" style={{ tableLayout: 'fixed' }}>
                        {children}
                      </table>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-gray-50">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 bg-gray-50">
                        <div className="whitespace-nowrap">
                          {children}
                        </div>
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                        <div 
                          className="whitespace-normal break-words" 
                          style={{ 
                            wordBreak: 'break-word', 
                            overflowWrap: 'break-word',
                            lineHeight: '1.5',
                            hyphens: 'auto'
                          }}
                        >
                          {children}
                        </div>
                      </td>
                    ),
                  }}
                >
                  {section}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}

        {/* 如果内容为空 */}
        {contentSections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>PRD文档内容将在这里显示</p>
          </div>
        )}
      </div>

      {/* 文档结尾信息 */}
      {processedContent && (
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            本文档由 PM.DEV 自动生成 • {new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      )}
    </div>
  );
}; 