'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Component import from -next, types from core @stagewise/toolbar
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import type { ToolbarConfig, ToolbarPlugin, ContextElementContext, UserMessage, PromptContext, ToolbarContext } from '@stagewise/toolbar';

// Helper function to generate a DOM path (simplified version)
function getDomPath(el: HTMLElement | null): string {
  if (!el) {
    return '';
  }
  const stack = [];
  let currentEl: HTMLElement | null = el;
  while (currentEl && currentEl.parentNode && currentEl.parentNode.nodeType === Node.ELEMENT_NODE) {
    let sibCount = 0;
    let sibIndex = 0;
    const parentNode = currentEl.parentNode as Element; // Assert parentNode is Element
    for (let i = 0; i < parentNode.childNodes.length; i++) {
      const sib: Node = parentNode.childNodes[i]; // Explicitly type sib
      if (sib.nodeName === currentEl.nodeName) {
        if (sib === currentEl) {
          sibIndex = sibCount;
          break;
        }
        sibCount++;
      }
    }
    if (currentEl.hasAttribute('id') && currentEl.id !== '') {
      stack.unshift(currentEl.nodeName.toLowerCase() + '#' + currentEl.id);
    } else if (sibCount > 0) {
      stack.unshift(currentEl.nodeName.toLowerCase() + ':nth-of-type(' + (sibIndex + 1) + ')');
    } else {
      stack.unshift(currentEl.nodeName.toLowerCase());
    }
    currentEl = parentNode as HTMLElement; // Move to parent
  }
  // If the loop terminated because currentEl became the document or similar, stack might be full.
  // If el was the body or html, path might be empty or just body/html, adjust as needed.
  return stack.join(' > ');
}

// Define a more specific type for the information we extract and store
interface ExtractedElementInfo {
  domPath: string;
  tagName: string;
  id: string;
  className: string;
  elementText: string;
}

export default function StagewiseTestPage() {
  const [stagewiseInitialized, setStagewiseInitialized] = useState(false);
  const [selectedElementInfo, setSelectedElementInfo] = useState<ExtractedElementInfo | null>(null);
  const [desiredEffect, setDesiredEffect] = useState('');
  const [generatedInstruction, setGeneratedInstruction] = useState('');

  useEffect(() => {
    console.log("StagewiseToolbar component initialized via initToolbar from @stagewise/toolbar.");
  }, []);

  const handleStagewiseData = useCallback((element: HTMLElement | null) => {
    if (!element) {
      setSelectedElementInfo(null);
      return;
    }
    const domPath = getDomPath(element);
    const elementText = element.innerText?.trim().substring(0, 200) || '';
    
    const extractedInfo: ExtractedElementInfo = {
      domPath,
      tagName: element.tagName,
      id: element.id || '',
      className: element.className || '',
      elementText,
    };
    
    console.log('Stagewise: Element selected:', extractedInfo);
    setSelectedElementInfo(extractedInfo);
    setGeneratedInstruction(''); 
    if (!stagewiseInitialized) setStagewiseInitialized(true); 
  }, [stagewiseInitialized]);
  
  const simulateClearSelection = useCallback(() => {
    handleStagewiseData(null);
  }, [handleStagewiseData]);

  const pmAssistantPlugin: ToolbarPlugin = {
    // Based on ToolbarPlugin interface from @stagewise/toolbar/core/src/plugin.ts
    displayName: 'PM Assistant Inspector',
    pluginName: 'pm-assistant-inspector', // pluginName is used for internal ID
    description: 'Captures selected element details for PM Assistant.',
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v2h-2zm0 3h2v4h-2z"/></svg>', // Placeholder icon
    mcp: null, // No MCP features for this basic plugin
    onLoad: (toolbar: ToolbarContext) => {
      console.log('PM Assistant Inspector plugin loaded! Toolbar context:', toolbar);
    },
    onContextElementSelect: (element: HTMLElement): ContextElementContext => {
      handleStagewiseData(element);
      return {
        annotation: `Selected: ${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}`,
      };
    },
    // Other optional handlers from ToolbarPlugin can be null or undefined if not used
    onPromptingStart: null,
    onPromptingAbort: null,
    onResponse: null, 
    onPromptSend: null, // Can implement later if needed, see previous commented out example
  };

  const stagewiseToolbarConfig: ToolbarConfig = {
    plugins: [pmAssistantPlugin],
  };

  const generateInstruction = () => {
    if (!selectedElementInfo) {
      alert('请先通过Stagewise选择一个元素。');
      return;
    }
    if (!desiredEffect.trim()) {
      alert('请输入期望的调整与效果。');
      return;
    }
    let instruction = `
**UI微调需求 (Stagewise)**

*   **DOM路径**: \`${selectedElementInfo.domPath}\`
*   **标签**: \`${selectedElementInfo.tagName}\`
`;
    if (selectedElementInfo.id) instruction += `*   **ID**: \`${selectedElementInfo.id}\`\n`;
    if (selectedElementInfo.className) instruction += `*   **Class**: \`${selectedElementInfo.className}\`\n`;
    instruction += `*   **文本 (参考)**: \`${selectedElementInfo.elementText || '无'}\`
*   **期望调整**: \`${desiredEffect}\`
*   **技术栈**: React (Next.js) + Tailwind CSS
`;
    instruction += `
---
**AI指令:**
AI你好，请按以下详情修改UI：
页面技术栈: React (Next.js) + Tailwind CSS.
元素DOM路径: \`${selectedElementInfo.domPath}\`.
元素文本: \`${selectedElementInfo.elementText || '(无)'}\`.
具体改动: **${desiredEffect}**
---
`;
    setGeneratedInstruction(instruction.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-8 flex flex-col items-center">
      <StagewiseToolbar config={stagewiseToolbarConfig} />
      
      <header className="w-full max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold text-orange-400">Stagewise 集成测试页</h1>
        <p className="text-slate-300 mt-2">
          右键点击页面元素，从 Stagewise 菜单中选择 'PM Assistant Inspector' 来捕获元素信息。
        </p>
        {!selectedElementInfo && !stagewiseInitialized && (
          <div className="mt-4 p-3 bg-blue-500 text-black rounded-md">
            Stagewise Toolbar 已加载。请右键选择元素并激活 'PM Assistant Inspector'。
          </div>
        )}
        {selectedElementInfo && stagewiseInitialized && (
          <div className="mt-4 p-3 bg-green-600 text-white rounded-md">
            元素已捕获! (DOM Path: {selectedElementInfo.domPath})
            <button onClick={simulateClearSelection} className="ml-4 py-1 px-3 bg-green-700 hover:bg-green-800 rounded text-xs">清除</button>
          </div>
        )}
        {!selectedElementInfo && stagewiseInitialized && (
          <div className="mt-4 p-3 bg-yellow-600 text-white rounded-md">
            PM Assistant Inspector 已激活。请右键选择一个元素。
          </div>
        )}
      </header>

      <main className="w-full max-w-3xl space-y-8 bg-slate-800 shadow-2xl rounded-lg p-6 sm:p-10">
        <section>
          <h2 className="text-2xl font-semibold text-orange-300 mb-3">1. 选择UI元素 (通过Stagewise)</h2>
          <p className="text-slate-400 mb-4">
            在页面上右键点击您想调整的UI元素，从 Stagewise 菜单中选择 'PM Assistant Inspector'。
          </p>
          {selectedElementInfo && (
            <div className="bg-slate-700 p-4 rounded-md shadow">
              <h3 className="text-lg font-medium text-orange-200 mb-2">捕获的元素信息:</h3>
              <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-900 p-3 rounded-md overflow-auto max-h-60">
                {JSON.stringify(selectedElementInfo, null, 2)}
              </pre>
            </div>
          )}
          {!selectedElementInfo && stagewiseInitialized && (
            <div className="bg-slate-700 p-4 rounded-md shadow text-center text-slate-400">
              等待通过Stagewise插件选择元素...
            </div>
          )}
          {!selectedElementInfo && !stagewiseInitialized && (
            <div className="bg-slate-700 p-4 rounded-md shadow text-center text-slate-400">
              请先通过右键菜单激活Stagewise插件来选择元素。
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-orange-300 mb-3">2. 描述期望的调整</h2>
          <label htmlFor="desiredEffect" className="block text-sm font-medium text-slate-300 mb-1">
            期望的调整与效果:
          </label>
          <textarea
            id="desiredEffect"
            value={desiredEffect}
            onChange={(e) => setDesiredEffect(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 placeholder-slate-400"
            placeholder="例如：将按钮背景改为深蓝色，文字增大2px并加粗。"
          />
        </section>

        <section className="text-center">
          <button
            onClick={generateInstruction}
            disabled={!selectedElementInfo || !desiredEffect.trim()}
            className="py-2.5 px-6 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
          >
            生成AI操作指令
          </button>
        </section>

        {generatedInstruction && (
          <section>
            <h2 className="text-2xl font-semibold text-orange-300 mb-3">4. 生成的操作指令</h2>
            <div className="bg-slate-900 p-4 rounded-md shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-orange-200">复制以下指令给IDE中的AI助手:</span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedInstruction).then(() => alert('指令已复制!'))}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-orange-300 py-1 px-3 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7m-6 0L12 5l4 2m-8 0h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" /></svg>
                  复制
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-700 p-3 rounded-md overflow-auto max-h-96">
                {generatedInstruction}
              </pre>
            </div>
          </section>
        )}
      </main>
      
      <footer className="text-center text-sm text-slate-400 w-full py-8 mt-10">
        © {new Date().getFullYear()} PM-Assistant Stagewise Test Environment
      </footer>
    </div>
  );
} 