'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Lightbulb, Loader2, MessageSquareText, ArrowLeft, PlusCircle, AlertTriangle, Plus, Wand2 } from 'lucide-react';
import { 
  PromptTemplate, 
  PromptVariable,
  getAllTemplates, 
  getCategoriesFromTemplates,
  searchTemplatesInList,
  saveCustomTemplate,
  deleteCustomTemplate
} from '@/data/prompt-templates';
import TemplateCard from './TemplateCard';
import { AnimatedAIInput } from '@/components/ui/animated-ai-input';
import { EnhancedMessageItem } from '@/components/message/enhanced-message-item';
import { Message, MessageBlock, MessageBlockType, MainTextMessageBlock } from '@/types/message';
import { DEFAULT_MODEL } from '@/config/models';

// 定义消息类型
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

export default function PromptHouseView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  
  // 对话相关状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 增强消息系统状态
  const [enhancedMessages, setEnhancedMessages] = useState<Message[]>([]);
  const [messageBlocks, setMessageBlocks] = useState<Record<string, MessageBlock>>({});

  // 将旧消息转换为增强消息系统
  const convertToEnhancedMessages = useCallback((oldMessages: ChatMessage[]) => {
    const newMessages: Message[] = [];
    const newBlocks: Record<string, MessageBlock> = {};

    oldMessages.forEach(oldMessage => {
      // 创建消息块
      const blockId = `${oldMessage.id}-text`;
      const textBlock: MainTextMessageBlock = {
        id: blockId,
        type: MessageBlockType.MAIN_TEXT,
        content: oldMessage.content,
        createdAt: oldMessage.timestamp
      };

      // 创建消息
      const newMessage: Message = {
        id: oldMessage.id,
        role: oldMessage.role as 'user' | 'assistant' | 'system',
        blocks: [blockId],
        timestamp: oldMessage.timestamp,
        isGenerating: oldMessage.isGenerating
      };

      newMessages.push(newMessage);
      newBlocks[blockId] = textBlock;
    });

    setEnhancedMessages(newMessages);
    setMessageBlocks(newBlocks);
  }, []);

  // 监听消息变化并转换
  useEffect(() => {
    convertToEnhancedMessages(messages);
  }, [messages, convertToEnhancedMessages]);

  // New state variables for async loading
  const [allTemplates, setAllTemplates] = useState<PromptTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      setTemplateError(null);
      try {
        const templates = await getAllTemplates();
        setAllTemplates(templates);
      } catch (err) {
        console.error("Failed to load templates:", err);
        setTemplateError('Failed to load templates. Please try again later.');
      }
      setIsLoadingTemplates(false);
    };
    loadTemplates();
  }, []);

  // Filter only Cherry Studio templates (id starts with 'cs-')
  const cherryStudioTemplates = useMemo(() => {
    if (isLoadingTemplates || templateError) return [];
    return allTemplates.filter(template => template.id.startsWith('cs-'));
  }, [allTemplates, isLoadingTemplates, templateError]);

  // Recalculate categories when cherryStudioTemplates changes
  const categories = useMemo(() => {
    if (isLoadingTemplates || templateError) return [];
    return getCategoriesFromTemplates(cherryStudioTemplates);
  }, [cherryStudioTemplates, isLoadingTemplates, templateError]);

  // Recalculate filtered templates when search/category/cherryStudioTemplates changes
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;
    
    // 过滤分类
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }
    
    // 搜索过滤
    if (searchQuery) {
      filtered = searchTemplatesInList(searchQuery, selectedCategory || undefined, filtered);
    }
    
    return filtered;
  }, [allTemplates, selectedCategory, searchQuery]);

  // Refresh templates after custom template operations
  const refreshTemplates = async () => {
    setIsLoadingTemplates(true);
    setTemplateError(null);
    try {
      const templates = await getAllTemplates();
      setAllTemplates(templates);
    } catch (error) {
      console.error('Failed to refresh templates:', error);
      setTemplateError('刷新模板失败');
    } finally {
      setIsLoadingTemplates(false);
    }
  };



  // 当选择新模板时重置对话
  useEffect(() => {
    if (selectedTemplate) {
      // 清空消息，让用户直接开始对话
      setMessages([]);
    }
  }, [selectedTemplate]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 发送消息的处理函数
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
    setIsLoading(true);

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
        const errorData = await response.json().catch(() => ({ error: { message: "请求失败，无法解析错误信息" } }));
        console.error("API Error from /api/chat-multi:", response.status, errorData);
        const errorMessages = newMessages.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: `错误: ${errorData.error?.message || errorData.details || response.statusText || '请求失败'}`, isGenerating: false }
            : msg
        );
        setMessages(errorMessages);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader from /api/chat-multi");
      }
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (accumulatedContent) {
            const finalMessages = newMessages.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedContent, isGenerating: false }
                : msg
            );
            setMessages(finalMessages);
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            
            if (!jsonStr || jsonStr === '[DONE]') {
              continue;
            }
            
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
      console.error("Fetch Error to /api/chat-multi:", error);
      const errorMessages = newMessages.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: `请求出错: ${error instanceof Error ? error.message : '未知错误'}`, isGenerating: false }
          : msg
      );
      setMessages(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存自定义模板
  const handleSaveCustomTemplate = (template: Partial<PromptTemplate>) => {
    saveCustomTemplate(template);
    setShowCustomForm(false);
    setEditingTemplate(null);
    refreshTemplates(); // Refresh the list
  };

  // 删除自定义模板
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('确定要删除这个自定义模板吗？')) {
      deleteCustomTemplate(templateId);
      refreshTemplates(); // Refresh the list
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null); // Deselect if the deleted template was selected
      }
    }
  };

  // 当选择一个模板时
  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setMessages([]); // 清空消息
    setShowCustomForm(false); // 关闭自定义表单
    // 可能需要重置聊天相关的其他状态，例如isLoading
    setIsLoading(false); 
  };

  const handleBackToList = () => {
    setSelectedTemplate(null);
    setMessages([]);
    setShowCustomForm(false);
    setIsLoading(false);
  };

  if (isLoadingTemplates) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
        <p className="text-lg">正在加载模板...</p>
      </div>
    );
  }

  if (templateError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-red-600">
        <Wand2 className="w-12 h-12 mb-4" />
        <p className="text-lg">加载模板失败</p>
        <p className="text-sm">{templateError}</p>
        <button 
          onClick={refreshTemplates} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* 左侧面板 */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Prompt 工具</h1>
          <p className="text-sm text-gray-600">测试 Prompt 模板功能和AI生成效果</p>
        </div>

        {/* 搜索框 */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 分类按钮 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">分类</h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                  selectedCategory === category
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 自定义模板按钮 */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => {
              setShowCustomForm(true);
              setSelectedTemplate(null);
              setEditingTemplate(null);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            自定义
          </button>
        </div>

        {/* 模板列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : templateError ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 mb-2">加载模板失败</p>
              <button
                onClick={refreshTemplates}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                重试
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onClick={() => handleSelectTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col">
        {showCustomForm ? (
          // 自定义模板表单
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToList}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTemplate ? '编辑模板' : '创建自定义模板'}
                </h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <CustomTemplateForm
                template={editingTemplate}
                onSave={async (template) => {
                  try {
                    await saveCustomTemplate(template);
                    setShowCustomForm(false);
                    setEditingTemplate(null);
                    await refreshTemplates();
                  } catch (error) {
                    console.error('保存模板失败:', error);
                  }
                }}
                onCancel={() => {
                  setShowCustomForm(false);
                  setEditingTemplate(null);
                }}
              />
            </div>
          </div>
        ) : selectedTemplate ? (
          // 聊天界面
          <div className="flex flex-col h-full bg-white">
            {/* 聊天头部 */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToList}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedTemplate.emoji}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h2>
                </div>
              </div>
            </div>

            {/* 聊天消息区域 */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {enhancedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="bg-gray-50 rounded-full p-4 mb-4">
                    <MessageSquareText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    开始与 {selectedTemplate.name} 对话
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    {selectedTemplate.description}
                  </p>
                </div>
              ) : (
                enhancedMessages.map((message) => (
                  <EnhancedMessageItem
                    key={message.id}
                    message={message}
                    blocks={messageBlocks}
                    isGenerating={message.isGenerating}
                    onBlockEdit={() => {}}
                  />
                ))
              )}
            </div>

            {/* 聊天输入区域 */}
            <div className="bg-white border-t border-gray-200 p-6">
              <AnimatedAIInput
                onSendMessage={handleSendMessage}
                placeholder={`与 ${selectedTemplate.name} 对话...`}
                disabled={isLoading}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          </div>
        ) : (
          // 未选择模板时的占位符
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="bg-gray-50 rounded-full p-6 mb-4 mx-auto w-fit">
                <Lightbulb className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">选择一个模板开始</h3>
              <p className="text-gray-600">
                从左侧选择一个 Prompt 模板，或创建自定义模板
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 自定义模板表单组件
interface CustomTemplateFormProps {
  template?: PromptTemplate | null;
  onSave: (template: Omit<PromptTemplate, 'isCustom' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function CustomTemplateForm({ template, onSave, onCancel }: CustomTemplateFormProps) {
  const [formData, setFormData] = useState({
    id: template?.id || '',
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || '',
    prompt: template?.prompt || '',
    variables: template?.variables || [] as PromptVariable[],
    tags: template?.tags.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.prompt) {
      alert('请填写必填字段');
      return;
    }

    const templateData: Omit<PromptTemplate, 'isCustom' | 'createdAt' | 'updatedAt'> = {
      id: formData.id || `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      category: formData.category || '自定义',
      prompt: formData.prompt,
      variables: formData.variables,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    onSave(templateData);
  };

  const addVariable = () => {
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, {
        name: '',
        type: 'text',
        label: '',
        required: false
      }]
    }));
  };

  const updateVariable = (index: number, field: keyof PromptVariable, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) => 
        i === index ? { ...variable, [field]: value } : variable
      )
    }));
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {template ? '编辑自定义模板' : '创建自定义模板'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">模板名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">描述 *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">分类</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="例如：营销、写作、编程"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">标签</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="用逗号分隔，例如：营销,文案,创意"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prompt 模板 *</label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                className="w-full p-2 border rounded-lg font-mono text-sm"
                rows={6}
                placeholder="使用 {{变量名}} 的格式定义变量"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">变量定义</label>
                <button
                  type="button"
                  onClick={addVariable}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  添加变量
                </button>
              </div>
              
              {formData.variables.map((variable, index) => (
                <div key={index} className="border rounded-lg p-3 mb-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="变量名"
                      value={variable.name}
                      onChange={(e) => updateVariable(index, 'name', e.target.value)}
                      className="p-2 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="显示标签"
                      value={variable.label}
                      onChange={(e) => updateVariable(index, 'label', e.target.value)}
                      className="p-2 border rounded text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <select
                      value={variable.type}
                      onChange={(e) => updateVariable(index, 'type', e.target.value as 'text' | 'textarea' | 'select')}
                      className="p-2 border rounded text-sm"
                    >
                      <option value="text">文本</option>
                      <option value="textarea">多行文本</option>
                      <option value="select">下拉选择</option>
                    </select>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={variable.required || false}
                        onChange={(e) => updateVariable(index, 'required', e.target.checked)}
                      />
                      必填
                    </label>
                    <button
                      type="button"
                      onClick={() => removeVariable(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="提示文本"
                    value={variable.placeholder || ''}
                    onChange={(e) => updateVariable(index, 'placeholder', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                  {variable.type === 'select' && (
                    <input
                      type="text"
                      placeholder="选项（用逗号分隔）"
                      value={(variable.options || []).join(', ')}
                      onChange={(e) => updateVariable(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full p-2 border rounded text-sm mt-2"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {template ? '更新' : '创建'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 