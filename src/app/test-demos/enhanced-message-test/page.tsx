'use client';

import { useState, useEffect, useRef } from "react";
import { AnimatedAIInput } from "@/components/ui/animated-ai-input";
import { EnhancedMessageItem } from "@/components/message/enhanced-message-item";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { 
  Message, 
  MessageBlock, 
  MessageBlockType,
  MainTextMessageBlock,
  CodeMessageBlock,
  CitationMessageBlock,
  ErrorMessageBlock,
  ThinkingMessageBlock,
  Citation
} from "@/types/message";
import { Home, Code, FileText, Brain, Sparkles } from "lucide-react";

export default function EnhancedMessageTestPage() {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [blocks, setBlocks] = useState<Record<string, MessageBlock>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  
  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 初始化欢迎消息
  useEffect(() => {
    const welcomeMessage = createWelcomeMessage();
    setMessages([welcomeMessage.message]);
    setBlocks(welcomeMessage.blocks);
  }, []);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 创建欢迎消息
  const createWelcomeMessage = () => {
    const messageId = 'welcome-msg';
    const textBlockId = 'welcome-text-block';
    
    const textBlock: MainTextMessageBlock = {
      id: textBlockId,
      type: MessageBlockType.MAIN_TEXT,
      content: `# 🎉 欢迎使用增强消息系统！

这是一个基于Cherry Studio架构设计的新消息系统测试页面。

## ✨ 新功能特性

- **📝 增强Markdown渲染**：支持GFM、数学公式、表格等
- **💻 智能代码块**：语法高亮、行号、复制、编辑功能
- **🔗 引用系统**：Web搜索结果和知识库引用
- **🧠 思考过程**：AI推理过程可视化
- **⚠️ 错误处理**：优雅的错误信息展示
- **🖼️ 多媒体支持**：图片、视频等内容块

## 🚀 测试指令

尝试输入以下指令来测试不同的功能：

- \`/code\` - 生成代码块示例
- \`/markdown\` - 展示Markdown渲染
- \`/error\` - 显示错误信息
- \`/thinking\` - 展示思考过程
- \`/citation\` - 显示引用信息
- \`/math\` - 数学公式渲染

开始体验吧！`,
      createdAt: new Date()
    };

    const message: Message = {
      id: messageId,
      role: 'assistant',
      blocks: [textBlockId],
      timestamp: new Date()
    };

    return {
      message,
      blocks: { [textBlockId]: textBlock }
    };
  };

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    // 添加用户消息
    const userMessageId = `user-${Date.now()}`;
    const userTextBlockId = `${userMessageId}-text`;
    
    const userTextBlock: MainTextMessageBlock = {
      id: userTextBlockId,
      type: MessageBlockType.MAIN_TEXT,
      content,
      createdAt: new Date()
    };

    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      blocks: [userTextBlockId],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setBlocks(prev => ({ ...prev, [userTextBlockId]: userTextBlock }));
    setIsLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      const response = generateResponse(content);
      setMessages(prev => [...prev, response.message]);
      setBlocks(prev => ({ ...prev, ...response.blocks }));
      setIsLoading(false);
    }, 1000 + Math.random() * 2000); // 1-3秒随机延迟
  };

  // 生成AI响应
  const generateResponse = (userInput: string) => {
    const messageId = `assistant-${Date.now()}`;
    const lowerInput = userInput.toLowerCase();
    
    // 根据用户输入生成不同类型的响应
    if (lowerInput.includes('/code') || lowerInput.includes('代码')) {
      return generateCodeResponse(messageId);
    } else if (lowerInput.includes('/markdown') || lowerInput.includes('markdown')) {
      return generateMarkdownResponse(messageId);
    } else if (lowerInput.includes('/error') || lowerInput.includes('错误')) {
      return generateErrorResponse(messageId);
    } else if (lowerInput.includes('/thinking') || lowerInput.includes('思考')) {
      return generateThinkingResponse(messageId);
    } else if (lowerInput.includes('/citation') || lowerInput.includes('引用')) {
      return generateCitationResponse(messageId);
    } else if (lowerInput.includes('/math') || lowerInput.includes('数学')) {
      return generateMathResponse(messageId);
    } else {
      return generateDefaultResponse(messageId, userInput);
    }
  };

  // 生成代码块响应
  const generateCodeResponse = (messageId: string) => {
    const textBlockId = `${messageId}-text`;
    const codeBlockId = `${messageId}-code`;

    const textBlock: MainTextMessageBlock = {
      id: textBlockId,
      type: MessageBlockType.MAIN_TEXT,
      content: `## 🔥 智能代码块演示

以下是一个React组件示例，展示了代码高亮、行号显示和复制功能：`,
      createdAt: new Date()
    };

    const codeBlock: CodeMessageBlock = {
      id: codeBlockId,
      type: MessageBlockType.CODE,
      content: `import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
  filename?: string;
  editable?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  code,
  filename,
  editable = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={\`language-\${language}\`}>
          {code}
        </code>
      </pre>
      
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
};`,
      language: 'typescript',
      filename: 'CodeBlock.tsx',
      editable: true,
      createdAt: new Date()
    };

    const message: Message = {
      id: messageId,
      role: 'assistant',
      blocks: [textBlockId, codeBlockId],
      timestamp: new Date()
    };

    return {
      message,
      blocks: { 
        [textBlockId]: textBlock,
        [codeBlockId]: codeBlock
      }
    };
  };

  // 生成Markdown响应
  const generateMarkdownResponse = (messageId: string) => {
    const textBlockId = `${messageId}-text`;

    const textBlock: MainTextMessageBlock = {
      id: textBlockId,
      type: MessageBlockType.MAIN_TEXT,
      content: `# 📝 Markdown渲染演示

## 文本格式

这是一个**粗体文本**示例，这是一个*斜体文本*示例，这是一个\`内联代码\`示例。

## 列表

### 无序列表
- 第一项内容
- 第二项内容
  - 嵌套列表项
  - 另一个嵌套项
- 第三项内容

### 有序列表
1. 第一步：规划和设计
2. 第二步：开发和实现
3. 第三步：测试和优化

## 表格

| 功能 | 状态 | 优先级 |
|------|------|--------|
| Markdown渲染 | ✅ 完成 | 高 |
| 代码高亮 | ✅ 完成 | 高 |
| 引用系统 | 🚧 开发中 | 中 |
| 多媒体支持 | 📋 计划中 | 低 |

## 引用

> 这是一个引用块的示例。
> 
> 引用可以包含多行内容，非常适合展示重要的信息。

## 链接

访问 [GitHub](https://github.com) 查看更多开源项目。

以上展示了Markdown的各种功能！`,
      createdAt: new Date()
    };

    const message: Message = {
      id: messageId,
      role: 'assistant',
      blocks: [textBlockId],
      timestamp: new Date()
    };

    return {
      message,
      blocks: { [textBlockId]: textBlock }
    };
  };

  // 生成错误响应
  const generateErrorResponse = (messageId: string) => {
    const errorBlockId = `${messageId}-error`;

    const errorBlock: ErrorMessageBlock = {
      id: errorBlockId,
      type: MessageBlockType.ERROR,
      error: 'API调用失败：网络连接超时',
      details: `Error Details:
- Status Code: 408
- Message: Request Timeout
- Timestamp: ${new Date().toISOString()}
- Endpoint: /api/chat-completion

Stack Trace:
  at fetch (/lib/api-client.ts:45:12)
  at ChatService.sendMessage (/services/chat.ts:23:8)`,
      createdAt: new Date()
    };

    const message: Message = {
      id: messageId,
      role: 'assistant',
      blocks: [errorBlockId],
      timestamp: new Date()
    };

    return {
      message,
      blocks: { [errorBlockId]: errorBlock }
    };
  };

  // 生成思考过程响应
  const generateThinkingResponse = (messageId: string) => {
    const textBlockId = `${messageId}-text`;
    const thinkingBlockId = `${messageId}-thinking`;

    const textBlock: MainTextMessageBlock = {
      id: textBlockId,
      type: MessageBlockType.MAIN_TEXT,
      content: `## 🧠 AI思考过程演示

这是一个展示AI思考过程的示例。点击下方的"显示思考过程"按钮可以查看AI是如何分析和推理问题的。

**最终回答**：基于分析，我认为新的消息块架构将显著提升用户体验和开发效率。`,
      createdAt: new Date()
    };

    const thinkingBlock: ThinkingMessageBlock = {
      id: thinkingBlockId,
      type: MessageBlockType.THINKING,
      content: `让我分析一下这个问题...

首先，我需要考虑以下几个方面：

1. **技术可行性**
   - 当前的React架构是否支持？
   - TypeScript类型系统的复杂度如何？
   - 性能影响是否在可接受范围内？

2. **用户体验**
   - 消息渲染是否足够流畅？
   - 交互体验是否直观？
   - 响应式设计是否完善？

经过分析，我发现这个方案是可行且推荐的。`,
      visible: false,
      createdAt: new Date()
    };

    const message: Message = {
      id: messageId,
      role: 'assistant',
      blocks: [textBlockId, thinkingBlockId],
      timestamp: new Date()
    };

    return {
      message,
      blocks: { 
        [textBlockId]: textBlock,
        [thinkingBlockId]: thinkingBlock
      }
    };
  };

  // 生成引用响应
  const generateCitationResponse = (messageId: string) => {
    const textBlockId = `${messageId}-text`;
    const citationBlockId = `${messageId}-citation`;

    const textBlock: MainTextMessageBlock = {
      id: textBlockId,
      type: MessageBlockType.MAIN_TEXT,
      content: `## 🔗 引用系统演示

根据我的搜索和分析，以下是关于现代Web开发趋势的相关信息。`,
      createdAt: new Date()
    };

    const citations: Citation[] = [
      {
        number: 1,
        url: 'https://react.dev/blog/2023/03/16/introducing-react-dev',
        title: 'Introducing react.dev',
        hostname: 'react.dev',
        content: 'Learn React with the new interactive tutorial and documentation.',
        showFavicon: true,
        type: 'websearch'
      },
      {
        number: 2,
        url: 'https://nextjs.org/blog/next-14',
        title: 'Next.js 14',
        hostname: 'nextjs.org', 
        content: 'Next.js 14 introduces significant performance improvements.',
        showFavicon: true,
        type: 'websearch'
      }
    ];

    const citationBlock: CitationMessageBlock = {
      id: citationBlockId,
      type: MessageBlockType.CITATION,
      citations,
      createdAt: new Date()
    };

    const message: Message = {
      id: messageId,
      role: 'assistant',
      blocks: [textBlockId, citationBlockId],
      timestamp: new Date()
    };

    return {
      message,
      blocks: { 
        [textBlockId]: textBlock,
        [citationBlockId]: citationBlock
      }
    };
  };

  // 生成数学公式响应
  const generateMathResponse = (messageId: string) => {
    const textBlockId = `${messageId}-text`;

    const textBlock: MainTextMessageBlock = {
      id: textBlockId,
      type: MessageBlockType.MAIN_TEXT,
      content: `## 🔢 数学公式渲染演示

### 行内公式

在人工智能中，损失函数 $L(\\theta) = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - f(x_i, \\theta))^2$ 用于衡量模型预测与真实值的差异。

### 块级公式

**梯度下降算法**：

$$
\\theta_{t+1} = \\theta_t - \\alpha \\nabla L(\\theta_t)
$$

**正态分布概率密度函数**：

$$
f(x) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}
$$

**欧拉公式**：

$$
e^{i\\pi} + 1 = 0
$$

这个公式被称为"最美丽的数学公式"。`,
      createdAt: new Date()
    };

    const message: Message = {
      id: messageId,
      role: 'assistant',
      blocks: [textBlockId],
      timestamp: new Date()
    };

    return {
      message,
      blocks: { [textBlockId]: textBlock }
    };
  };

  // 生成默认响应
  const generateDefaultResponse = (messageId: string, userInput: string) => {
    const textBlockId = `${messageId}-text`;

    const textBlock: MainTextMessageBlock = {
      id: textBlockId,
      type: MessageBlockType.MAIN_TEXT,
      content: `感谢您的提问："${userInput}"

我是增强消息系统的AI助手。请尝试以下指令：

- \`/code\` - 查看代码块演示
- \`/markdown\` - 体验Markdown渲染
- \`/error\` - 查看错误处理
- \`/thinking\` - 展示AI思考过程
- \`/citation\` - 查看引用系统
- \`/math\` - 数学公式渲染

试试看吧！🚀`,
      createdAt: new Date()
    };

    const message: Message = {
      id: messageId,
      role: 'assistant',
      blocks: [textBlockId],
      timestamp: new Date()
    };

    return {
      message,
      blocks: { [textBlockId]: textBlock }
    };
  };

  // 处理块编辑
  const handleBlockEdit = (blockId: string, updates: Partial<MessageBlock>) => {
    setBlocks(prev => ({
      ...prev,
      [blockId]: { ...prev[blockId], ...updates } as MessageBlock
    }));
  };

  // 快捷按钮配置
  const quickActions = [
    {
      title: "代码演示",
      icon: <Code className="h-4 w-4" />,
      onClick: () => handleSendMessage("/code")
    },
    {
      title: "Markdown",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => handleSendMessage("/markdown")
    },
    {
      title: "思考过程",
      icon: <Brain className="h-4 w-4" />,
      onClick: () => handleSendMessage("/thinking")
    },
    {
      title: "数学公式",
      icon: <Sparkles className="h-4 w-4" />,
      onClick: () => handleSendMessage("/math")
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href="/test-demos"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>返回测试首页</span>
            </a>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">增强消息系统测试</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 py-12 h-screen">
        {/* 标题区域 - 只在没有消息时显示 */}
        {messages.length === 1 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-7xl font-normal text-black mb-12">Enhanced Message System</h1>
              
              {/* 输入框 */}
              <div className="flex justify-center mb-8">
                <div className="w-full max-w-2xl">
                  <AnimatedAIInput
                    onSendMessage={(message) => handleSendMessage(message)}
                    placeholder="输入消息或测试指令（如 /code, /markdown）..."
                    disabled={isLoading}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    webSearchEnabled={false}
                    onWebSearchToggle={() => {}}
                  />
                </div>
              </div>

              {/* 快捷按钮 */}
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {action.icon}
                    <span>{action.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 消息区域 */}
        {messages.length > 1 && (
          <div className="flex-1 flex flex-col h-full">
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto pb-40 relative" 
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="max-w-4xl mx-auto space-y-8 px-6 pt-6">
                {messages.slice(1).map((message) => (
                  <EnhancedMessageItem
                    key={message.id}
                    message={message}
                    blocks={blocks}
                    isGenerating={isLoading && message === messages[messages.length - 1]}
                    onBlockEdit={handleBlockEdit}
                  />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] flex flex-col items-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <TextShimmer duration={1.5} spread={1}>
                          AI正在思考中...
                        </TextShimmer>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="h-32"></div>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200">
              <div className="max-w-4xl mx-auto px-6 py-4">
                <AnimatedAIInput
                  onSendMessage={(message) => handleSendMessage(message)}
                  placeholder="输入消息或测试指令..."
                  disabled={isLoading}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  webSearchEnabled={false}
                  onWebSearchToggle={() => {}}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 