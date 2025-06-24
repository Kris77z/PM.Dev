'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DemoCard {
  id: string;
  title: string;
  description: string;
  path: string;
  tags: string[];
  status: 'stable' | 'beta' | 'new';
}

const demos: DemoCard[] = [
  {
    id: 'prd-test',
    title: 'PRD工具测试',
    description: '快速测试PRD生成流程和提示词效果，包含预填充的测试数据模板',
    path: '/test-demos/prd-test',
    tags: ['PRD', '产品需求', '提示词测试', 'AI生成'],
    status: 'new'
  },
  {
    id: 'enhanced-message-test',
    title: '增强消息系统测试',
    description: '基于Cherry Studio架构的新消息系统，支持代码高亮、数学公式、引用系统等功能',
    path: '/test-demos/enhanced-message-test',
    tags: ['消息系统', 'Markdown', '代码高亮', 'Cherry Studio'],
    status: 'new'
  },
  {
    id: 'research-plan-demo',
    title: 'Research Plan 组件测试',
    description: '基于Vibe Coding研究工作流日志的组件演示，展示渐进式显示和状态管理功能',
    path: '/test-demos/research-plan-demo',
    tags: ['组件测试', '工作流', '研究助手'],
    status: 'new'
  },
  {
    id: 'agent-plan-test',
    title: 'Agent Plan 测试',
    description: '代理规划和执行流程的测试页面',
    path: '/test-demos/agent-plan-test',
    tags: ['代理', '规划', '执行'],
    status: 'stable'
  },
  {
    id: 'langgraph-v2-test',
    title: 'LangGraph V2 测试',
    description: 'LangGraph V2版本功能测试',
    path: '/test-demos/langgraph-v2-test',
    tags: ['LangGraph', 'V2', '图形'],
    status: 'beta'
  },
  {
    id: 'test-models',
    title: '模型测试',
    description: '各种AI模型的测试和比较',
    path: '/test-demos/test-models',
    tags: ['模型', 'AI', '测试'],
    status: 'stable'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-green-100 text-green-800'
    case 'beta':
      return 'bg-yellow-100 text-yellow-800'
    case 'stable':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'new': return '新功能'
    case 'beta': return '测试版'
    case 'stable': return '稳定版'
    default: return '未知'
  }
}

export default function TestDemosPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDemos = demos.filter(demo =>
    demo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">测试演示中心</h1>
                <p className="text-sm text-gray-500">PM Assistant 功能测试和演示页面</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="搜索演示页面..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDemos.map((demo) => (
            <div
              key={demo.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {demo.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(demo.status)}`}>
                    {getStatusText(demo.status)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {demo.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {demo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Link href={demo.path}>
                  <Button className="w-full" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    打开演示
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredDemos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">没有找到匹配的演示</div>
            <div className="text-gray-400 text-sm">尝试调整搜索关键词</div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">统计信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{demos.length}</div>
              <div className="text-sm text-gray-500">总演示数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {demos.filter(d => d.status === 'new').length}
              </div>
              <div className="text-sm text-gray-500">新功能</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {demos.filter(d => d.status === 'beta').length}
              </div>
              <div className="text-sm text-gray-500">测试版</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {demos.filter(d => d.status === 'stable').length}
              </div>
              <div className="text-sm text-gray-500">稳定版</div>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最新更新</h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">
                <strong>Research Plan 组件测试</strong> - 新增基于工作流日志的组件演示页面
              </span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">
                优化了组件的渐进式显示和状态管理功能
              </span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-700">
                添加了自动播放和实时状态切换功能
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 