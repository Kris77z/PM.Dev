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

// Interface for Add Feature answers - Added PRD fields
interface AddFeatureAnswers {
  platformType?: string;
  featureNameAndPurpose?: string;
  hasPrd?: 'yes' | 'no'; // Added
  prdPathOrContent?: string; // Added: For simulation
  prdSummaryConfirmation?: string; // Added
  featureGoalAndValue?: string;
  targetUsers?: string;
  coreWorkflow?: string;
  interactionWithExisting?: string;
  nextStepDecision?: string; 
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

// Props for the component
interface AddFeatureFormProps {
  // Callback when the initial definition is complete.
  // It might pass a flag indicating whether to continue with tech/page planning.
  onComplete: (answers: AddFeatureAnswers, shouldContinue: boolean) => void;
  onCancel?: () => void; // 添加取消回调函数
}

const AddFeatureForm: React.FC<AddFeatureFormProps> = ({ onComplete, onCancel }) => {
  const [answers, setAnswers] = useState<AddFeatureAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [prdContent, setPrdContent] = useState(''); // Simulate PRD input
  const [aiSummary, setAiSummary] = useState('AI 生成的新功能摘要占位符 - 请根据您提供的 PRD 或记忆确认/修改。'); // Simulate AI summary

  // Define step options text constants for clarity
  const HAS_PRD_YES = '有，我可以提供';
  const HAS_PRD_NO = '没有/不详细';

  // Define steps dynamically based on PRD existence
  const getSteps = (hasPrdValue: 'yes' | 'no' | null): Step[] => [
    {
      key: 'platformType',
      text: '您要在哪个平台添加新功能/页面？',
      type: 'select' as const,
      options: ['Web 端', 'App 端 (iOS)', 'App 端 (Android)', 'App 端 (通用)'],
      isOptional: false,
    },
    {
      key: 'featureNameAndPurpose',
      text: '请简要描述您要添加的新功能/页面的名称及其主要作用？',
      type: 'textarea' as const,
      isOptional: false,
    },
    {
        key: 'hasPrd',
        text: '关于这个新功能，是否有现成的 PRD 或需求文档？',
        type: 'select' as const,
        options: [HAS_PRD_YES, HAS_PRD_NO],
        isOptional: false,
    },
    ...(hasPrdValue === 'yes'
      ? [
          {
            key: 'prdPathOrContent',
            text: '请提供相关 PRD 文档的路径或粘贴关键内容：(模拟步骤)',
            type: 'textarea' as const,
            isOptional: false,
          },
          {
            key: 'prdSummaryConfirmation',
            text: `根据文档，我理解这个新功能的目标、用户、核心流程大致是：请确认或补充：`,
            type: 'textarea' as const,
            isSummary: true,
            isOptional: true,
          },
        ]
      : hasPrdValue === 'no'
      ? [
          {
            key: 'featureGoalAndValue',
            text: '这个新功能/页面主要想解决什么现有产品未满足的需求，或为用户带来什么核心价值？',
            type: 'textarea' as const,
            isOptional: false,
          },
          {
            key: 'targetUsers',
            text: '这个新功能主要是给所有现有用户使用，还是针对特定的用户群体？（如是特定群体，请简要描述）',
            type: 'textarea' as const,
            isOptional: false,
          },
          {
            key: 'coreWorkflow',
            text: '请描述用户使用这个新功能的主要操作步骤或核心流程？',
            type: 'textarea' as const,
            isOptional: false,
          },
        ]
      : []),
    {
      key: 'interactionWithExisting',
      text: '这个新功能需要如何与现有产品的功能或数据进行交互？',
      type: 'textarea' as const,
      isOptional: false,
    },
    {
      key: 'nextStepDecision',
      text: '新功能的基本定义已完成。接下来通常需要进行技术和页面规划，您想继续吗？',
      type: 'select' as const,
      options: ['继续技术和页面规划', '暂时先到这里'],
      isOptional: false,
    },
  ];

  const [steps, setSteps] = useState(() => getSteps(null)); // Initial steps calculation

  // Update steps when hasPrd answer changes
  useEffect(() => {
    setSteps(getSteps(answers.hasPrd ?? null));
  }, [answers.hasPrd]);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = event.target;
    
    if (type === 'radio' && name === 'hasPrd') {
        const internalValue = value === HAS_PRD_YES ? 'yes' : 'no';
        setCurrentAnswer(value); // Keep visual selection
        setAnswers(prev => ({
            ...prev,
            hasPrd: internalValue, // Store internal value
            // Reset conflicting fields
            prdPathOrContent: internalValue === 'yes' ? prev.prdPathOrContent : undefined,
            prdSummaryConfirmation: internalValue === 'yes' ? prev.prdSummaryConfirmation : undefined,
            featureGoalAndValue: internalValue === 'no' ? prev.featureGoalAndValue : undefined,
            targetUsers: internalValue === 'no' ? prev.targetUsers : undefined,
            coreWorkflow: internalValue === 'no' ? prev.coreWorkflow : undefined,
        }));
    } else if (type === 'radio') {
        setCurrentAnswer(value); // For nextStepDecision
         setAnswers(prev => ({ ...prev, [name]: value }));
    }else {
        // Handle text and textarea inputs
        setCurrentAnswer(value);
        if (currentQuestion?.key === 'prdPathOrContent') {
            setPrdContent(value); 
        }
    }
  };
  
  // Handler for checkbox/radio option selection
  const handleOptionSelect = (option: string) => {
    setCurrentAnswer(option);
  };

  const handleNextStep = () => {
    const currentKey = currentQuestion.key as keyof AddFeatureAnswers;
    let valueToSave = currentAnswer;

    if (currentKey === 'prdPathOrContent') {
      valueToSave = prdContent;
      setAiSummary(`AI 基于您提供的描述生成的摘要占位符 - 请确认/修改关于 [${answers.featureNameAndPurpose || '新功能'}] 的情况。`);
    } else if (currentKey === 'prdSummaryConfirmation') {
      valueToSave = currentAnswer; 
    }
    
    const updatedAnswers: AddFeatureAnswers = { ...answers, [currentKey]: valueToSave };
    // Clean up irrelevant answers based on hasPrd
    if (updatedAnswers.hasPrd === 'yes') {
        delete updatedAnswers.featureGoalAndValue;
        delete updatedAnswers.targetUsers;
        delete updatedAnswers.coreWorkflow;
    } else if (updatedAnswers.hasPrd === 'no') {
        delete updatedAnswers.prdPathOrContent;
        delete updatedAnswers.prdSummaryConfirmation;
    }

    setAnswers(updatedAnswers);
    setCurrentAnswer('');
    setPrdContent('');

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step completed
      console.log('Add Feature Form completed:', updatedAnswers);
      const shouldContinue = updatedAnswers.nextStepDecision === '继续技术和页面规划';
      onComplete(updatedAnswers, shouldContinue);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevQuestion = steps[currentStep - 1];
      if (prevQuestion) {
        const prevKey = prevQuestion.key as keyof AddFeatureAnswers;
        let initialValue = answers[prevKey] || '';

        if (prevKey === 'prdSummaryConfirmation') {
          initialValue = answers[prevKey] || aiSummary; 
        } else if (prevKey === 'hasPrd') {
          initialValue = answers.hasPrd === 'yes' ? HAS_PRD_YES : answers.hasPrd === 'no' ? HAS_PRD_NO : '';
        } else if (prevKey === 'nextStepDecision'){
          initialValue = answers[prevKey] || ''; 
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

   // Effect to set initial value for the current step input
   useEffect(() => {
    const key = steps[currentStep]?.key as keyof AddFeatureAnswers | undefined;
    if (!key) return; 

    let initialValue = answers[key] || '';

    if (key === 'prdSummaryConfirmation') {
        initialValue = answers[key] || aiSummary; 
    } else if (key === 'hasPrd') {
        initialValue = answers.hasPrd === 'yes' ? HAS_PRD_YES : answers.hasPrd === 'no' ? HAS_PRD_NO : '';
    } else if (key === 'nextStepDecision'){
         initialValue = answers[key] || ''; // Ensure radio selection is pre-filled
    }
    
    setCurrentAnswer(initialValue);

    if (key === 'prdPathOrContent') {
        setPrdContent(answers.prdPathOrContent || '');
    }
  }, [currentStep, steps, answers, aiSummary]); // Dependencies
  
  // Function to render the correct input based on question type
  const renderInput = (question: Step) => {
    if (question.type === 'select' && question.options) {
      return (
        <div className="space-y-3">
          {question.options.map((option) => (
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
              // 不是可选项且没有答案时禁用按钮
              disabled={!currentQuestion.isOptional && !currentAnswer.trim() && currentQuestion.type !== 'select'}
            >
              {currentStep < steps.length - 1 ? '下一步' : '完成新功能定义'}
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

export default AddFeatureForm; 