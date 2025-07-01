'use client';

import React, { useState } from 'react';
import { Monitor, Play, Download, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { AlertSuccess, AlertError } from '@/components/ui/alert';
import { HTMLPrototypePreview } from '@/components/prd-house/HTMLPrototypePreview';
import { PRDGenerationData } from '@/lib/prd-generator';
import { generateHTMLPrompt } from '@/prompts/html-generation-prompt';

export default function PRDHTMLTestPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState('');

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertState({ type, message });
    setTimeout(() => setAlertState({ type: null, message: '' }), 3000);
  };

  // 模拟完整的PRD数据用于测试
  const mockPRDData: PRDGenerationData = {
    answers: {
      'c1_requirement_intro': '一个智能任务管理应用，帮助用户高效管理日常任务和项目，通过AI智能提醒和自动分类功能，提升工作效率。',
      'c1_business_line': '生产力工具',
      'c1_product_manager': '张小明',
      'c1_frontend_dev': '李小华',
      'c1_backend_dev': '王小刚',
      'c1_data_analyst': '陈小美',
      'c2_requirement_goal': '帮助用户将工作效率提升30%，减少任务遗漏率至5%以下，提供直观易用的任务管理界面',
      'c5_related_docs': 'https://example.com/api-docs, https://example.com/design-guide'
    },
    changeRecords: [
      {
        version: '1.0',
        modifier: '张小明',
        date: '2024-01-15',
        reason: '初始版本创建',
        content: '创建基础任务管理功能'
      },
      {
        version: '1.1',
        modifier: '李小华',
        date: '2024-01-20',
        reason: '增加AI功能',
        content: '添加智能分类和提醒功能'
      }
    ],
    userScenarios: [
      {
        userType: '职场白领',
        scenario: '每天需要管理多个项目和任务，经常在不同工具间切换',
        painPoint: '现有工具功能分散，操作复杂，容易遗漏重要任务'
      },
      {
        userType: '项目经理',
        scenario: '需要跟踪团队成员的任务进度，协调项目时间线',
        painPoint: '缺乏统一的项目视图，难以实时了解项目状态'
      },
      {
        userType: '自由职业者',
        scenario: '管理多个客户项目，需要精确的时间追踪',
        painPoint: '难以平衡不同客户的优先级，时间管理效率低'
      }
    ],
    iterationHistory: [
      {
        version: '0.1',
        author: '产品团队',
        date: '2024-01-01',
        content: '完成市场调研和用户访谈'
      },
      {
        version: '0.5',
        author: '设计团队',
        date: '2024-01-10',
        content: '完成UI/UX设计稿'
      }
    ],
    competitors: [
      {
        name: 'Todoist',
        features: '任务管理、项目协作、自然语言处理',
        advantages: '界面简洁、功能丰富、跨平台同步',
        disadvantages: '高级功能需要付费、缺乏时间追踪',
        marketPosition: '市场领导者，全球用户超过2500万'
      },
      {
        name: 'Notion',
        features: '文档编辑、数据库、任务管理、团队协作',
        advantages: '功能全面、自定义程度高、模板丰富',
        disadvantages: '学习成本高、移动端体验一般',
        marketPosition: '快速增长的全能型工具，估值100亿美元'
      },
      {
        name: 'Asana',
        features: '项目管理、团队协作、时间线视图',
        advantages: '项目管理功能强大、团队协作体验好',
        disadvantages: '个人用户功能相对简单、价格较高',
        marketPosition: '企业级项目管理工具的主要竞争者'
      }
    ],
    requirementSolution: {
      sharedPrototype: '智能任务管理系统',
      requirements: [
        {
          name: '智能任务创建',
          priority: 'High',
          features: '自然语言输入、AI自动分类、智能标签建议',
          businessLogic: '用户输入任务描述，AI分析内容自动分配分类和优先级',
          dataRequirements: '任务标题、描述、截止时间、分类、优先级、标签',
          edgeCases: '网络断开时离线创建、语音输入识别错误处理',
          painPoints: '传统工具需要手动填写多个字段，操作繁琐',
          modules: '任务管理模块、AI分析模块',
          openIssues: 'AI分类准确性需要持续优化'
        },
        {
          name: '智能提醒系统',
          priority: 'High',
          features: '基于用户习惯的智能提醒、多渠道通知',
          businessLogic: '分析用户完成任务的时间模式，在最佳时机发送提醒',
          dataRequirements: '用户行为数据、任务完成历史、偏好设置',
          edgeCases: '用户时区变更、设备通知权限被拒绝',
          painPoints: '固定时间提醒经常被忽略，效果不佳',
          modules: '通知模块、数据分析模块',
          openIssues: '如何平衡提醒频率和用户体验'
        },
        {
          name: '项目协作看板',
          priority: 'Middle',
          features: '可视化项目进度、团队成员分工、实时同步',
          businessLogic: '采用看板模式展示项目状态，支持拖拽操作',
          dataRequirements: '项目信息、任务状态、成员权限、操作日志',
          edgeCases: '多人同时编辑冲突、网络同步失败',
          painPoints: '团队协作缺乏透明度，进度难以追踪',
          modules: '协作模块、同步模块',
          openIssues: '实时协作的性能优化'
        }
      ]
    }
  };

  const handleGenerateHTML = async () => {
    setIsLoading(true);
    try {
      // 使用新的简化提示词系统
      const prompt = generateHTMLPrompt(mockPRDData);
      
      const response = await fetch('/api/ai-html-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt,
          modelId: 'gemini-2.0-flash'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate HTML');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }
      
      setGeneratedHTML(result.content);
      setShowPreview(true);
      showAlert('success', '✨ 使用新的简化系统成功生成精美HTML原型！');
    } catch (error) {
      console.error('Error generating HTML:', error);
      showAlert('error', '生成HTML时出错，请检查控制台');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPreview = () => {
    setShowPreview(true);
    showAlert('success', '打开HTML原型预览测试界面');
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* 左侧控制面板 */}
      <div className="w-1/2 border-r border-gray-300 overflow-y-auto">
        <div className="p-6">
          {/* 顶部标题 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PRD到HTML生成测试</h1>
            </div>
            <p className="text-gray-600">
              测试基于PRD数据自动生成精美HTML原型的功能。
              我们已经集成了新的<strong className="text-blue-600">简化智能匹配系统</strong>。
            </p>
          </div>

          {/* Alert 提示 */}
          {alertState.type && (
            <div className="fixed top-4 left-4 z-50 pointer-events-none">
              <div className="pointer-events-auto animate-in fade-in-0 slide-in-from-top-2 duration-300">
                {alertState.type === 'success' ? (
                  <AlertSuccess>{alertState.message}</AlertSuccess>
                ) : (
                  <AlertError>{alertState.message}</AlertError>
                )}
              </div>
            </div>
          )}

          {/* PRD基本信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              测试PRD数据概览
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">产品名称：</span>
                <span className="text-gray-600">{mockPRDData.requirementSolution.sharedPrototype}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">产品介绍：</span>
                <span className="text-gray-600">{mockPRDData.answers['c1_requirement_intro']}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">业务线：</span>
                <span className="text-gray-600">{mockPRDData.answers['c1_business_line']}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">需求目标：</span>
                <span className="text-gray-600">{mockPRDData.answers['c2_requirement_goal']}</span>
              </div>
            </div>
          </div>

          {/* 数据统计 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">数据统计</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{mockPRDData.userScenarios.length}</div>
                <div className="text-sm text-gray-600">用户场景</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{mockPRDData.competitors.length}</div>
                <div className="text-sm text-gray-600">竞品分析</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{mockPRDData.requirementSolution.requirements.length}</div>
                <div className="text-sm text-gray-600">核心需求</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{mockPRDData.changeRecords.length}</div>
                <div className="text-sm text-gray-600">变更记录</div>
              </div>
            </div>
          </div>

          {/* 核心功能展示 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">核心需求功能</h2>
            <div className="space-y-3">
              {mockPRDData.requirementSolution.requirements.map((req, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{req.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      req.priority === 'High' ? 'bg-red-100 text-red-700' :
                      req.priority === 'Middle' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{req.features}</p>
                  <p className="text-xs text-gray-500">{req.painPoints}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 测试控制面板 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">测试控制面板</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-3">✨ 新版本功能</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <strong className="text-blue-600">简化系统：</strong>移除复杂分类，直接生成精美HTML</p>
                  <p>• <strong className="text-green-600">专注精美：</strong>基于您的HTML参考文件的设计风格</p>
                  <p>• <strong className="text-purple-600">现代设计：</strong>使用最新的CSS技术和响应式布局</p>
                  <p>• <strong className="text-orange-600">智能图片：</strong>自动使用高质量占位图片</p>
                  <p>• <strong className="text-red-600">即时预览：</strong>生成后立即在右侧预览</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleGenerateHTML}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      🚀 新版本：生成精美HTML
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleTestPreview}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  📋 旧版本：使用原有系统
                </Button>
                
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <strong>注意：</strong>新版本使用Gemini 2.0 Flash模型，生成速度更快，质量更高。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧预览区域 */}
      <div className="w-1/2 bg-white flex flex-col">
        <div className="border-b border-gray-300 p-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">✨ HTML原型预览</h2>
          <p className="text-sm text-gray-600">生成的HTML将在这里实时预览</p>
        </div>
        
        <div className="flex-1 p-4">
          {generatedHTML ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-700">生成的HTML预览</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      const newWindow = window.open('', '_blank');
                      if (newWindow) {
                        newWindow.document.write(generatedHTML);
                        newWindow.document.close();
                      }
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    新窗口打开
                  </Button>
                  <Button
                    onClick={() => setGeneratedHTML('')}
                    size="sm"
                    variant="outline"
                  >
                    清除
                  </Button>
                </div>
              </div>
              <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  srcDoc={generatedHTML}
                  className="w-full h-full border-0"
                  title="Generated HTML Preview"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Monitor className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">等待生成HTML预览</p>
                <p className="text-sm">点击左侧的生成按钮开始测试</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 旧版本预览模态（保持兼容） */}
      {showPreview && !generatedHTML && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[90vh] overflow-hidden">
            <HTMLPrototypePreview
              prdData={mockPRDData}
              onClose={() => setShowPreview(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 