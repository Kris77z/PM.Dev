'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Stepper, 
  StepperItem, 
  StepperIndicator, 
  StepperSeparator,
  StepperTrigger
} from "@/components/ui/stepper";
import { IconArrowBack } from "@tabler/icons-react";

// Interface for optimization answers - using 'yes'/'no' for hasPrd
interface OptimizationAnswers {
  platformType?: string;
  featureOrPageName?: string;
  hasPrd?: 'yes' | 'no'; // Changed type to 'yes' | 'no'
  prdPathOrContent?: string; // For simulation
  prdSummaryConfirmation?: string;
  problemDescription?: string;
  optimizationGoal?: string;
  proposedSolution?: string;
  techDiscussionPoints?: string;
}

// Props for the component
interface OptimizationFormProps {
  onComplete: (answers: OptimizationAnswers) => void;
  onCancel?: () => void; // 添加取消回调函数
}

// 添加 Step 类型定义
interface Step {
  key: string;
  text: string;
  type: 'select' | 'text' | 'textarea';
  options?: string[];
  isOptional?: boolean;
  isSummary?: boolean;
  hint?: string;
}

const OptimizationForm: React.FC<OptimizationFormProps> = ({ onComplete, onCancel }) => {
  const [answers, setAnswers] = useState<OptimizationAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [prdContent, setPrdContent] = useState(''); // Simulate PRD input
  const [aiSummary, setAiSummary] = useState('AI 生成的摘要占位符 - 请根据您提供的 PRD 或记忆确认/修改。'); // Simulate AI summary

  // Define step options text constants for clarity
  const HAS_PRD_YES = '有，我可以提供';
  const HAS_PRD_NO = '没有/不详细';

  // Define steps dynamically based on PRD existence
  const getSteps = (hasPrdValue: 'yes' | 'no' | null): Step[] => [
    {
      key: 'platformType',
      text: '您要优化的功能/页面是属于哪个平台？',
      type: 'select' as const, // Ensure type safety
      options: ['Web 端', 'App 端 (iOS)', 'App 端 (Android)', 'App 端 (通用)'],
      isOptional: false,
    },
    {
      key: 'featureOrPageName',
      text: '具体是哪个功能模块或页面需要优化？',
      type: 'text' as const,
      isOptional: false,
    },
    {
      key: 'hasPrd',
      text: '关于此功能/页面，是否有现成的、详细的 PRD 或类似说明文档？',
      type: 'select' as const,
      options: [HAS_PRD_YES, HAS_PRD_NO],
      isOptional: false,
    },
    ...(hasPrdValue === 'yes' // Compare with internal value
      ? [
          {
            key: 'prdPathOrContent',
            text: '请提供相关 PRD 文档的路径或粘贴关键内容：(模拟步骤)',
            type: 'textarea' as const,
            isOptional: false,
          },
          {
            key: 'prdSummaryConfirmation',
            text: `根据您提供的 PRD (或我的理解)，该功能/页面情况大致如下。请确认或补充：`,
            type: 'textarea' as const,
            isSummary: true,
            isOptional: true,
          },
        ]
      : hasPrdValue === 'no' // Compare with internal value
      ? [
          {
            key: 'problemDescription',
            text: '请详细描述当前功能/页面存在的主要问题或不足：',
            type: 'textarea' as const,
            isOptional: false,
          },
        ]
      : []),
    {
      key: 'optimizationGoal',
      text: '您希望通过这次优化，达到什么样的具体目标？',
      type: 'textarea' as const,
      isOptional: false,
    },
    {
      key: 'proposedSolution',
      text: '您初步设想的优化方案或改动思路是什么？',
      type: 'textarea' as const,
      isOptional: false,
    },
    {
      key: 'techDiscussionPoints',
      text: '基于您的优化目标和方案，您觉得有哪些方面可能需要特别与技术团队沟通或确认？',
      type: 'textarea' as const,
      isOptional: false,
    },
  ];

  const [steps, setSteps] = useState(() => getSteps(null)); // Initial steps calculation

  // Update steps when hasPrd answer changes
  useEffect(() => {
    setSteps(getSteps(answers.hasPrd ?? null)); // Use internal 'yes'/'no' value
  }, [answers.hasPrd]);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = event.target;

    // Handle radio button selection
    if (type === 'radio' && name === 'hasPrd') {
        const internalValue = value === HAS_PRD_YES ? 'yes' : 'no';
        setCurrentAnswer(value); // Keep visual selection
        setAnswers(prev => ({
            ...prev,
            hasPrd: internalValue, // Store internal value
            // Reset subsequent fields based on the *new* internal value
            prdPathOrContent: internalValue === 'yes' ? prev.prdPathOrContent : undefined,
            prdSummaryConfirmation: internalValue === 'yes' ? prev.prdSummaryConfirmation : undefined,
            problemDescription: internalValue === 'no' ? prev.problemDescription : undefined,
        }));
    } else if (type === 'radio') {
        setCurrentAnswer(value);
        setAnswers(prev => ({ ...prev, [name]: value }));
    } else {
        // Handle text and textarea inputs
        setCurrentAnswer(value);
        if (currentQuestion?.key === 'prdPathOrContent') {
            setPrdContent(value); // Update simulated PRD content
        }
    }
  };
  
  // Handler for checkbox/radio option selection
  const handleOptionSelect = (option: string) => {
    setCurrentAnswer(option);
  };

  const handleNextStep = () => {
    const currentKey = currentQuestion.key;
    let valueToSave = currentAnswer;

    // Special handling for simulated PRD steps
    if (currentKey === 'prdPathOrContent') {
      valueToSave = prdContent; // Save the simulated content
      setAiSummary(`AI 基于您提供的描述生成的摘要占位符 - 请确认/修改关于 [${answers.featureOrPageName || '该功能'}] 的情况。`);
    } else if (currentKey === 'prdSummaryConfirmation') {
      valueToSave = currentAnswer; // User confirmed/edited summary
    }

    const updatedAnswers: OptimizationAnswers = { ...answers, [currentKey]: valueToSave };
    // Remove keys that are no longer relevant based on hasPrd choice
    if (updatedAnswers.hasPrd === 'yes') {
        delete updatedAnswers.problemDescription;
    } else if (updatedAnswers.hasPrd === 'no') {
        delete updatedAnswers.prdPathOrContent;
        delete updatedAnswers.prdSummaryConfirmation;
    }
    
    setAnswers(updatedAnswers);
    setCurrentAnswer(''); // Reset visual input for next step
    setPrdContent(''); // Reset temp PRD content state

    // Move to the next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      console.log('Optimization Form completed:', updatedAnswers);
      onComplete(updatedAnswers);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevQuestion = steps[currentStep - 1];
      if (prevQuestion) {
        const prevKey = prevQuestion.key as keyof OptimizationAnswers;
        let initialValue = answers[prevKey] || '';

        if (prevKey === 'prdSummaryConfirmation') {
          initialValue = answers[prevKey] || aiSummary; 
        } else if (prevKey === 'hasPrd') {
          initialValue = answers.hasPrd === 'yes' ? HAS_PRD_YES : answers.hasPrd === 'no' ? HAS_PRD_NO : '';
        }
        
        setCurrentAnswer(initialValue);

        if (prevKey === 'prdPathOrContent') {
          setPrdContent(answers.prdPathOrContent || '');
        }
      }
    }
  };

  const currentQuestion = steps[currentStep];
  const totalSteps = steps.length;

   // Effect to set the initial value for the current step's input field
   useEffect(() => {
    const key = steps[currentStep]?.key as keyof OptimizationAnswers | undefined;
    if (!key) return; 

    let initialValue = answers[key] || '';

    if (key === 'prdSummaryConfirmation') {
        initialValue = answers[key] || aiSummary; 
    } else if (key === 'hasPrd') {
        // Map internal state back to display text for radio check
        initialValue = answers.hasPrd === 'yes' ? HAS_PRD_YES : answers.hasPrd === 'no' ? HAS_PRD_NO : '';
    }
    
    setCurrentAnswer(initialValue);

    // Reset PRD content temporary state when moving to that step
    if (key === 'prdPathOrContent') {
        setPrdContent(answers.prdPathOrContent || '');
    }
  }, [currentStep, steps, answers, aiSummary]); // Dependencies
  
  // Function to render the correct input based on question type
  const renderInput = (question: Step) => {
    if (question.type === 'select' && question.options) {
      return (
        <div className="space-y-3">
          {question.options.map((option: string) => (
            <label key={option} className="flex items-center space-x-3 cursor-pointer">
              <Checkbox 
                id={`option-${option}`}
                checked={currentAnswer === option}
                onCheckedChange={() => handleOptionSelect(option)}
                className="border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <span className="text-base">{option}</span>
            </label>
          ))}
        </div>
      );
    } else { // Default to text area
      return (
        <>
          <textarea
            name={question.key}
            value={question.key === 'prdPathOrContent' ? prdContent : currentAnswer}
            onChange={handleInputChange}
            rows={question.key === 'prdSummaryConfirmation' ? 6 : 4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            placeholder={question.isOptional ? "选填，请在此输入您的回答..." : "请在此输入您的回答..."}
          />
          {question.hint && <p className="text-sm text-gray-500 mt-2">{question.hint}</p>}
        </>
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="space-y-3">
        <Stepper value={currentStep + 1} onValueChange={(step) => setCurrentStep(step - 1)} className="w-full">
          {steps.map((question, index) => (
            <StepperItem key={question.key} step={index + 1} className="flex-1">
              <StepperTrigger 
                className="w-full flex-col items-start gap-2" 
                asChild 
                disabled={index > currentStep}
                onClick={() => { if (index <= currentStep) setCurrentStep(index);}}
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
          步骤 {currentStep + 1} / {totalSteps}
        </div>
      </div>

      {/* Question Area */}
      {currentQuestion && (
          <div key={currentQuestion.key} className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-3">
              {currentQuestion.text}
              {currentQuestion.isOptional && <span className="text-sm font-normal text-gray-500 ml-1">(选填)</span>}
            </label>
            {renderInput(currentQuestion)}
          </div>
      )}

      {/* Navigation Button */}
      {currentQuestion && (
        <div className="flex space-x-4">
          <div className="flex-grow flex space-x-4">
            {currentStep > 0 && (
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
              className="flex-grow py-2 px-4 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              disabled={!currentQuestion.isOptional && !currentAnswer.trim() && currentQuestion.type !== 'select'}
            >
              {currentStep < steps.length - 1 ? '下一步' : '完成优化规划'}
            </button>
          </div>
        </div>
      )}
      
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

export default OptimizationForm; 