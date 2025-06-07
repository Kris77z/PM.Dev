'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './code-block';

// 导入KaTeX CSS
import 'katex/dist/katex.min.css';
// 导入代码高亮CSS
import 'highlight.js/styles/github.css';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`markdown-content break-words overflow-hidden ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
        components={{
          // 自定义代码块渲染
          code(props: any) {
            const { inline, className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language) {
              return (
                <CodeBlock
                  language={language}
                  code={String(children).replace(/\n$/, '')}
                />
              );
            }
            
            // 内联代码
            return (
              <code 
                className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400 break-all"
                {...rest}
              >
                {children}
              </code>
            );
          },
          
          // 自定义链接渲染
          a({ href, children, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                {...props}
              >
                {children}
              </a>
            );
          },
          
          // 自定义表格渲染
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table 
                  className="min-w-full border-collapse border border-gray-300 dark:border-gray-600"
                  {...props}
                >
                  {children}
                </table>
              </div>
            );
          },
          
          th({ children, ...props }) {
            return (
              <th 
                className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-left font-semibold break-words"
                {...props}
              >
                {children}
              </th>
            );
          },
          
          td({ children, ...props }) {
            return (
              <td 
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 break-words"
                {...props}
              >
                {children}
              </td>
            );
          },
          
          // 自定义引用块渲染
          blockquote({ children, ...props }) {
            return (
              <blockquote 
                className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-700 dark:text-gray-300 break-words"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          
          // 自定义列表渲染
          ul({ children, ...props }) {
            return (
              <ul 
                className="list-disc list-inside my-4 space-y-1 break-words"
                {...props}
              >
                {children}
              </ul>
            );
          },
          
          ol({ children, ...props }) {
            return (
              <ol 
                className="list-decimal list-inside my-4 space-y-1 break-words"
                {...props}
              >
                {children}
              </ol>
            );
          },
          
          // 自定义标题渲染
          h1({ children, ...props }) {
            return (
              <h1 
                className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100 break-words"
                {...props}
              >
                {children}
              </h1>
            );
          },
          
          h2({ children, ...props }) {
            return (
              <h2 
                className="text-xl font-bold mt-5 mb-3 text-gray-900 dark:text-gray-100 break-words"
                {...props}
              >
                {children}
              </h2>
            );
          },
          
          h3({ children, ...props }) {
            return (
              <h3 
                className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100 break-words"
                {...props}
              >
                {children}
              </h3>
            );
          },
          
          // 自定义段落渲染
          p({ children, ...props }) {
            return (
              <p 
                className="my-3 leading-relaxed text-gray-800 dark:text-gray-200 break-words"
                {...props}
              >
                {children}
              </p>
            );
          },
          
          // 自定义分割线渲染
          hr({ ...props }) {
            return (
              <hr 
                className="my-6 border-gray-300 dark:border-gray-600"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}; 