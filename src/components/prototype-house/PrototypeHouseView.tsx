'use client'

import React from 'react'
import { Layers, Plus, Search } from 'lucide-react'

export default function PrototypeHouseView() {
  return (
    <div className="flex h-full bg-gray-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Layers className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">原型工具</h2>
          <p className="text-gray-600 mb-6">
            快速原型设计工具，帮助你创建交互式产品原型
          </p>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              创建新原型
            </button>
            <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Search className="w-4 h-4" />
              浏览模板
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">功能开发中...</p>
        </div>
      </div>
    </div>
  );
} 