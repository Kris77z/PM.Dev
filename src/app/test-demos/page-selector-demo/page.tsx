'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import projectAnalysisData from '@/data/bbx-project-analysis.json';
import {
  // 导入 SimpleUIMicroAdjustmentForm.tsx 中定义的类型
  GroupedPageOption, RegionOption
} from '@/components/SimpleUIMicroAdjustmentForm';
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
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Stepper,
  StepperItem,
  StepperIndicator,
  StepperSeparator,
  StepperTrigger
} from "@/components/ui/stepper";

// 页面 value 到截图路径的映射
// 使用中文文件名，如用户提供并放置在 /public/screenshots 目录下
const PAGE_SCREENSHOTS: Record<string, string> = {
  cex_market_watchlist: '/screenshots/关注列表.png',
  cex_market_crypto: '/screenshots/加密货币.png',
  cex_market_futures: '/screenshots/合约交易.png',
  cex_market_etf: '/screenshots/ETF.png',
  cex_market_exchanges: '/screenshots/交易所.png',
  cex_market_discover: '/screenshots/发现.png',
  cex_market_news: '/screenshots/快讯.png',
  dex_market: '/screenshots/市场.png',
  dex_trackers: '/screenshots/Trackers.png',
  dex_farcaster: '/screenshots/Farcaster.png',
  common_about_us: '/screenshots/关于我们.png',
  common_contact_us: '/screenshots/联系我们.png',
  common_points: '/screenshots/积分.png',
  common_commission_rebate: '/screenshots/手续费返佣.png',
  common_user_profile: '/screenshots/个人中心设置.png',
};

// 步骤定义
const steps = [
    { id: 1, text: '选择主要页面/功能区域', key: 'mainPageArea' },
    { id: 2, text: '选择具体版块/区域', key: 'specificSection' },
];

const PageSelectorDemoPage: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // 页面和区域选择的状态，key对应steps中的key
  const [answers, setAnswers] = useState<Record<string, string>>({
      mainPageArea: '',
      specificSection: '',
  });
  
  const pageOptions: GroupedPageOption[] = projectAnalysisData.pages;
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);

  // 根据选择的页面更新区域选项
  useEffect(() => {
    if (answers.mainPageArea && projectAnalysisData.regions) {
      // 确保 projectAnalysisData.regions[answers.mainPageArea] 存在且是数组
      // 这里需要进行类型断言，因为 projectAnalysisData.regions 的键是字符串，但TS无法直接知道它对应 answers.mainPageArea 的具体字符串字面量类型
      const sections = projectAnalysisData.regions[answers.mainPageArea as keyof typeof projectAnalysisData.regions] || [];
      setRegionOptions(sections);
      // 如果当前选中的区域不再有效，则重置
      if (answers.specificSection && !sections.some(opt => opt.value === answers.specificSection) && answers.specificSection !== '_entire_page_') {
          setAnswers(prev => ({ ...prev, specificSection: '' }));
      }
    } else {
      setRegionOptions([]);
      setAnswers(prev => ({ ...prev, specificSection: '' })); // 没有选择页面，清空区域选择
    }
  }, [answers.mainPageArea, projectAnalysisData.regions]);

  // 获取当前选中页面的信息
  const selectedPageInfo = pageOptions.flatMap(group => group.options)
    .find(option => option.value === answers.mainPageArea);

  // Escape 键关闭放大视图
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isZoomed]);

  // 点击图片的处理函数 (第一步)
  const handleImageClick = () => {
    if (answers.mainPageArea && PAGE_SCREENSHOTS[answers.mainPageArea]) {
      setIsZoomed(true);
    }
  };

  // 关闭放大视图
  const handleCloseZoom = () => {
    setIsZoomed(false);
  };

  const handleNextStep = () => {
    // 校验当前步骤的回答是否有效 (只校验必填项)
    const currentStepKey = steps[currentStepIndex].key;
    // 目前这两个步骤都是必选的，所以简单校验是否为空
    if (!answers[currentStepKey]) {
        alert(`请完成当前步骤：${steps[currentStepIndex].text}`);
        return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // 最后一个步骤，完成选择，可以触发一个事件或显示完成信息
      console.log("Page and Region Selected:", answers);
      alert(`页面: ${answers.mainPageArea}, 区域: ${answers.specificSection} 选择完成！`);
      // TODO: 在这里触发后续的高亮选择等逻辑
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepChange = (stepIndex: number) => {
      // 只有已完成或当前步骤可以点击
      if (stepIndex <= currentStepIndex) {
          setCurrentStepIndex(stepIndex);
      }
  };

  const renderStepContent = () => {
    const currentStep = steps[currentStepIndex];

    if (currentStep.key === 'mainPageArea') {
      // 第一步：页面选择和截图预览
      return (
        <div className="flex flex-col gap-8">
          <div className="w-full space-y-4">
            <label className="block font-medium mb-2">{currentStep.text} *</label>
            <Select onValueChange={(value) => setAnswers({ ...answers, mainPageArea: value, specificSection: '' })} value={answers.mainPageArea}>
              <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500">
                <SelectValue placeholder="请选择主要页面..." />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 overflow-hidden">
                {pageOptions.map((group, index) => (
                  <React.Fragment key={group.groupLabel}>
                    <SelectGroup>
                      <SelectLabel className="py-2 px-3 text-xs font-semibold text-gray-500">
                        {group.groupLabel}
                      </SelectLabel>
                      {group.options.map(option => {
                        const displayLabel = option.label;
                        // 暂时禁用合约交易页面
                        const isDisabled = option.value === 'cex_market_futures';

                        return (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="py-2 px-4 hover:bg-orange-50 focus:bg-orange-50 rounded cursor-pointer text-sm data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                            disabled={isDisabled}
                          >
                            {displayLabel + (isDisabled ? ' (暂不支持)' : '')}
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

          {/* 截图预览卡片 (只有选中页面后才显示) */}
          {answers.mainPageArea && PAGE_SCREENSHOTS[answers.mainPageArea] && (
            <div className="flex-1 mt-4">
              <Card>
                <CardContent className="p-6">
                  <div
                    className="relative w-full h-[300px] border rounded-xl overflow-hidden shadow-lg bg-black cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <Image
                      src={PAGE_SCREENSHOTS[answers.mainPageArea]}
                      alt={selectedPageInfo?.label || '页面预览'}
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
             {/* 提示文字 */}
             {!answers.mainPageArea && (
                 <div className="text-center text-sm text-gray-500 mt-4">请先选择一个页面以显示截图。</div>
             )}
        </div>
      );
    } else if (currentStep.key === 'specificSection') {
      // 第二步：区域选择
       const showPlaceholder = regionOptions.length === 0 && answers.mainPageArea;
      return (
        <div className="w-full space-y-4">
          <label className="block font-medium mb-2">{currentStep.text} *</label>
          <Select onValueChange={(value) => setAnswers({ ...answers, specificSection: value })} value={answers.specificSection}>
            <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500">
              <SelectValue placeholder="请选择具体版块..." />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 overflow-hidden">
                {/* Render "整个页面" first if it exists in regionOptions */}
                {regionOptions.find(opt => opt.value === '_entire_page_') && (
                  <SelectItem
                    key="_entire_page_"
                    value="_entire_page_"
                    className="py-2 px-4 hover:bg-orange-50 focus:bg-orange-50 rounded cursor-pointer text-sm font-medium"
                  >
                    整个页面
                  </SelectItem>
                )}
                {/* Render Separator if "整个页面" exists and there are other options */}
                {regionOptions.find(opt => opt.value === '_entire_page_') && regionOptions.filter(opt => opt.value !== '_entire_page_').length > 0 && (
                  <SelectSeparator className="my-1" />
                )}
                {/* Render other region options */}
                {regionOptions
                  .filter(option => option.value !== '_entire_page_') // Exclude _entire_page_ as it's handled above
                  .map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-2 px-4 hover:bg-orange-50 focus:bg-orange-50 rounded cursor-pointer text-sm"
                    >
                      {option.label}
                    </SelectItem>
                ))}

               {/* 没有区域选项时的提示 */}
              {showPlaceholder && (
                 <SelectItem value="no-regions" disabled className="py-2 px-4 text-gray-400 cursor-not-allowed text-sm">
                    (该页面无预设版块，请在下一步详细描述 - 下一步功能待开发)
                 </SelectItem>
              )}
            </SelectContent>
          </Select>
            {/* 提示文字 */}
             {answers.mainPageArea && !answers.specificSection && !showPlaceholder && (
                 <div className="text-center text-sm text-gray-500 mt-4">请选择具体版块或区域。</div>
             )}
             {answers.specificSection === '_entire_page_' && (
                  <div className="text-center text-sm text-gray-500 mt-4">您选择了整个页面进行微调。</div>
             )}
             {answers.specificSection && answers.specificSection !== '_entire_page_' && (
                   <div className="text-center text-sm text-gray-500 mt-4">您选择了区域: &apos;{regionOptions.find(opt => opt.value === answers.specificSection)?.label}&apos;。</div>
             )}

        </div>
      );
    }
    return null; // 未知步骤
  };

  // 检查"下一个"按钮是否应该启用
  const isNextButtonDisabled = () => {
      const currentStepKey = steps[currentStepIndex].key;
      // 只有对应的答案有了值，按钮才启用
      return !answers[currentStepKey];
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <h1 className="text-2xl font-bold text-center mb-4">页面及区域选择</h1>

        {/* Stepper */}
        <div className="space-y-3">
            <Stepper value={currentStepIndex + 1} className="w-full">
              {steps.map((step, index) => (
                <StepperItem key={step.id} step={index + 1} className="flex-1">
                  <StepperTrigger
                    className="w-full flex-col items-start gap-2"
                    asChild
                    // 只有已完成或当前步骤可以点击
                    disabled={index > currentStepIndex}
                    onClick={() => handleStepChange(index)}
                  >
                     {/* Stepper 指示器 */}
                    <StepperIndicator asChild className="h-2 w-full rounded-none bg-gray-200 data-[state=completed]:bg-orange-500 data-[state=active]:bg-orange-500">
                      <span className="sr-only">{index + 1}</span>
                    </StepperIndicator>
                  </StepperTrigger>
                  {index < steps.length - 1 && <StepperSeparator className="data-[state=completed]:bg-orange-500"/>}
                </StepperItem>
              ))}
            </Stepper>
            <div className="text-sm font-medium tabular-nums text-muted-foreground text-center">
              步骤 {currentStepIndex + 1} / {steps.length}
            </div>
        </div>

        {/* 当前步骤内容 */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* 步骤导航按钮 */}
        <div className="flex space-x-4 mt-8">
          {currentStepIndex > 0 && (
             <button
               onClick={handlePreviousStep}
               type="button"
               className="py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
             >
               上一步
             </button>
          )}
          <button
            onClick={handleNextStep}
            type="button"
            className="flex-grow py-2 px-4 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50"
            disabled={isNextButtonDisabled()}
          >
            {currentStepIndex < steps.length - 1 ? '下一个' : '完成选择'}
          </button>
        </div>

        {/* 返回首页按钮 */}
        <div className="flex justify-center mt-6">
            {/* TODO: 添加返回首页逻辑 */}
        </div>

        {/* 放大视图 */}
        {isZoomed && answers.mainPageArea && PAGE_SCREENSHOTS[answers.mainPageArea] && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] cursor-pointer"
            onClick={handleCloseZoom}
          >
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}> {/* 阻止事件冒泡 */}
              <Image
                src={PAGE_SCREENSHOTS[answers.mainPageArea]}
                alt={selectedPageInfo?.label || '页面预览'}
                fill
                className="object-contain"
              />
            </div>
             {/* 关闭按钮 */}
             <button
               className="absolute top-4 right-4 text-white text-3xl font-bold z-[101]"
               onClick={handleCloseZoom}
             >
               &times;
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PageSelectorDemoPage; 