'use client';

import React, { useState } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Edit, Save, X } from 'lucide-react';
import { CodeMessageBlock } from '@/types/message';

interface CodeBlockProps {
  block: CodeMessageBlock;
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  isGenerating?: boolean;
  onEdit?: (updates: Partial<CodeMessageBlock>) => void;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  onEdit,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(block.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit({ content: editContent });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(block.content);
    setIsEditing(false);
  };

  return (
    <div className={`code-block-container relative group my-4 w-full max-w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* 代码块头部 */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {block.language || 'text'}
          </span>
          {block.filename && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {block.filename}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {block.editable && onEdit && (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>保存</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>取消</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  <span>编辑</span>
                </button>
              )}
            </>
          )}
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>复制</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* 代码内容 */}
      <div className="relative">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-64 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
            style={{ fontSize: '13px', lineHeight: '1.6' }}
          />
        ) : (
          <div className="overflow-x-auto">
            <SyntaxHighlighter
              language={block.language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                maxHeight: '400px',
                fontSize: '13px',
                lineHeight: '1.6',
                background: '#1e1e1e',
                padding: '16px',
                minWidth: '100%',
                width: 'max-content',
                maxWidth: '100%',
                overflow: 'visible',
                whiteSpace: 'pre'
              }}
              showLineNumbers={block.content.split('\n').length > 5}
              wrapLines={false}
              wrapLongLines={false}
            >
              {block.content}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeBlock; 