'use client'

import React from 'react'
import { MessageSquare, Wand2, FileText, Layers, Infinity } from 'lucide-react'
import { ViewType } from '@/app/page'

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

const menuItems = [
  {
    id: 'chat' as ViewType,
    label: 'AI 聊天',
    icon: MessageSquare,
    description: '与 AI 助手对话'
  },
  {
    id: 'prompt-house' as ViewType,
    label: 'Prompt 工具',
    icon: Wand2,
    description: '智能提示词模板'
  },
  {
    id: 'prd-house' as ViewType,
    label: 'PRD 工具',
    icon: FileText,
    description: '产品需求文档'
  },
  {
    id: 'prototype-house' as ViewType,
    label: '原型工具',
    icon: Layers,
    description: '快速原型设计'
  },
  {
    id: 'infinite-canvas' as ViewType,
    label: '无限画布',
    icon: Infinity,
    description: '创意思维导图'
  }
]

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">PM Assistant</h1>
        <p className="text-sm text-gray-600 mt-1">产品经理的 AI 助手</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2024 PM Assistant
        </div>
      </div>
    </div>
  )
} 