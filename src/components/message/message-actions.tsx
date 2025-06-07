'use client';

import React from 'react';
import { CopyButton } from './copy-button';

interface MessageActionsProps {
  content: string;
  role: 'user' | 'assistant';
  isGenerating?: boolean;
  className?: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  role,
  isGenerating = false,
  className = ''
}) => {
  // 如果正在生成中，不显示任何操作按钮
  if (isGenerating) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* AI消息：只显示复制按钮（内容生成完毕后显示） */}
      {role === 'assistant' && (
        <CopyButton 
          text={content}
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        />
      )}
    </div>
  );
}; 