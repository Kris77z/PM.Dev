'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { saveCustomTemplate, type PromptTemplate, type PromptVariable } from '@/data/prompt-templates';

interface CreatePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// 预定义的分类选项
const CATEGORIES = [
  '产品管理',
  '内容创作',
  '文档写作',
  '办公效率',
  '营销推广',
  '技术开发',
  '数据分析',
  '创意设计',
  '学习教育',
  '其他'
];

// Emoji选项
const EMOJI_OPTIONS = [
  '📝', '💡', '🚀', '⚡', '🎯', '📊', '🔧', '🎨', 
  '📋', '💼', '🌟', '🔍', '📈', '🎪', '🎭', '✨',
  '🎲', '🎯', '🚨', '⭐', '🔥', '💎', '🏆', '🎪'
];

export default function CreatePromptDialog({ open, onOpenChange, onSuccess }: CreatePromptDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    emoji: '✨',
    prompt: '',
    tags: '',
    variables: [] as PromptVariable[]
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [promptMode, setPromptMode] = useState<'manual' | 'variable'>('manual');

  // 预设变量模板
  const defaultVariables: PromptVariable[] = [
    { name: 'role', label: '角色', type: 'text', placeholder: '如：产品经理、设计师、开发者', required: false },
    { name: 'skill', label: '技能', type: 'text', placeholder: '如：需求分析、用户体验设计', required: false },
    { name: 'requirement', label: '要求', type: 'textarea', placeholder: '具体的任务要求或目标', required: false },
    { name: 'context', label: '背景', type: 'textarea', placeholder: '相关背景信息或上下文', required: false }
  ];

  // 变量值状态 - 用于存储用户填写的变量值
  const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({});

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      emoji: '✨',
      prompt: '',
      tags: '',
      variables: []
    });
    setVariableValues({});
    setPromptMode('manual');
  };

  // 切换到变量模式时，初始化默认变量
  const handleModeChange = (mode: 'manual' | 'variable') => {
    setPromptMode(mode);
    if (mode === 'variable') {
      setFormData(prev => ({ ...prev, variables: defaultVariables }));
    } else {
      setFormData(prev => ({ ...prev, variables: [] }));
    }
  };

  // 插入变量到提示词
  const insertVariable = (variableName: string) => {
    const variableText = `{{${variableName}}}`;
    setFormData(prev => ({
      ...prev,
      prompt: prev.prompt + variableText
    }));
  };



  // 保存模板
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.prompt.trim()) {
      alert('请填写模板名称和提示词');
      return;
    }

    setIsSaving(true);
    try {
      const templateData: Partial<PromptTemplate> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category || '其他',
        emoji: formData.emoji,
        prompt: formData.prompt.trim(),
        variables: promptMode === 'variable' ? defaultVariables : [],
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        isCustom: true
      };

      saveCustomTemplate(templateData);
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('保存模板失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 关闭弹窗
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">创建自定义 Prompt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                模板名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入模板名称"
                className="border-gray-300"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">分类</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">图标</Label>
              <Select value={formData.emoji} onValueChange={(value) => setFormData(prev => ({ ...prev, emoji: value }))}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="grid grid-cols-8 gap-1 p-2">
                    {EMOJI_OPTIONS.map((emoji, index) => (
                      <SelectItem key={`emoji-${index}`} value={emoji} className="h-8 w-8 flex items-center justify-center cursor-pointer p-0 m-0">
                        <span className="text-lg leading-none">{emoji}</span>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">标签</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="用逗号分隔多个标签"
                className="border-gray-300"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="简要描述这个模板的用途和特点"
              rows={2}
              className="border-gray-300"
            />
          </div>

                    {/* 提示词 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-gray-700">
                提示词 <span className="text-red-500">*</span>
              </Label>
              
              {/* 模式切换 Tab */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleModeChange('manual')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                    promptMode === 'manual'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('variable')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                    promptMode === 'variable'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Variable
                </button>
              </div>
            </div>
            
            {promptMode === 'manual' ? (
              <>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="例如：你是一个专业的产品经理，擅长需求分析。请根据以下要求，为用户提供详细的解决方案。要求：1. 逻辑清晰 2. 语言简洁 3. 提供具体的实施步骤"
                  rows={8}
                  className="border-gray-300 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 手动模式：直接输入完整的提示词内容
                </p>
              </>
            ) : (
              <div className="space-y-4">
                {/* 变量模式：先显示变量值填写 */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">填写变量值</Label>
                  <div className="space-y-3">
                    {defaultVariables.map((variable) => (
                      <div key={variable.name}>
                        <Label className="text-xs text-gray-600 mb-1 block">{variable.label}</Label>
                        {variable.type === 'textarea' ? (
                          <Textarea
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                            placeholder={variable.placeholder}
                            rows={2}
                            className="border-gray-300 text-sm"
                          />
                        ) : (
                          <Input
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                            placeholder={variable.placeholder}
                            className="border-gray-300 text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 提示词输入 */}
                <div>
                  <Textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="例如：你是一个专业的{{role}}，擅长{{skill}}。请根据以下要求：{{requirement}}，为用户提供详细的解决方案。"
                    rows={6}
                    className="border-gray-300 font-mono text-sm"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      💡 变量模式：使用 {`{{变量名}}`} 定义动态内容
                    </p>
                    
                    {/* 快速插入变量 */}
                    <div className="flex gap-1">
                      {defaultVariables.map((variable) => (
                        <button
                          key={variable.name}
                          type="button"
                          onClick={() => insertVariable(variable.name)}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                          title={`插入 {{${variable.name}}}`}
                        >
                          {variable.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim() || !formData.prompt.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                保存中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                保存模板
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 