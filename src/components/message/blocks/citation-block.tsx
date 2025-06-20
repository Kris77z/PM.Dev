'use client';

import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { CitationMessageBlock } from '@/types/message';

interface CitationBlockProps {
  block: CitationMessageBlock;
  className?: string;
}

export const CitationBlock: React.FC<CitationBlockProps> = ({
  block,
  className = ''
}) => {
  if (!block.citations || block.citations.length === 0) {
    return null;
  }

  return (
    <div className={`citation-block my-4 ${className}`}>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
        📚 参考资料
      </div>
      <div className="space-y-2">
        {block.citations.map((citation) => (
          <div key={citation.number} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
              {citation.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {citation.showFavicon && (
                  <Globe className="w-4 h-4 text-gray-400" />
                )}
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {citation.title || citation.url}
                </h4>
                <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  {citation.type}
                </span>
              </div>
              {citation.hostname && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {citation.hostname}
                </div>
              )}
              {citation.content && (
                <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {citation.content}
                </div>
              )}
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                访问原文
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitationBlock; 