'use client';

import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { KnowledgeMessageBlock } from '@/types/message';

interface KnowledgeBlockProps {
  block: KnowledgeMessageBlock;
  className?: string;
}

export const KnowledgeBlock: React.FC<KnowledgeBlockProps> = ({
  block,
  className = ''
}) => {
  return (
    <div className={`knowledge-block my-4 ${className}`}>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        知识库引用
      </div>
      <div className="space-y-3">
        {block.references.map((reference) => (
          <div key={reference.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {reference.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">
              {reference.content}
            </p>
            <div className="flex items-center justify-between">
              <a
                href={reference.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                查看原文
              </a>
              {reference.score && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  相关度: {Math.round(reference.score * 100)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBlock; 