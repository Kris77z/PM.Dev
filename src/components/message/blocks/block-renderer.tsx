'use client';

import React from 'react';
import { 
  MessageBlock, 
  MessageBlockType,
  MainTextMessageBlock,
  CodeMessageBlock,
  ImageMessageBlock,
  CitationMessageBlock,
  ErrorMessageBlock,
  ThinkingMessageBlock,
  SearchResultMessageBlock,
  KnowledgeMessageBlock
} from '@/types/message';
import { MainTextBlock } from './main-text-block';
import { CodeBlock } from './code-block';
import { ImageBlock } from './image-block';
import { CitationBlock } from './citation-block';
import { ErrorBlock } from './error-block';
import { ThinkingBlock } from './thinking-block';
import { SearchResultBlock } from './search-result-block';
import { KnowledgeBlock } from './knowledge-block';

interface BlockRendererProps {
  blocks: MessageBlock[];
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  isGenerating?: boolean;
  onBlockEdit?: (blockId: string, updates: Partial<MessageBlock>) => void;
  className?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  blocks,
  messageId,
  role,
  isGenerating = false,
  onBlockEdit,
  className = ''
}) => {
  const renderBlock = (block: MessageBlock, index: number) => {
    const blockProps = {
      block,
      messageId,
      role,
      isGenerating,
      onEdit: onBlockEdit ? (updates: Partial<MessageBlock>) => onBlockEdit(block.id, updates) : undefined,
      className: index === 0 ? 'first-block' : ''
    };

    switch (block.type) {
      case MessageBlockType.MAIN_TEXT:
        return <MainTextBlock key={block.id} {...blockProps} block={block as MainTextMessageBlock} />;
      
      case MessageBlockType.CODE:
        return <CodeBlock key={block.id} {...blockProps} block={block as CodeMessageBlock} />;
      
      case MessageBlockType.IMAGE:
        return <ImageBlock key={block.id} {...blockProps} block={block as ImageMessageBlock} />;
      
      case MessageBlockType.CITATION:
        return <CitationBlock key={block.id} {...blockProps} block={block as CitationMessageBlock} />;
      
      case MessageBlockType.ERROR:
        return <ErrorBlock key={block.id} {...blockProps} block={block as ErrorMessageBlock} />;
      
      case MessageBlockType.THINKING:
        return <ThinkingBlock key={block.id} {...blockProps} block={block as ThinkingMessageBlock} />;
      
      case MessageBlockType.SEARCH_RESULT:
        return <SearchResultBlock key={block.id} {...blockProps} block={block as SearchResultMessageBlock} />;
      
      case MessageBlockType.KNOWLEDGE:
        return <KnowledgeBlock key={block.id} {...blockProps} block={block as KnowledgeMessageBlock} />;
      
      default:
        console.warn(`Unknown block type: ${(block as MessageBlock).type}`);
        return null;
    }
  };

  return (
    <div className={`message-blocks ${className}`}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default BlockRenderer; 