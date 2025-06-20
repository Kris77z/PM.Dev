'use client';

import React from 'react';
import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  actions?: React.ReactNode; // 可选的操作按钮（如Create按钮）
  className?: string;
}

export function TabNavigation({ 
  tabs, 
  activeTab, 
  onTabChange, 
  actions,
  className 
}: TabNavigationProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* 操作按钮区域 */}
      {actions}
      
      {/* Tab 选择区域 */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
} 