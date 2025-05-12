'use client';

import React, { useState } from 'react';
import { 
  Stepper, 
  StepperItem, 
  StepperIndicator, 
  StepperSeparator,
  StepperTrigger
} from "@/components/ui/stepper";

// Interface for a single planned page details
interface PageDetails {
  purpose: string;
  coreFunctionality: string;
  userFlow: string;
}

// Type for storing details of all pages
interface AllPagesData {
  [pageName: string]: PageDetails;
}

// Define the structure for the final output data
export interface PlannedPagesOutput {
  pages: AllPagesData;
  flowDescription: string; // Added field for page flow description
}

// Props for the component
interface PagePlanningFormProps {
  // Updated onCompleteAll to expect the new PlannedPagesOutput structure
  onCompleteAll: (plannedPagesData: PlannedPagesOutput) => void;
}

const PagePlanningForm: React.FC<PagePlanningFormProps> = ({ onCompleteAll }) => {
  const [pageListInput, setPageListInput] = useState(''); // For the initial text area
  const [pageNames, setPageNames] = useState<string[]>([]); // Stores the parsed page names
  const [allPagesData, setAllPagesData] = useState<AllPagesData>({}); // Stores details for each page
  const [isListingPages, setIsListingPages] = useState(true); // Controls which view to show
  // Added state for the overall page flow description
  const [pageFlowDescription, setPageFlowDescription] = useState(''); 

  const totalSteps = 2; // Two steps in this form
  const currentStep = isListingPages ? 1 : 2;

  const handlePageListSubmit = () => {
    const names = pageListInput.split(/\n|,/).map(name => name.trim()).filter(name => name);
    if (names.length > 0) {
      setPageNames(names);
      const initialData: AllPagesData = {};
      names.forEach(name => {
        initialData[name] = { purpose: '', coreFunctionality: '', userFlow: '' };
      });
      setAllPagesData(initialData);
      setIsListingPages(false); // Move to step 2
    }
  };

  const handleDetailChange = (pageName: string, field: keyof PageDetails, value: string) => {
    setAllPagesData(prev => ({
      ...prev,
      [pageName]: {
        ...prev[pageName],
        [field]: value,
      },
    }));
  };

  const handleCompleteAll = () => {
    const arePageDetailsComplete = pageNames.every(name => 
        allPagesData[name].purpose.trim() &&
        allPagesData[name].coreFunctionality.trim() &&
        allPagesData[name].userFlow.trim()
    );

    if (!arePageDetailsComplete || !pageFlowDescription.trim()) { // Also check pageFlowDescription
        alert('请确保所有页面的信息和页面间流转描述都已填写完整。');
        return;
    }
    
    const finalOutput: PlannedPagesOutput = {
        pages: allPagesData,
        flowDescription: pageFlowDescription
    };

    console.log('Page Planning Completed:', finalOutput);
    onCompleteAll(finalOutput);
  };

  // Helper to allow navigating Stepper by clicking
  const handleStepChange = (step: number) => {
    if (step === 1) {
        // Only allow going back to step 1 if pageNames exist (meaning step 1 was completed)
        if (pageNames.length > 0) setIsListingPages(true);
    } else if (step === 2) {
        // Only allow going to step 2 if step 1 was completed
        if (pageNames.length > 0) setIsListingPages(false);
    }
  };

  const renderStepper = () => (
    <div className="space-y-3 mb-8">
        <Stepper value={currentStep} onValueChange={handleStepChange} className="w-full">
            <StepperItem step={1} className="flex-1">
                <StepperTrigger className="w-full flex-col items-start gap-2" asChild>
                    <StepperIndicator asChild className="h-2 w-full rounded-none bg-gray-200 data-[state=completed]:bg-orange-500 data-[state=active]:bg-orange-500">
                        <span className="sr-only">1</span>
                    </StepperIndicator>
                </StepperTrigger>
                <StepperSeparator className="data-[state=completed]:bg-orange-500"/>
            </StepperItem>
            <StepperItem step={2} className="flex-1">
                <StepperTrigger className="w-full flex-col items-start gap-2" asChild disabled={pageNames.length === 0} onClick={() => handleStepChange(2)}>
                    <StepperIndicator asChild className="h-2 w-full rounded-none bg-gray-200 data-[state=completed]:bg-orange-500 data-[state=active]:bg-orange-500">
                        <span className="sr-only">2</span>
                    </StepperIndicator>
                </StepperTrigger>
            </StepperItem>
        </Stepper>
        <div className="text-sm font-medium tabular-nums text-muted-foreground text-center">
            步骤 {currentStep} / {totalSteps}
        </div>
    </div>
  );

  if (isListingPages) {
    // View 1: Input for listing page names
    return (
      <div className="max-w-xl w-full mx-auto space-y-8">
        {renderStepper()}
        <h2 className="text-xl font-semibold mb-4 text-center">页面规划 - 步骤 1: 列出主要页面</h2>
        <label htmlFor="pageList" className="block text-lg font-medium text-gray-700 mb-2">
          您的产品包含哪些主要页面/屏幕？ (请每行输入一个页面名称，或用逗号分隔)
        </label>
        <textarea
          id="pageList"
          value={pageListInput}
          onChange={(e) => setPageListInput(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          placeholder="例如：\n首页\n登录页\n产品列表页\n产品详情页\n个人中心"
        />
        <button
          onClick={handlePageListSubmit}
          type="button"
          className="mt-4 w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50"
          disabled={!pageListInput.trim()}
        >
          下一步：填写页面详情
        </button>
      </div>
    );
  }

  // View 2: Fill details for each listed page
  return (
    <div className="max-w-2xl w-full mx-auto space-y-8">
      {renderStepper()}
      <h2 className="text-xl font-semibold mb-4 text-center">页面规划 - 步骤 2: 填写页面详情</h2>
      
      {pageNames.map((pageName) => (
        <div key={pageName} className="mb-6 p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium text-orange-600 mb-3">页面: {pageName}</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor={`purpose-${pageName}`} className="block text-sm font-medium text-gray-700 mb-1">页面目的:</label>
              <textarea
                id={`purpose-${pageName}`}
                value={allPagesData[pageName].purpose}
                onChange={(e) => handleDetailChange(pageName, 'purpose', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="这个页面的主要作用是什么？用户来这里是为了做什么？请具体描述。"
              />
            </div>
            <div>
              <label htmlFor={`coreFunctionality-${pageName}`} className="block text-sm font-medium text-gray-700 mb-1">核心功能/操作:</label>
              <textarea
                id={`coreFunctionality-${pageName}`}
                value={allPagesData[pageName].coreFunctionality}
                onChange={(e) => handleDetailChange(pageName, 'coreFunctionality', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="用户在这个页面上需要进行哪些最主要的操作？请具体列举。"
              />
            </div>
            <div>
              <label htmlFor={`userFlow-${pageName}`} className="block text-sm font-medium text-gray-700 mb-1">用户流程:</label>
              <textarea
                id={`userFlow-${pageName}`}
                value={allPagesData[pageName].userFlow}
                onChange={(e) => handleDetailChange(pageName, 'userFlow', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="请简单描述用户使用这个页面的主要步骤，包括关键输入和输出。"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="p-4 border-t border-gray-200 mt-6 pt-6">
          <label htmlFor="pageFlowDescription" className="block text-lg font-medium text-gray-700 mb-2">
              页面间流转描述:
          </label>
          <textarea
            id="pageFlowDescription"
            value={pageFlowDescription}
            onChange={(e) => setPageFlowDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            placeholder="请详细描述页面间的跳转逻辑，并明确指出触发跳转的具体操作..."
          />
      </div>

      <button
        onClick={handleCompleteAll}
        type="button"
        className="mt-4 w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50"
        disabled={!pageNames.length || !pageFlowDescription.trim() || pageNames.some(name => !allPagesData[name].purpose.trim() || !allPagesData[name].coreFunctionality.trim() || !allPagesData[name].userFlow.trim())}
      >
        完成所有页面规划
      </button>
    </div>
  );
};

export default PagePlanningForm; 