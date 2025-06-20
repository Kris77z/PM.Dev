'use client';

import React, { useMemo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { MainTextMessageBlock } from '@/types/message';
import { TextShimmer } from '@/components/ui/text-shimmer';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import '@/styles/message.css';

interface MainTextBlockProps {
  block: MainTextMessageBlock;
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  isGenerating?: boolean;
  onEdit?: (updates: Partial<MainTextMessageBlock>) => void;
  className?: string;
}

// 打字机效果组件
const TypewriterText: React.FC<{
  content: string;
  speed?: number;
  onComplete?: () => void;
}> = ({ content, speed = 20, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!content) return;

    let index = 0;
    setDisplayedContent('');
    setIsTyping(true);

    const timer = setInterval(() => {
      if (index >= content.length) {
        clearInterval(timer);
        setIsTyping(false);
        onComplete?.();
        return;
      }

      setDisplayedContent(content.slice(0, index + 1));
      index++;
    }, speed);

    return () => clearInterval(timer);
  }, [content, speed, onComplete]);

  return (
    <>
      {displayedContent}
      {isTyping && (
        <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-500 ml-1 animate-pulse" />
      )}
    </>
  );
};

export const MainTextBlock: React.FC<MainTextBlockProps> = ({
  block,
  messageId: _messageId,
  role,
  isGenerating = false,
  onEdit: _onEdit,
  className = ''
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [hasShownTypewriter, setHasShownTypewriter] = useState(false);

  // 根据主题决定代码高亮样式
  const codeStyle = vscDarkPlus; // 可以根据主题切换

  // 内容预处理：移除引用但保持格式
  const processedContent = useMemo(() => {
    if (!block.content) return '';
    
    return block.content
      // 移除文献引用格式
      .replace(/文献\[\d+\]"[^"]*"/g, '')
      .replace(/\[\d+\]/g, '')
      // 移除引用链接
      .replace(/\s*-\s*https?:\/\/[^\s]+/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      // 清理多余的空格，但保留段落结构
      .replace(/ +/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, [block.content]);

  // 检查是否是新消息（创建时间在5秒内）
  const isNewMessage = useMemo(() => {
    const now = new Date().getTime();
    const createdAt = block.createdAt instanceof Date ? block.createdAt.getTime() : new Date(block.createdAt).getTime();
    return (now - createdAt) < 5000; // 5秒内认为是新消息
  }, [block.createdAt]);

  // 只对新消息且内容首次出现且不在生成中时，启用打字机效果
  useEffect(() => {
    if (!isGenerating && processedContent && isNewMessage && !hasShownTypewriter && !typewriterComplete) {
      setShowTypewriter(true);
      setHasShownTypewriter(true);
    } else if (!isNewMessage) {
      // 如果不是新消息，直接标记为完成
      setTypewriterComplete(true);
      setHasShownTypewriter(true);
    }
  }, [isGenerating, processedContent, isNewMessage, hasShownTypewriter, typewriterComplete]);

  // 复制代码功能
  const handleCopyCode = async (code: string, language: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(`${language}-${code.slice(0, 50)}`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // 自定义代码组件
  const CodeComponent = ({ inline, className, children, ...props }: {
    inline?: boolean;
    className?: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');
    const codeId = `${language}-${code.slice(0, 50)}`;

    if (!inline && language) {
      return (
        <div className="relative group my-4 w-full max-w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          {/* 代码块头部 */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              {language || 'text'}
            </span>
            <button
              onClick={() => handleCopyCode(code, language)}
              className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {copiedCode === codeId ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>复制</span>
                </>
              )}
            </button>
          </div>
          
          {/* 代码内容 */}
          <div className="relative">
            <SyntaxHighlighter
              language={language}
              style={codeStyle}
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

  // 思考块渲染
  if (block.type === 'thinking') {
    return (
      <div className={`thinking-block ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {showThinking ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showThinking ? '隐藏思考过程' : '显示思考过程'}</span>
          </button>
        </div>
        
        {showThinking && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
              💭 AI 思考过程
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap">
              {block.content}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 生成中状态
  if (isGenerating && !block.content) {
    return (
      <div className={`text-sm leading-relaxed ${className}`}>
        <TextShimmer duration={1.5} spread={1}>
          正在思考中...
        </TextShimmer>
      </div>
    );
  }

  // 用户消息简单文本渲染
  if (role === 'user') {
    return (
      <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${className}`}>
        {block.content}
      </div>
    );
  }

  // AI消息Markdown渲染 - 支持打字机效果
  return (
    <div className={`markdown-content ${className}`}>
      {showTypewriter && !typewriterComplete ? (
        // 打字机效果显示纯文本（不使用 Markdown）
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          <TypewriterText
            content={processedContent}
            speed={30}
            onComplete={() => {
              setTypewriterComplete(true);
              setShowTypewriter(false);
            }}
          />
        </div>
      ) : (
        // 正常 Markdown 渲染
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
          components={{
            code: CodeComponent,
            // 自定义链接样式
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                {...props}
              >
                {children}
              </a>
            ),
            // 自定义表格样式
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm" {...props}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children, ...props }) => (
              <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left text-sm" {...props}>
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm" {...props}>
                {children}
              </td>
            ),
            // 自定义标题样式
            h1: ({ children, ...props }) => (
              <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0" {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-base font-bold mt-3 mb-2 first:mt-0" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-sm font-bold mt-3 mb-2 first:mt-0" {...props}>
                {children}
              </h3>
            ),
            // 自定义段落样式
            p: ({ children, ...props }) => (
              <p className="mb-2 last:mb-0" {...props}>
                {children}
              </p>
            ),
            // 自定义列表样式
            ul: ({ children, ...props }) => (
              <ul className="list-disc list-inside space-y-1 mb-2 last:mb-0 ml-4" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal list-inside space-y-1 mb-2 last:mb-0 ml-4" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="text-sm leading-relaxed" {...props}>
                {children}
              </li>
            ),
            // 自定义引用样式
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-3" {...props}>
                {children}
              </blockquote>
            ),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      )}
    </div>
  );
};

export default MainTextBlock; 