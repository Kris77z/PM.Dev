'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Copy, Download, ChevronRight, RefreshCw, CheckCircle } from 'lucide-react';
import { Typewriter } from '@/components/ui/typewriter';
import { Stepper, StepperItem, StepperIndicator, StepperSeparator, StepperTrigger } from '@/components/ui/stepper';


// 工作流阶段定义
type WorkflowStage = 'welcome' | 'initial' | 'interviewing' | 'generating' | 'generated' | 'verifying' | 'verified';

// PRD 质量评分
interface QualityScore {
  completeness: number;
  clarity: number;
  feasibility: number;
  userFocus: number;
  overall: number;
}

interface Question {
  id: string;
  text: string;
  placeholder: string;
  hint?: string;
  isOptional?: boolean;
}

interface QuestionCard {
  cardId: number;
  title: string;
  description: string;
  questions: Question[];
  answers?: { [key: string]: string };
}

// --- 模拟 AI 服务 ---
const mockAIService = {
  getInitialQuestions: (): QuestionCard => ({
    cardId: 1,
    title: '产品愿景和目的',
    description: '让我们先了解您产品的核心理念和价值主张',
    questions: [
      { 
        id: 'q1_problem', 
        text: '这个产品主要解决用户的什么问题或痛点？', 
        placeholder: '例如：用户总是忘记喝水，或者不知道自己喝了多少水...',
        hint: '请尽量具体描述用户目前遇到的困难和不便之处'
      },
      { 
        id: 'q1_audience', 
        text: '你的目标用户群体是谁？', 
        placeholder: '例如：办公室白领、健身爱好者、需要健康管理的老年人...',
        hint: '可以从年龄、职业、生活习惯等维度来描述'
      },
      { 
        id: 'q1_unique', 
        text: '相比现有产品，你的产品有什么独特之处或竞争优势？', 
        placeholder: '例如：更智能的提醒、与智能水杯联动、更强的社交属性...' 
      },
    ]
  }),
  
  getNextQuestions: (allCards: QuestionCard[]): QuestionCard | null => {
    const nextCardId = allCards.length + 1;
    
    if (nextCardId === 2) {
      return {
        cardId: 2,
        title: '用户需求和行为',
        description: '深入了解用户的使用场景和行为模式',
        questions: [
          { 
            id: 'q2_scenario', 
            text: '用户在什么场景下会使用这个产品？', 
            placeholder: '例如：在办公室工作时、在健身房运动后、在家中休息时...',
            hint: '请描述用户的典型使用环境和时间节点'
          },
          { 
            id: 'q2_goal', 
            text: '用户使用产品时的主要目标是什么？', 
            placeholder: '例如：快速记录饮水量、查看今天是否达标、与朋友分享成就...' 
          },
          { 
            id: 'q2_alternative', 
            text: '用户当前是如何解决这个问题的？现有方案有什么不足？', 
            placeholder: '例如：用备忘录记录，但容易忘记；用其他App，但功能太复杂...' 
          },
        ]
      };
    }
    
    if (nextCardId === 3) {
      return {
        cardId: 3,
        title: '核心功能需求',
        description: '明确产品的功能范围和实现优先级',
        questions: [
          { 
            id: 'q3_must_have', 
            text: '首个版本中，哪些功能是绝对必需的？', 
            placeholder: '例如：饮水记录、每日目标设定、定时提醒...',
            hint: '请按优先级排序，专注于核心价值功能'
          },
          { 
            id: 'q3_should_have', 
            text: '哪些功能是重要但可以在后续版本添加的？', 
            placeholder: '例如：历史数据图表、成就系统、好友排行榜...',
            isOptional: true
          },
          { 
            id: 'q3_constraints', 
            text: '有什么特殊的技术要求或限制吗？', 
            placeholder: '例如：必须支持iOS和Android、需要离线使用、数据需加密...',
            isOptional: true,
            hint: '包括平台要求、性能要求、安全要求等'
          },
        ]
      };
    }
    
    // No more questions
    return null;
  }
};

export default function PRDHouseViewV3() {
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('welcome');
  const [questionCards, setQuestionCards] = useState<QuestionCard[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [prdContent, setPrdContent] = useState<string>('');
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialIdea, setInitialIdea] = useState<string>('');
  
  // Typewriter 动画控制
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeAnimationComplete, setWelcomeAnimationComplete] = useState(false);

  // Typewriter 动画文本
  const welcomeTexts = [
    "你好！我是你的专属产品顾问 🌟",
    "我将引导你完成一份专业的 PRD 文档",
    "让我们从你的产品想法开始吧..."
  ];

  // 监听 typewriter 动画完成
  useEffect(() => {
    if (workflowStage === 'welcome') {
      const timer = setTimeout(() => {
        setWelcomeAnimationComplete(true);
      }, welcomeTexts.join('').length * 80 + welcomeTexts.length * 1500 + 2000); // 估算动画完成时间
      
      return () => clearTimeout(timer);
    }
  }, [workflowStage, welcomeTexts]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setWorkflowStage('initial');
  };

  const startInterview = () => {
    if (!initialIdea.trim()) return;
    
    setIsLoading(true);
    setWorkflowStage('interviewing');

    setTimeout(() => {
      const firstCard = mockAIService.getInitialQuestions();
      setQuestionCards([firstCard]);
      
      // Initialize answers state for the first card
      const initialAnswers: { [key: string]: string } = {};
      firstCard.questions.forEach(q => initialAnswers[q.id] = '');
      setCurrentAnswers(initialAnswers);
      setCurrentQuestionIndex(0);
      
      setIsLoading(false);
    }, 800);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setCurrentAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextStep = () => {
    const currentCard = questionCards[questionCards.length - 1];
    
    if (currentQuestionIndex < currentCard.questions.length - 1) {
      // 还有下一个问题
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // 当前卡片完成，提交答案并获取下一批问题
      submitCurrentCard();
    }
  };

  const handlePreviousStep = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitCurrentCard = () => {
    setIsLoading(true);

    // 1. Save current answers to the latest card
    const updatedCards = [...questionCards];
    const lastCardIndex = updatedCards.length - 1;
    updatedCards[lastCardIndex] = { ...updatedCards[lastCardIndex], answers: currentAnswers };

    // 2. Simulate getting next questions
    setTimeout(() => {
      const nextCard = mockAIService.getNextQuestions(updatedCards);
      
      if (nextCard) {
        setQuestionCards([...updatedCards, nextCard]);
        const nextInitialAnswers: { [key: string]: string } = {};
        nextCard.questions.forEach(q => nextInitialAnswers[q.id] = '');
        setCurrentAnswers(nextInitialAnswers);
        setCurrentQuestionIndex(0);
      } else {
        // No more questions, just save the last answers
        setQuestionCards(updatedCards);
        // Ready to generate PRD
      }
      setIsLoading(false);
    }, 1200);
  };
  
  const getCurrentQuestion = () => {
    const currentCard = questionCards[questionCards.length - 1];
    if (!currentCard) return null;
    return currentCard.questions[currentQuestionIndex];
  };

  const isCurrentQuestionAnswered = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return false;
    
    const answer = currentAnswers[currentQuestion.id] || '';
    return currentQuestion.isOptional || answer.trim() !== '';
  };

  const canGeneratePRD = () => {
    return questionCards.length >= 3 && !mockAIService.getNextQuestions(questionCards);
  };

  // 生成PRD
  const generatePRD = () => {
    console.log("Generating PRD with data:", questionCards);
    setIsLoading(true);
    setWorkflowStage('generating');

    // 模拟PRD生成过程
    setTimeout(() => {
      const mockPRD = `# 产品需求文档：${initialIdea}

## 1. 项目概述

### 1.1 产品愿景
${questionCards[0]?.answers?.q1_problem || '待完善的产品愿景描述'}

### 1.2 目标用户
${questionCards[0]?.answers?.q1_audience || '待完善的目标用户描述'}

### 1.3 竞争优势
${questionCards[0]?.answers?.q1_unique || '待完善的竞争优势描述'}

## 2. 用户需求分析

### 2.1 使用场景
${questionCards[1]?.answers?.q2_scenario || '待完善的使用场景描述'}

### 2.2 用户目标
${questionCards[1]?.answers?.q2_goal || '待完善的用户目标描述'}

### 2.3 现有解决方案及痛点
${questionCards[1]?.answers?.q2_alternative || '待完善的现有方案分析'}

## 3. 功能需求

### 3.1 核心功能（必需）
${questionCards[2]?.answers?.q3_must_have || '待完善的核心功能描述'}

### 3.2 重要功能（后续版本）
${questionCards[2]?.answers?.q3_should_have || '暂未定义重要功能'}

### 3.3 技术约束
${questionCards[2]?.answers?.q3_constraints || '暂无特殊技术约束'}

---

*本PRD基于AI访谈自动生成，建议根据实际业务需求进行调整和完善。*`;

      setPrdContent(mockPRD);
      setWorkflowStage('generated');
      setIsLoading(false);
    }, 3000);
  };

  // 验证和改进PRD
  const verifyPRD = () => {
    console.log("Verifying PRD");
    setIsLoading(true);
    setWorkflowStage('verifying');

    setTimeout(() => {
      // 模拟质量评分
      setQualityScore({
        completeness: 8.5,
        clarity: 7.8,
        feasibility: 8.2,
        userFocus: 9.1,
        overall: 8.4
      });

      const improvedPRD = prdContent + `

---

## 🤖 AI 审查与优化建议

### 📊 质量评分报告
- **完整性**: 8.5/10 - 包含了PRD的核心部分，但某些细节需要补充
- **清晰度**: 7.8/10 - 整体结构清晰，部分描述需要更加具体
- **可行性**: 8.2/10 - 技术实现方案合理，时间安排现实
- **用户关注**: 9.1/10 - 很好地关注了用户需求和体验
- **总体评分**: 8.4/10

### 💡 改进建议

1. **增强需求描述**
   - 为每个功能添加详细的验收标准
   - 使用用户故事和场景描述来明确需求

2. **完善技术架构**
   - 详细的API接口设计文档
   - 数据库设计和ER图

3. **强化用户体验**
   - 添加用户journey map
   - 界面原型和交互规范

*AI建议：建议将此PRD作为基础版本，后续通过与团队协作不断迭代优化。*`;

      setPrdContent(improvedPRD);
      setWorkflowStage('verified');
      setIsLoading(false);
    }, 4000);
  };

  // 复制PRD内容
  const copyPRD = () => {
    navigator.clipboard.writeText(prdContent).then(() => {
      console.log('PRD copied to clipboard');
    });
  };

  // 下载PRD文件
  const downloadPRD = () => {
    const blob = new Blob([prdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD-${initialIdea.slice(0, 20).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 重新开始
  const restart = () => {
    setWorkflowStage('welcome');
    setQuestionCards([]);
    setCurrentAnswers({});
    setCurrentQuestionIndex(0);
    setPrdContent('');
    setQualityScore(null);
    setInitialIdea('');
    setIsLoading(false);
    setShowWelcome(true);
    setWelcomeAnimationComplete(false);
  };

  // 渲染当前问题表单
  const renderCurrentQuestion = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;

    const currentCard = questionCards[questionCards.length - 1];
    const totalQuestions = currentCard.questions.length;

    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Progress Stepper */}
        <div className="space-y-3">
          <Stepper value={currentQuestionIndex + 1} className="w-full">
            {currentCard.questions.map((question, index) => (
              <StepperItem key={question.id} step={index + 1} className="flex-1">
                <StepperTrigger 
                  className="w-full flex-col items-start gap-2"
                  asChild 
                  disabled={index > currentQuestionIndex}
                >
                  <StepperIndicator 
                    asChild 
                    className="h-2 w-full rounded-none bg-gray-200 data-[state=completed]:bg-orange-500 data-[state=active]:bg-orange-500"
                  >
                    <span className="sr-only">{index + 1}</span>
                  </StepperIndicator>
                </StepperTrigger>
                {index < totalQuestions - 1 && <StepperSeparator className="data-[state=completed]:bg-orange-500"/>}
              </StepperItem>
            ))}
          </Stepper>
          <div className="text-sm font-medium tabular-nums text-muted-foreground text-center">
            步骤 {currentQuestionIndex + 1} / {totalQuestions}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{currentCard.title}</h3>
            <p className="text-sm text-gray-600">{currentCard.description}</p>
          </div>
          
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-700">
              {currentQuestion.text}
              {currentQuestion.isOptional && <span className="text-sm font-normal text-gray-500 ml-1">(选填)</span>}
            </label>
            
            <textarea
              value={currentAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={isLoading}
            />
            
            {currentQuestion.hint && (
              <p className="text-sm text-gray-500">{currentQuestion.hint}</p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex space-x-4 mt-6">
            {currentQuestionIndex > 0 && (
              <button
                onClick={handlePreviousStep}
                type="button"
                className="py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                disabled={isLoading}
              >
                上一步
              </button>
            )}
            
            <button
              onClick={handleNextStep}
              type="button"
              className="flex-grow py-2 px-4 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={!isCurrentQuestionAnswered() || isLoading}
            >
              {currentQuestionIndex < totalQuestions - 1 ? '下一个' : (isLoading ? '提交中...' : '提交本轮回答')}
              <ChevronRight className="h-5 w-5"/>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-gray-50 text-black">
      {/* Left Panel: Welcome / Form / Progress */}
      <div className="flex flex-col w-1/2 border-r border-gray-200 p-6 bg-slate-50 overflow-y-auto">
        
        {/* Welcome Stage with Typewriter */}
        {workflowStage === 'welcome' && showWelcome && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center space-y-8 max-w-md">
              <div className="text-2xl text-gray-800 min-h-[3rem] flex items-center justify-center">
                <Typewriter
                  text={welcomeTexts}
                  speed={80}
                  waitTime={1500}
                  deleteSpeed={50}
                  loop={false}
                  className="text-center"
                  showCursor={true}
                  cursorChar="✨"
                />
              </div>
              
              {welcomeAnimationComplete && (
                <div className="animate-fade-in opacity-100">
                  <button
                    onClick={handleWelcomeComplete}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-md transition-all duration-200"
                  >
                    开始产品规划 🚀
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Initial Idea Input */}
        {workflowStage === 'initial' && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">描述你的产品想法</h2>
                <p className="text-gray-600 mb-6">
                  用一两句话简单描述你想要做的产品，AI 将引导你完成专业的 PRD 文档。
                </p>
              </div>
              
              <div className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <label className="block text-sm font-medium text-gray-700">产品想法</label>
                <textarea
                  value={initialIdea}
                  onChange={(e) => setInitialIdea(e.target.value)}
                  placeholder="例如：我想做一个帮助用户养成健康饮水习惯的移动应用..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={isLoading}
                />
                <button
                  onClick={startInterview}
                  disabled={!initialIdea.trim() || isLoading}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-medium transition-colors duration-200"
                >
                  {isLoading ? '启动访谈中...' : '开始 AI 产品访谈'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interview Stage */}
        {workflowStage === 'interviewing' && (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">产品访谈进行中</h2>
                <p className="text-sm text-gray-600 mt-1">
                  已完成 {questionCards.length - 1}/3 个主题，当前：{questionCards[questionCards.length - 1]?.title}
                </p>
              </div>
              <button
                onClick={restart}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="重新开始"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Overview */}
            <div className="space-y-3">
              {questionCards.map((card, index) => (
                <div 
                  key={card.cardId} 
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    index === questionCards.length - 1 
                      ? 'border-orange-500 bg-orange-50 shadow-sm' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-700">{card.title}</h3>
                      <p className="text-sm text-gray-500">{card.description}</p>
                    </div>
                    {index < questionCards.length - 1 && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Current Question Form */}
            <div className="mt-6">
              {renderCurrentQuestion()}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: PRD Document */}
      <div className="flex flex-col w-1/2">
        <div className="p-6 flex items-center justify-between border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">产品需求文档 (PRD)</h2>
            {qualityScore && (
              <div className="text-sm text-gray-600 mt-1">
                AI 质量评分: <span className="font-semibold text-orange-600">{qualityScore.overall}/10</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={generatePRD}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:bg-gray-400 transition-colors duration-200"
              disabled={isLoading || !canGeneratePRD()}
            >
              <FileText className="h-5 w-5" />
              {isLoading && workflowStage === 'generating' ? '生成中...' : '生成 PRD'}
            </button>
            
            <button
              onClick={verifyPRD}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 disabled:bg-gray-400 transition-colors duration-200"
              disabled={isLoading || workflowStage !== 'generated'}
            >
              <Sparkles className="h-5 w-5" />
              {isLoading && workflowStage === 'verifying' ? '审查中...' : 'AI 深度审查'}
            </button>

            {prdContent && (
              <>
                <button
                  onClick={copyPRD}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors duration-200"
                >
                  <Copy className="h-5 w-5" />
                  复制
                </button>
                <button
                  onClick={downloadPRD}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2 transition-colors duration-200"
                >
                  <Download className="h-5 w-5" />
                  下载
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          {prdContent ? (
            <article className="prose lg:prose-lg max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{prdContent}</pre>
            </article>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 mx-auto text-gray-300" />
                <div>
                  <p className="text-lg font-medium">PRD 文档将在这里生成</p>
                                     <p className="text-sm mt-2">完成左侧的产品访谈后，点击 &quot;生成 PRD&quot; 创建专业文档</p>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                  ✨ 基于 cursor-ai-prd-workflow 设计理念
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out 1s forwards;
        }
      `}</style>
    </div>
  );
} 