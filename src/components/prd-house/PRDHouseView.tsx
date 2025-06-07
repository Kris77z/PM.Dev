'use client'

import { useState } from 'react'
import { Send, FileText, Sparkles } from 'lucide-react'

// 假设的对话消息类型
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function PRDHouseView() {
  const [workflowStage, setWorkflowStage] = useState<'interview' | 'generated' | 'verified'>('interview')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '你好！请用一两句话描述你的产品核心想法，我们来一起把它变成一份专业的PRD。' }
  ])
  const [prdContent, setPrdContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [userInput, setUserInput] = useState<string>('')

  const handleSendMessage = () => {
    if (!userInput.trim()) return
    // TODO: 实现与AI的交互逻辑
    console.log('User input:', userInput)
    setMessages([...messages, { role: 'user', content: userInput }])
    setUserInput('')
    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: '很有趣的想法！我们可以从目标用户开始聊聊，您认为这个产品的核心用户群体是谁？' }])
    }, 1000)
  }

  const handleGeneratePRD = () => {
    setIsLoading(true)
    // TODO: 调用AI生成PRD
    console.log('Generating PRD...')
    setTimeout(() => {
      setPrdContent(`# 产品需求文档：AI驱动的饮水记录App

## 1. 项目背景
... (这里是AI根据对话生成的PRD内容) ...

## 2. 目标用户
...

## 3. 核心功能
...
      `)
      setWorkflowStage('generated')
      setIsLoading(false)
    }, 2000)
  }
  
  const handleVerifyPRD = () => {
    setIsLoading(true)
    // TODO: 调用AI审查PRD
    console.log('Verifying PRD...')
    setTimeout(() => {
      setPrdContent(prdContent + `
---
### AI审查与改进建议 (v2)
1.  **逻辑漏洞**: 在用户激励体系中，目前的积分奖励机制较为单一，可能无法长期维持用户活跃度。建议增加成就徽章、好友排行榜等社交激励元素。
2.  **需求不明确**: "健康建议"功能描述较为模糊。建议明确建议的来源（如通用健康知识库、或与专业营养师合作）、推送频率和个性化程度。
3.  **缺少关键信息**: 未定义非功能性需求，如App的性能指标（启动时间、响应速度）、数据隐私保护策略等。
        `)
      setWorkflowStage('verified')
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="flex h-full w-full bg-white text-black">
      {/* Left Panel: Interview / Chat */}
      <div className="flex flex-col w-1/2 border-r border-gray-200">
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">AI产品访谈</h2>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0" />}
                <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100'}`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="请输入您的想法..."
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400"
              disabled={isLoading}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: PRD Document */}
      <div className="flex flex-col w-1/2">
        <div className="p-6 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-xl font-semibold">产品需求文档 (PRD)</h2>
          <div className="flex gap-2">
            <button
              onClick={handleGeneratePRD}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:bg-gray-400"
              disabled={isLoading || messages.length <= 2}
            >
              <FileText className="h-5 w-5" />
              {isLoading && workflowStage === 'interview' ? '生成中...' : '生成PRD'}
            </button>
            <button
              onClick={handleVerifyPRD}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 disabled:bg-gray-400"
              disabled={isLoading || workflowStage !== 'generated'}
            >
              <Sparkles className="h-5 w-5" />
              {isLoading && workflowStage === 'generated' ? '审查中...' : 'AI审查并改进'}
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {prdContent ? (
            <article className="prose lg:prose-xl">
              <pre className="whitespace-pre-wrap font-sans">{prdContent}</pre>
            </article>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>完成左侧访谈后，点击 &quot;生成PRD&quot; 按钮来创建文档。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 