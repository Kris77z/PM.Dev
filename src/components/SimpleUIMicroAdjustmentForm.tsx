'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // 引入 Image 组件
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  // CardHeader, // 根据 page-selector-demo.tsx 的最终形态，我们不需要 CardHeader
  // CardTitle // 根据 page-selector-demo.tsx 的最终形态，我们不需要 CardTitle
} from '@/components/ui/card'; // 引入 Card 和 CardContent
// Label, Textarea, Button imports are removed, will use native elements + Tailwind
import { 
  Stepper, 
  StepperItem, 
  StepperIndicator, 
  StepperSeparator,
  StepperTrigger
} from "@/components/ui/stepper";
import { IconArrowBack } from "@tabler/icons-react";

// 为每个页面添加截图路径，使用中文文件名 (从 page-selector-demo.tsx 复制过来)
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

// 更新 ProjectAnalysisData 接口以匹配 bbx-project-analysis.json 的结构
export interface PageOption {
  value: string;
  label: string;
}

export interface RegionOption {
  value: string;
  label: string;
  group?: string;  // Optional for grouped regions
}

// New interface for grouped page options
export interface GroupedPageOption {
  groupLabel: string;
  options: PageOption[];
}

export interface ProjectAnalysisData {
  techStack: string;
  pages: GroupedPageOption[]; // Updated to use GroupedPageOption
  regions: Record<string, RegionOption[]>;
  componentPathHints?: Record<string, Record<string, string>>;
}

// --- New Types ---
export interface SimpleAnswers {
  mainPageArea?: string; // Stores the ID/value of the selected main page
  specificSection?: string; // Stores the ID/value of the selected specific section
  targetElement?: string;
  desiredEffect?: string;
  optimizationReason?: string;
}

interface FormQuestion {
  id: number;
  text: string;
  key: keyof SimpleAnswers;
  type: 'select' | 'textarea';
  hint?: string;
  isOptional?: boolean;
  placeholder?: string; 
}

// --- Component Props ---
export interface SimpleUIMicroAdjustmentFormProps {
  projectAnalysisData: ProjectAnalysisData;
  onSubmit: (instruction: string) => void;
  onCancel: () => void;
}

// --- Initial Questions Definition ---
const initialQuestions: FormQuestion[] = [
  { id: 1, text: 'Q1: 选择主要页面/功能区域 *', key: 'mainPageArea', type: 'select', placeholder: '请选择主要页面...' },
  { id: 2, text: 'Q2: 选择具体版块/区域 *', key: 'specificSection', type: 'select', placeholder: '请选择具体版块...' },
  { id: 3, text: 'Q3: 描述目标界面元素 *', key: 'targetElement', type: 'textarea', placeholder: '例如：那个蓝色的提交按钮、顶部的网站Logo...', hint: '请尽量详细描述元素的位置、外观特征等。' },
  { id: 4, text: 'Q4: 期望达成的整体效果 (可选)', key: 'desiredEffect', type: 'textarea', placeholder: '例如：让它更醒目一点、把文字改一下...', isOptional: true },
  { id: 5, text: 'Q5: 优化原因 *', key: 'optimizationReason', type: 'textarea', placeholder: '例如：提高用户点击率、改善视觉效果...' }
];

// --- Helper to generate instruction document (Corrected Version) ---
// 将此函数导出，以便在测试页面使用
export const generateInstructionDocument = (answers: SimpleAnswers, projectData: ProjectAnalysisData): string => {
  const selectedPageOption = projectData.pages
    .flatMap(group => group.options)
    .find(p => p.value === answers.mainPageArea);

  let specificSectionText = "N/A";
  if (answers.mainPageArea && answers.specificSection) {
    if (answers.specificSection === '_entire_page_') {
      specificSectionText = "整个页面";
    } else {
      const pageKey = answers.mainPageArea as keyof typeof projectData.regions;
      if (projectData.regions && pageKey in projectData.regions) {
        const regionsForPage = projectData.regions[pageKey];
        if (regionsForPage) {
          const selectedRegion = regionsForPage.find(
            (r: RegionOption) => r.value === answers.specificSection
          );
          specificSectionText = selectedRegion ? selectedRegion.label : "未知区域";
        } else {
          specificSectionText = "未知页面区域"; // Should ideally not happen if data is correct
        }
      } else {
        specificSectionText = "未知页面"; // Should ideally not happen if data is correct
      }
    }
  }

  // 更新组件路径提示的逻辑和措辞
  let componentPathHintText = "路径提示信息不可用，请AI分析项目结构和上下文进行定位。"; // Default fallback

  if (answers.mainPageArea && answers.specificSection) {
    const pageHintKey = answers.mainPageArea as keyof typeof projectData.componentPathHints;
    const hintsAvailable = projectData.componentPathHints && pageHintKey in projectData.componentPathHints;

    if (answers.specificSection === '_entire_page_') {
      if (hintsAvailable) {
        const pageHints = projectData.componentPathHints![pageHintKey];
        if (pageHints && '_entire_page_' in pageHints && pageHints['_entire_page_']) {
          componentPathHintText = `${pageHints['_entire_page_']}`;
        } else {
          componentPathHintText = "针对整个页面修改，但预设路径提示缺失，请AI分析项目结构定位主要文件/文件夹。";
        }
      } else {
        componentPathHintText = "针对整个页面修改，但当前页面无路径提示定义，请AI分析项目结构定位主要文件/文件夹。";
      }
    } else { // Specific section
      if (hintsAvailable) {
        const pageHints = projectData.componentPathHints![pageHintKey];
        if (pageHints) {
          const regionHintKey = answers.specificSection as keyof typeof pageHints;
          if (regionHintKey in pageHints && pageHints[regionHintKey]) {
            componentPathHintText = `${pageHints[regionHintKey]}`;
          } else {
            componentPathHintText = "当前选定区域无特定路径提示，请AI根据页面结构和上下文判断。";
          }
        } else {
           componentPathHintText = "当前页面路径提示信息不完整，请AI根据项目结构和上下文判断。";
        }
      } else {
        componentPathHintText = "当前页面无路径提示定义，请AI根据项目结构和上下文判断。";
      }
    }
  }

  const instruction = `
**UI微调需求概要**

*   **目标页面/功能区域**:\n    *   ID: \`${answers.mainPageArea || "未提供"}\`\n    *   名称: \`${selectedPageOption?.label || "未提供"}\`\n*   **目标具体版块/区域**:\n    *   ID: \`${answers.specificSection || "未提供"}\`\n    *   名称: \`${specificSectionText}\`\n*   **相关组件路径提示**: \`${componentPathHintText}\`\n*   **要调整的界面元素**: \`${answers.targetElement || "未提供"}\`\n*   **期望的调整与效果**: \`${answers.desiredEffect || "未提供"}\`\n*   **调整原因**: \`${answers.optimizationReason || "未提供"}\`\n`;
  return instruction.trim();
};


export const SimpleUIMicroAdjustmentForm: React.FC<SimpleUIMicroAdjustmentFormProps> = ({
  projectAnalysisData,
  onSubmit,
  onCancel,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SimpleAnswers>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  const [q1Options, setQ1Options] = useState<GroupedPageOption[]>([]);
  const [q2Options, setQ2Options] = useState<RegionOption[]>([]);
  const [isZoomed, setIsZoomed] = useState(false); // 新增状态：截图是否放大

  const totalSteps = initialQuestions.length;

  // 更新 useEffect 以匹配新的数据结构
  useEffect(() => {
    if (projectAnalysisData && projectAnalysisData.pages) {
      setQ1Options(projectAnalysisData.pages);
    }
  }, [projectAnalysisData]);

  // 获取当前选中页面的信息
  const selectedPageInfo = q1Options.flatMap(group => group.options)
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
  }, [isZoomed]); // 依赖 isZoomed 状态

  // 点击图片的处理函数
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
    const currentQuestion = initialQuestions[currentQuestionIndex];
    
    // 第一步的校验逻辑 (如果当前是第一步且未选择页面)
    if (currentQuestionIndex === 0 && !answers.mainPageArea) {
        alert('请先选择一个页面');
        return;
    }

    // 其他步骤的校验和逻辑保持不变
    if (currentQuestionIndex > 0 && !currentQuestion.isOptional && !currentAnswer.trim()) {
      alert(`请回答问题: ${currentQuestion.text}`);
      return;
    }

    // 如果当前是第一步，更新 mainPageArea 状态并进入下一步
    if (currentQuestionIndex === 0) {
        const selectedMainPageId = answers.mainPageArea; // 直接使用 answers.mainPageArea
        const sections = projectAnalysisData.regions[selectedMainPageId || ''] || [];
        setQ2Options(sections);
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer(''); // 重置下一题的回答
        return;
    }

    // 如果不是第一步，按原逻辑更新 answers 并进入下一步
    const newAnswers = { ...answers, [currentQuestion.key]: currentAnswer };
    setAnswers(newAnswers);
    
    // 更新 Q2 选项逻辑（仅在 Q1 完成时触发，这里不需要重复判断 currentQuestion.key === 'mainPageArea'）
    // ... Q2 options update logic was moved to the first step's next handler
    
    setCurrentAnswer(''); 

    if (currentQuestionIndex < totalSteps - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitToParent(newAnswers);
    }
  };

  const handleSubmitToParent = (finalAnswers: SimpleAnswers) => {
    const instructionDoc = generateInstructionDocument(finalAnswers, projectAnalysisData);
    onSubmit(instructionDoc);
  };
  
  const handleStepChange = (stepIndex: number) => {
    if (stepIndex < totalSteps && stepIndex >= 0) {
      // 在切换步骤前保存当前回答
      const currentQuestionKey = initialQuestions[currentQuestionIndex].key;
      setAnswers(prev => ({ ...prev, [currentQuestionKey]: currentAnswer }));

      setCurrentQuestionIndex(stepIndex);
      // 加载对应步骤的回答
      const questionKey = initialQuestions[stepIndex].key;
      setCurrentAnswer(answers[questionKey] || '');
      
      // 如果切换回第一步，并且已经选择了页面，加载 Q2 选项
      if (stepIndex === 0 && answers.mainPageArea) {
          const selectedMainPageId = answers.mainPageArea;
          const sections = projectAnalysisData.regions[selectedMainPageId] || [];
          setQ2Options(sections);
      }

      // 如果切换到第二步，确保 Q2 选项已加载 (如果从第一步切换过来应该已经加载)
      if (stepIndex === 1 && !q2Options.length && answers.mainPageArea) {
           const selectedMainPageId = answers.mainPageArea;
           const sections = projectAnalysisData.regions[selectedMainPageId] || [];
           setQ2Options(sections);
      }

    }
  };

  const handlePreviousStep = () => {
    if (currentQuestionIndex > 0) {
      // 在切换步骤前保存当前回答
      const currentQuestionKey = initialQuestions[currentQuestionIndex].key;
      setAnswers(prev => ({ ...prev, [currentQuestionKey]: currentAnswer }));

      setCurrentQuestionIndex(prev => prev - 1);
      // 加载上一步骤的回答
      const questionKey = initialQuestions[currentQuestionIndex - 1].key;
      setCurrentAnswer(answers[questionKey] || '');
    }
  };

  const renderInput = (question: FormQuestion) => {
    // 特殊处理第一步：页面选择和截图预览
    if (currentQuestionIndex === 0 && question.key === 'mainPageArea') {
      return (
        <div className="flex flex-col gap-8"> {/* 垂直布局 */}
          {/* 页面选择下拉框 */}
          <div className="w-full space-y-4">
            <label className="block font-medium mb-2">选择页面：</label>
            {/* 注意：这里的 value 和 onValueChange 需要直接绑定到 answers.mainPageArea */}
            <Select onValueChange={(value) => setAnswers({ ...answers, mainPageArea: value })} value={answers.mainPageArea}>
              <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500">
                <SelectValue placeholder={question.placeholder} />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 overflow-hidden">
                {q1Options.map((group, index) => (
                  <React.Fragment key={group.groupLabel}>
                    <SelectGroup>
                      <SelectLabel className="py-2 px-3 text-xs font-semibold text-gray-500">
                        {group.groupLabel}
                      </SelectLabel>
                      {group.options.map(option => {
                        const displayLabel = option.label;
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
                    {index < q1Options.length - 1 && <SelectSeparator className="my-1" />}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 截图预览卡片 (只有选中页面后才显示) */}
          {answers.mainPageArea && PAGE_SCREENSHOTS[answers.mainPageArea] && (
            <div className="flex-1 mt-4">
              <Card>
                 {/* CardContent 的内边距调整 */}
                <CardContent className="p-6"> 
                  <div
                    className="relative w-full h-[300px] border rounded-xl overflow-hidden shadow-lg bg-black cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <Image
                      src={PAGE_SCREENSHOTS[answers.mainPageArea]}
                      alt={selectedPageInfo?.label || '页面预览'}
                      fill
                      className="object-contain rounded-xl" // 图片圆角更大
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      );
    }

    // 其他步骤的渲染逻辑保持不变
    if (question.type === 'select') {
      const options = question.key === 'mainPageArea' ? q1Options : q2Options;
      return (
        <Select onValueChange={(value) => setCurrentAnswer(value)} value={currentAnswer}>
          <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500">
            <SelectValue placeholder={question.placeholder} />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 overflow-hidden">
            {question.key === 'mainPageArea' ? ( // 这部分逻辑实际上不会被触发了，因为第一步单独处理了
              q1Options.map((group, index) => (
                <React.Fragment key={group.groupLabel}>
                  <SelectGroup>
                    <SelectLabel className="py-2 px-3 text-xs font-semibold text-gray-500">{group.groupLabel}</SelectLabel>
                    {group.options.map(option => {
                      let displayLabel = option.label;
                      let isDisabled = false;
                      if (option.value === 'cex_market_futures') {
                        displayLabel += ' (功能复杂，暂不由此微调)';
                        isDisabled = true;
                      }
                      return (
                        <SelectItem 
                          key={option.value} 
                          value={option.value} 
                          className="py-2 px-4 hover:bg-orange-50 focus:bg-orange-50 rounded cursor-pointer text-sm data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                          disabled={isDisabled}
                        >
                          {displayLabel}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                  {index < q1Options.length - 1 && <SelectSeparator className="my-1" />}
                </React.Fragment>
              ))
            ) : ( // Q2 及以后步骤的下拉框渲染
              <SelectGroup>
                {/* Render "整个页面" first if it exists */}
                {q2Options.find(opt => opt.value === '_entire_page_') && (
                  <SelectItem 
                    key="_entire_page_" 
                    value="_entire_page_" 
                    className="py-2 px-4 hover:bg-orange-50 focus:bg-orange-50 rounded cursor-pointer text-sm font-medium"
                  >
                    整个页面
                  </SelectItem>
                )}
                {/* Render Separator if "整个页面" exists and there are other options */}
                {q2Options.find(opt => opt.value === '_entire_page_') && q2Options.filter(opt => opt.value !== '_entire_page_').length > 0 && (
                  <SelectSeparator className="my-1" />
                )}
                {/* Render other region options */}
                {q2Options
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
              </SelectGroup>
            )}
            {options.length === 0 && question.key === 'specificSection' && answers.mainPageArea && (
              <SelectItem value="custom" disabled className="py-2 px-4 text-gray-400 cursor-not-allowed text-sm">
                (该页面无预设版块，请在Q3详细描述)
              </SelectItem>
            )}
             {options.length === 0 && question.key === 'mainPageArea' && ( // 这部分也应该不会被触发了
              <SelectItem value="loading" disabled className="py-2 px-4 text-gray-400 cursor-not-allowed text-sm">
                (加载中或无可选页面...)
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    } else { // Textarea (using native textarea)
      return (
        <>
          <textarea
            id={`question-${question.id}`}
            value={currentAnswer}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentAnswer(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            placeholder={question.placeholder || (question.isOptional ? "选填，请在此输入您的回答..." : "请在此输入您的回答...")}
          />
          {question.hint && <p className="text-sm text-gray-500 mt-2">{question.hint}</p>}
        </>
      );
    }
  };
  
  const currentQuestion = initialQuestions[currentQuestionIndex];

  return (
    <div className="max-w-xl w-full mx-auto space-y-8">
      {/* Stepper */}
      <div className="space-y-3">
         <div className="text-center text-2xl font-bold mb-4">认真回答所有问题</div>
        <Stepper value={currentQuestionIndex + 1} className="w-full">
          {initialQuestions.map((questionData, index) => (
            <StepperItem key={questionData.id} step={index + 1} className="flex-1">
              <StepperTrigger 
                className="w-full flex-col items-start gap-2" 
                asChild 
                disabled={index > currentQuestionIndex} 
                onClick={() => { if (index <= currentQuestionIndex) handleStepChange(index);}}
              >
                 {/* Stepper 指示器 */} 
                <StepperIndicator asChild className="h-2 w-full rounded-none bg-gray-200 data-[state=completed]:bg-orange-500 data-[state=active]:bg-orange-500">
                  <span className="sr-only">{index + 1}</span>
                </StepperIndicator>
              </StepperTrigger>
              {index < totalSteps - 1 && <StepperSeparator className="data-[state=completed]:bg-orange-500"/>}
            </StepperItem>
          ))}
        </Stepper>
        <div className="text-sm font-medium tabular-nums text-muted-foreground text-center">
          步骤 {currentQuestionIndex + 1} / {totalSteps}
        </div>
      </div>
      
      {/* 当前步骤内容 */}
      {/* 根据 currentQuestionIndex 渲染不同的内容 */} 
      <div className="mb-6">
         {/* 如果是第一步，使用自定义的渲染逻辑 */} 
         {currentQuestionIndex === 0 ? (
             <div className="space-y-4"> {/* 包裹第一步内容的容器 */} 
                 <div className="block text-lg font-medium text-gray-700 mb-3">
                     {initialQuestions[currentQuestionIndex].text}
                 </div>
                 {renderInput(initialQuestions[currentQuestionIndex])} {/* 渲染第一步的页面选择和截图 */} 
             </div>
         ) : (
             // 其他步骤使用原有的渲染逻辑
             <div key={currentQuestion.id} className="mb-6">
               <label htmlFor={`question-${currentQuestion.id}`} className="block text-lg font-medium text-gray-700 mb-3">
                 {currentQuestion.text}
                 {currentQuestion.isOptional && <span className="text-sm font-normal text-gray-500 ml-1">(选填)</span>}
               </label>
               {renderInput(currentQuestion)}
             </div>
         )}
      </div>
      
      {/* 步骤导航按钮 */}
      <div className="flex space-x-4 mt-8">
        {currentQuestionIndex > 0 && (
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
          // 第一步时，只有选择了页面才启用"下一个"按钮
          disabled={currentQuestionIndex === 0 ? !answers.mainPageArea : (!currentQuestion.isOptional && !currentAnswer.trim() && currentQuestion.type === 'textarea')}
        >
          {currentQuestionIndex < totalSteps - 1 ? '下一个' : '生成操作指令'}
        </button>
      </div>
      
      {/* 返回首页按钮 (如果需要) */}
      {onCancel && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={onCancel}
            className="py-2 px-4 text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            <IconArrowBack size={16} className="mr-1" />
            返回首页
          </button>
        </div>
      )}

      {/* 放大视图 */}
      {isZoomed && answers.mainPageArea && PAGE_SCREENSHOTS[answers.mainPageArea] && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] cursor-pointer"
          onClick={handleCloseZoom}
        >
          {/* 调整包裹图片的容器样式，使其能更好地放大 */}
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}> 
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
  );
};

export default SimpleUIMicroAdjustmentForm; 