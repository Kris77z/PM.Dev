'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ErrorMessageBlock } from '@/types/message';

interface ErrorBlockProps {
  block: ErrorMessageBlock;
  className?: string;
}

export const ErrorBlock: React.FC<ErrorBlockProps> = ({
  block,
  className = ''
}) => {
  return (
    <div className={`error-block my-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            出现错误
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">
            {block.error}
          </div>
          {block.details && (
            <details className="mt-2">
              <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                查看详细信息
              </summary>
              <div className="mt-1 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded font-mono whitespace-pre-wrap">
                {block.details}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBlock; 