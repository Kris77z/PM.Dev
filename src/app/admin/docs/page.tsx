'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowBack, IconFileText, IconSettings, IconUsers, IconChartBar } from '@tabler/icons-react';

export default function AdminDocsPage() {
  const router = useRouter();

  const adminSections = [
    {
      icon: <IconFileText className="w-8 h-8" />,
      title: "文档管理",
      description: "管理系统文档、用户手册和API文档",
      items: [
        "系统配置文档",
        "用户操作手册", 
        "API接口文档",
        "故障排除指南"
      ]
    },
    {
      icon: <IconUsers className="w-8 h-8" />,
      title: "用户管理",
      description: "管理用户账户、权限和访问控制",
      items: [
        "用户账户管理",
        "权限配置",
        "访问日志",
        "安全设置"
      ]
    },
    {
      icon: <IconChartBar className="w-8 h-8" />,
      title: "数据分析",
      description: "查看系统使用情况和性能指标",
      items: [
        "使用统计",
        "性能监控",
        "错误日志",
        "用户行为分析"
      ]
    },
    {
      icon: <IconSettings className="w-8 h-8" />,
      title: "系统设置",
      description: "配置系统参数和功能开关",
      items: [
        "基础配置",
        "功能开关",
        "集成设置",
        "备份恢复"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <IconSettings className="h-6 w-6 text-blue-500" />
                  管理后台
                </h1>
                <p className="text-sm text-gray-500">系统管理和配置中心</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminSections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-blue-500">
                  {section.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">{section.description}</p>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
