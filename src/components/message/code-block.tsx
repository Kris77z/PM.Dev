'use client';

import React, { useState } from 'react';
import { CopyButton } from './copy-button';

interface CodeBlockProps {
  language: string;
  code: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language, 
  code, 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className={`relative group my-4 ${className}`}>
      {/* 代码块头部 */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {language || 'text'}
        </span>
        <CopyButton 
          text={code}
          onCopy={() => setCopied(true)}
          copied={copied}
        />
      </div>
      
      {/* 代码内容 */}
      <div className="relative">
        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm leading-relaxed">
          <code className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}; 