'use client';

import React, { useState } from 'react';
import { Monitor, Download, RotateCcw, Trash2, History, Code, Eye, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertSuccess, AlertError } from '@/components/ui/alert';
import { usePRDHTMLGeneration } from '@/hooks/usePRDHTMLGeneration';
import { PRDGenerationData } from '@/lib/prd-generator';
import { TextShimmer } from '@/components/ui/text-shimmer';

interface HTMLPrototypePreviewProps {
  prdData: PRDGenerationData;
  onClose?: () => void;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';

export const HTMLPrototypePreview: React.FC<HTMLPrototypePreviewProps> = ({
  prdData,
  onClose
}) => {
  const {
    isGenerating,
    generatedHTML,
    previewURL,
    error,
    generationHistory,
    hasPreview,
    generateHTMLPrototype,
    downloadHTML,
    clearPreview,
    restoreFromHistory,
    clearError,
    regenerate
  } = usePRDHTMLGeneration();

  const [userQuery, setUserQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertState({ type, message });
    setTimeout(() => setAlertState({ type: null, message: '' }), 3000);
  };

  const handleGenerate = async () => {
    clearError();
    const success = await generateHTMLPrototype(prdData, userQuery.trim() || undefined);
    if (success) {
      showAlert('success', 'HTML原型生成成功！');
      setUserQuery(''); // 清空输入框
    } else {
      showAlert('error', '生成失败，请重试');
    }
  };

  const handleDownload = () => {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
    const filename = `prd-prototype-${timestamp}.html`;
    const success = downloadHTML(filename);
    if (success) {
      showAlert('success', 'HTML文件下载成功！');
    } else {
      showAlert('error', '下载失败，请重试');
    }
  };

  const handleRegenerate = async () => {
    const success = await regenerate(prdData, userQuery.trim() || undefined);
    if (success) {
      showAlert('success', '重新生成成功！');
    } else {
      showAlert('error', '重新生成失败，请重试');
    }
  };

  const handleRestoreFromHistory = async (historyId: string) => {
    const success = restoreFromHistory(historyId);
    if (success) {
      showAlert('success', '已恢复历史版本');
      setShowHistory(false);
    } else {
      showAlert('error', '恢复历史版本失败');
    }
  };

  const handleClearAll = () => {
    clearPreview();
    setUserQuery('');
    setShowCode(false);
    setShowHistory(false);
    showAlert('success', '已清除所有内容');
  };

  // 获取视图模式对应的样式
  const getIframeStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
      default:
        return { width: '100%', height: '600px' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Alert 提示 */}
      {alertState.type && (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
          <div className="pointer-events-auto animate-in fade-in-0 slide-in-from-top-2 duration-300">
            {alertState.type === 'success' ? (
              <AlertSuccess>{alertState.message}</AlertSuccess>
            ) : (
              <AlertError>{alertState.message}</AlertError>
            )}
          </div>
        </div>
      )}

      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">HTML原型预览</h2>
        
        <div className="flex items-center gap-2">
          {/* 视图模式切换 */}
          {hasPreview && (
            <div className="flex items-center gap-1 mr-4">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* 功能按钮 */}
          {hasPreview && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
              >
                <Code className="h-4 w-4 mr-1" />
                {showCode ? '预览' : '代码'}
              </Button>
              
              {generationHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-4 w-4 mr-1" />
                  历史
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                下载
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isGenerating}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                重新生成
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                清除
              </Button>
            </>
          )}

          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              关闭
            </Button>
          )}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧：输入和历史记录 */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* 输入区域 */}
          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义要求（可选）
            </label>
            <Textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="例如：添加深色主题、增加动画效果、优化移动端体验..."
              className="mb-3"
              rows={3}
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <TextShimmer duration={1.5} className="text-white">
                  正在生成中...
                </TextShimmer>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  {hasPreview ? '重新生成原型' : '生成HTML原型'}
                </>
              )}
            </Button>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-4 border-b border-gray-100">
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearError}
                  className="mt-2"
                >
                  清除错误
                </Button>
              </div>
            </div>
          )}

          {/* 历史记录 */}
          {showHistory && generationHistory.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">生成历史</h3>
                <div className="space-y-2">
                  {generationHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRestoreFromHistory(item.id)}
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {item.timestamp.toLocaleString()}
                      </div>
                      {item.userQuery && (
                        <div className="text-sm text-gray-700 truncate">
                          要求：{item.userQuery}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        点击恢复此版本
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：预览区域 */}
        <div className="flex-1 flex flex-col">
          {!hasPreview && !isGenerating && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Monitor className="h-16 w-16 text-gray-300 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    生成HTML原型
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md">
                    基于您的PRD数据，AI将生成一个可交互的HTML页面原型。
                    您可以在左侧添加自定义要求来优化生成效果。
                  </p>
                </div>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
                <div>
                  <TextShimmer duration={2} className="text-lg font-medium text-gray-600">
                    AI正在生成HTML原型...
                  </TextShimmer>
                  <p className="text-gray-500 text-sm mt-2">
                    这可能需要30-60秒，请耐心等待
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasPreview && !showCode && previewURL && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg" style={getIframeStyles()}>
                <iframe
                  src={previewURL}
                  className="w-full h-full"
                  title="HTML原型预览"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          )}

          {hasPreview && showCode && generatedHTML && (
            <div className="flex-1 p-4">
              <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">HTML源代码</span>
                </div>
                <div className="h-full overflow-auto">
                  <pre className="p-4 text-sm bg-white h-full">
                    <code>{generatedHTML}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 