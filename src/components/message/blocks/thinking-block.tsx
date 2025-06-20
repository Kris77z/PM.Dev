'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Brain } from 'lucide-react';
import { ThinkingMessageBlock } from '@/types/message';

interface ThinkingBlockProps {
  block: ThinkingMessageBlock;
  className?: string;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  block,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(block.visible || false);

  return (
    <div className={`thinking-block my-4 ${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-2"
      >
        <Brain className="w-4 h-4" />
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span>{isVisible ? '隐藏思考过程' : '显示思考过程'}</span>
      </button>
      
      {isVisible && (
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
};

export default ThinkingBlock; 