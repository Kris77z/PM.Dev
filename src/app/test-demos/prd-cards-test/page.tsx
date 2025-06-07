'use client';

import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Expandable, 
  ExpandableCard, 
  ExpandableCardHeader, 
  ExpandableCardContent, 
  ExpandableContent, 
  ExpandableTrigger,
  ExpandableCardFooter
} from '@/components/ui/expandable';

// 定义数据结构
interface PrdQuestion {
  id: string;
  text: string;
  placeholder?: string;
  hint?: string;
  isOptional?: boolean;
  type?: 'text' | 'select' | 'input';
  options?: string[];
  gridColumn?: string;
  isRequired?: boolean;
  hasAI?: boolean;
  aiPrompt?: string;
  isAIGenerated?: boolean;
}

interface PrdChapter {
  id: string;
  title: string;
  description: string;
  questions: PrdQuestion[];
}

// 完整的PRD模板
const prdChapters: PrdChapter[] = [
  // 1. 需求介绍 - 完全按照requirement-intro-pilot设计
  {
    id: 'c1',
    title: '需求介绍',
    description: '明确本次迭代的基本信息和历史背景。',
    questions: [
      { 
        id: 'c1_business_line', 
        text: '所属业务线', 
        placeholder: '', 
        type: 'select',
        options: ['AiCoin PC', 'AiCoin APP', 'AiCoin Web'],
        gridColumn: 'col-span-2',
        isRequired: true
      },
      { 
        id: 'c1_pm', 
        text: '需求负责人', 
        placeholder: '@张三', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_frontend', 
        text: '前端', 
        placeholder: '@李四', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_backend', 
        text: '后端', 
        placeholder: '@王五', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_data', 
        text: '数据', 
        placeholder: '@赵六', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_testing', 
        text: '测试', 
        placeholder: '@孙七', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_design', 
        text: '设计', 
        placeholder: '@周八', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_brief_description', 
        text: '需求核心描述', 
        placeholder: '用一句话描述本次迭代的核心目标，例如：为解决新用户注册流程复杂的问题，上线手机号一键登录功能', 
        type: 'input',
        gridColumn: 'col-span-2',
        isRequired: true,
        hasAI: true,
        aiPrompt: '基于这个核心描述，生成完整的需求介绍'
      },
      { 
        id: 'c1_change_records', 
        text: '变更记录', 
        placeholder: '版本：0.1\n修订人：@xxx\n修订内容：\n修订原因：\n日期：',
        gridColumn: 'col-span-2'
      }
    ]
  },
  
  // 2. 需求分析 - 目标设定（全部textarea）
  {
    id: 'c2',
    title: '需求分析',
    description: '深入探究需求的背景、用户价值和目标。',
    questions: [
      { 
        id: 'c2_goal_brief', 
        text: '核心目标描述', 
        placeholder: '例如：提升新用户使用成功率，减少操作复杂度', 
        type: 'input',
        gridColumn: 'col-span-2',
        isRequired: true,
        hasAI: true,
        aiPrompt: '基于这个核心目标，生成详细的主要目标、次要目标和可量化指标'
      },
      { 
        id: 'c2_goal_primary', 
        text: '主要目标', 
        placeholder: '例如：提升新用户首次使用成功率至80%，改善关键流程的用户体验，减少用户在核心功能上的困惑和阻碍...', 
        gridColumn: 'col-span-2',
        isAIGenerated: true
      },
      { 
        id: 'c2_goal_secondary', 
        text: '次要目标', 
        placeholder: '例如：降低用户操作步骤从5步减少到3步，优化界面布局提升视觉效果，增强功能的可发现性...', 
        gridColumn: 'col-span-2',
        isAIGenerated: true
      },
      { 
        id: 'c2_goal_metrics', 
        text: '可量化指标', 
        placeholder: '例如：提升功能使用率15%，降低客服咨询量20%，新用户完成率从60%提升到80%，用户满意度达到90%...', 
        gridColumn: 'col-span-2',
        isAIGenerated: true
      }
    ]
  },
  
  // 3. 竞品分析 - SWOT（全部textarea）
  {
    id: 'c3',
    title: '竞品分析',
    description: '分析市场上的竞争者，借鉴其优缺点。',
    questions: [
      { 
        id: 'c3_swot_brief', 
        text: '分析背景', 
        placeholder: '例如：在即时通讯领域，我们需要分析自身相对竞品的优劣势', 
        type: 'input',
        gridColumn: 'col-span-2',
        isRequired: true,
        hasAI: true,
        aiPrompt: '基于这个分析背景，生成详细的SWOT分析内容'
      },
      { 
        id: 'c3_our_strength', 
        text: '我们的优势(S)', 
        placeholder: '例如：技术领先、用户基础大、品牌知名度高、产品稳定性强、团队经验丰富、资源充足...', 
        gridColumn: 'col-span-2',
        isAIGenerated: true
      },
      { 
        id: 'c3_our_weakness', 
        text: '我们的劣势(W)', 
        placeholder: '例如：功能相对简单、缺乏差异化特性、市场推广不足、用户教育成本高...', 
        gridColumn: 'col-span-2',
        isAIGenerated: true
      },
      { 
        id: 'c3_opportunities', 
        text: '市场机会(O)', 
        placeholder: '例如：用户对隐私保护需求增加、新兴市场待开发、技术升级带来新可能、行业标准变化...', 
        gridColumn: 'col-span-2',
        isAIGenerated: true
      },
      { 
        id: 'c3_threats', 
        text: '潜在威胁(T)', 
        placeholder: '例如：竞品快速迭代、新入局者技术颠覆、用户需求快速变化、市场竞争加剧、政策法规变化...', 
        gridColumn: 'col-span-2',
        isAIGenerated: true
      },
      { 
        id: 'c3_improvement_suggestions', 
        text: '改进建议', 
        placeholder: '基于以上分析，提出我们产品的具体优化建议和差异化机会，包括短期改进计划和长期发展策略...',
        gridColumn: 'col-span-2',
        isAIGenerated: true
      }
    ]
  },
  
  // 4. 需求方案 - 拆分需求概览
  {
    id: 'c4',
    title: '需求方案',
    description: '具体描述为实现需求所设计的功能和逻辑。',
    questions: [
      { 
        id: 'c4_priority_standard', 
        text: '优先级标准', 
        placeholder: '设立优先级标准：High（紧急）、Middle（一般）、Low（灵活）', 
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_feature_list', 
        text: '功能点/流程', 
        placeholder: '列出核心功能点和业务流程，说明各功能模块的作用和价值...', 
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_business_logic', 
        text: '业务逻辑/规则说明', 
        placeholder: '详细描述业务规则、数据校验要求、特殊状态处理等...', 
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_figma_link', 
        text: 'Figma原型链接', 
        placeholder: 'https://figma.com/file/...', 
        type: 'input',
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_prototype_desc', 
        text: '原型说明', 
        placeholder: '简要描述界面流程和关键交互，或贴入关键界面截图说明',
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_acceptance', 
        text: '验收情况', 
        placeholder: '根据当前需求必须完成的功能和用户体验方面的验收要求\n\n等级验收进度说明：\n必过 | 核心业务流程 | 具体验收标准 | 验收方法/工具 | 验收责任通过\n基线 | 基础功能可用性 | 具体标准 | 方法 | 责任人\n优化 | 体验增项 | 具体标准 | 方法 | 责任人',
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_open_issues', 
        text: '开放问题/待定决策', 
        placeholder: '用于记录讨论中尚未明确，需要后续跟进或已做出但需要记录的重要决策点',
        gridColumn: 'col-span-2'
      }
    ]
  },
  
  // 5. 其余事项 - 优化布局
  {
    id: 'c5',
    title: '其余事项',
    description: '相关文档和迭代历史记录。',
    questions: [
      { 
        id: 'c5_competitor_report', 
        text: '竞品清单链接', 
        placeholder: 'https://docs.google.com/spreadsheets/...', 
        type: 'input',
        gridColumn: 'col-span-1',
        isOptional: true 
      },
      { 
        id: 'c5_data_report', 
        text: '数据分析报告链接', 
        placeholder: 'https://analytics.example.com/...', 
        type: 'input',
        gridColumn: 'col-span-1',
        isOptional: true 
      },
      { 
        id: 'c5_user_research', 
        text: '用户调研报告链接', 
        placeholder: 'https://user-research.example.com/...', 
        type: 'input',
        gridColumn: 'col-span-1',
        isOptional: true 
      },
      { 
        id: 'c5_other_report', 
        text: '其他报告链接', 
        placeholder: 'https://other-reports.example.com/...', 
        type: 'input',
        gridColumn: 'col-span-1',
        isOptional: true 
      },
      { 
        id: 'c5_other_docs', 
        text: '其他相关文档', 
        placeholder: 'https://other-docs.example.com/...',
        type: 'input',
        gridColumn: 'col-span-2',
        isOptional: true 
      },
      { 
        id: 'c5_history', 
        text: '功能迭代历史', 
        placeholder: '版本号 | 需求文档 | 主要变更/优化内容 | 负责PM | 日期\nV1.0 | | 首次上线核心网格交易功能 | | 2025.04.21\n...',
        gridColumn: 'col-span-2'
      }
    ]
  }
];

export default function PRDCardsTestPage() {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  // 模拟AI生成功能
  const generateAIContent = async (question: PrdQuestion) => {
    if (!formData[question.id]?.trim()) {
      alert('请先填写核心描述');
      return;
    }

    setIsGenerating(prev => ({ ...prev, [question.id]: true }));
    
    // 模拟AI调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟AI生成内容
    if (question.id === 'c2_goal_brief') {
      setFormData(prev => ({
        ...prev,
        'c2_goal_primary': `提升${formData[question.id]}中的核心指标至80%`,
        'c2_goal_secondary': `优化${formData[question.id]}的操作流程`,
        'c2_goal_metrics': `基于${formData[question.id]}，实现用户满意度提升15%，使用时长增加20%`
      }));
    } else if (question.id === 'c3_swot_brief') {
      setFormData(prev => ({
        ...prev,
        'c3_our_strength': `相比竞品，我们的优势：技术创新能力强、用户基础稳固、产品稳定性高`,
        'c3_our_weakness': `相对劣势：功能丰富度有待提升、用户学习成本较高`,
        'c3_opportunities': `市场机会：${formData[question.id]}背景下的差异化空间、新兴需求的突破口`,
        'c3_threats': `潜在威胁：竞品快速迭代、新技术颠覆风险、市场竞争加剧`,
        'c3_improvement_suggestions': `基于以上分析，提出我们产品的具体优化建议和差异化机会，包括短期改进计划和长期发展策略...`
      }));
    }
    
    setIsGenerating(prev => ({ ...prev, [question.id]: false }));
  };

  const renderQuestionInput = (question: PrdQuestion) => {
    if (question.type === 'select') {
      return (
        <div>
          <Label className="block text-md font-medium text-gray-700 mb-3">
            {question.text} {question.isRequired && <span className="text-red-500">*</span>}
          </Label>
          <div className="flex flex-wrap gap-6">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <Checkbox 
                  id={`${question.id}-${option}`}
                  checked={formData[question.id] === option}
                  onCheckedChange={() => handleAnswerChange(question.id, option)}
                  className="border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <span className="text-base">{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (question.type === 'input') {
      return (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-md font-medium text-gray-700">
              {question.text} 
              {question.isRequired && <span className="text-red-500">*</span>}
              {question.isOptional && <span className="text-gray-400">(可选)</span>}
            </Label>
            {question.hasAI && (
              <Button
                onClick={() => generateAIContent(question)}
                disabled={isGenerating[question.id] || !formData[question.id]?.trim()}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isGenerating[question.id] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    AI生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI扩展
                  </>
                )}
              </Button>
            )}
          </div>
          
          <Input
            value={formData[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="focus:ring-orange-500 focus:border-orange-500"
          />
          
          {question.hasAI && (
            <p className="text-xs text-gray-500 mt-1">
              请用一句话描述核心目标，AI将基于此生成完整内容
            </p>
          )}
        </div>
      );
    }

    // 默认为textarea
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-md font-medium text-gray-700">
            {question.text} 
            {question.isRequired && <span className="text-red-500">*</span>}
            {question.isOptional && <span className="text-gray-400">(可选)</span>}
            {question.isAIGenerated && (
              <span className="ml-2 inline-flex items-center text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                <Sparkles className="h-3 w-3 mr-1" />
                AI生成
              </span>
            )}
          </Label>
          {question.hasAI && (
            <Button
              onClick={() => generateAIContent(question)}
              disabled={isGenerating[question.id] || !formData[question.id]?.trim()}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isGenerating[question.id] ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  AI生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI生成
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className={question.isAIGenerated ? "bg-orange-50 border border-orange-200 rounded-md p-4" : ""}>
          <Textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={question.isAIGenerated ? 6 : 4}
            className={`w-full ${question.isAIGenerated ? "bg-white" : ""} focus:ring-orange-500 focus:border-orange-500`}
          />
        </div>
        
        {question.hint && (
          <p className="text-xs text-gray-500 mt-1">{question.hint}</p>
        )}
      </div>
    );
  };

  const renderCard = (chapter: PrdChapter, index: number) => (
    <div key={chapter.id} className="w-full max-w-4xl mx-auto mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">{index + 1}. {chapter.title}</h2>
        <p className="text-sm text-gray-600">{chapter.description}</p>
      </div>
      
      <Expandable expandDirection="both" expandBehavior="push">
        <ExpandableCard 
          collapsedSize={{ width: 480, height: 140 }} 
          expandedSize={{ width: 800, height: undefined }} 
          className="mx-auto"
          hoverToExpand={false}
        >
          <ExpandableTrigger>
            <ExpandableCardHeader className="py-6 cursor-pointer h-full">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{chapter.title}</h3>
                  <p className="text-sm text-gray-500">{chapter.description}</p>
                </div>
              </div>
            </ExpandableCardHeader>
          </ExpandableTrigger>
          
          <ExpandableContent preset="fade" stagger staggerChildren={0.1}>
            <ExpandableCardContent>
              <div className="pt-4">
                <div className="grid grid-cols-2 gap-6">
                  {chapter.questions.map(question => (
                    <div key={question.id} className={question.gridColumn || 'col-span-1'}>
                      {renderQuestionInput(question)}
                    </div>
                  ))}
                </div>
              </div>
            </ExpandableCardContent>
            
            <ExpandableCardFooter>
              <div className="flex items-center justify-between w-full pt-4">
                <Button variant="outline" className="border-gray-300">
                  上一步
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  下一步
                </Button>
              </div>
            </ExpandableCardFooter>
          </ExpandableContent>
        </ExpandableCard>
      </Expandable>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">PRD 卡片优化测试</h1>
          <p className="text-gray-600">测试卡片样式和混合输入模式</p>
        </div>
        
        <div className="space-y-12">
          {prdChapters.map((chapter, index) => renderCard(chapter, index))}
        </div>
      </div>
    </div>
  );
} 