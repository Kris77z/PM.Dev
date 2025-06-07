'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import projectAnalysisData from '@/data/bbx-project-analysis.json';

// 截图文件列表
const SCREENSHOTS = [
  'Trackers.png',
  'Farcaster.png',
  '市场.png',
  '快讯.png',
  '发现.png',
  '交易所.png',
  'ETF.png',
  '加密货币.png',
  '关注列表.png',
  '个人中心设置.png',
  '手续费返佣.png',
  '联系我们.png',
  '积分.png',
  '关于我们.png',
];

// 截图文件名到页面 key 的映射
const SCREENSHOT_TO_PAGE_KEY: Record<string, string> = {
  'Trackers.png': 'dex_trackers',
  'Farcaster.png': 'dex_farcaster',
  '市场.png': 'dex_market',
  '快讯.png': 'cex_market_news',
  '发现.png': 'cex_market_discover',
  '交易所.png': 'cex_market_exchanges',
  'ETF.png': 'cex_market_etf',
  '加密货币.png': 'cex_market_crypto',
  '关注列表.png': 'cex_market_watchlist',
  '个人中心设置.png': 'common_user_profile',
  '手续费返佣.png': 'common_commission_rebate',
  '联系我们.png': 'common_contact_us',
  '积分.png': 'common_points',
  '关于我们.png': 'common_about_us',
};

interface HighlightRegion {
  id: string;
  name: string;
  type: 'navigation' | 'content' | 'action' | 'form';
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  description: string;
  priority: number;
}

interface PageConfig {
  pageName: string;
  screenshot: string;
  regions: HighlightRegion[];
}

interface PredefinedRegion {
  value: string;
  label: string;
}

const ScreenshotAnnotator: React.FC = () => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string>(SCREENSHOTS[0]);
  const [regions, setRegions] = useState<HighlightRegion[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Partial<HighlightRegion>>({
    type: 'content',
    priority: 1,
  });
  const [editingRegion, setEditingRegion] = useState<string | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<Record<string, PageConfig>>({});
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [predefinedRegions, setPredefinedRegions] = useState<PredefinedRegion[]>([]);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从 localStorage 加载已保存的配置
  useEffect(() => {
    const saved = localStorage.getItem('screenshot-annotator-configs');
    if (saved) {
      try {
        setSavedConfigs(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved configs:', error);
      }
    }
  }, []);

  // 当选择截图时，自动加载对应的配置和预定义区域
  useEffect(() => {
    const pageName = selectedScreenshot.replace('.png', '');
    if (savedConfigs[pageName]) {
      setRegions(savedConfigs[pageName].regions);
    } else {
      setRegions([]);
    }
    setEditingRegion(null);

    // 加载预定义区域
    const pageKey = SCREENSHOT_TO_PAGE_KEY[selectedScreenshot];
    if (pageKey && projectAnalysisData.regions[pageKey as keyof typeof projectAnalysisData.regions]) {
      setPredefinedRegions(projectAnalysisData.regions[pageKey as keyof typeof projectAnalysisData.regions] as PredefinedRegion[]);
    } else {
      setPredefinedRegions([]);
    }
  }, [selectedScreenshot, savedConfigs]);

  // 保存配置到 localStorage
  const saveConfigToStorage = useCallback((config: PageConfig) => {
    const newConfigs = { ...savedConfigs, [config.pageName]: config };
    setSavedConfigs(newConfigs);
    localStorage.setItem('screenshot-annotator-configs', JSON.stringify(newConfigs));
  }, [savedConfigs]);

  // 获取相对于图片的坐标
  const getRelativeCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    
    const rect = imageRef.current.getBoundingClientRect();
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // 开始绘制区域
  const handleMouseDown = (e: React.MouseEvent) => {
    if (editingRegion) return; // 编辑模式下不允许绘制新区域
    
    const coords = getRelativeCoordinates(e.clientX, e.clientY);
    setStartPoint(coords);
    setIsDrawing(true);
  };

  // 完成绘制
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const endPoint = getRelativeCoordinates(e.clientX, e.clientY);
    
    const newRegion: HighlightRegion = {
      id: Date.now().toString(),
      name: currentRegion.name || `区域 ${regions.length + 1}`,
      type: currentRegion.type || 'content',
      coordinates: {
        x: Math.min(startPoint.x, endPoint.x),
        y: Math.min(startPoint.y, endPoint.y),
        width: Math.abs(endPoint.x - startPoint.x),
        height: Math.abs(endPoint.y - startPoint.y),
      },
      description: currentRegion.description || '',
      priority: currentRegion.priority || 1,
    };

    // 只有当区域足够大时才添加
    if (newRegion.coordinates.width > 10 && newRegion.coordinates.height > 10) {
      const updatedRegions = [...regions, newRegion];
      setRegions(updatedRegions);
      
      // 自动保存到 localStorage
      const config: PageConfig = {
        pageName: selectedScreenshot.replace('.png', ''),
        screenshot: selectedScreenshot,
        regions: updatedRegions,
      };
      saveConfigToStorage(config);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };

  // 删除区域
  const deleteRegion = (id: string) => {
    const updatedRegions = regions.filter(region => region.id !== id);
    setRegions(updatedRegions);
    setEditingRegion(null);
    
    // 自动保存到 localStorage
    const config: PageConfig = {
      pageName: selectedScreenshot.replace('.png', ''),
      screenshot: selectedScreenshot,
      regions: updatedRegions,
    };
    saveConfigToStorage(config);
  };

  // 更新区域
  const updateRegion = (id: string, updates: Partial<HighlightRegion>) => {
    const updatedRegions = regions.map(region => 
      region.id === id ? { ...region, ...updates } : region
    );
    setRegions(updatedRegions);
    
    // 自动保存到 localStorage
    const config: PageConfig = {
      pageName: selectedScreenshot.replace('.png', ''),
      screenshot: selectedScreenshot,
      regions: updatedRegions,
    };
    saveConfigToStorage(config);
  };

  // 导出配置
  const exportConfig = () => {
    const config: PageConfig = {
      pageName: selectedScreenshot.replace('.png', ''),
      screenshot: selectedScreenshot,
      regions,
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.pageName}-highlight-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导出所有配置
  const exportAllConfigs = () => {
    const allConfigs = Object.values(savedConfigs);
    const blob = new Blob([JSON.stringify(allConfigs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-highlight-configs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入配置文件
  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // 判断是单个配置还是多个配置
        if (Array.isArray(importedData)) {
          // 多个配置
          const newConfigs = { ...savedConfigs };
          importedData.forEach((config: PageConfig) => {
            newConfigs[config.pageName] = config;
          });
          setSavedConfigs(newConfigs);
          localStorage.setItem('screenshot-annotator-configs', JSON.stringify(newConfigs));
          alert(`成功导入 ${importedData.length} 个配置文件！`);
        } else if (importedData.pageName && importedData.regions) {
          // 单个配置
          const newConfigs = { ...savedConfigs, [importedData.pageName]: importedData };
          setSavedConfigs(newConfigs);
          localStorage.setItem('screenshot-annotator-configs', JSON.stringify(newConfigs));
          alert('配置文件导入成功！');
        } else {
          alert('配置文件格式不正确！');
        }
      } catch (error) {
        alert('配置文件解析失败！请检查文件格式。');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowImportDialog(false);
  };

  // 清空所有区域
  const clearAllRegions = () => {
    setRegions([]);
    setEditingRegion(null);
    
    // 从 localStorage 中删除当前页面的配置
    const pageName = selectedScreenshot.replace('.png', '');
    const newConfigs = { ...savedConfigs };
    delete newConfigs[pageName];
    setSavedConfigs(newConfigs);
    localStorage.setItem('screenshot-annotator-configs', JSON.stringify(newConfigs));
  };

  // 清空所有保存的配置
  const clearAllConfigs = () => {
    if (confirm('确定要清空所有保存的配置吗？此操作不可恢复。')) {
      setSavedConfigs({});
      setRegions([]);
      setEditingRegion(null);
      localStorage.removeItem('screenshot-annotator-configs');
      alert('所有配置已清空！');
    }
  };

  // 快速创建预定义区域
  const createPredefinedRegion = (predefined: PredefinedRegion) => {
    // 自动推断区域类型
    let type: 'navigation' | 'content' | 'action' | 'form' = 'content';
    const label = predefined.label.toLowerCase();
    
    if (label.includes('导航') || label.includes('菜单') || label.includes('标题') || label.includes('头部')) {
      type = 'navigation';
    } else if (label.includes('按钮') || label.includes('操作') || label.includes('入口') || label.includes('链接')) {
      type = 'action';
    } else if (label.includes('表单') || label.includes('输入') || label.includes('搜索') || label.includes('设置')) {
      type = 'form';
    }

    setCurrentRegion({
      name: predefined.label,
      type: type,
      description: `预定义区域：${predefined.label}`,
      priority: predefined.value === '_entire_page_' ? 10 : 5,
    });
  };

  // 获取当前页面的配置状态
  const currentPageName = selectedScreenshot.replace('.png', '');
  const hasCurrentPageConfig = !!savedConfigs[currentPageName];
  const totalConfiguredPages = Object.keys(savedConfigs).length;
  const currentPageKey = SCREENSHOT_TO_PAGE_KEY[selectedScreenshot];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">截图标注工具</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>已配置页面: {totalConfiguredPages}/{SCREENSHOTS.length}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportDialog(true)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              导入配置
            </button>
            <button
              onClick={exportAllConfigs}
              disabled={totalConfiguredPages === 0}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              导出全部
            </button>
            <button
              onClick={clearAllConfigs}
              disabled={totalConfiguredPages === 0}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              清空全部
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左侧：截图选择和预览 */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">选择截图：</label>
            <select 
              value={selectedScreenshot} 
              onChange={(e) => setSelectedScreenshot(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SCREENSHOTS.map(screenshot => {
                const pageName = screenshot.replace('.png', '');
                const isConfigured = !!savedConfigs[pageName];
                return (
                  <option key={screenshot} value={screenshot}>
                    {isConfigured ? '✅ ' : '⚪ '}{screenshot}
                  </option>
                );
              })}
            </select>
            {hasCurrentPageConfig && (
              <span className="text-sm text-green-600 font-medium">
                ✅ 已配置 {regions.length} 个区域
              </span>
            )}
            {currentPageKey && (
              <span className="text-sm text-blue-600 font-medium">
                📋 页面类型: {currentPageKey}
              </span>
            )}
          </div>

          {/* 预定义区域提示 */}
          {predefinedRegions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 该页面预定义区域 ({predefinedRegions.length} 个)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {predefinedRegions.map((region) => (
                  <button
                    key={region.value}
                    onClick={() => createPredefinedRegion(region)}
                    className="text-left p-2 bg-white border border-blue-200 rounded text-sm hover:bg-blue-100 transition-colors"
                    title={`点击快速设置为当前区域：${region.label}`}
                  >
                    <div className="font-medium text-blue-800">{region.label}</div>
                    <div className="text-xs text-blue-600">{region.value}</div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-blue-600 mt-2">
                💡 点击上方区域可快速设置为当前标注区域的名称和类型
              </div>
            </div>
          )}

          {/* 截图预览区域 */}
          <div 
            ref={containerRef}
            className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white"
            style={{ maxHeight: '70vh' }}
          >
            <img
              ref={imageRef}
              src={`/screenshots/${selectedScreenshot}`}
              alt={selectedScreenshot}
              className="max-w-full h-auto cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              draggable={false}
            />
            
            {/* 渲染已定义的区域 */}
            {regions.map(region => (
              <div
                key={region.id}
                className={`absolute border-2 cursor-pointer transition-all ${
                  editingRegion === region.id 
                    ? 'border-blue-500 bg-blue-500/20' 
                    : 'border-red-500 bg-red-500/10 hover:bg-red-500/20'
                }`}
                style={{
                  left: region.coordinates.x,
                  top: region.coordinates.y,
                  width: region.coordinates.width,
                  height: region.coordinates.height,
                }}
                onClick={() => setEditingRegion(region.id)}
              >
                <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {region.name}
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            💡 提示：在截图上拖拽鼠标来选择区域，点击已有区域进行编辑。配置会自动保存。
          </div>
        </div>

        {/* 右侧：控制面板 */}
        <div className="space-y-6">
          {/* 新区域设置 */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
            <h3 className="font-semibold text-gray-900">新区域设置</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">区域名称</label>
              <input
                type="text"
                value={currentRegion.name || ''}
                onChange={(e) => setCurrentRegion(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如：导航栏、内容区域"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">区域类型</label>
              <select 
                value={currentRegion.type} 
                onChange={(e) => setCurrentRegion(prev => ({ ...prev, type: e.target.value as 'navigation' | 'content' | 'action' | 'form' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="navigation">导航</option>
                <option value="content">内容</option>
                <option value="action">操作</option>
                <option value="form">表单</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={currentRegion.description || ''}
                onChange={(e) => setCurrentRegion(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述这个区域的功能..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优先级 (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={currentRegion.priority || 1}
                onChange={(e) => setCurrentRegion(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 编辑区域 */}
          {editingRegion && (
            <div className="border border-blue-200 rounded-lg p-4 space-y-4 bg-blue-50">
              <h3 className="font-semibold text-gray-900">编辑区域</h3>
              {(() => {
                const region = regions.find(r => r.id === editingRegion);
                if (!region) return null;
                
                return (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">区域名称</label>
                      <input
                        type="text"
                        value={region.name}
                        onChange={(e) => updateRegion(region.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">区域类型</label>
                      <select 
                        value={region.type} 
                        onChange={(e) => updateRegion(region.id, { type: e.target.value as 'navigation' | 'content' | 'action' | 'form' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="navigation">导航</option>
                        <option value="content">内容</option>
                        <option value="action">操作</option>
                        <option value="form">表单</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                      <textarea
                        value={region.description}
                        onChange={(e) => updateRegion(region.id, { description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => deleteRegion(region.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        删除区域
                      </button>
                      <button 
                        onClick={() => setEditingRegion(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        完成编辑
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* 区域列表 */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
            <h3 className="font-semibold text-gray-900">已定义区域 ({regions.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {regions.map(region => (
                <div 
                  key={region.id}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    editingRegion === region.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => setEditingRegion(region.id)}
                >
                  <div className="font-medium text-gray-900">{region.name}</div>
                  <div className="text-sm text-gray-600">{region.type} | 优先级: {region.priority}</div>
                </div>
              ))}
              {regions.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  暂无定义的区域
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-2">
            <button 
              onClick={exportConfig} 
              disabled={regions.length === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              导出当前页面配置
            </button>
            <button 
              onClick={clearAllRegions}
              disabled={regions.length === 0}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              清空当前页面区域
            </button>
          </div>
        </div>
      </div>

      {/* 导入配置对话框 */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">导入配置文件</h3>
            <p className="text-sm text-gray-600 mb-4">
              选择之前导出的配置文件（支持单个页面配置或全部配置文件）
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="w-full mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotAnnotator; 