'use client';

import React from 'react';
import { ImageMessageBlock } from '@/types/message';

interface ImageBlockProps {
  block: ImageMessageBlock;
  className?: string;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  className = ''
}) => {
  return (
    <div className={`image-block my-4 ${className}`}>
      <div className="relative inline-block max-w-full">
        <img
          src={block.url}
          alt={block.alt || '图片'}
          className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
          style={{
            width: block.width ? `${block.width}px` : 'auto',
            height: block.height ? `${block.height}px` : 'auto'
          }}
        />
        {block.caption && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            {block.caption}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageBlock; 