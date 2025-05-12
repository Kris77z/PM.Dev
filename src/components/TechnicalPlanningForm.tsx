'use client';

import React, { useState } from 'react';

// Define a more specific type for the dependency check function
type DependencyCheckFn = (dependentValue: JsonValue | undefined, allAnswers: Answers) => boolean;

// Interface for Question structure
interface Question {
  id: number;
  section: string;
  text: string;
  key: string;
  type: 'text' | 'select' | 'info'; 
  options?: string[];
  hint?: string;
  isOptional?: boolean; 
  // Use the specific function type
  dependsOn?: { key: string; value: JsonValue | DependencyCheckFn }; 
}

// Technical Planning Questions - V6 with Project Type
const technicalQuestions: Question[] = [
  {
    id: 1, // New first question
    section: '项目类型定义', // New section
    text: '这个项目属于哪种类型？', 
    key: 'project_type',
    type: 'select',
    isOptional: false, // Mandatory
    options: [
        '纯前端项目 (静态页面为主，如官网、文档)',
        '纯前端项目 (含复杂交互，可能需状态管理，无独立后端)',
        '全栈项目 (含前后端，需数据库、API等)',
        '其他 (请说明)'
    ],
  },
  
  // --- A. 核心架构 (Core Architecture) ---
  {
    id: 2, // Re-ID
    section: '核心架构',
    text: '后台技术选择：', 
    key: 'backend_tech',
    type: 'select',
    isOptional: false,
    options: ['Next.js API Routes','Node.js (独立服务)','Python (如 Flask/Django)','其他 (请说明)'],
    hint: '(推荐: Next.js API Routes)...',
    dependsOn: { key: 'project_type', value: '全栈项目 (含前后端，需数据库、API等)' }
  },
  {
    id: 3, // Re-ID
    section: '核心架构',
    text: '架构风格：', 
    key: 'architecture_style',
    type: 'select',
    isOptional: false,
    options: ['整体服务 (推荐初期)','微服务','其他 (请说明)'],
    hint: '初期项目通常建议先做成整体服务。',
    dependsOn: { key: 'project_type', value: '全栈项目 (含前后端，需数据库、API等)' }
  },
  {
    id: 4, // Re-ID
    section: '核心架构',
    text: '已知的关键依赖包 (可选)',
    key: 'known_key_dependencies',
    type: 'text',
    isOptional: true,
    hint: '是否有已知的、必须使用的关键库或包？例如：axios, date-fns, lodash 等'
    // No dependency - applies to all project types
  },

  // --- B. 数据管理 (Data Management) --- (Depends on Full Stack)
  {
    id: 5, // Re-ID
    section: '数据管理',
    text: '数据库类型选择：',
    key: 'db_type',
    type: 'select',
    isOptional: false,
    options: ['PostgreSQL (关系型)','MySQL (关系型)','MongoDB (NoSQL)','Serverless 数据库 (如 Firebase/Supabase)','其他 (请说明)'],
    hint: '(推荐: PostgreSQL)...',
    dependsOn: { key: 'project_type', value: '全栈项目 (含前后端，需数据库、API等)' }
  },
  {
    id: 6, // Re-ID
    section: '数据管理',
    text: '应用的核心数据实体有哪些？',
    key: 'core_entities',
    type: 'text',
    isOptional: false,
    hint: '例如：用户、产品、订单、帖子、任务等...',
    dependsOn: { key: 'project_type', value: '全栈项目 (含前后端，需数据库、API等)' }
  },
  {
    id: 7, // Re-ID
    section: '数据管理',
    text: '实体间主要关系描述 (可选)',
    key: 'entity_relationships',
    type: 'text',
    isOptional: true,
    hint: '这些核心实体之间存在哪些主要关系？...',
    dependsOn: { key: 'project_type', value: '全栈项目 (含前后端，需数据库、API等)' }
  },
   {
    id: 8, // Re-ID
    section: '数据管理',
    text: '是否需要用户认证/登录功能？',
    key: 'needs_authentication',
    type: 'select',
    isOptional: false,
    options: ['是', '否'],
    dependsOn: { key: 'project_type', value: '全栈项目 (含前后端，需数据库、API等)' }
  },
  {
    id: 9, // Re-ID
    section: '数据管理',
    text: '首选认证方式',
    key: 'preferred_auth_methods',
    type: 'select',
    isOptional: false, 
    options: ['邮箱/密码', '手机号验证码', '社交登录 (Google/GitHub等)', '其他'],
    // Depends on both project type AND needs_authentication being '是'
    dependsOn: { key: 'needs_authentication', value: '是' } 
  },
  {
    id: 10, // Re-ID
    section: '数据管理',
    text: '文件/媒体存储需求 (可选)',
    key: 'file_storage_needs',
    type: 'select',
    isOptional: true,
    options: ['不需要', '用户头像', '用户上传内容(图片/视频/文件等)', '其他'],
    dependsOn: { key: 'project_type', value: '全栈项目 (含前后端，需数据库、API等)' }
  },

  // --- C. API & 通信 (API & Communication) --- (Depends on Full Stack)
  {
    id: 11, // Re-ID
    section: 'API & 通信',
    text: 'API 风格：', 
    key: 'api_style',
    type: 'select',
    isOptional: false,
    options: ['RESTful','GraphQL','gRPC','其他 (请说明)'],
    hint: '(推荐: RESTful)...',
    dependsOn: { key: 'project_type', value: '全栈项目 (含前后端，需数据库、API等)' }
  },
  {
    id: 12, // Re-ID
    section: 'API & 通信',
    text: '是否有计划集成关键的第三方 API？（可选）',
    key: 'third_party_apis',
    type: 'text',
    isOptional: true,
    hint: '例如：支付、地图、社交登录等...',
    dependsOn: { key: 'project_type', value: '全栈项目 (含前后端，需数据库、API等)' }
  },
  {
    id: 13, // Re-ID
    section: 'API & 通信',
    text: '第三方 API 文档链接 (可选)',
    key: 'third_party_api_docs',
    type: 'text',
    isOptional: true,
    // Explicitly type the dependency check function
    dependsOn: { 
        key: 'third_party_apis', 
        value: (val: JsonValue | undefined, allAnswers: Answers): boolean => 
            !!(allAnswers['project_type'] === '全栈项目 (含前后端，需数据库、API等)' && val && String(val).trim() !== '')
    } 
  },

  // --- D. 前端细节 (Frontend Details) --- (Depends on Not being purely static)
  {
    id: 14, // Re-ID
    section: '前端细节',
    text: 'UI 库选择：', 
    key: 'ui_library',
    type: 'select',
    isOptional: false,
    options: ['Shadcn/UI','Material UI (MUI)','Ant Design','Tailwind CSS (纯工具类)','不使用 UI 库 (纯手写 CSS)','其他 (请说明)'],
    hint: '(推荐: Shadcn/UI)...',
    // Explicitly type the dependency check function
    dependsOn: { key: 'project_type', value: (val: JsonValue | undefined): boolean => val !== '纯前端项目 (静态页面为主，如官网、文档)' } 
  },
  {
    id: 15, // Re-ID
    section: '前端细节',
    text: '应用的整体视觉风格偏好？',
    key: 'visual_style',
    type: 'select',
    isOptional: false,
    options: ['简洁现代', '活泼有趣', '专业商务', '跟随 UI 库默认', '其他 (请说明)'],
    dependsOn: { key: 'project_type', value: (val: JsonValue | undefined): boolean => val !== '纯前端项目 (静态页面为主，如官网、文档)' } 
  },
  {
    id: 16, // Re-ID
    section: '前端细节',
    text: '有无偏好的主色调？(可选)',
    key: 'primary_color',
    type: 'text',
    isOptional: true,
    hint: '可填写颜色代码或描述...',
    dependsOn: { key: 'project_type', value: (val: JsonValue | undefined): boolean => val !== '纯前端项目 (静态页面为主，如官网、文档)' } 
  },
  {
    id: 17, // Re-ID
    section: '前端细节',
    text: '品牌色/辅助色 (可选)',
    key: 'brand_accent_colors',
    type: 'text',
    isOptional: true,
    hint: '除了主色调外，还希望使用哪些关键颜色？...',
    dependsOn: { key: 'project_type', value: (val: JsonValue | undefined): boolean => val !== '纯前端项目 (静态页面为主，如官网、文档)' } 
  },
  {
    id: 18, // Re-ID
    section: '前端细节',
    text: '计划使用哪个图标库？',
    key: 'icon_library',
    type: 'select',
    isOptional: false,
    options: ['不确定/暂不使用', 'Heroicons (Tailwind 默认)', 'Font Awesome', 'Material Icons', 'Ant Design Icons', '其他 (请说明)'],
    dependsOn: { key: 'project_type', value: (val: JsonValue | undefined): boolean => val !== '纯前端项目 (静态页面为主，如官网、文档)' } 
  },
  {
    id: 19, // Re-ID
    section: '前端细节',
    text: '首选字体名称 (可选)',
    key: 'preferred_font_name',
    type: 'text',
    isOptional: true,
    dependsOn: { key: 'project_type', value: (val: JsonValue | undefined): boolean => val !== '纯前端项目 (静态页面为主，如官网、文档)' } 
  },
  {
    id: 20, // Re-ID
    section: '前端细节',
    text: '间距/布局系统偏好 (可选)',
    key: 'spacing_layout_preference',
    type: 'select',
    isOptional: true,
    options: ['跟随 UI 库默认', '基于 8pt 网格', '使用 Tailwind 标准间距', '其他'],
    dependsOn: { key: 'project_type', value: (val: JsonValue | undefined): boolean => val !== '纯前端项目 (静态页面为主，如官网、文档)' } 
  },

  // --- E. 基础设施 & 工具 (Infrastructure & Tools) ---
   {
    id: 21, // Re-ID
    section: '基础设施 & 工具',
    text: '是否有其他必须使用的特定库或工具？（可选）',
    key: 'other_libraries',
    type: 'text',
    isOptional: true,
    hint: '例如：状态管理库(适用于含交互的前端/全栈), 图表库等'
    // Applies to all types, but hint adjusted
  }
];

interface Answers {
  [key: string]: JsonValue; // Allow nested values for potential future use
}

// Utility type for JsonValue
type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | { [key: string]: JsonValue } 
  | JsonValue[];

interface TechnicalPlanningFormProps {
  onComplete: (answers: Answers) => void;
}

const TechnicalPlanningForm: React.FC<TechnicalPlanningFormProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>(''); // Input values are strings
  const [otherInputValue, setOtherInputValue] = useState('');

  // Function to check if a question should be displayed based on dependencies
  const shouldDisplayQuestion = (question: Question, currentAnswers: Answers): boolean => {
    if (!question.dependsOn) {
      return true; 
    }
    const dependentAnswer = currentAnswers[question.dependsOn.key];
    
    if (typeof question.dependsOn.value === 'function') {
      // Cast the function to the specific type before calling
      const checkFn = question.dependsOn.value as DependencyCheckFn;
      return checkFn(dependentAnswer, currentAnswers); 
    }
    
    // Simple value comparison
    return dependentAnswer === question.dependsOn.value; 
  };

  // Filter questions based on dependencies using the current answers state
  // We don't need the full 'visibleQuestions' array here anymore for the component logic
  // const visibleQuestions = technicalQuestions.filter(q => shouldDisplayQuestion(q, answers));
  // const interactiveVisibleQuestions = visibleQuestions.filter(q => q.type !== 'info');
  // const totalInteractiveVisibleQuestions = interactiveVisibleQuestions.length; // Removed

  const handleNextQuestion = () => {
    const currentActualQuestion = technicalQuestions[currentQuestionIndex]; 
    let answerToSave: JsonValue = currentAnswer;

    if (currentActualQuestion.type === 'select' && currentAnswer === '其他 (请说明)') {
      answerToSave = `其他: ${otherInputValue}`;
    }
    
    // Use const as suggested by linter
    const initialAnswers = { ...answers }; 
    let updatedAnswers = initialAnswers; // Keep let for potential clean-up modifications
    const shouldSaveAnswer = !currentActualQuestion.isOptional || (currentActualQuestion.isOptional && String(answerToSave).trim() !== '');

    // Clean up potentially obsolete answers...
    technicalQuestions.forEach(q => {
        if (q.dependsOn && q.dependsOn.key === currentActualQuestion.key && !shouldDisplayQuestion(q, { ...initialAnswers, [currentActualQuestion.key]: answerToSave }) && updatedAnswers[q.key] !== undefined) {
            // Create new object without the key
            updatedAnswers = Object.keys(updatedAnswers).reduce((acc, key) => {
                if (key !== q.key) acc[key] = updatedAnswers[key];
                return acc;
            }, {} as Answers);
        }
    });

    // Save the current answer (modify updatedAnswers)
    if (currentActualQuestion.type !== 'info' && shouldSaveAnswer) {
        updatedAnswers = { ...updatedAnswers, [currentActualQuestion.key]: answerToSave };
    } else if (currentActualQuestion.isOptional && String(answerToSave).trim() === '') {
        if (updatedAnswers[currentActualQuestion.key] !== undefined) {
           // Create new object without the key
           updatedAnswers = Object.keys(updatedAnswers).reduce((acc, key) => {
                if (key !== currentActualQuestion.key) acc[key] = updatedAnswers[key];
                return acc;
            }, {} as Answers);
        }
    }
    
    setAnswers(updatedAnswers); 
    setCurrentAnswer('');
    setOtherInputValue('');

    // Find the *next* question to display based on the *updated* answers
    let nextIndex = -1;
    let currentIndexInFullList = currentQuestionIndex;
    while(nextIndex === -1 && currentIndexInFullList < technicalQuestions.length - 1){
        currentIndexInFullList++;
        const nextPotentialQuestion = technicalQuestions[currentIndexInFullList];
        if (shouldDisplayQuestion(nextPotentialQuestion, updatedAnswers) && nextPotentialQuestion.type !== 'info') {
            nextIndex = currentIndexInFullList;
        }
    }
    
    if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
    } else {
        // No more visible interactive questions
        console.log('Technical Planning Form completed:', updatedAnswers); 
        onComplete(updatedAnswers);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setCurrentAnswer(event.target.value);
    if (event.target.type === 'radio' && event.target.value !== '其他 (请说明)') {
        setOtherInputValue('');
    }
  };

  const handleOtherInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInputValue(event.target.value);
  };

  // Render Input function remains largely the same, uses isOptional for placeholder
  const renderInput = (question: Question) => {
      const placeholderText = question.isOptional ? "选填..." : "请在此输入您的回答...";
      if (question.type === 'select' && question.options) {
         return (
          <div className="space-y-2">
            {question.options.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span>{option}</span>
              </label>
            ))}
            {question.options.includes('其他 (请说明)') && currentAnswer === '其他 (请说明)' && (
              <input
                type="text"
                value={otherInputValue}
                onChange={handleOtherInputChange}
                placeholder={placeholderText} 
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
        );
      } else if (question.type === 'text') {
        return (
          <textarea
              id={`question-${question.id}`}
              value={currentAnswer}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={placeholderText}
          />
        );
      } else { 
        return null; 
      }
  };

  // Get the current question object to render
  const currentQuestion = technicalQuestions[currentQuestionIndex]; 
  
  // Recalculate visible questions *here* for progress display, using current 'answers' state
  const currentVisibleInteractiveQuestions = technicalQuestions.filter(q => 
      q.type !== 'info' && shouldDisplayQuestion(q, answers)
  );
  const totalProgressSteps = currentVisibleInteractiveQuestions.length;
  const currentVisibleInteractiveIndex = currentVisibleInteractiveQuestions.findIndex(q => q.id === currentQuestion?.id); 

  const progressText = totalProgressSteps > 0 && currentVisibleInteractiveIndex !== -1 ? 
    `进度: ${currentVisibleInteractiveIndex + 1} / ${totalProgressSteps}` : 
    '技术规划';

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
      <div className="text-sm text-gray-600">
        {progressText}
      </div>

      {/* Render the current question if it exists */}
      {currentQuestion && (
          <div key={currentQuestion.id} className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">{currentQuestion.section}</h3>
            
            <label htmlFor={`question-${currentQuestion.id}`} className="block text-base font-medium text-gray-800">
              {currentQuestion.text}
              {currentQuestion.isOptional && <span className="text-sm font-normal text-gray-500 ml-1">(选填)</span>}
            </label>
            
            {renderInput(currentQuestion)}
            
            {currentQuestion.hint && <p className="text-sm text-gray-500 mt-2">{currentQuestion.hint}</p>}

            <button
              onClick={handleNextQuestion}
              className="w-full py-2 px-4 mt-6 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 disabled:bg-gray-400"
              disabled={!currentQuestion.isOptional && !currentAnswer.trim() && currentQuestion.type !== 'select'}
            >
              {/* Check if there are more visible questions using totalProgressSteps */} 
              {(currentVisibleInteractiveIndex !== -1 && currentVisibleInteractiveIndex < totalProgressSteps - 1) ? '下一个问题' : '完成技术规划'}
            </button>
          </div>
      )}
      {/* Handle case where no questions are visible initially or after selection */}
      {!currentQuestion && totalProgressSteps === 0 && (
           <p>根据您的项目类型选择，没有需要填写的技术规划问题。</p> 
      )}
    </div>
  );
};

export default TechnicalPlanningForm; 