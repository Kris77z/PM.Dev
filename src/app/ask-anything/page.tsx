'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatedAIInput } from "@/components/ui/animated-ai-input";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { EnhancedMessageItem } from "@/components/message";
import { MessageBlockType, MainTextMessageBlock } from "@/types/message";
import { AGENT_PROMPTS } from "@/config/prompts";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import PromptStashView from "@/components/prompt-stash/PromptStashView";
import PRDHouseViewRefactored from "@/components/prd-house/PRDHouseViewRefactored";
import { PRDGenerationData } from "@/lib/prd-generator";
import { 
  MessageSquarePlus, 
  Lightbulb,
  FileText,
  Home,
  Trash2,
  Brain,
  Monitor,
  Smartphone,
  Tablet,
  Copy
} from "lucide-react";
import ResearchPlan from "@/components/ui/research-plan";
import type { ViewType } from "@/types/research";
import { useChat } from "@/hooks/useChat";
import { useAgentResearch } from "@/hooks/useAgentResearch";
import { convertLangGraphToResearchTasks, getCurrentExecutingStep } from "@/utils/research-converter";
import { ResearchReportModal } from "@/components/ui/research-report-modal";
import { cn } from "@/lib/utils";

// 消息转换为块格式的辅助函数
const convertMessageToBlocks = (message: { content?: string; timestamp: Date }): Record<string, MainTextMessageBlock> => {
  if (!message.content) return {};
  
  const blockId = `${message.timestamp.getTime()}-main-text`;
  const block: MainTextMessageBlock = {
    id: blockId,
    type: MessageBlockType.MAIN_TEXT,
    content: message.content,
    createdAt: message.timestamp // 使用消息的时间戳而不是当前时间
  };
  
  return { [blockId]: block };
};

// 内容组件 - 包含所有使用useSearchParams的逻辑
function AskAnythingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('session');
  const viewParam = searchParams?.get('view') as ViewType || 'chat';
  const queryParam = searchParams?.get('query');

  // 使用自定义hooks
  const chat = useChat();
  const agentResearch = useAgentResearch();
  
  // 本地状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>(viewParam);
  
  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 加载历史对话
  useEffect(() => {
    chat.initializeChatHistory();
    agentResearch.initializeResearchHistory(); // 初始化研究历史

    // 如果URL中有sessionId，加载对应的对话
    if (sessionId) {
      chat.loadChatSession(sessionId);
    }
  }, [sessionId, chat.initializeChatHistory, chat.loadChatSession, agentResearch.initializeResearchHistory]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, chat.isLoading]);

  // 删除历史对话 - 包装处理事件
  const handleDeleteChat = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    chat.handleDeleteChat(sessionId);
  };

  // 侧边栏链接配置
  const links = [
    {
      label: "新对话",
      href: "#",
      icon: <MessageSquarePlus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        chat.startNewChat();
      }
    },
  ];

  const bottomLinks = [
    {
      label: "返回首页",
      href: "/",
      icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
  ];

  // 快捷按钮配置 - Claude风格
  const quickActions = [
    {
      title: "PRD 工具",
      description: AGENT_PROMPTS.prd.description,
      icon: <FileText className="h-4 w-4" />,
      onClick: () => switchView('prd-house')  // 直接切换到PRD工具视图
    },
    {
      title: "Prompt 工具",
      description: AGENT_PROMPTS.promptHouse.description,
      icon: <Lightbulb className="h-4 w-4" />,
      onClick: () => switchView('prompt-stash')  // 直接切换到Prompt Stash视图
    }
  ];

  // 视图切换函数
  const switchView = (view: ViewType) => {
    setActiveView(view);
    const params = new URLSearchParams(searchParams?.toString());
    if (view === 'chat') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    const newUrl = params.toString() ? `/ask-anything?${params.toString()}` : '/ask-anything';
    router.push(newUrl, { scroll: false });
  };

  // 同步URL变化
  useEffect(() => {
    setActiveView(viewParam);
  }, [viewParam]);

  // 处理 query 参数，自动发送研究消息
  useEffect(() => {
    if (queryParam && viewParam === 'agent-research' && agentResearch.agentMessages.length === 1) {
      // 延迟一下确保页面完全加载
      setTimeout(() => {
        agentResearch.handleAgentResearchMessage(queryParam);
        // 清除 URL 中的 query 参数
        const newParams = new URLSearchParams(searchParams?.toString());
        newParams.delete('query');
        const newUrl = newParams.toString() ? `/ask-anything?${newParams.toString()}` : '/ask-anything?view=agent-research';
        router.replace(newUrl, { scroll: false });
      }, 100);
    }
  }, [queryParam, viewParam, agentResearch.agentMessages.length, agentResearch.handleAgentResearchMessage, searchParams, router]);

  // 原型生成相关状态
  const [isGeneratingPrototype, setIsGeneratingPrototype] = useState(false);
  const [autoGenerationStarted, setAutoGenerationStarted] = useState(false);
  const [prototypeError, setPrototypeError] = useState<string | null>(null);
  
  // 缓存iframe URL避免重新生成导致闪烁
  const [cachedPrototypeUrl, setCachedPrototypeUrl] = useState<string | null>(null);
  const [cachedCodeUrl, setCachedCodeUrl] = useState<string | null>(null);

  // 右侧Tab状态
  const [activeRightTab, setActiveRightTab] = useState<'prototype' | 'code'>('prototype');
  const [activeSizeTab, setActiveSizeTab] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [htmlCode, setHtmlCode] = useState<string>('');

  // 自动开始原型生成
  useEffect(() => {
    if (activeView === 'prototype-house' && !autoGenerationStarted) {
      setAutoGenerationStarted(true);
      
      // 延迟一下确保组件完全加载，然后开始生成
      setTimeout(() => {
        handlePrototypeMessage();
      }, 500);
    } else if (activeView !== 'prototype-house') {
      // 离开原型生成页面时重置状态
      setAutoGenerationStarted(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, autoGenerationStarted]);

  // 调试：监控prototypeError状态变化
  useEffect(() => {
    console.log('prototypeError 状态变化:', prototypeError);
  }, [prototypeError]);

  // 清理URL当组件卸载或htmlCode变化时
  useEffect(() => {
    return () => {
      if (cachedPrototypeUrl) {
        URL.revokeObjectURL(cachedPrototypeUrl);
      }
      if (cachedCodeUrl) {
        URL.revokeObjectURL(cachedCodeUrl);
      }
    };
  }, [cachedPrototypeUrl, cachedCodeUrl]);

  // 原型生成流程
  const handlePrototypeMessage = useCallback(async () => {
    // 读取PRD数据
    const savedPrdData = sessionStorage.getItem('prdData');
    if (!savedPrdData) {
      return;
    }

    let prdData: PRDGenerationData;
    try {
      prdData = JSON.parse(savedPrdData) as PRDGenerationData;
    } catch (error) {
      console.error('解析PRD数据失败:', error);
      return;
    }

    setIsGeneratingPrototype(true);
    setPrototypeError(null);

    try {
      console.log('开始HTML生成请求，模型: gemini-2.5-flash');
      const response = await fetch('/api/ai-html-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: createPrototypePrompt(prdData),
          modelId: 'gemini-2.5-flash'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          // 提取HTML内容
          const htmlMatch = data.content.match(/```html\s*([\s\S]*?)\s*```/);
          const htmlContent = htmlMatch ? htmlMatch[1].trim() : data.content;
          setHtmlCode(htmlContent);
          setPrototypeError(null);
          
          // 生成并缓存URL
          const prototypeBlob = new Blob([htmlContent], { type: 'text/html' });
          const prototypeUrl = URL.createObjectURL(prototypeBlob);
          setCachedPrototypeUrl(prototypeUrl);
          
          const codeHtml = createCodePreviewHtml(htmlContent);
          const codeBlob = new Blob([codeHtml], { type: 'text/html' });
          const codeUrl = URL.createObjectURL(codeBlob);
          setCachedCodeUrl(codeUrl);
        } else {
          throw new Error(data.error || '生成失败');
        }
      } else {
        // 尝试解析错误响应
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `API请求失败: ${response.status}`);
        } catch {
          throw new Error(`API请求失败: ${response.status} - ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('原型生成失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.log('设置错误状态:', errorMessage);
      setPrototypeError(errorMessage);
    } finally {
      setIsGeneratingPrototype(false);
      console.log('生成流程结束');
    }
  }, []);

  // 创建原型生成提示词 - 使用简化的直接提示词
  const createPrototypePrompt = (prdData: PRDGenerationData) => {
    const productName = prdData.requirementSolution?.sharedPrototype || '未命名产品';
    const productDescription = prdData.answers?.['c1_requirement_intro'] || '';
    const coreRequirements = prdData.answers?.['c2_requirement_goal'] || '';
    const functionalRequirements = prdData.answers?.['c6_functional_requirements'] || '';
    
    return `
请基于以下PRD信息，生成一个现代化、精美的产品原型：

## 产品信息
**产品名称**: ${productName}
**产品描述**: ${productDescription}
**核心需求**: ${coreRequirements}
**功能需求**: ${functionalRequirements}

## 设计要求
1. **现代化视觉**: 使用现代Web应用的设计语言，包括精美的配色、优雅的间距、流畅的动画效果
2. **组件质感**: 创造高质量的按钮、卡片、表单等组件，注重细节和用户体验
3. **布局自由**: 根据产品特性设计最适合的布局结构，确保信息层次清晰
4. **交互体验**: 添加悬停效果、加载状态、错误处理等完整的交互反馈
5. **响应式设计**: 确保在不同设备上都有良好的显示效果

## 技术要求
- 使用Tailwind CSS实现所有样式
- 图片使用 https://picsum.photos/width/height?random=N 格式，包含错误处理
- 确保所有功能真实可用，不是演示文档
- 在iframe环境中完美显示
- 包含完整的JavaScript交互功能

请生成完整的HTML页面，创造视觉精美、体验优秀的现代化产品界面。
`;
  };

  // PRD文档消息组件 - 简化版
  const PrototypePRDMessage = () => {
    const [prdData, setPrdData] = useState<PRDGenerationData | null>(null);

    useEffect(() => {
      // 从sessionStorage读取PRD数据
      try {
        const savedPrdData = sessionStorage.getItem('prdData');
        if (savedPrdData) {
          setPrdData(JSON.parse(savedPrdData));
        }
      } catch (error) {
        console.error('读取PRD数据失败:', error);
      }
    }, []);

    if (!prdData) {
      return (
        <div className="w-full">
          <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-3">
            <p className="text-sm leading-relaxed">未找到PRD数据，请先在PRD工具中生成文档</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-3">
          <div className="text-sm leading-relaxed space-y-3">
            <div>
              <span className="font-medium">产品名称：</span>
              <span>{prdData.requirementSolution?.sharedPrototype || '未填写'}</span>
            </div>
            <div>
              <span className="font-medium">产品描述：</span>
              <span>{prdData.answers?.['c1_requirement_intro'] || '未填写'}</span>
            </div>
            <div>
              <span className="font-medium">核心需求：</span>
              <span>{prdData.answers?.['c2_requirement_goal'] || '未填写'}</span>
            </div>
            {prdData.answers?.['c3_target_metrics'] && (
              <div>
                <span className="font-medium">目标指标：</span>
                <span>{prdData.answers['c3_target_metrics']}</span>
              </div>
            )}
            {prdData.answers?.['c4_user_portrait'] && (
              <div>
                <span className="font-medium">用户画像：</span>
                <span>{prdData.answers['c4_user_portrait']}</span>
              </div>
            )}
            {prdData.answers?.['c5_user_story'] && (
              <div>
                <span className="font-medium">用户故事：</span>
                <span>{prdData.answers['c5_user_story']}</span>
              </div>
            )}
            {prdData.answers?.['c6_functional_requirements'] && (
              <div>
                <span className="font-medium">功能需求：</span>
                <span>{prdData.answers['c6_functional_requirements']}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 右侧Tab导航组件
  const RightTabNavigation = () => {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        {/* 左侧：原型/代码切换和复制按钮 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveRightTab('prototype')}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                activeRightTab === 'prototype'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              原型
            </button>
            <button
              onClick={() => setActiveRightTab('code')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                activeRightTab === 'code'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              代码
            </button>
          </div>

          {/* 复制代码按钮 - 随时可以复制 */}
          <button
            onClick={() => {
              if (htmlCode) {
                navigator.clipboard.writeText(htmlCode);
                // 可以添加复制成功提示
                const button = document.activeElement as HTMLButtonElement;
                const originalTitle = button.title;
                button.title = '复制成功！';
                setTimeout(() => {
                  button.title = originalTitle;
                }, 1000);
              }
            }}
            disabled={!htmlCode}
            className={cn(
              "px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-center",
              htmlCode
                ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                : "text-gray-400 bg-gray-50 cursor-not-allowed"
            )}
            title="复制代码"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        {/* 右侧：尺寸切换 - 只在原型预览时显示 */}
        {activeRightTab === 'prototype' && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveSizeTab('desktop')}
              className={cn(
                "px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-center",
                activeSizeTab === 'desktop'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
              title="桌面视图"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveSizeTab('tablet')}
              className={cn(
                "px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-center",
                activeSizeTab === 'tablet'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
              title="平板视图"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveSizeTab('mobile')}
              className={cn(
                "px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-center",
                activeSizeTab === 'mobile'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
              title="手机视图"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // 创建代码预览HTML页面
  const createCodePreviewHtml = (code: string) => {
    // 正确的HTML转义顺序：先转义&，再转义<和>
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // 将代码按行分割
    const lines = escapedCode.split('\n');
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代码预览</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background: #ffffff;
            line-height: 1.6;
            color: #333;
            overflow: hidden;
        }
        .code-container {
            height: 100vh;
            display: flex;
            position: relative;
        }
        .line-numbers {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            background: #f8f9fa;
            border-right: 1px solid #e1e4e8;
            padding: 20px 8px 20px 0;
            min-width: 48px;
            max-width: 48px;
            text-align: right;
            user-select: none;
            font-size: 14px;
            color: #6a737d;
            z-index: 10;
            overflow: hidden;
        }
        .code-content {
            flex: 1;
            margin-left: 48px;
            padding: 20px 20px 20px 24px;
            overflow: auto;
            box-sizing: border-box;
        }
        pre {
            margin: 0;
            white-space: pre;
            font-size: 14px;
            line-height: 1.6;
        }
        .line-number {
            display: block;
            height: 1.6em;
            line-height: 1.6;
            color: #6a737d;
            font-size: 14px;
            padding-right: 8px;
            margin: 0;
        }
        .line-content {
            display: block;
            height: 1.6em;
            line-height: 1.6;
            white-space: pre;
            margin: 0;
        }
        /* 代码高亮样式 */
        .keyword { color: #d73a49; font-weight: 600; }
        .string { color: #032f62; }
        .comment { color: #6a737d; font-style: italic; }
        .tag { color: #22863a; font-weight: 600; }
        .attr-name { color: #6f42c1; }
        .attr-value { color: #032f62; }
        
        /* 同步滚动 */
        .code-content::-webkit-scrollbar {
            width: 12px;
            height: 12px;
        }
        .code-content::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        .code-content::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 6px;
        }
        .code-content::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
    </style>
    <script>
        // 同步行号和代码的垂直滚动
        window.addEventListener('load', function() {
            const codeContent = document.querySelector('.code-content');
            const lineNumbers = document.querySelector('.line-numbers');
            
            codeContent.addEventListener('scroll', function() {
                lineNumbers.scrollTop = codeContent.scrollTop;
            });
        });
    </script>
</head>
<body>
    <div class="code-container">
        <div class="line-numbers">
            ${lines.map((_, index) => `<div class="line-number">${(index + 1).toString().padStart(3, ' ')}</div>`).join('')}
        </div>
        <div class="code-content">
            <pre><code>${lines.map(line => `<div class="line-content">${line}</div>`).join('')}</code></pre>
        </div>
    </div>
</body>
</html>`;
  };

  // 原型预览面板组件 - 统一使用iframe
  const PrototypePreviewPanel = () => {
    // 获取iframe内容URL - 使用缓存避免重新生成
    const getIframeUrl = () => {
      if (htmlCode) {
        if (activeRightTab === 'prototype') {
          return cachedPrototypeUrl;
        } else {
          return cachedCodeUrl;
        }
      }
      return null;
    };

         // 获取iframe容器样式
     const getIframeContainerStyles = () => {
       if (activeRightTab === 'prototype') {
         // 原型预览根据设备尺寸调整
         switch (activeSizeTab) {
           case 'mobile':
             return 'flex justify-center items-start pt-8 bg-gray-50';
           case 'tablet':
             return 'flex justify-center items-start pt-8 bg-gray-50';
           case 'desktop':
           default:
             return 'bg-white';
         }
       } else {
         // 代码预览始终全屏
         return 'bg-white';
       }
     };

     // 获取iframe样式 - 去掉重复边框
     const getIframeStyles = () => {
       if (activeRightTab === 'prototype') {
         switch (activeSizeTab) {
           case 'mobile':
             return 'w-96 h-[calc(100%-4rem)] border-0';
           case 'tablet':
             return 'w-3/4 h-[calc(100%-4rem)] border-0';
           case 'desktop':
           default:
             return 'w-full h-full border-0';
         }
       } else {
         // 代码预览始终全屏
         return 'w-full h-full border-0';
       }
     };

    const iframeUrl = getIframeUrl();

         if (htmlCode && iframeUrl) {
       // 已生成原型 - 统一使用iframe，添加边框包裹
       return (
         <div className="w-full h-full p-4">
           <div className={`w-full h-full border border-gray-200 rounded-lg overflow-hidden ${getIframeContainerStyles()}`}>
             <iframe 
               src={iframeUrl}
               className={getIframeStyles()}
               title={activeRightTab === 'prototype' ? "Generated Prototype" : "Code Preview"}
               style={{ 
                 minHeight: '100%',
                 border: 'none'
               }}
             />
           </div>
         </div>
       );
     }

         if (isGeneratingPrototype) {
       // 正在生成
       return (
         <div className="w-full h-full p-4">
           <div className="w-full h-full border border-gray-100 rounded-lg flex items-center justify-center bg-gray-50">
             <div className="text-center">
               <div className="mb-4">
                 <TextShimmer duration={2}>正在生成原型...</TextShimmer>
               </div>
               <p className="text-gray-600 text-sm">请稍候，正在根据您的PRD文档生成原型</p>
             </div>
           </div>
         </div>
       );
     }

     // 默认状态
     return (
       <div className="w-full h-full p-4">
         <div className="w-full h-full border border-gray-100 rounded-lg flex items-center justify-center bg-white">
           <div className="text-center">
             <h1 className="text-7xl font-normal text-black">PM.DEV To ProtoType</h1>
           </div>
         </div>
       </div>
     );
  };

  return (
    <div className="min-h-screen bg-white flex">
      
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Chat Management Section - New Chat & Recent Chats */}
            <div className="mt-8 flex flex-col gap-2">
              {/* New Chat */}
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              
              {/* Recent Chats - 直接左对齐显示，无缩进 */}
              {chat.chatHistory.length > 0 && (
                <div className="mt-2 space-y-1">
                  {chat.chatHistory.map((session) => (
                    <div 
                      key={session.id} 
                      className="group flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 py-2 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer"
                      onClick={() => chat.loadHistorySession(session)}
                    >
                      <span className="truncate flex-1" title={session.title}>
                        {session.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteChat(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-opacity"
                        title="删除对话"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="mt-8 flex flex-col gap-2">
              <SidebarLink 
                link={{
                  label: "PRD 工具",
                  href: "#",
                  icon: <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    switchView('prd-house');
                  }
                }}
              />
              <SidebarLink 
                link={{
                  label: "Prompt 工具",
                  href: "#",
                  icon: <Lightbulb className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    switchView('prompt-stash');
                  }
                }}
              />
              <SidebarLink 
                link={{
                  label: "原型生成",
                  href: "#",
                  icon: <Monitor className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    switchView('prototype-house');
                  }
                }}
              />
              <SidebarLink 
                link={{
                  label: "Agent 研究",
                  href: "#",
                  icon: <Brain className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    switchView('agent-research');
                  }
                }}
              />
              
              {/* 历史研究 - 直接左对齐显示，无缩进 */}
              {agentResearch.researchHistory.length > 0 && (
                <div className="mt-2 space-y-1">
                  {agentResearch.researchHistory.map((session) => (
                    <div 
                      key={session.id} 
                      className="group flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 py-2 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer"
                      onClick={() => {
                        // 切换到 agent-research 视图并加载历史研究
                        switchView('agent-research');
                        agentResearch.loadHistoryResearchSession(session);
                      }}
                    >
                      <span className="truncate flex-1" title={session.title}>
                        {session.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          agentResearch.handleDeleteResearch(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-opacity"
                        title="删除研究"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Links */}
          <div className="mb-4">
            {bottomLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </SidebarBody>
      </Sidebar>

      {/* 主要内容区域 */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-[300px]' : 'md:ml-[60px]'} ml-0`}>
        {/* 当前代理状态显示 */}
        {chat.currentAgent && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
            <span className="text-sm text-blue-700">
              当前模式: {chat.currentAgent}
            </span>
          </div>
        )}

        <div className="flex-1 flex flex-col px-6 py-12 h-screen">
          {/* 根据activeView渲染不同内容 */}
          {activeView === 'chat' && (
            <>
              {/* 标题 - 在页面绝对中心 */}
              {chat.messages.length === 1 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-7xl font-normal text-black mb-12">Ask PM.Dev Anything</h1>
                    
                    {/* 输入框 */}
                    <div className="flex justify-center mb-8">
                      <div className="w-full max-w-2xl">
                        <AnimatedAIInput
                          onSendMessage={(message, modelId, enableWS) => chat.handleSendMessage(message, modelId, undefined, enableWS)}
                          placeholder="What is Web3?"
                          disabled={chat.isLoading}
                          selectedModel={chat.selectedModel}
                          onModelChange={chat.setSelectedModel}
                          webSearchEnabled={webSearchEnabled}
                          onWebSearchToggle={setWebSearchEnabled}
                        />
                      </div>
                    </div>

                    {/* 快捷按钮 - Claude风格 */}
                    <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.onClick}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {action.icon}
                          <span>{action.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 有对话时的布局 */}
              {chat.messages.length > 1 && (
                <div className="flex-1 flex flex-col h-full">
                  {/* 消息显示区域 - 可滚动，带渐变 */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto pb-40 relative" 
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    <div className="max-w-2xl mx-auto space-y-8 px-6 pt-6">
                      {chat.messages.slice(1).map((message) => {
                        const blocks = convertMessageToBlocks(message);
                        
                        return (
                          <EnhancedMessageItem
                            key={message.id}
                            message={{
                              ...message,
                              blocks: Object.keys(blocks)
                            }}
                            blocks={blocks}
                            isGenerating={message.isGenerating}
                            showTimestamp={true}
                            showActions={true}
                            density="normal"
                          />
                        );
                      })}
                      
                      {/* 底部占位空间，确保最后一条消息不被遮挡 */}
                      <div className="h-32"></div>
                    </div>
                  </div>

                  {/* 输入框区域 - 固定在底部，无分割线 */}
                  <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm">
                    <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-[300px]' : 'md:ml-[60px]'} ml-0`}>
                      <div className="max-w-2xl mx-auto px-6 py-4">
                        <AnimatedAIInput
                          onSendMessage={(message, modelId, enableWS) => chat.handleSendMessage(message, modelId, undefined, enableWS)}
                          placeholder="What is Web3?"
                          disabled={chat.isLoading}
                          selectedModel={chat.selectedModel}
                          onModelChange={chat.setSelectedModel}
                          webSearchEnabled={webSearchEnabled}
                          onWebSearchToggle={setWebSearchEnabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Prompt工具视图 - 移除padding让其占满整个容器 */}
          {activeView === 'prompt-stash' && (
            <div className="flex-1 overflow-hidden -mx-6 -my-12">
              <PromptStashView />
            </div>
          )}

          {/* PRD工具视图 */}
          {activeView === 'prd-house' && (
            <div className="flex-1 overflow-hidden -mx-6 -my-12">
              <PRDHouseViewRefactored />
            </div>
          )}

          {/* 原型生成视图 */}
          {activeView === 'prototype-house' && (
            <div className="flex-1 flex overflow-hidden -mx-6 -my-12 h-screen">
              {/* 左侧对话区域 - 固定380px宽度 */}
              <div className="flex flex-col bg-white" style={{ width: '380px', minWidth: '380px', maxWidth: '380px' }}>
                {/* PRD信息和步骤区域 */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-6 pb-8">
                    {/* PRD文档消息 - 简化版 */}
                    <PrototypePRDMessage />
                    
                    {/* 错误信息气泡 */}
                    {prototypeError && (
                      <div className="w-full">
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl px-4 py-3">
                          <div className="text-sm leading-relaxed">
                            <div className="font-medium mb-1">生成失败</div>
                            <div>{prototypeError}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 重新生成按钮 - 只在失败时显示 */}
                    {prototypeError && (
                      <div className="w-full">
                        <button
                          onClick={() => {
                            setPrototypeError(null);
                            handlePrototypeMessage();
                          }}
                          disabled={isGeneratingPrototype}
                          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors"
                          style={{ 
                            backgroundColor: isGeneratingPrototype ? '#fb923c' : '#ea580c'
                          }}
                        >
                          {isGeneratingPrototype ? '正在重新生成...' : '重新生成原型'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 右侧预览区域 - 占用剩余所有空间 */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Tab 导航 - 固定高度，去掉分割线 */}
                <div className="flex-shrink-0">
                  <RightTabNavigation />
                </div>
                
                {/* 预览内容 - 占用剩余高度 */}
                <div className="flex-1 min-h-0">
                  <PrototypePreviewPanel />
                </div>
              </div>
            </div>
          )}

          {/* 无限画布视图 */}
          {activeView === 'infinite-canvas' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-normal text-black mb-4">无限画布</h1>
                <p className="text-gray-600">思维导图和流程图工具正在开发中...</p>
              </div>
            </div>
          )}

          {/* Agent 研究视图 */}
          {activeView === 'agent-research' && (
            <>
              {/* 标题 - 在页面绝对中心 */}
              {agentResearch.agentMessages.length === 1 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-7xl font-normal text-black mb-12">Ask PM.Dev To Research</h1>
                    
                    {/* 输入框 - 和主页面一样大 */}
                    <div className="flex justify-center mb-8">
                      <div className="w-full max-w-2xl">
                        <AnimatedAIInput
                          onSendMessage={(message) => agentResearch.handleAgentResearchMessage(message)}
                          placeholder="请描述您想要研究的主题..."
                          disabled={agentResearch.isLoading}
                          selectedModel="gemini-2.0-flash"
                          onModelChange={() => {}}
                          webSearchEnabled={false}
                          onWebSearchToggle={() => {}}
                          hideModelSelector={true}
                          hideSearchIcon={true}
                        />
                      </div>
                    </div>

                    {/* 快捷按钮 - 与主页面样式一致 */}
                    <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                      <button
                        onClick={() => agentResearch.handleAgentResearchMessage("大模型发展趋势")}
                        disabled={agentResearch.isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>大模型发展趋势</span>
                      </button>
                      
                      <button
                        onClick={() => agentResearch.handleAgentResearchMessage("AI在区块链中的应用")}
                        disabled={agentResearch.isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <FileText className="w-4 h-4" />
                        <span>AI在区块链中的应用</span>
                      </button>
                      
                      <button
                        onClick={() => agentResearch.handleAgentResearchMessage("Vibe Coding的未来")}
                        disabled={agentResearch.isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>Vibe Coding的未来</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 对话区域 - 使用与测试页面相同的样式 */}
              {agentResearch.agentMessages.length > 1 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                      {agentResearch.agentMessages.slice(1).map((message) => (
                        <div key={message.id} className="space-y-4">
                          {/* 用户消息 */}
                          {message.role === 'user' && (
                            <div className="flex justify-end">
                              <div className="bg-black text-white px-4 py-2 rounded-lg max-w-xs">
                                {message.content}
                              </div>
                            </div>
                          )}

                          {/* Assistant 消息 - 不使用气泡包裹，直接展示 */}
                          {message.role === 'assistant' && (
                            <div className="space-y-4">
                              {/* 加载状态 - 当开始研究但还没有具体步骤内容时显示 */}
                              {message.isGenerating && (!message.agentPlan || message.agentPlan.steps.length === 0 || 
                                (message.agentPlan.steps.length === 1 && !message.agentPlan.steps[0].details?.length)) && (
                                <div className="max-w-[85%]">
                                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl px-4 py-3">
                                    <div className="text-sm leading-relaxed">
                                      <TextShimmer duration={1.5} spread={1}>
                                        正在思考中...
                                      </TextShimmer>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Agent Plan 展示 - 使用新的 ResearchPlan 组件 */}
                              {message.agentPlan && message.agentPlan.steps.length > 0 && (() => {
                                const tasks = convertLangGraphToResearchTasks(message.agentPlan.steps);
                                // 动态生成展开的任务ID列表
                                const expandedTaskIds = tasks.map(task => task.id);
                                
                                // 🔥 关键修复：直接使用useAgentResearch提供的currentStep
                                const currentStep = message.agentPlan.currentStep || getCurrentExecutingStep(message.agentPlan.steps);
                                const isActive = message.agentPlan.status === 'running';
                                
                                // 调试信息
                                console.log('ask-anything 调试信息:', {
                                  agentPlanStatus: message.agentPlan.status,
                                  agentPlanCurrentStep: message.agentPlan.currentStep,
                                  getCurrentExecutingStepResult: getCurrentExecutingStep(message.agentPlan.steps),
                                  finalCurrentStep: currentStep,
                                  isActive,
                                  totalSteps: message.agentPlan.steps.length,
                                  lastStep: message.agentPlan.steps[message.agentPlan.steps.length - 1]
                                });
                                
                                return (
                                  <div className="max-w-[85%] space-y-2">
                                    <ResearchPlan 
                                      tasks={tasks}
                                      expandedTaskIds={expandedTaskIds}
                                      currentStep={currentStep}
                                      isActive={isActive}
                                      showReport={message.agentPlan?.status === 'completed' && !!message.content}
                                      reportContent={message.content}
                                      onReportView={() => agentResearch.setShowReport(true)}
                                      className="p-0"
                                      enableProgressiveDisplay={true}
                                    />
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* 任务完成后的新研究按钮 */}
                      {(() => {
                        const lastMessage = agentResearch.agentMessages.filter(m => m.role === 'assistant').pop();
                        const isTaskCompleted = lastMessage?.agentPlan?.status === 'completed';
                        
                        if (isTaskCompleted) {
                          return (
                            <div className="flex justify-center mt-8 mb-8">
                              <div className="w-full max-w-2xl">
                                {/* 开始新研究按钮 - 样式参考 ask-anything 快捷按钮 */}
                                <button
                                  onClick={() => {
                                    // 清空当前对话，开始新研究
                                    agentResearch.agentMessages.splice(1); // 保留系统消息
                                    // 重新加载页面以确保状态完全重置
                                    window.location.href = `/ask-anything?view=agent-research`;
                                  }}
                                  className="flex items-center gap-2 px-4 py-3 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors mx-auto"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span>开始新的研究</span>
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* 底部占位空间 - 根据是否有输入框调整 */}
                      {(() => {
                        const lastMessage = agentResearch.agentMessages.filter(m => m.role === 'assistant').pop();
                        const isTaskCompleted = lastMessage?.agentPlan?.status === 'completed';
                        const hasActiveTask = lastMessage?.agentPlan && lastMessage.agentPlan.status === 'running';
                        const shouldShowInput = !agentResearch.isLoading && !hasActiveTask && !isTaskCompleted;
                        
                        return <div className={shouldShowInput ? "h-32" : "h-8"}></div>;
                      })()}
                    </div>
                  </div>

                  {/* 输入框区域 - 单线程任务，任务开始后隐藏 */}
                  {/* 只有在没有正在进行的任务且任务未完成时才显示输入框 */}
                  {!agentResearch.isLoading && (() => {
                    const lastMessage = agentResearch.agentMessages.filter(m => m.role === 'assistant').pop();
                    const isTaskCompleted = lastMessage?.agentPlan?.status === 'completed';
                    const hasActiveTask = lastMessage?.agentPlan && lastMessage.agentPlan.status === 'running';
                    
                    // 如果有活跃任务或任务已完成，就不显示输入框
                    if (hasActiveTask || isTaskCompleted) {
                      return null;
                    }
                    
                    return (
                      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm">
                        <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-[300px]' : 'md:ml-[60px]'} ml-0`}>
                          <div className="max-w-2xl mx-auto px-6 py-4">
                            <AnimatedAIInput
                              onSendMessage={(message) => agentResearch.handleAgentResearchMessage(message)}
                              placeholder="请描述您想要研究的主题..."
                              disabled={agentResearch.isLoading}
                              selectedModel="gemini-2.0-flash"
                              onModelChange={() => {}}
                              webSearchEnabled={false}
                              onWebSearchToggle={() => {}}
                              hideModelSelector={true}
                              hideSearchIcon={true}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 报告预览弹窗 */}
      <ResearchReportModal
        isOpen={agentResearch.showReport}
        onClose={() => agentResearch.setShowReport(false)}
        reportContent={
          agentResearch.agentMessages.filter(m => m.role === 'assistant' && m.content).pop()?.content || ''
        }
        userQuery={
          agentResearch.agentMessages.find(m => m.role === 'user')?.content || ''
        }
      />
    </div>
  );
}

// 加载组件
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">正在加载...</p>
      </div>
    </div>
  );
}

// 主页面组件 - 包装在Suspense中
export default function AskAnythingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AskAnythingPageContent />
    </Suspense>
  );
} 