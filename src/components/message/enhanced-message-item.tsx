'use client';

import React, { useMemo } from 'react';
import { BlockRenderer } from './blocks';
import { MessageActions } from './message-actions';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Message, MessageBlock, MessageBlockType, MainTextMessageBlock } from '@/types/message';
import { cn } from '@/lib/utils';

interface EnhancedMessageItemProps {
  message: Message;
  blocks: Record<string, MessageBlock>;
  isGenerating?: boolean;
  showTimestamp?: boolean;
  showActions?: boolean;
  density?: 'compact' | 'normal' | 'spacious';
  onBlockEdit?: (blockId: string, updates: Partial<MessageBlock>) => void;
  onMessageEdit?: (messageId: string, updates: Partial<Message>) => void;
  className?: string;
}

export const EnhancedMessageItem: React.FC<EnhancedMessageItemProps> = ({
  message,
  blocks,
  isGenerating = false,
  showTimestamp = true,
  showActions = true,
  density = 'normal',
  onBlockEdit,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMessageEdit: _onMessageEdit,
  className = ''
}) => {
  // 获取消息块
  const messageBlocks = useMemo(() => {
    return message.blocks
      .map(blockId => blocks[blockId])
      .filter(Boolean) as MessageBlock[];
  }, [message.blocks, blocks]);

  // 如果没有块，创建一个主文本块用于向后兼容
  const compatibilityBlocks = useMemo(() => {
    if (messageBlocks.length > 0) {
      return messageBlocks;
    }

    if (message.content) {
      const mainTextBlock: MainTextMessageBlock = {
        id: `${message.id}-main-text`,
        type: MessageBlockType.MAIN_TEXT,
        content: message.content,
        createdAt: message.timestamp
      };
      return [mainTextBlock];
    }

    return [];
  }, [messageBlocks, message.content, message.id, message.timestamp]);

  // 获取间距样式
  const spacingClass = {
    compact: 'mb-4',
    normal: 'mb-6',
    spacious: 'mb-8'
  }[density];

  // 获取气泡最大宽度
  const maxWidthClass = {
    compact: 'max-w-[70%]',
    normal: 'max-w-[75%]',
    spacious: 'max-w-[80%]'
  }[density];

  return (
    <div className={cn(
      'enhanced-message-container group flex',
      message.role === 'user' ? 'justify-end' : 'justify-start',
      spacingClass,
      className
    )}>
      <div className={cn(
        'flex flex-col',
        message.role === 'user' ? 'items-end' : 'items-start',
        maxWidthClass
      )}>
        {/* Mentions */}
        {message.mentions && message.mentions.length > 0 && (
          <div className="flex gap-2 mb-2 px-2">
            {message.mentions.map((model) => (
              <span 
                key={model.id}
                className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded"
              >
                @{model.name}
              </span>
            ))}
          </div>
        )}

        {/* 消息气泡 */}
        <div className={cn(
          'rounded-2xl px-4 py-3 break-words w-full max-w-full min-w-0 overflow-hidden',
          message.role === 'user'
            ? 'bg-black text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
        )}>
          {/* 生成中状态 */}
          {isGenerating && compatibilityBlocks.length === 0 ? (
            <div className="text-sm leading-relaxed">
              <TextShimmer duration={1.5} spread={1}>
                正在思考中...
              </TextShimmer>
            </div>
          ) : (
            /* 消息块渲染 */
            <BlockRenderer
              blocks={compatibilityBlocks}
              messageId={message.id}
              role={message.role}
              isGenerating={isGenerating}
              onBlockEdit={onBlockEdit}
            />
          )}
        </div>
        
        {/* 时间戳和操作按钮 */}
        <div className="mt-2 px-2 w-full">
          {!isGenerating && (
            // 生成完毕：显示时间和操作按钮
            <div className={cn(
              'flex items-center',
              message.role === 'user' ? 'justify-end' : 'justify-between'
            )}>
              {/* AI消息：时间在左，操作在右 */}
              {message.role === 'assistant' && (
                <>
                  {showTimestamp && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {message.timestamp.toLocaleTimeString('zh-CN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                  {showActions && (
                    <MessageActions
                      content={message.content || compatibilityBlocks
                        .filter(block => block.type === MessageBlockType.MAIN_TEXT)
                        .map(block => (block as MainTextMessageBlock).content)
                        .join('\n')
                      }
                      role={message.role}
                      isGenerating={isGenerating}
                    />
                  )}
                </>
              )}
              
              {/* 用户消息：只显示时间 */}
              {message.role === 'user' && showTimestamp && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {message.timestamp.toLocaleTimeString('zh-CN', { 
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

export default EnhancedMessageItem; 