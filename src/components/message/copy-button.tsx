'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
  copied?: boolean;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ 
  text, 
  onCopy,
  copied: externalCopied,
  className = '' 
}) => {
  const [internalCopied, setInternalCopied] = useState(false);
  const copied = externalCopied !== undefined ? externalCopied : internalCopied;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      if (externalCopied === undefined) {
        setInternalCopied(true);
        setTimeout(() => setInternalCopied(false), 2000);
      }
      onCopy?.();
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-1 px-2 py-1 text-xs
        bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700
        text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
        rounded transition-colors duration-200
        ${className}
      `}
      title={copied ? '已复制!' : '复制代码'}
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
  );
}; 