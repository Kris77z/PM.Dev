'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowBack, IconBook, IconCode, IconBulb, IconTarget, IconRocket } from '@tabler/icons-react';

export default function VibeCodingGuidePage() {
  const router = useRouter();

  const guideItems = [
    {
      icon: <IconTarget className="w-8 h-8" />,
      title: "明确需求",
      description: "在使用Vibe Coding之前，清晰地定义你想要实现的功能或解决的问题",
      tips: [
        "写下具体的功能需求",
        "准备相关的参考资料",
        "思考用户使用场景"
      ]
    },
    {
      icon: <IconCode className="w-8 h-8" />,
      title: "善用提示词",
      description: "学会编写清晰、具体的提示词，让AI更好地理解你的意图",
      tips: [
        "使用具体的技术栈名称",
        "提供上下文信息",
        "分步骤描述复杂需求"
      ]
    },
    {
      icon: <IconBulb className="w-8 h-8" />,
      title: "迭代优化",
      description: "通过多轮对话不断完善代码，逐步达到理想效果",
      tips: [
        "先实现基础功能",
        "逐步添加细节",
        "及时测试和调整"
      ]
    },
    {
      icon: <IconRocket className="w-8 h-8" />,
      title: "项目管理",
      description: "合理规划项目结构，保持代码的可维护性",
      tips: [
        "建立清晰的文件结构",
        "编写必要的文档",
        "定期重构代码"
      ]
    }
  ];

  const bestPractices = [
    {
      title: "提示词模板",
      content: `我需要创建一个[功能描述]，使用[技术栈]。
      
具体要求：
1. [具体需求1]
2. [具体需求2]
3. [具体需求3]

请提供完整的代码实现。`
    },
    {
      title: "代码审查请求",
      content: `请帮我审查这段代码，重点关注：
1. 代码质量和可读性
2. 性能优化建议
3. 潜在的bug或问题
4. 最佳实践建议

[粘贴你的代码]`
    },
    {
      title: "功能扩展",
      content: `基于现有代码，我想添加[新功能描述]。

现有代码：
[粘贴相关代码]

新功能需求：
1. [需求描述1]
2. [需求描述2]

请提供修改方案。`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <IconArrowBack className="h-5 w-5" />
                <span>返回</span>
              </button>
              <div className="ml-6">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <IconBook className="h-6 w-6 text-orange-500" />
                  Vibe Coding 指南
                </h1>
                <p className="text-sm text-gray-500">更适合 PM 体质的 Vibe Coding 指南</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 介绍部分 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">什么是Vibe Coding？</h2>
          <p className="text-gray-600 mb-4">
            Vibe Coding是一种AI驱动的编程方法论，专为提高开发效率和代码质量而设计。作为产品经理，
            你可以利用Vibe Coding快速实现产品原型、验证想法，甚至参与到实际的产品开发中。
          </p>
          <p className="text-gray-600">
            本指南将帮助你掌握Vibe Coding的核心理念和实践方法，让你能够更好地与开发团队协作，
            甚至独立完成一些简单的开发任务。
          </p>
        </div>

        {/* 核心原则 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {guideItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-orange-500">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <ul className="space-y-2">
                {item.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 最佳实践模板 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">实用提示词模板</h2>
          <div className="space-y-6">
            {bestPractices.map((practice, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{practice.title}</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {practice.content}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vibe Coding核心理念 */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-orange-800 mb-4">Vibe Coding 核心理念</h2>
          <ul className="space-y-3 text-orange-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
              <strong>直觉驱动：</strong>相信你的产品直觉，用代码验证想法
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
              <strong>快速迭代：</strong>快速构建MVP，通过用户反馈持续改进
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
              <strong>协作优先：</strong>代码是团队沟通的桥梁，不是技术壁垒
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
              <strong>用户导向：</strong>每一行代码都应该为用户价值服务
            </li>
          </ul>
        </div>

        {/* 注意事项 */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-orange-800 mb-4">重要提示</h2>
          <ul className="space-y-2 text-orange-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
              始终保持代码的可读性和可维护性
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
              定期备份重要代码和项目文件
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
              与开发团队保持良好沟通，遵循团队代码规范
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
              AI生成的代码需要仔细检查和测试
            </li>
          </ul>
        </div>

        {/* 进阶学习 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">进阶学习建议</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">技术基础</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 学习基础的HTML/CSS</li>
                <li>• 了解JavaScript基础语法</li>
                <li>• 熟悉React组件概念</li>
                <li>• 掌握版本控制(Git)基础</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">产品思维</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 用户体验设计原则</li>
                <li>• 产品功能优先级管理</li>
                <li>• 数据驱动的产品决策</li>
                <li>• 敏捷开发流程理解</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 