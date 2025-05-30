'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Clipboard, ChevronDown, ChevronUp, Info } from 'lucide-react'; // Using lucide-react for icons

interface MicroAdjustmentGuidanceUIProps {
  demandSummaryMarkdown: string;
  fullGuideMarkdown: string;
  onCopySummary?: () => void; // Optional callback for copy success
}

export const MicroAdjustmentGuidanceUI: React.FC<MicroAdjustmentGuidanceUIProps> = ({
  demandSummaryMarkdown,
  fullGuideMarkdown,
  onCopySummary,
}) => {
  const [isFullGuideVisible, setIsFullGuideVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(demandSummaryMarkdown);
      setCopySuccess('需求概要已复制到剪贴板！');
      if (onCopySummary) onCopySummary();
      setTimeout(() => setCopySuccess(''), 2000); // Clear message after 2 seconds
    } catch (err) {
      console.error('无法复制文本: ', err);
      setCopySuccess('复制失败，请手动复制。');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-xl space-y-6">
      
      <div className="text-center">
        <Info className="h-10 w-10 text-blue-600 mx-auto mb-2" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          您的UI微调需求已准备就绪
        </h1>
        <p className="text-gray-600 mt-1">
          请参考下方生成的概要，并查阅详细指南以向AI助手下达指令。
        </p>
      </div>

      {/* UI微调需求概要展示区 */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-slate-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">UI微调需求概要</h2>
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center px-3 py-1.5 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            title="复制概要到剪贴板"
          >
            <Clipboard size={16} className="mr-1.5" />
            复制概要
          </button>
        </div>
        {copySuccess && (
          <p className={`text-xs ${copySuccess.includes('失败') ? 'text-red-500' : 'text-green-600'}`}>
            {copySuccess}
          </p>
        )}
        <div className="prose prose-sm max-w-none p-2 bg-white border border-gray-100 rounded">
          <ReactMarkdown>{demandSummaryMarkdown}</ReactMarkdown>
        </div>
      </div>

      {/* PM完整操作指南展示区 (可折叠) */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => setIsFullGuideVisible(!isFullGuideVisible)}
          className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none transition-colors rounded-t-lg"
        >
          <h2 className="text-xl font-semibold text-gray-700">
            PM操作指南：如何向AI请求UI微调
          </h2>
          {isFullGuideVisible ? (
            <ChevronUp size={20} className="text-gray-600" />
          ) : (
            <ChevronDown size={20} className="text-gray-600" />
          )}
        </button>
        {isFullGuideVisible && (
          <div className="p-4 border-t border-gray-200 prose prose-sm sm:prose max-w-none">
            <ReactMarkdown>{fullGuideMarkdown}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-500">
          您现在可以结合以上信息，在IDE中与AI助手进行沟通了。
        </p>
      </div>
    </div>
  );
};

export default MicroAdjustmentGuidanceUI; 