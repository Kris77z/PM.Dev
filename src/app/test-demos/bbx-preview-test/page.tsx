'use client';

import React, { useRef, useEffect, useState } from 'react';
import projectAnalysisData from '@/data/bbx-project-analysis.json';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 页面 value 到 iframe src 的简单映射（可根据实际情况调整）
const PAGE_SRC_MAP: Record<string, string> = {
  cex_market_news: 'http://localhost:3001/zh-Hans/news',
  // 其他页面可继续补充
};

const BBX_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';

const BBXPreviewTestPage: React.FC = () => {
  const pageOptions = projectAnalysisData.pages;
  // 默认选第一个分组的第一个页面
  const defaultPage = pageOptions[0]?.options[0]?.value || '';
  const [selectedPage, setSelectedPage] = useState<string>(defaultPage);
  const [messageLog, setMessageLog] = useState<unknown[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== BBX_ORIGIN) return;
      setMessageLog((prev) => [event.data, ...prev]);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 根据页面 value 映射到 iframe src
  const iframeSrc = PAGE_SRC_MAP[selectedPage] || '/bbx-mock-news.html';

  return (
    <div className="min-h-screen flex flex-col p-8 gap-8">
      <h1 className="text-2xl font-bold mb-4">BBX 预览 iframe + 消息监听测试页</h1>
      <div className="flex gap-8">
        {/* 左侧：页面选择 */}
        <div className="w-1/4 space-y-4">
          <label className="block font-medium mb-2">选择页面：</label>
          <Select onValueChange={setSelectedPage} value={selectedPage}>
            <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500">
              <SelectValue placeholder="请选择主要页面..." />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 overflow-hidden">
              {pageOptions.map((group, index) => (
                <React.Fragment key={group.groupLabel}>
                  <SelectGroup>
                    <SelectLabel className="py-2 px-3 text-xs font-semibold text-gray-500">{group.groupLabel}</SelectLabel>
                    {group.options.map(option => {
                      let displayLabel = option.label;
                      let isDisabled = false;
                      if (option.value === 'cex_market_futures') {
                        displayLabel += ' (功能复杂，暂不由此微调)';
                        isDisabled = true;
                      }
                      return (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="py-2 px-4 hover:bg-orange-50 focus:bg-orange-50 rounded cursor-pointer text-sm data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                          disabled={isDisabled}
                        >
                          {displayLabel}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                  {index < pageOptions.length - 1 && <SelectSeparator className="my-1" />}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* 右侧：iframe 预览 */}
        <div className="flex-1 border rounded shadow overflow-hidden min-h-[500px] bg-gray-50">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title="BBX 预览"
            className="w-full h-[500px] border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
      {/* 消息日志展示 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">收到的消息：</h2>
        <div className="bg-gray-100 rounded p-4 max-h-60 overflow-auto text-sm">
          {messageLog.length === 0 ? (
            <div className="text-gray-400">暂无消息</div>
          ) : (
            messageLog.map((msg, idx) => (
              <pre key={idx} className="mb-2 whitespace-pre-wrap">{JSON.stringify(msg, null, 2)}</pre>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BBXPreviewTestPage; 