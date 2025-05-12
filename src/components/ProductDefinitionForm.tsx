'use client';

import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Stepper, 
  StepperItem, 
  StepperIndicator, 
  StepperSeparator,
  StepperTrigger
} from "@/components/ui/stepper";
import { IconArrowBack } from "@tabler/icons-react";

// Define type for question object for better type checking
interface Question {
  id: number;
  text: string;
  key: string;
  type: 'text' | 'select';
  options?: string[];
  hint?: string;
  isOptional?: boolean;
}

// Initial questions - renamed from "questions"
const initialQuestions: Question[] = [
  {
    id: 1,
    text: '您的产品是面向哪个平台？',
    key: 'platform',
    type: 'select',
    // Added 'PC'
    options: ['网页端', '移动端App (iOS)', '移动端App (Android)', '移动端App (iOS + Android)', 'PC', '其他']
  },
  {
    id: 2,
    text: '你想做一个什么样的产品？它主要是干什么的？',
    key: 'product_concept',
    type: 'text'
  },
  {
    id: 3,
    text: '这个产品的目标用户是谁？',
    key: 'target_users',
    type: 'text'
  },
  {
    id: 4,
    text: '您希望产品包含哪些核心功能？',
    key: 'core_features',
    type: 'text',
    hint: '请尽量清晰具体'
  },
  {
    id: 5,
    text: '关键用户流程示例 (可选)',
    key: 'key_user_flow_examples',
    type: 'text',
    isOptional: true,
    hint: '请为 1-2 个核心功能，详细描述用户完成任务的主要步骤。这有助于 AI 理解核心交互。'
  },
  {
    id: 6,
    text: '您是否有参考的产品或设计风格偏好？',
    key: 'references',
    type: 'text'
  },
  {
    id: 7,
    text: '范围说明/未来考虑 (可选)',
    key: 'scope_future_considerations',
    type: 'text',
    isOptional: true,
    hint: '当前版本明确包含哪些内容？有哪些是明确不做或留待未来版本的？帮助界定项目范围。'
  },
];

interface Answers {
  [key: string]: string;
}

// Added onComplete prop type
interface ProductDefinitionFormProps {
  // Simplified onComplete to only pass initial answers
  onComplete: (answers: Answers) => void;
  onCancel?: () => void; // 添加取消回调函数
}

const ProductDefinitionForm: React.FC<ProductDefinitionFormProps> = ({ onComplete, onCancel }) => {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [initialAnswers, setInitialAnswers] = useState<Answers>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  const totalSteps = initialQuestions.length;

  const handleNextStep = () => {
    const currentQuestion = initialQuestions[currentQuestionIndex];
    const currentQuestionKey = currentQuestion.key;
    
    const shouldSaveAnswer = !currentQuestion.isOptional || (currentQuestion.isOptional && currentAnswer.trim());
    let updatedInitialAnswers = initialAnswers;

    if (shouldSaveAnswer) {
         updatedInitialAnswers = {
            ...initialAnswers,
            [currentQuestionKey]: currentAnswer
        };
        setInitialAnswers(updatedInitialAnswers);
    } else if (currentQuestion.isOptional && !currentAnswer.trim()) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [currentQuestionKey]: removed, ...rest } = initialAnswers;
        updatedInitialAnswers = rest;
        setInitialAnswers(updatedInitialAnswers);
    }
    
    setCurrentAnswer('');

    if (currentQuestionIndex < totalSteps - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      console.log('Product Definition Form completed:', updatedInitialAnswers);
      onComplete(updatedInitialAnswers);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const prevQuestion = initialQuestions[currentQuestionIndex - 1];
      setCurrentAnswer(initialAnswers[prevQuestion.key] || '');
    }
  };
  
  // Updated input change handler to support checkbox and radio
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setCurrentAnswer(event.target.value);
  };

  // New handler for checkbox selection
  const handleOptionSelect = (option: string) => {
    setCurrentAnswer(option);
  };
  
  // Function to get the current question based on form phase
  const getCurrentQuestion = (): Question => {
    return initialQuestions[currentQuestionIndex];
  };
  
  // Function to render the correct input based on question type
  const renderInput = (question: Question) => {
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
            id={`question-${question.id}`}
            value={currentAnswer}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            placeholder={question.isOptional ? "选填，请在此输入您的回答..." : "请在此输入您的回答..."}
          />
          {question.hint && <p className="text-sm text-gray-500 mt-2">{question.hint}</p>}
        </>
      );
    }
  };
  
  // Get the current question
  const currentQuestion = getCurrentQuestion();
  
  return (
    <div className="max-w-xl w-full mx-auto space-y-8">
      <div className="space-y-3">
        <Stepper value={currentQuestionIndex + 1} onValueChange={(step) => setCurrentQuestionIndex(step - 1)} className="w-full">
          {initialQuestions.map((question, index) => (
            <StepperItem key={question.id} step={index + 1} className="flex-1">
              <StepperTrigger 
                className="w-full flex-col items-start gap-2" 
                asChild 
                disabled={index > currentQuestionIndex}
                onClick={() => { if (index <= currentQuestionIndex) setCurrentQuestionIndex(index);}}
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
      
      <div key={currentQuestion.id} className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-3">
          {currentQuestion.text}
          {currentQuestion.isOptional && <span className="text-sm font-normal text-gray-500 ml-1">(选填)</span>}
        </label>
        {renderInput(currentQuestion)}
      </div>
      
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
            disabled={!currentQuestion.isOptional && !currentAnswer.trim() && currentQuestion.type !== 'select'}
          >
            {currentQuestionIndex < totalSteps - 1 ? '下一个' : '提交'}
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

export default ProductDefinitionForm; 