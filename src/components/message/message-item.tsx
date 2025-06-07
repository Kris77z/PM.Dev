'use client';

import React from 'react';
import { MarkdownContent } from './markdown-content';
import { MessageActions } from './message-actions';
import { TextShimmer } from '@/components/ui/text-shimmer';

interface MessageItemProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
  className?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  role,
  content,
  timestamp,
  isGenerating = false,
  className = ''
}) => {
  return (
    <div className={`group flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-8 ${className}`}>
      <div className={`max-w-[85%] ${role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
        {/* 消息气泡 */}
        <div
          className={`rounded-2xl px-4 py-3 break-words ${
            role === 'user'
              ? 'bg-black text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
        >
          {/* 消息内容 */}
          <div className="text-sm leading-relaxed break-words overflow-hidden">
            {role === 'assistant' ? (
              <MarkdownContent content={content} />
            ) : (
              <div className="whitespace-pre-wrap break-words">{content}</div>
            )}
          </div>
        </div>
        
        {/* 生成状态或时间戳和操作按钮 */}
        <div className="mt-2 px-2 w-full">
          {isGenerating ? (
            // 生成中：使用TextShimmer动效
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <TextShimmer duration={1.5} spread={1}>
                正在思考中...
              </TextShimmer>
            </div>
          ) : (
            // 生成完毕：显示时间和操作按钮
            <div className={`flex items-center ${role === 'user' ? 'justify-end' : 'justify-between'}`}>
              {/* AI消息：时间在左，复制在右 */}
              {role === 'assistant' && (
                <>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {timestamp.toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <MessageActions
                    content={content}
                    role={role}
                    isGenerating={isGenerating}
                  />
                </>
              )}
              
              {/* 用户消息：只显示时间 */}
              {role === 'user' && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {timestamp.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 