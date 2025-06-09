'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, MessageCircle, Lightbulb, Bookmark, GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllTemplates, searchTemplatesInList } from '@/data/prompt-templates';
import { PromptCard, ExtendedPromptTemplate } from './PromptCard';
import { AnimatedAIInput } from '@/components/ui/animated-ai-input';
import { MessageItem } from '@/components/message/message-item';
import CreatePromptDialog from './CreatePromptDialog';

// Default model for chat
const DEFAULT_MODEL = 'gpt-4o-mini';

// 聊天消息接口
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

// Tab类型
type ActiveTab = 'all' | 'favorites';

// Tab 导航组件
function TabNavigation({ 
  activeTab, 
  onTabChange,
  onCreateClick 
}: { 
  activeTab: ActiveTab; 
  onTabChange: (tab: ActiveTab) => void;
  onCreateClick: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Create 按钮 */}
      <button
        onClick={onCreateClick}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        <Plus className="w-4 h-4" />
        Create
      </button>
      
      {/* Tab 选择 */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => onTabChange('all')}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === 'all'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          All
        </button>
        <button
          onClick={() => onTabChange('favorites')}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1",
            activeTab === 'favorites'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function PromptStashView() {
  // 基础状态
  const [allTemplates, setAllTemplates] = useState<ExtendedPromptTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);
  
  // Tab 和搜索状态
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 收藏状态 (使用 localStorage 持久化)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // 选中状态
  const [selectedTemplate, setSelectedTemplate] = useState<ExtendedPromptTemplate | null>(null);
  
  // 聊天状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 拖拽调整相关状态
  const [leftWidth, setLeftWidth] = useState(800); // 初始宽度 800px
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 创建Prompt弹窗状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // 最小宽度限制
  const MIN_LEFT_WIDTH = 400; // 最小左侧宽度
  const MIN_RIGHT_WIDTH = 400; // 最小右侧宽度

  // 处理拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // 处理拖拽移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // 计算新的左侧宽度，考虑最小宽度限制
    const newLeftWidth = Math.max(
      MIN_LEFT_WIDTH,
      Math.min(mouseX, containerWidth - MIN_RIGHT_WIDTH)
    );
    
    setLeftWidth(newLeftWidth);
  }, [isDragging]);

  // 处理拖拽结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 加载收藏列表
  useEffect(() => {
    const savedFavorites = localStorage.getItem('prompt-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // 加载模板
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      setTemplateError(null);
      try {
        const templates = await getAllTemplates();
        const extendedTemplates: ExtendedPromptTemplate[] = templates.map(template => ({
          ...template,
          isFavorited: favorites.has(template.id)
        }));
        setAllTemplates(extendedTemplates);
      } catch (error) {
        console.error("Failed to load templates:", error);
        setTemplateError('Failed to load templates. Please try again later.');
      }
      setIsLoadingTemplates(false);
    };
    loadTemplates();
  }, [favorites]);

  // 过滤模板
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;
    
    // Tab 过滤
    if (activeTab === 'favorites') {
      filtered = filtered.filter(template => template.isFavorited);
    }
    
    // 搜索过滤
    if (searchQuery) {
      filtered = searchTemplatesInList(searchQuery, undefined, filtered);
    }
    
    return filtered;
  }, [allTemplates, activeTab, searchQuery]);

  // 切换收藏
  const handleFavoriteToggle = (templateId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('prompt-favorites', JSON.stringify([...newFavorites]));
    
    // 更新模板状态
    setAllTemplates(prev => prev.map(template => ({
      ...template,
      isFavorited: newFavorites.has(template.id)
    })));
  };

  // 刷新模板列表
  const refreshTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const templates = await getAllTemplates();
      const extendedTemplates: ExtendedPromptTemplate[] = templates.map(template => ({
        ...template,
        isFavorited: favorites.has(template.id)
      }));
      setAllTemplates(extendedTemplates);
    } catch (error) {
      console.error("Failed to refresh templates:", error);
    }
    setIsLoadingTemplates(false);
  };

  // 处理创建成功
  const handleCreateSuccess = () => {
    refreshTemplates();
  };

  // 选择模板
  const handleSelectTemplate = (template: ExtendedPromptTemplate) => {
    setSelectedTemplate(template);
  };

  // 开始聊天
  const handleStartChat = (template: ExtendedPromptTemplate) => {
    setSelectedTemplate(template);
    setMessages([]); // 清空消息
  };

  // 发送消息
  const handleSendMessage = async (userInput: string, modelId?: string) => {
    if (!userInput.trim() || !selectedTemplate) return;

    const currentModel = modelId || selectedModel;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    const assistantMessageId = Date.now().toString() + '-assistant';
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isGenerating: true,
    };

    const newMessages = [...messages, userMessage, initialAssistantMessage];
    setMessages(newMessages);
    setIsChatLoading(true);

    // 使用模板的系统提示词
    const systemPrompt = selectedTemplate.prompt;

    const messagesForApi = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await fetch('/api/chat-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentModel,
          messages: messagesForApi,
          context: systemPrompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "请求失败" } }));
        const errorMessages = newMessages.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: `错误: ${errorData.error?.message || '请求失败'}`, isGenerating: false }
            : msg
        );
        setMessages(errorMessages);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get response reader");
      
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            
            if (!jsonStr || jsonStr === '[DONE]') continue;
            
            try {
              const parsedChunk = JSON.parse(jsonStr);
              const deltaContent = parsedChunk.choices?.[0]?.delta?.content;
              if (deltaContent) {
                accumulatedContent += deltaContent;
                const updatedMessages = newMessages.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: accumulatedContent, isGenerating: true }
                    : msg
                );
                setMessages(updatedMessages);
              }
              
              const finishReason = parsedChunk.choices?.[0]?.finish_reason;
              if (finishReason === 'stop' || finishReason === 'length') {
                const finalMessages = newMessages.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: accumulatedContent, isGenerating: false }
                    : msg
                );
                setMessages(finalMessages);
                return;
              }
            } catch {
              continue;
            }
          }
        }
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      const errorMessages = newMessages.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: `请求出错: ${error instanceof Error ? error.message : '未知错误'}`, isGenerating: false }
          : msg
      );
      setMessages(errorMessages);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="flex h-full bg-gray-50 relative">
      {/* 左侧 Prompts 面板 - 使用动态宽度 */}
      <div 
        className="bg-white border-r border-gray-200 flex flex-col"
        style={{ width: `${leftWidth}px` }}
      >
        {/* 头部 - Tab 和标题在同一行 */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Prompts</h2>
            <TabNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onCreateClick={() => setShowCreateDialog(true)}
            />
          </div>
          
          {/* 搜索框 - 移除下边框 */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Prompts 列表 - 与搜索框左右对齐 */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : templateError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">加载模板失败</p>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                重试
              </button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {activeTab === 'favorites' ? '还没有收藏的模板' : '没有找到匹配的模板'}
              </p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-x-3 gap-y-4",
              leftWidth >= 600 ? "grid-cols-2" : "grid-cols-1"
            )}>
              {filteredTemplates.map((template) => (
                <PromptCard
                  key={template.id}
                  template={template}
                  isActive={selectedTemplate?.id === template.id}
                  isChatting={selectedTemplate?.id === template.id && messages.length > 0}
                  onSelect={handleSelectTemplate}
                  onFavoriteToggle={() => handleFavoriteToggle(template.id)}
                  onStartChat={() => handleStartChat(template)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 拖拽分割条 */}
      <div
        className="w-1 bg-gray-200 cursor-col-resize relative group"
        onMouseDown={handleMouseDown}
      >
        {/* 拖拽指示器 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-4 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <GripVertical className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* 右侧 AI Agent 聊天面板 */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedTemplate ? (
          <>
            {/* 聊天头部 - 使用emoji替换机器人图标 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-2xl">{selectedTemplate.emoji}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>

            {/* 聊天消息区域 */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    开始与 {selectedTemplate.name} 对话
                  </h3>
                  <p className="text-gray-600 max-w-md mb-4">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lightbulb className="w-4 h-4 text-orange-500" />
                    <span>AI Agent 将根据模板设定提供专业回答</span>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    id={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                    isGenerating={message.isGenerating}
                  />
                ))
              )}
            </div>

            {/* 聊天输入区域 - 移除顶部边框 */}
            <div className="p-4">
              <AnimatedAIInput
                onSendMessage={handleSendMessage}
                placeholder={`向 ${selectedTemplate.name} 提问...`}
                disabled={isChatLoading}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          </>
        ) : (
          // 未选择 prompt 时的占位符
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-6 mx-auto">
                <MessageCircle className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">选择一个 Prompt 开始</h3>
              <p className="text-gray-600 max-w-md">
                从左侧选择一个 Prompt 模板，开始与 AI Agent 对话
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* 创建Prompt弹窗 */}
      <CreatePromptDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
} 