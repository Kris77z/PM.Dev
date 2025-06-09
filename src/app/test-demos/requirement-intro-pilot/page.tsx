'use client';

import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Expandable, 
  ExpandableCard, 
  ExpandableCardHeader, 
  ExpandableCardContent, 
  ExpandableContent, 
  ExpandableTrigger,
  ExpandableCardFooter
} from '@/components/ui/expandable';

// 定义结构化数据类型
interface RequirementBasicInfo {
  businessLine: string;
  projectManager: string;
  frontend: string;
  backend: string;
  data: string;
  testing: string;
  design: string;
  briefDescription: string; // PM的核心输入：简短描述
  expandedDescription?: string; // AI生成的完整描述
}

interface ChangeRecord {
  version: string;
  modifier: string;
  content: string;
  reason: string;
  date: string;
}



// 初始数据
const initialBasicInfo: RequirementBasicInfo = {
  businessLine: '',
  projectManager: '',
  frontend: '',
  backend: '',
  data: '',
  testing: '',
  design: '',
  briefDescription: '',
  expandedDescription: ''
};

const initialChangeRecord: ChangeRecord = {
  version: '0.1',
  modifier: '@xxx',
  content: '',
  reason: '',
  date: new Date().toISOString().split('T')[0]
};

export default function RequirementIntroPilotPage() {
  const [basicInfo, setBasicInfo] = useState<RequirementBasicInfo>(initialBasicInfo);
  const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([initialChangeRecord]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 模拟AI生成功能
  const generateAIContent = async () => {
    if (!basicInfo.briefDescription.trim()) {
      alert('请先填写需求的简短描述');
      return;
    }

    setIsGenerating(true);
    
    // 模拟AI调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟AI生成的扩展描述
    const aiGeneratedDescription = `## 需求介绍

基于产品经理提供的核心思想："${basicInfo.briefDescription}"，本次功能迭代旨在提升用户体验，解决当前产品在核心使用场景中存在的痛点。

### 迭代背景
随着业务发展和用户反馈的积累，我们发现现有功能在用户使用过程中存在一些关键问题需要优化。本次迭代将重点关注用户的核心需求，通过功能改进和体验优化，提升产品的整体可用性和用户满意度。

### 预期效果
通过本次功能迭代，我们期望能够：
- 提升用户操作效率
- 降低用户使用门槛
- 增强产品核心竞争力
- 为后续功能迭代奠定基础`;

    setBasicInfo(prev => ({
      ...prev,
      expandedDescription: aiGeneratedDescription
    }));
    
    setIsGenerating(false);
  };

  const handleBasicInfoChange = (field: keyof RequirementBasicInfo, value: string) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleChangeRecordChange = (index: number, field: keyof ChangeRecord, value: string) => {
    setChangeRecords(prev => 
      prev.map((record, i) => 
        i === index ? { ...record, [field]: value } : record
      )
    );
  };

  const addChangeRecord = () => {
    setChangeRecords(prev => [...prev, { ...initialChangeRecord, version: `0.${prev.length + 1}` }]);
  };

  const removeChangeRecord = (index: number) => {
    if (changeRecords.length > 1) {
      setChangeRecords(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">需求介绍 - 混合输入模式试点</h1>
          <p className="text-gray-600">展示结构化输入、富文本编辑器和AI协作的混合模式</p>
        </div>
        
        <div className="w-full max-w-4xl mx-auto">
          <Expandable expandDirection="both" expandBehavior="push">
            <ExpandableCard 
              collapsedSize={{ width: 480, height: 140 }} 
              expandedSize={{ width: 1000, height: undefined }} 
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
                      <h3 className="text-lg font-semibold text-gray-800">需求介绍</h3>
                      <p className="text-sm text-gray-500">明确本次迭代的基本信息和历史背景</p>
                    </div>
                  </div>
                </ExpandableCardHeader>
              </ExpandableTrigger>
              
              <ExpandableContent preset="fade" stagger staggerChildren={0.1}>
                <ExpandableCardContent>
                  <div className="space-y-8 pt-4">
                    
                    {/* 1. 所属业务线 - 结构化选择 */}
                    <div>
                      <Label className="block text-md font-medium text-gray-700 mb-3">
                        所属业务线 <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex flex-wrap gap-6">
                        {['AiCoin PC', 'AiCoin APP', 'AiCoin Web'].map((option) => (
                          <label key={option} className="flex items-center space-x-3 cursor-pointer">
                            <Checkbox 
                              id={`business-${option}`}
                              checked={basicInfo.businessLine === option}
                              onCheckedChange={() => handleBasicInfoChange('businessLine', option)}
                              className="border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />
                            <span className="text-base">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 2. 团队成员 - 结构化输入 */}
                    <div>
                      <Label className="block text-md font-medium text-gray-700 mb-3">
                        团队成员 <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pm" className="text-sm text-gray-600 mb-1 block">需求负责人</Label>
                          <Input
                            id="pm"
                            value={basicInfo.projectManager}
                            onChange={(e) => handleBasicInfoChange('projectManager', e.target.value)}
                            placeholder="@张三"
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="frontend" className="text-sm text-gray-600 mb-1 block">前端</Label>
                          <Input
                            id="frontend"
                            value={basicInfo.frontend}
                            onChange={(e) => handleBasicInfoChange('frontend', e.target.value)}
                            placeholder="@李四"
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="backend" className="text-sm text-gray-600 mb-1 block">后端</Label>
                          <Input
                            id="backend"
                            value={basicInfo.backend}
                            onChange={(e) => handleBasicInfoChange('backend', e.target.value)}
                            placeholder="@王五"
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="data" className="text-sm text-gray-600 mb-1 block">数据</Label>
                          <Input
                            id="data"
                            value={basicInfo.data}
                            onChange={(e) => handleBasicInfoChange('data', e.target.value)}
                            placeholder="@赵六"
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="testing" className="text-sm text-gray-600 mb-1 block">测试</Label>
                          <Input
                            id="testing"
                            value={basicInfo.testing}
                            onChange={(e) => handleBasicInfoChange('testing', e.target.value)}
                            placeholder="@孙七"
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="design" className="text-sm text-gray-600 mb-1 block">设计</Label>
                          <Input
                            id="design"
                            value={basicInfo.design}
                            onChange={(e) => handleBasicInfoChange('design', e.target.value)}
                            placeholder="@周八"
                            className="focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. 需求核心描述 - PM种子输入 + AI扩展 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-md font-medium text-gray-700">
                          需求核心描述 <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          onClick={generateAIContent}
                          disabled={isGenerating || !basicInfo.briefDescription.trim()}
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              AI生成中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              AI扩展描述
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* PM的核心输入 */}
                      <div className="mb-4">
                        <Label className="text-sm text-gray-600 mb-2 block">
                          💡 简短描述 (PM核心输入)
                        </Label>
                        <Input
                          value={basicInfo.briefDescription}
                          onChange={(e) => handleBasicInfoChange('briefDescription', e.target.value)}
                          placeholder="例如：为解决新用户注册流程复杂的问题，上线手机号一键登录功能"
                          className="focus:ring-orange-500 focus:border-orange-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          请用一句话描述本次迭代的核心目标，AI将基于此生成完整的需求介绍
                        </p>
                      </div>

                      {/* AI生成的扩展内容 */}
                      {basicInfo.expandedDescription && (
                        <div className="mt-4">
                          <Label className="text-sm text-gray-600 mb-2 block flex items-center">
                            <Sparkles className="h-4 w-4 mr-1 text-orange-500" />
                            AI扩展的完整描述
                          </Label>
                          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                            <Textarea
                              value={basicInfo.expandedDescription}
                              onChange={(e) => handleBasicInfoChange('expandedDescription', e.target.value)}
                              rows={8}
                              className="w-full bg-white focus:ring-orange-500 focus:border-orange-500"
                              placeholder="AI生成的内容将出现在这里，您可以进一步编辑..."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. 变更记录 - 可动态增删的表格组件 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-md font-medium text-gray-700">
                          变更记录 <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          onClick={addChangeRecord}
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          + 添加记录
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {changeRecords.map((record, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">变更记录 #{index + 1}</h4>
                              {changeRecords.length > 1 && (
                                <Button
                                  onClick={() => removeChangeRecord(index)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  删除
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-gray-600 mb-1 block">版本</Label>
                                <Input
                                  value={record.version}
                                  onChange={(e) => handleChangeRecordChange(index, 'version', e.target.value)}
                                  placeholder="0.1"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600 mb-1 block">修订人</Label>
                                <Input
                                  value={record.modifier}
                                  onChange={(e) => handleChangeRecordChange(index, 'modifier', e.target.value)}
                                  placeholder="@xxx"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600 mb-1 block">修订日期</Label>
                                <Input
                                  type="date"
                                  value={record.date}
                                  onChange={(e) => handleChangeRecordChange(index, 'date', e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600 mb-1 block">修订原因</Label>
                                <Input
                                  value={record.reason}
                                  onChange={(e) => handleChangeRecordChange(index, 'reason', e.target.value)}
                                  placeholder="功能优化"
                                  className="text-sm"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label className="text-xs text-gray-600 mb-1 block">修订内容</Label>
                                <Textarea
                                  value={record.content}
                                  onChange={(e) => handleChangeRecordChange(index, 'content', e.target.value)}
                                  rows={2}
                                  placeholder="描述本次修订的具体内容..."
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ExpandableCardContent>
                
                <ExpandableCardFooter>
                  <div className="flex items-center justify-between w-full pt-6">
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
        
        {/* 数据预览 */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">结构化数据预览</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">基本信息</h4>
              <pre className="text-sm text-gray-600 overflow-auto max-h-60 bg-gray-50 p-3 rounded">
                {JSON.stringify(basicInfo, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">变更记录</h4>
              <pre className="text-sm text-gray-600 overflow-auto max-h-60 bg-gray-50 p-3 rounded">
                {JSON.stringify(changeRecords, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 