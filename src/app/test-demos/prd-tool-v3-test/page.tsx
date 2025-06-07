'use client';

import PRDHouseViewV3 from '@/components/prd-house/PRDHouseViewV3';

export default function PRDToolV3TestPage() {
  return (
    <div className="h-screen w-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">PRD 工具 V3 测试页面</h1>
        <p className="text-sm text-gray-600 mt-1">
          带有 Typewriter 动画引导的新版本，参考 ProductDefinitionForm 的表单设计风格
        </p>
        <div className="text-xs text-gray-500 mt-2">
          新功能：产品专家动画引导 → 产品想法输入 → 结构化AI访谈 → PRD生成 → AI深度审查
        </div>
      </div>
      <div className="h-[calc(100vh-96px)]">
        <PRDHouseViewV3 />
      </div>
    </div>
  );
} 