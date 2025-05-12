'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Label, Textarea, Button imports are removed, will use native elements + Tailwind
import { 
  Stepper, 
  StepperItem, 
  StepperIndicator, 
  StepperSeparator,
  StepperTrigger
} from "@/components/ui/stepper";
import { IconArrowBack } from "@tabler/icons-react";

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

export interface ProjectAnalysisData {
  techStack: string;  // 简单字符串，不是复杂对象
  pages: PageOption[];  // 与 JSON 结构匹配
  regions: Record<string, RegionOption[]>;  // 与 JSON 结构匹配
  componentPathHints?: Record<string, Record<string, string>>;  // 组件路径提示
}

// --- New Types ---
interface SimpleAnswers {
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
const generateInstructionDocument = (answers: SimpleAnswers, projectData: ProjectAnalysisData): string => {
  let instruction = "# AI编码助手操作指令 (简单UI微调)\n\n";

  // 根据更新后的结构调整数据获取方式
  const mainPage = projectData.pages.find(p => p.value === answers.mainPageArea);
  const mainPageName = mainPage ? mainPage.label : '未指定页面';
  // 没有直接的 path 字段，可以从 componentPathHints 获取或者省略
  const mainPagePath = mainPage && projectData.componentPathHints && answers.mainPageArea && 
                      projectData.componentPathHints[answers.mainPageArea] ? 
                      ' (可能的路径提示见后文)' : '';

  instruction += `**主要页面/功能区域:** ${mainPageName}${mainPagePath}\n`;

  let sectionName = '未指定版块';
  let sectionPathHint = '';
  
  if (answers.mainPageArea && answers.specificSection && projectData.regions) {
    const regions = projectData.regions[answers.mainPageArea] || [];
    const section = regions.find(s => s.value === answers.specificSection);
    sectionName = section ? section.label : '未指定版块';
    
    // 从 componentPathHints 获取路径提示（如果有）
    if (projectData.componentPathHints && 
        projectData.componentPathHints[answers.mainPageArea] && 
        projectData.componentPathHints[answers.mainPageArea][answers.specificSection]) {
      sectionPathHint = ` (组件路径: ${projectData.componentPathHints[answers.mainPageArea][answers.specificSection]})`;
      sectionName += sectionPathHint;
    } else if (section?.group) {
      sectionPathHint = ` (分组: ${section.group})`;
      sectionName += sectionPathHint;
    }
  }
  
  instruction += `**具体版块/区域:** ${sectionName}\n`;
  instruction += `**目标界面元素描述:** ${answers.targetElement || '未填写'}\n`;
  instruction += `**期望达成的整体效果:** ${answers.desiredEffect || '未填写'}\n`;
  instruction += `**优化原因:** ${answers.optimizationReason || '未填写'}\n\n`;

  instruction += "## 给AI编码助手的建议指令模板:\n";
  instruction += "```\n";
  instruction += `你好 Cursor，\n\n我想对我们项目中的一个UI元素进行微调。\n`;
  instruction += `- **它位于页面**: "${mainPageName}"\n`;
  instruction += `- **具体版块/组件大约是**: "${sectionName.replace(sectionPathHint, '')}"\n`;
  instruction += `- **我想要修改的元素是**: "${answers.targetElement || 'PM将在此处补充描述'}"\n`;
  if (answers.desiredEffect) {
    instruction += `- **我希望它能变成**: "${answers.desiredEffect}"\n`;
  }
  instruction += `- **修改原因**: "${answers.optimizationReason || 'PM将在此处补充原因'}"\n\n`;
  
  instruction += "项目技术栈提示：\n";
  instruction += `- ${projectData.techStack}\n`;
  
  instruction += "\n我需要你帮我：\n";
  instruction += "1. 理解这个UI元素在项目中的位置和作用\n";
  instruction += "2. 分析如何实现我想要的变更（主要是样式调整）\n";
  instruction += "3. 提供具体的代码修改建议，包括：\n";
  instruction += "   - 需要修改的文件路径（如果可以确定）\n";
  instruction += "   - 精确的代码变更（添加/修改/删除）\n";
  instruction += "   - 如果涉及CSS/Tailwind变更，请详细说明每个类的作用\n";
  instruction += "\n示例修改格式（仅供参考）：\n";
  instruction += "```jsx\n// 原代码\n<button className=\"px-4 py-2 text-white bg-blue-500 rounded\">\n  提交\n</button>\n\n// 修改后\n<button className=\"px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600\">\n  提交\n</button>\n```\n\n";
  
  instruction += "请帮我看看如何实现这个微调。谢谢！\n";
  instruction += "```\n\n";
  
  instruction += "## PM操作提示:\n";
  instruction += "- **仔细检查**: 在将上述指令粘贴给Cursor这类AI编码助手之前，请再次检查每个字段的描述是否准确。\n";
  instruction += "- **提供截图**: 如果方便，强烈建议您截取目标UI元素的图片，一并提供给AI编码助手，这将极大提高沟通效率和准确性。\n";
  instruction += "- **具体化描述**: 尽量使用明确、具体的语言描述您想要修改的元素和期望效果。\n";
  instruction += "- **使用上下文**: 如果有相似的现有设计，可以提供参考（\"类似于XX页面的YY按钮样式\"）。\n";
  
  // 添加组件路径提示（如果有）
  if (sectionPathHint) {
    instruction += `- **相关文件/组件提示**: ${sectionPathHint.substring(2, sectionPathHint.length-1)}，请AI重点关注。\n`;
  }
  
  instruction += "- **保持耐心**: AI可能需要几次尝试才能完美理解您的需求，请准备好进行几轮沟通。\n";

  return instruction;
};


export const SimpleUIMicroAdjustmentForm: React.FC<SimpleUIMicroAdjustmentFormProps> = ({
  projectAnalysisData,
  onSubmit,
  onCancel,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SimpleAnswers>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  const [q1Options, setQ1Options] = useState<PageOption[]>([]);
  const [q2Options, setQ2Options] = useState<RegionOption[]>([]);
  
  const totalSteps = initialQuestions.length;

  // 更新 useEffect 以匹配新的数据结构
  useEffect(() => {
    if (projectAnalysisData && projectAnalysisData.pages) {
      setQ1Options(projectAnalysisData.pages);
    }
  }, [projectAnalysisData]);

  const handleNextStep = () => {
    const currentQuestion = initialQuestions[currentQuestionIndex];
    
    if (!currentQuestion.isOptional && !currentAnswer.trim()) {
      alert(`请回答问题: ${currentQuestion.text}`);
      return;
    }

    const newAnswers = { ...answers, [currentQuestion.key]: currentAnswer };
    setAnswers(newAnswers);

    // 更新 Q2 选项逻辑以匹配新的数据结构
    if (currentQuestion.key === 'mainPageArea') {
      const selectedMainPageId = currentAnswer;
      const sections = projectAnalysisData.regions[selectedMainPageId] || [];
      setQ2Options(sections);
    }
    
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
        setCurrentQuestionIndex(stepIndex);
        const questionKey = initialQuestions[stepIndex].key;
        setCurrentAnswer(answers[questionKey] || '');
    }
  };

  const handlePreviousStep = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const questionKey = initialQuestions[currentQuestionIndex - 1].key;
      setCurrentAnswer(answers[questionKey] || '');
    }
  };

  const renderInput = (question: FormQuestion) => {
    if (question.type === 'select') {
      const options = question.key === 'mainPageArea' ? q1Options : q2Options;
      return (
        <Select onValueChange={(value) => setCurrentAnswer(value)} value={currentAnswer}>
          <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500">
            <SelectValue placeholder={question.placeholder} />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 overflow-hidden">
            <SelectGroup>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value} className="py-2 px-4 hover:bg-orange-50 focus:bg-orange-50 rounded cursor-pointer text-sm">
                  {option.label}
                </SelectItem>
              ))}
              {options.length === 0 && question.key === 'specificSection' && answers.mainPageArea && (
                <SelectItem value="custom" disabled className="py-2 px-4 text-gray-400 cursor-not-allowed text-sm">
                  (该页面无预设版块，请在Q3详细描述)
                </SelectItem>
              )}
               {options.length === 0 && question.key === 'mainPageArea' && (
                <SelectItem value="loading" disabled className="py-2 px-4 text-gray-400 cursor-not-allowed text-sm">
                  (加载中或无可选页面...)
                </SelectItem>
              )}
            </SelectGroup>
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
        <Stepper value={currentQuestionIndex + 1} className="w-full">
          {initialQuestions.map((questionData, index) => (
            <StepperItem key={questionData.id} step={index + 1} className="flex-1">
              <StepperTrigger 
                className="w-full flex-col items-start gap-2" 
                asChild 
                disabled={index > currentQuestionIndex} 
                onClick={() => { if (index <= currentQuestionIndex) handleStepChange(index);}}
              >
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
      
      {/* Current Question (using native label)*/}
      <div key={currentQuestion.id} className="mb-6">
        <label htmlFor={`question-${currentQuestion.id}`} className="block text-lg font-medium text-gray-700 mb-3">
          {currentQuestion.text}
          {currentQuestion.isOptional && <span className="text-sm font-normal text-gray-500 ml-1">(选填)</span>}
        </label>
        {renderInput(currentQuestion)}
      </div>
      
      {/* Buttons (using native button)*/}
      <div className="flex space-x-4">
        <div className="flex-grow flex space-x-4">
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
            disabled={!currentQuestion.isOptional && !currentAnswer.trim() && currentQuestion.type === 'textarea'} // Only disable for empty required textarea
          >
            {currentQuestionIndex < totalSteps - 1 ? '下一个' : '生成操作指令'}
          </button>
        </div>
      </div>
      
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
    </div>
  );
};

export default SimpleUIMicroAdjustmentForm; 