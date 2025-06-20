'use client';

import { Copy } from "lucide-react";
import { Button } from "./button";
import { CopyButton } from "../message/copy-button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

interface ResearchReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportContent: string;
  userQuery: string;
}

export function ResearchReportModal({ isOpen, onClose, reportContent, userQuery }: ResearchReportModalProps) {
  if (!isOpen) return null;



  // 自定义代码组件 - 和 MainTextBlock 保持一致
  const CodeComponent: React.ComponentType<React.HTMLAttributes<HTMLElement> & { inline?: boolean }> = ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');

    if (!inline && language) {
      return (
        <div className="relative group my-4 w-full max-w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          {/* 代码块头部 */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              {language || 'text'}
            </span>
            <CopyButton 
              text={code}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            />
          </div>
          {/* 代码内容 */}
          <div className="relative">
            <SyntaxHighlighter
              language={language}
              style={oneLight}
              customStyle={{
                margin: 0,
                maxHeight: '400px',
                fontSize: '13px',
                lineHeight: '1.6',
                background: '#1e1e1e',
                padding: '16px'
              }}
              showLineNumbers={code.split('\n').length > 5}
              wrapLines={true}
              wrapLongLines={true}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    }

    // 内联代码
    return (
      <code 
        className="px-1.5 py-0.5 text-sm bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded font-mono"
        {...props}
      >
        {children}
      </code>
    );
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportContent);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl max-h-[90vh] w-full flex flex-col">
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">研究报告</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCopyReport}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="复制报告"
            >
              <Copy className="h-4 w-4" />
            </button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="max-w-none leading-relaxed">
            {/* 报告标题 */}
            <h1 className="text-3xl font-bold text-black mb-6">
              {userQuery}
            </h1>
            
            {/* 报告内容 - 使用和chat相同的ReactMarkdown渲染 */}
            <div className="text-base leading-relaxed markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                components={{
                  code: CodeComponent,
                  // 自定义链接样式
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  // 自定义标题样式 - 移除多余边距
                  h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 first:mt-0 last:mb-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2 first:mt-0 last:mb-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1 first:mt-0 last:mb-0">{children}</h3>,
                  // 优化列表样式 - 修复换行问题
                  ul: ({ children }) => <ul className="list-disc pl-6 my-2 space-y-1 first:mt-0 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 my-2 space-y-1 first:mt-0 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  // 自定义段落样式 - 减少边距
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  // 自定义表格样式
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 first:mt-0 last:mb-0">
                      <table className="min-w-full border border-gray-200 dark:border-gray-700">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-medium text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                      {children}
                    </td>
                  ),
                  // 自定义引用样式
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 italic text-gray-700 dark:text-gray-300 first:mt-0 last:mb-0">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {reportContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 