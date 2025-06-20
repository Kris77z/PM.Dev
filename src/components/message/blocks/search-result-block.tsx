'use client';

import React from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { SearchResultMessageBlock } from '@/types/message';

interface SearchResultBlockProps {
  block: SearchResultMessageBlock;
  className?: string;
}

export const SearchResultBlock: React.FC<SearchResultBlockProps> = ({
  block,
  className = ''
}) => {
  return (
    <div className={`search-result-block my-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
        <Search className="w-4 h-4" />
        <span>搜索结果: "{block.query}"</span>
        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
          {block.source}
        </span>
      </div>
      <div className="space-y-3">
        {block.results.map((result, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {result.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">
              {result.snippet}
            </p>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              {result.source || '查看原文'}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultBlock; 