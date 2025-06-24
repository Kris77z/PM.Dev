import { useState, useCallback } from 'react';
import { PRDGenerationData } from '@/lib/prd-generator';
import { 
  generateHTMLFromPRD, 
  GeminiAIService, 
  HTMLGenerationResult,
  createDownloadableHTML,
  createPreviewURL
} from '@/lib/prd-html-generator';

export interface HTMLPreviewState {
  isGenerating: boolean;
  generatedHTML: string | null;
  previewURL: string | null;
  error: string | null;
  generationHistory: Array<{
    id: string;
    timestamp: Date;
    htmlContent: string;
    userQuery?: string;
  }>;
}

export function usePRDHTMLGeneration() {
  const [state, setState] = useState<HTMLPreviewState>({
    isGenerating: false,
    generatedHTML: null,
    previewURL: null,
    error: null,
    generationHistory: []
  });

  // 生成HTML原型
  const generateHTMLPrototype = useCallback(async (
    prdData: PRDGenerationData,
    userQuery?: string
  ): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null
    }));

    try {
      // 创建AI服务实例
      const aiService = new GeminiAIService();
      
      // 生成HTML
      const result: HTMLGenerationResult = await generateHTMLFromPRD(
        prdData,
        aiService,
        userQuery
      );

      if (result.success && result.htmlContent) {
        // 清理之前的预览URL
        if (state.previewURL) {
          URL.revokeObjectURL(state.previewURL);
        }

        // 创建新的预览URL
        const newPreviewURL = createPreviewURL(result.htmlContent);

        // 添加到历史记录
        const newHistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date(),
          htmlContent: result.htmlContent,
          userQuery
        };

        setState(prev => ({
          ...prev,
          isGenerating: false,
          generatedHTML: result.htmlContent as string,
          previewURL: newPreviewURL,
          error: null,
          generationHistory: [newHistoryItem, ...prev.generationHistory.slice(0, 4)] // 保留最近5个
        }));

        return true;
      } else {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: result.error || '生成失败，未知错误'
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : '生成过程中发生未知错误'
      }));
      return false;
    }
  }, [state.previewURL]);

  // 下载HTML文件
  const downloadHTML = useCallback((filename?: string) => {
    if (state.generatedHTML) {
      createDownloadableHTML(state.generatedHTML, filename);
      return true;
    }
    return false;
  }, [state.generatedHTML]);

  // 清除预览
  const clearPreview = useCallback(() => {
    if (state.previewURL) {
      URL.revokeObjectURL(state.previewURL);
    }
    setState(prev => ({
      ...prev,
      generatedHTML: null,
      previewURL: null,
      error: null
    }));
  }, [state.previewURL]);

  // 从历史记录中恢复
  const restoreFromHistory = useCallback((historyId: string) => {
    const historyItem = state.generationHistory.find(item => item.id === historyId);
    if (historyItem) {
      // 清理当前预览URL
      if (state.previewURL) {
        URL.revokeObjectURL(state.previewURL);
      }

      // 创建新的预览URL
      const newPreviewURL = createPreviewURL(historyItem.htmlContent);

      setState(prev => ({
        ...prev,
        generatedHTML: historyItem.htmlContent,
        previewURL: newPreviewURL,
        error: null
      }));
      return true;
    }
    return false;
  }, [state.generationHistory, state.previewURL]);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // 重新生成（使用相同的数据和查询）
  const regenerate = useCallback(async (
    prdData: PRDGenerationData,
    userQuery?: string
  ): Promise<boolean> => {
    return generateHTMLPrototype(prdData, userQuery);
  }, [generateHTMLPrototype]);

  return {
    // 状态
    isGenerating: state.isGenerating,
    generatedHTML: state.generatedHTML,
    previewURL: state.previewURL,
    error: state.error,
    generationHistory: state.generationHistory,
    hasPreview: !!state.generatedHTML,

    // 操作方法
    generateHTMLPrototype,
    downloadHTML,
    clearPreview,
    restoreFromHistory,
    clearError,
    regenerate
  };
} 