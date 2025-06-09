import React from 'react';
import { cn } from "@/lib/utils";
import { ArrowRight, Bookmark } from "lucide-react";
import { MinimalCard, MinimalCardDescription } from "@/components/ui/minimal-card";
import { PromptTemplate } from '@/data/prompt-templates';

// 扩展 PromptTemplate 接口来包含收藏状态
interface ExtendedPromptTemplate extends PromptTemplate {
  isFavorited?: boolean;
}

interface PromptCardProps {
  template: ExtendedPromptTemplate;
  isActive: boolean;
  isChatting: boolean;
  onSelect: (template: ExtendedPromptTemplate) => void;
  onFavoriteToggle: () => void;
  onStartChat: () => void;
}

export function PromptCard({ 
  template, 
  isActive, 
  isChatting,
  onSelect, 
  onFavoriteToggle, 
  onStartChat 
}: PromptCardProps) {
  return (
    <MinimalCard 
      className={cn(
        "relative shadow-lg border border-gray-200 h-full flex flex-col p-0",
        isActive && "ring-2 ring-orange-500"
      )}
    >
      {/* 卡片内容 */}
      <div className="px-4 py-4 flex flex-col h-full">
        {/* Icon + 标题 + 收藏按钮 */}
        <div className="flex items-center gap-3 mb-1.5">
          <div className="flex items-center justify-center w-5 h-5">
            <span className="text-base leading-5">{template.emoji}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 flex-1 leading-5 m-0 p-0">
            {template.name}
          </h3>
          
          {/* 收藏按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            className={cn(
              "p-2.5 rounded-lg transition-all duration-200 hover:bg-white/80 flex-shrink-0",
              template.isFavorited ? "text-orange-500" : "text-gray-400"
            )}
          >
            <Bookmark 
              className={cn(
                "w-5 h-5",
                template.isFavorited && "fill-current"
              )} 
            />
          </button>
        </div>

        {/* 描述 */}
        <MinimalCardDescription className="text-sm text-gray-600 pb-6 px-0 m-0">
          {template.description}
        </MinimalCardDescription>

        {/* 底部区域：标签和对话按钮 */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 flex-1">
            {/* 显示分类 */}
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
              {template.category}
            </span>
            
            {/* 显示标签 */}
            {template.tags && template.tags.slice(0, 2).map((tag: string, index: number) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Try prompt 按钮 */}
          <button
            onClick={() => {
              onSelect(template);
              onStartChat();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ml-2 flex-shrink-0",
              isChatting
                ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Try prompt
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </MinimalCard>
  );
}

export type { ExtendedPromptTemplate }; 