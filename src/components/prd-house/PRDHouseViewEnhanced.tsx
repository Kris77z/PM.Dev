'use client';

import { useState } from 'react';
import { FileText, Sparkles, Copy, Download, ChevronRight, RefreshCw } from 'lucide-react';

// 工作流阶段定义
type WorkflowStage = 'initial' | 'interviewing' | 'generating' | 'generated' | 'verifying' | 'verified';

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
}

interface QuestionCard {
  cardId: number;
  title: string;
  questions: Question[];
  answers?: { [key: string]: string };
}

// --- 模拟 AI 服务 ---
const mockAIService = {
  getInitialQuestions: (): QuestionCard => ({
    cardId: 1,
    title: '第一批问题 - 产品愿景和目的',
    questions: [
      { id: 'q1_problem', text: '这个产品主要解决用户的什么问题或痛点？', placeholder: '例如：用户总是忘记喝水，或者不知道自己喝了多少水...' },
      { id: 'q1_audience', text: '你的目标用户群体是谁？', placeholder: '例如：办公室白领、健身爱好者、需要健康管理的老年人...' },
      { id: 'q1_unique', text: '相比现有产品，你的产品有什么独特之处或竞争优势？', placeholder: '例如：更智能的提醒、与智能水杯联动、更强的社交属性...' },
    ]
  }),
  getNextQuestions: (allCards: QuestionCard[]): QuestionCard | null => {
    const nextCardId = allCards.length + 1;
    if (nextCardId === 2) {
      return {
        cardId: 2,
        title: '第二批问题 - 用户需求和行为',
        questions: [
            { id: 'q2_scenario', text: '用户在什么场景下会使用这个产品？', placeholder: '例如：在办公室工作时、在健身房运动后、在家中休息时...' },
            { id: 'q2_goal', text: '用户使用产品时的主要目标是什么？', placeholder: '例如：快速记录饮水量、查看今天是否达标、与朋友分享成就...' },
            { id: 'q2_alternative', text: '当前的替代方案及其不足？', placeholder: '例如：用备忘录记，但容易忘；用其他App，但功能太复杂...' },
        ]
      };
    }
    if (nextCardId === 3) {
      return {
        cardId: 3,
        title: '第三批问题 - 核心功能需求',
        questions: [
            { id: 'q3_must_have', text: '首个版本中，哪些功能是绝对必需的？', placeholder: '例如：饮水记录、每日目标设定、定时提醒...' },
            { id: 'q3_should_have', text: '哪些功能是重要但可以在后续版本添加的？', placeholder: '例如：历史数据图表、成就系统、好友排行榜...' },
            { id: 'q3_constraints', text: '有什么特殊的技术要求或限制吗？', placeholder: '例如：必须支持iOS和Android、需要离线使用、数据需加密...' },
        ]
      };
    }
    // No more questions
    return null;
  }
};

export default function PRDHouseViewEnhanced() {
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('initial');
  const [questionCards, setQuestionCards] = useState<QuestionCard[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: string]: string }>({});
  
  const [prdContent, setPrdContent] = useState<string>('');
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialIdea, setInitialIdea] = useState<string>('');

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
      
      setIsLoading(false);
    }, 500);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setCurrentAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const submitAnswers = () => {
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
      } else {
        // No more questions, just save the last answers
        setQuestionCards(updatedCards);
        // Maybe change stage to 'readyToGenerate'
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const isCurrentCardAnswered = () => {
      const currentCard = questionCards[questionCards.length - 1];
      if (!currentCard) return false;
      return currentCard.questions.every(q => (currentAnswers[q.id] || '').trim() !== '');
  }

  // 生成PRD
  const generatePRD = () => {
    console.log("Generating PRD with data:", questionCards);
    setIsLoading(true);
    setWorkflowStage('generating');

    // 模拟PRD生成过程
    setTimeout(() => {
      const mockPRD = `# 产品需求文档：${initialIdea}

## 概述
基于我们的访谈，本产品旨在为目标用户提供创新的解决方案...

## 目标和目的
- **主要目标**: 解决用户的核心痛点
- **次要目标**: 提升用户体验和效率
- **业务目标**: 实现可持续的用户增长

## 范围
### 包含内容
- 核心功能模块
- 用户界面设计
- 基础数据管理

### 不包含内容（此版本）
- 高级分析功能
- 第三方集成
- 企业级功能

## 目标用户
**主要用户群体**: 基于访谈确定的目标用户
- 年龄: [从访谈中获取]
- 职业: [从访谈中获取] 
- 使用场景: [从访谈中获取]

## 功能需求

### 高优先级功能 (Must-Have)
1. **功能1**: 核心业务逻辑
2. **功能2**: 用户登录和管理
3. **功能3**: 基础数据操作

### 中优先级功能 (Should-Have)  
1. **功能4**: 增强用户体验
2. **功能5**: 数据可视化

### 低优先级功能 (Could-Have)
1. **功能6**: 附加特性
2. **功能7**: 优化功能

## 非功能性需求
- **性能**: 页面加载时间 < 2秒
- **安全**: 数据加密和用户隐私保护
- **可用性**: 支持多设备访问
- **可扩展性**: 支持未来功能扩展

## 用户旅程
1. **发现阶段**: 用户了解产品
2. **注册阶段**: 用户创建账户
3. **使用阶段**: 用户完成核心任务
4. **留存阶段**: 用户持续使用

## 成功指标
- **用户获取**: 月活跃用户数
- **用户参与**: 日使用频次
- **用户满意**: 用户评分和反馈
- **业务价值**: 转化率和收入

## 时间表
- **第1阶段**: 核心功能开发 (4-6周)
- **第2阶段**: 用户界面优化 (2-3周)
- **第3阶段**: 测试和部署 (2周)

## 开放问题/假设
- 需要进一步验证的用户需求
- 技术实现的可行性评估
- 市场竞争分析

---
*此PRD基于AI访谈生成，建议根据实际情况进行调整和完善。*`;

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

## AI 审查与改进建议

### 发现的问题
1. **需求模糊性**: 某些功能描述过于抽象，需要更具体的实现细节
2. **用户故事缺失**: 缺少标准的"As a [user type], I want [goal] so that [benefit]"格式的用户故事
3. **验收标准不明确**: 功能需求缺少明确的验收标准和测试用例

### 改进建议
1. **添加详细用户故事**:
   - As a 新用户, I want 快速了解产品价值 so that 我可以决定是否继续使用
   - As a 活跃用户, I want 高效完成核心任务 so that 我可以节省时间

2. **明确技术架构**:
   - 前端框架选择 (React/Vue/Angular)
   - 后端技术栈
   - 数据库设计方案
   - API设计规范

3. **增强质量保证**:
   - 单元测试覆盖率 ≥ 80%
   - 集成测试策略
   - 用户体验测试计划

### 质量评分
- **完整性**: ${qualityScore?.completeness}/10 - 包含了主要PRD部分，但某些细节需要补充
- **清晰度**: ${qualityScore?.clarity}/10 - 整体结构清晰，但部分描述需要更具体
- **可行性**: ${qualityScore?.feasibility}/10 - 技术实现合理，时间安排现实
- **用户关注**: ${qualityScore?.userFocus}/10 - 很好地关注了用户需求和体验

**总体评分**: ${qualityScore?.overall}/10

### 下一步建议
1. 与技术团队讨论架构设计
2. 进行用户调研验证假设
3. 制定详细的开发计划
4. 建立项目管理和追踪机制`;

      setPrdContent(improvedPRD);
      setWorkflowStage('verified');
      setIsLoading(false);
    }, 4000);
  };

  // 复制PRD内容
  const copyPRD = () => {
    console.log("Copying PRD");
    navigator.clipboard.writeText(prdContent);
    // 这里可以添加toast提示
  };

  // 下载PRD文件
  const downloadPRD = () => {
    console.log("Downloading PRD");
    const blob = new Blob([prdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD-${initialIdea.slice(0, 20)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 重新开始
  const restart = () => {
    setWorkflowStage('initial');
    setQuestionCards([]);
    setCurrentAnswers({});
    setPrdContent('');
    setQualityScore(null);
    setInitialIdea('');
    setIsLoading(false);
  };

  const renderCurrentCard = () => {
    if (workflowStage !== 'interviewing' || questionCards.length === 0) return null;
    const currentCard = questionCards[questionCards.length - 1];

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{currentCard.title}</h3>
            <div className="space-y-6">
                {currentCard.questions.map(q => (
                    <div key={q.id}>
                        <label htmlFor={q.id} className="block text-sm font-medium text-gray-700 mb-1">{q.text}</label>
                        <textarea
                            id={q.id}
                            value={currentAnswers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder}
                            className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                ))}
            </div>
             <button
                onClick={submitAnswers}
                disabled={!isCurrentCardAnswered() || isLoading}
                className="w-full mt-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? '处理中...' : '提交本轮回答'}
                <ChevronRight className="h-5 w-5"/>
              </button>
        </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-gray-50 text-black">
      {/* Left Panel: Dynamic Form */}
      <div className="flex flex-col w-1/2 border-r border-gray-200 p-6 bg-slate-50 overflow-y-auto">
        {workflowStage === 'initial' ? (
          <div className="m-auto w-full max-w-md">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">AI 产品访谈</h2>
                <p className="text-gray-600 mb-6">
                用一两句话描述你的产品想法，AI将通过结构化表单，引导你完成专业的PRD。
                </p>
            </div>
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <label className="block text-sm font-medium text-gray-700">你的产品想法</label>
                <textarea
                  value={initialIdea}
                  onChange={(e) => setInitialIdea(e.target.value)}
                  placeholder="例如：我想做一个帮助用户记录每日饮水量的App"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={startInterview}
                  disabled={!initialIdea.trim() || isLoading}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
                >
                  {isLoading ? '启动中...' : '开始 AI 访谈'}
                </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">访谈进行中...</h2>
                <button
                  onClick={restart}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="重新开始"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>

            {questionCards.map((card, index) => (
              <div key={card.cardId} className={`p-4 rounded-lg border ${index === questionCards.length - 1 ? 'border-blue-500 bg-white' : 'bg-gray-100 border-gray-200'}`}>
                <h3 className="font-semibold text-gray-700">{card.title}</h3>
                {index < questionCards.length - 1 && (
                  <p className="text-sm text-gray-500 mt-1">已完成</p>
                )}
              </div>
            ))}
            
            <div className="mt-4">
                {renderCurrentCard()}
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
                质量评分: {qualityScore.overall}/10
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={generatePRD}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:bg-gray-400"
              disabled={isLoading || workflowStage === 'initial' || questionCards.length < 3}
            >
              <FileText className="h-5 w-5" />
              {isLoading && workflowStage === 'generating' ? '生成中...' : '生成 PRD'}
            </button>
            
            <button
              onClick={verifyPRD}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 disabled:bg-gray-400"
              disabled={isLoading || workflowStage !== 'generated'}
            >
              <Sparkles className="h-5 w-5" />
              {isLoading && workflowStage === 'verifying' ? '审查中...' : 'AI 审查'}
            </button>

            {prdContent && (
              <>
                <button
                  onClick={copyPRD}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                >
                  <Copy className="h-5 w-5" />
                  复制
                </button>
                <button
                  onClick={downloadPRD}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
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
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">完成左侧访谈后，点击 &quot;生成 PRD&quot; 创建文档</p>
                <p className="text-sm mt-2">基于 cursor-ai-prd-workflow 设计理念</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 