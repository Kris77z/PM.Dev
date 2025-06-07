import React, { memo } from 'react';
import { PromptTemplate } from '@/data/prompt-templates';

interface TemplateCardProps {
  template: PromptTemplate;
  isSelected?: boolean;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected = false, onClick }) => {
  const emoji = template.emoji || '📝';
  const prompt = (template.description || template.prompt).substring(0, 200).replace(/\\n/g, '');

  return (
    <div 
      onClick={onClick}
      className={`
        relative rounded-lg cursor-pointer border overflow-hidden p-4 
        transition-all duration-200 ease-out
        border-gray-200 hover:border-gray-300
        shadow-sm hover:shadow-md
        transform hover:-translate-y-0.5
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'bg-white hover:bg-gray-50'}
      `}
    >
      {/* Background emoji */}
      <div className="absolute -right-12 top-0 h-full text-8xl flex items-center justify-center pointer-events-none opacity-10 blur-sm rounded-full overflow-hidden">
        {emoji}
      </div>

      {/* Card content */}
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-2 justify-start overflow-hidden">
          {/* Title and tags */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-base leading-tight font-semibold overflow-hidden text-ellipsis whitespace-nowrap break-all text-gray-900">
              {template.name}
            </div>
            
            {/* Category tags */}
            <div className="flex flex-row gap-1 flex-wrap">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded text-center">
                {template.category}
              </span>
              {template.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded text-center"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 2 && (
                <span className="text-xs text-gray-400 px-1">
                  +{template.tags.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Emoji icon */}
          <div className="w-11 h-11 rounded-lg text-2xl leading-none flex-shrink-0 opacity-100 transition-opacity duration-200 bg-gray-50 flex items-center justify-center">
            {emoji}
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 flex flex-col mt-4">
          <div className="flex-1 flex flex-col bg-gray-50 p-2 rounded-lg">
            <div 
              className="text-xs leading-normal text-gray-600 overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {prompt}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default memo(TemplateCard); 