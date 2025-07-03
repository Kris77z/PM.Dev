'use client';

import React, { useState } from "react";
import ProductDefinitionForm from "@/components/ProductDefinitionForm";
import TechnicalPlanningForm from "@/components/TechnicalPlanningForm";
import PagePlanningForm from "@/components/PagePlanningForm";
import OptimizationForm from "@/components/OptimizationForm";
// import AddFeatureForm from "@/components/AddFeatureForm"; // 暂时隐藏
import { SimpleUIMicroAdjustmentForm, ProjectAnalysisData } from "@/components/SimpleUIMicroAdjustmentForm";
import { Typewriter } from "@/components/ui/typewriter";
import { PMFeatures } from "@/components/PMFeatures"; 
import { IconSettings, IconPalette, IconArrowBack } from "@tabler/icons-react";

// --- Import necessary functions and types ---
import { generateAllDocuments } from '../lib/prd-generator'; // Import the reusable generator function
// Import types from the central types file
import {
    FlowAnswers,
    GenericAnswers,
    PlannedPagesOutput,
    OptimizationAnswers,
    // AddFeatureAnswers // 暂时隐藏
} from '../types';



// Extend CurrentForm to include new states for Simple UI Micro Adjustment flow
export type CurrentForm = 
  | null 
  | 'product' 
  | 'page' 
  | 'tech' 
  | 'optimizeForm' 
  // | 'addFeatureForm'  // 暂时隐藏
  // | 'addFeatureTech'  // 暂时隐藏
  // | 'addFeaturePage'  // 暂时隐藏
  | 'completed' 
  | 'optimizeCompleted' 
  // | 'addFeatureCompleted' // 暂时隐藏
  | 'optimizeChoice'
  | 'simpleUIMicroAdjustment'
  | 'simpleUIInstructionGenerated'; // 新增状态：显示生成的UI微调指令

export default function Home() {
  // 移除选择模式状态，直接在首页显示三个按钮
  const [currentForm, setCurrentForm] = useState<CurrentForm>(null);
  // State for storing answers from the current flow - uses FlowAnswers from types.ts
  const [flowAnswers, setFlowAnswers] = useState<FlowAnswers>({});
  // Keep Loading and Error states for the generation step
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]); // State to hold generated filenames

  // State for project analysis data for Simple UI form
  const [currentProjectAnalysis, setCurrentProjectAnalysis] = useState<ProjectAnalysisData | null>(null);
  const [isLoadingAnalysisData, setIsLoadingAnalysisData] = useState<boolean>(false);

  // 添加一个状态来保存生成的指令文本
  const [generatedUIInstruction, setGeneratedUIInstruction] = useState<string>("");



  // --- Callbacks for the 'newProduct' flow ---
  const handleProductFormComplete = (answers: GenericAnswers) => {
    console.log("New Product - Definition Answers:", answers);
    setFlowAnswers(prev => ({ ...prev, product: answers }));
    setCurrentForm('page');
  };

  const handlePagePlanningComplete = (plannedPagesData: PlannedPagesOutput) => {
    console.log("New Product - Planned Pages Data:", plannedPagesData);
    setFlowAnswers(prev => ({ ...prev, page: plannedPagesData }));
    setCurrentForm('tech');
  };

  const handleTechFormComplete = (answers: GenericAnswers) => {
    console.log("New Product - Technical Planning Answers:", answers);
    setFlowAnswers(prev => ({ ...prev, tech: answers }));
    setCurrentForm('completed'); // Move to completed state for New Product
  };

  // --- Callback for the 'optimize' flow ---
  const handleOptimizeChoice = async (choice: 'complex' | 'simpleUI') => {
    if (choice === 'complex') {
      setCurrentForm('optimizeForm');
    } else if (choice === 'simpleUI') {
      setIsLoadingAnalysisData(true);
      try {
        // 动态导入JSON数据
        const analysisDataModule = await import('../data/bbx-project-analysis.json');
        setCurrentProjectAnalysis(analysisDataModule.default || analysisDataModule);
        setCurrentForm('simpleUIMicroAdjustment');
      } catch (err) {
        console.error("Error loading project analysis data:", err);
        setError("加载项目分析数据失败，请检查文件是否存在或格式是否正确。");
      } finally {
        setIsLoadingAnalysisData(false);
      }
    }
  };

  const handleSimpleUIComplete = (instruction: string) => {
    console.log("Simple UI Micro Adjustment Instruction:", instruction);
    setFlowAnswers(prev => ({ ...prev, simpleUIInstruction: instruction }));
    // 保存生成的指令文本并转到指令显示页面
    setGeneratedUIInstruction(instruction);
    setCurrentForm('simpleUIInstructionGenerated');
  };

  // Define handleOptimizeFormComplete to fix linter errors and handle optimize flow
  const handleOptimizeFormComplete = (answers: OptimizationAnswers) => {
    console.log("Optimization Form Answers:", answers);
    setFlowAnswers(prev => ({ ...prev, optimize: answers }));
    setCurrentForm('optimizeCompleted');
  };

  // --- Function to generate documents using the refactored logic ---
  const generateDocuments = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedFiles([]); // Clear previous results at the start

    try {
      console.log("Calling generateAllDocuments with flowAnswers:", flowAnswers);
      // Call the reusable generation function from documentGenerator.ts
      const { generatedDocsMap, errors } = await generateAllDocuments(flowAnswers);
      console.log("generateAllDocuments finished. Errors:", errors, "Generated Map:", generatedDocsMap);

      // Update the state based on the results from the reusable function
      const successfullyGeneratedFilenames = Array.from(generatedDocsMap.entries())
        .filter(([, content]) => content !== null) // Filter out entries where generation failed (content is null)
        .map(([filename]) => filename); // Get the filenames of successfully generated docs
      setGeneratedFiles(successfullyGeneratedFilenames);

      // Handle overall errors reported by the generator function
      if (errors.length > 0) {
        setError(errors.join('; \n')); // Join multiple errors if they occurred
      } else if (generatedDocsMap.size === 0) {
        // This case might happen if flowAnswers was empty or no matching doc types were found
        setError("没有可生成的文档（可能未收集到任何有效数据）。");
      } else if (successfullyGeneratedFilenames.length === 0) {
         // This case means tasks ran but all failed (all content was null)
        setError("所有文档生成均失败。请检查 AI 服务或提示词配置。");
      }

      // Optional: Logic to actually write files can be added here or called separately
      // console.log("Simulating file writing for:", successfullyGeneratedFilenames);
      // const writeTasks = successfullyGeneratedFilenames.map(async (filename) => {
      //    const content = generatedDocsMap.get(filename);
      //    if (content) {
      //       // await YourFileWriteFunction(filename, content);
      //       console.log(` -> Simulated write for ${filename}`);
      //    }
      // });
      // await Promise.all(writeTasks);

    } catch (e) {
        // Catch any unexpected errors from the generateAllDocuments function itself
        console.error("Unexpected error during document generation process:", e);
        setError(`文档生成过程中发生意外错误: ${e instanceof Error ? e.message : String(e)}`);
        setGeneratedFiles([]); // Ensure files list is clear on unexpected error
    } finally {
        setIsLoading(false); // Ensure loading state is always turned off
    }
  };

  // Function to determine what content to render in the main area
  const renderContent = () => {
    // --- Render based on the current form state ---
    switch (currentForm) {
      // New Product Flow Forms
      case 'product':
        return <ProductDefinitionForm onComplete={handleProductFormComplete} onCancel={() => setCurrentForm(null)} />;
      case 'page':
        return <PagePlanningForm onCompleteAll={handlePagePlanningComplete} />;
      case 'tech':
        return <TechnicalPlanningForm onComplete={handleTechFormComplete} />;

      // Optimize Flow Form
      case 'optimizeChoice': // New case for optimize choice
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">选择优化类型</h2>
            <p className="mb-6 text-gray-700 text-center">您希望对现有功能/页面进行哪种类型的优化？</p>
            <div className="grid grid-cols-2 gap-6">
              <div
                onClick={() => handleOptimizeChoice('complex')}
                className="flex flex-col p-6 relative group border border-gray-300 rounded-lg hover:border-black transition-all cursor-pointer h-full"
              >
                <div className="opacity-0 group-hover:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-orange-50 to-transparent pointer-events-none rounded-lg" />
                <div className="mb-4 relative z-10 text-orange-500">
                  <IconSettings size={24} />
                </div>
                <div className="text-lg font-bold mb-2 relative z-10 group-hover:text-orange-600 transition-colors">
                  <div className="absolute left-0 top-2 h-0 group-hover:h-5 w-1 rounded-full bg-orange-500 transition-all duration-200 origin-center" />
                  <span className="group-hover:translate-x-2 transition duration-200 inline-block">
                    复杂功能优化
                  </span>
                </div>
                <p className="text-sm text-neutral-600 relative z-10 line-clamp-2 h-10">
                  对现有功能的复杂逻辑和流程进行优化，可能需要修改或添加多个组件或文件
                </p>
              </div>
              <div
                onClick={() => handleOptimizeChoice('simpleUI')}
                className="flex flex-col p-6 relative group border border-gray-300 rounded-lg hover:border-black transition-all cursor-pointer h-full"
              >
                <div className="opacity-0 group-hover:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-orange-50 to-transparent pointer-events-none rounded-lg" />
                <div className="mb-4 relative z-10 text-orange-500">
                  <IconPalette size={24} />
                </div>
                <div className="text-lg font-bold mb-2 relative z-10 group-hover:text-orange-600 transition-colors">
                  <div className="absolute left-0 top-2 h-0 group-hover:h-5 w-1 rounded-full bg-orange-500 transition-all duration-200 origin-center" />
                  <span className="group-hover:translate-x-2 transition duration-200 inline-block">
                    简单UI微调
                  </span>
                </div>
                <p className="text-sm text-neutral-600 relative z-10 line-clamp-2 h-10">
                  对现有页面的UI元素进行简单调整，如颜色、布局、文字等视觉优化
                </p>
              </div>
            </div>

             {/* Back Button */}
            <button onClick={() => setCurrentForm(null)} className="mt-4 w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-md shadow hover:bg-gray-700">返回首页</button>
          </div>
        );

      case 'optimizeForm':
        return <OptimizationForm onComplete={handleOptimizeFormComplete} onCancel={() => setCurrentForm(null)} />;

      // Add Feature Flow Forms
      // case 'addFeatureForm':
      //     return <AddFeatureForm onComplete={handleAddFeatureFormComplete} onCancel={resetToHome} />;
      // case 'addFeatureTech':
      //     return <TechnicalPlanningForm onComplete={handleAddFeatureTechComplete} />;
      // case 'addFeaturePage':
      //     return <PagePlanningForm onCompleteAll={handleAddFeaturePageComplete} />;

      // --- Completion States for Each Flow ---
      case 'completed': // New Product Completion
      case 'optimizeCompleted': // Optimize Completion
      // case 'addFeatureCompleted': // Add Feature Completion
        // Shared Completion UI (can be customized further if needed)
        let title = "规划数据收集完成！";
        let initialMessage = "准备生成规划文档。";
        if (currentForm === 'optimizeCompleted') {
            title = "优化规划数据收集完成！";
            initialMessage = "准备生成优化文档。";
        }

        return (
          <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg text-center">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {/* Show initial message only if not loading, no errors, and no files generated yet */}
            {generatedFiles.length === 0 && !isLoading && !error && (
                <p className="mb-4">{initialMessage}</p>
            )}
            {/* Generate Button */}
            <button
              onClick={generateDocuments}
              disabled={isLoading}
              className={`w-full mb-4 py-2 px-4 font-semibold rounded-md shadow ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
            >
              {isLoading ? '正在生成...' : '生成文档'}
            </button>
             {/* Loading Indicator */}
             {isLoading && <p>正在生成文档...</p>}
             {/* Error Message */}
             {error && <p className="text-red-500 mt-2">错误: {error}</p>}
             {/* Generated Files List */} 
             {generatedFiles.length > 0 && !isLoading && (
                <div className="mt-4 text-left">
                    <h3 className="text-lg font-semibold">已生成文档 (待写入文件):</h3>
                    <ul className="list-disc list-inside">
                        {generatedFiles.map(file => <li key={file}>{file}</li>)}
                    </ul>
                </div>
             )}
             {/* Back Button */}
            <button onClick={() => setCurrentForm(null)} className="mt-4 w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-md shadow hover:bg-gray-700">返回首页</button>
          </div>
        );

      case 'simpleUIMicroAdjustment': // New case for Simple UI form
        if (isLoadingAnalysisData) {
          return <p className="text-center">正在加载项目分析数据...</p>;
        }
        if (!currentProjectAnalysis) {
          // This case should ideally be handled by redirecting or showing a more specific error
          // if loading fails in handleOptimizeChoice and error state is set.
          return <p className="text-center text-red-500">项目分析数据加载失败或未找到。请返回重试。</p>;
        }
        return <SimpleUIMicroAdjustmentForm 
                  projectAnalysisData={currentProjectAnalysis} 
                  onSubmit={handleSimpleUIComplete} 
                  onCancel={() => setCurrentForm(null)} 
               />;

      case 'simpleUIInstructionGenerated': // 新增：UI微调指令生成结果页面
        return (
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            <h2 className="text-xl font-bold mb-6 text-center">UI微调操作指令已生成</h2>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
              <h3 className="text-lg font-medium text-orange-700 mb-2">如何使用这份指令？</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>复制下方的<strong>完整指令文本</strong></li>
                <li>打开 Cursor 或其他支持 AI 编码的 IDE</li>
                <li>将指令粘贴给 AI 助手</li>
                <li>如果有目标元素的截图，一并提供给 AI 助手</li>
                <li>查看 AI 助手提供的代码修改建议</li>
                <li>根据需要与 AI 助手进行沟通与调整</li>
              </ol>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 py-2 px-4 flex justify-between items-center border-b border-gray-200">
                <span className="font-medium text-gray-700">AI编码助手操作指令</span>
                <button
                  onClick={copyInstructionToClipboard}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  复制
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96 p-4 font-mono bg-white">
                {generatedUIInstruction}
              </pre>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
              <h3 className="text-lg font-medium text-blue-700 mb-2">提示</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>指令中已包含必要的上下文信息，如页面、区域和技术栈等</li>
                <li>如果 AI 回复不够精确，可以提供更多细节，如元素的具体CSS类名</li>
                <li>截图是提高沟通效率的最有效方式之一</li>
                <li>代码修改可能需要反复调整，请耐心与 AI 助手沟通</li>
              </ul>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentForm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 flex items-center"
              >
                <IconArrowBack size={16} className="mr-1" />
                返回首页
              </button>
              <button
                onClick={copyInstructionToClipboard}
                className="px-4 py-2 bg-orange-500 text-white rounded-md shadow-sm hover:bg-orange-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                复制完整指令
              </button>
            </div>
          </div>
        );

      default:
        // 初始状态：使用PMFeatures组件展示选项，移除副标题
        return (
          <div className="max-w-4xl mx-auto">
            <PMFeatures />
          </div>
        );
    }
  };

  // 添加复制到剪贴板的处理函数
  const copyInstructionToClipboard = () => {
    navigator.clipboard.writeText(generatedUIInstruction)
      .then(() => alert("操作指令已复制到剪贴板"))
      .catch(err => console.error("复制失败:", err));
  };

  // --- Main JSX Structure ---
  return (
    <div className="min-h-screen p-8 pb-20 gap-8 sm:p-12 font-[family-name:var(--font-geist-sans)] flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {/* Header with Custom Title */}
          <header className="w-full max-w-6xl mx-auto text-center mb-10">
            {currentForm ? (
              <div className="text-3xl font-semibold mb-4 text-black">认真回答所有问题</div>
            ) : (
              <div className="flex justify-center items-baseline gap-2 text-4xl font-semibold">
                <span>我们会</span>
                <span className="text-4xl">🌞</span>
                <span className="text-orange-500">
                  <Typewriter
                    text={["写 PRD", "画原型", "做设计", "那么多，还要会写代码", "那么多，还要会做测试", "那么多，开发肯定不会", "那么多，最会的当然还是做产品"]}
                    speed={80}
                    loop={true}
                    waitTime={2000}
                    className="inline-block"
                  />
                </span>
              </div>
            )}
            {currentForm && (
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                {getSubtitle(currentForm)}
              </p>
            )}
          </header>

          {/* Main Content Area - Central content */} 
          <div className="w-full flex justify-center items-start relative">
            {/* Content Area for Forms or Selection Buttons - Always centered */}
            <main className="flex flex-col items-center justify-start w-full max-w-4xl">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>

      {/* Footer - 固定在底部 */}
      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 w-full py-4">
        © {new Date().getFullYear()} PM.DEV
      </footer>
    </div>
  );
}

// Function to get the appropriate subtitle based on the current state
function getSubtitle(currentForm: CurrentForm) {
  switch(currentForm) {
      // New Product Flow Titles
      case 'product': return '开发新产品 - 步骤 1: 产品定义';
      case 'page': return '开发新产品 - 步骤 2: 页面规划';
      case 'tech': return '开发新产品 - 步骤 3: 技术规划';
      case 'completed': return '新产品规划数据收集完成';
      // Optimize Flow Titles
      case 'optimizeForm': return '优化功能 - 定义问题与目标';
      case 'optimizeCompleted': return '优化规划数据收集完成';
      // Add Feature Flow Titles
      // case 'addFeatureForm': return '添加新功能 - 步骤 1: 定义功能与目标';
      // case 'addFeatureTech': return '添加新功能 - 步骤 2: 技术规划 (针对新功能)';
      // case 'addFeaturePage': return '添加新功能 - 步骤 3: 页面规划 (针对新功能)';
      // case 'addFeatureCompleted': return '新功能规划数据收集完成';
      // Default Title
      default: return '';
  }
}