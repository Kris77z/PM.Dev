'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle, Download, Copy } from 'lucide-react';
import { 
  Expandable, 
  ExpandableCard, 
  ExpandableContent, 
  ExpandableCardHeader,
  ExpandableCardContent, 
  ExpandableCardFooter,
  ExpandableTrigger 
} from "@/components/ui/expandable";
import { Button } from "@/components/ui/button";
import { TextShimmer } from '@/components/ui/text-shimmer';
import { AlertSuccess, AlertError } from '@/components/ui/alert';
import { PRDQuestionInput } from './PRDQuestionInput';
import { usePRDAI } from '@/hooks/usePRDAI';
import { usePRDState } from '@/hooks/usePRDState';
import { prdTemplate as chapters } from '@/data/prd-template';

export default function PRDHouseViewRefactored() {
  // 使用自定义hooks
  const {
    handleAIAction: handleAIActionHook,
    isAILoading,
    reviewResult,
    generatedPRD
  } = usePRDAI();

  const {
    currentChapterIndex,
    setCurrentChapterIndex,
    answers,
    handleAnswerChange,
    workflowStage,
    setWorkflowStage,
    viewMode,
    setViewMode,
    changeRecords,
    handleChangeRecordAction,
    userScenarios,
    handleUserScenarioAction,
    setUserScenarios,
    iterationHistory,
    handleIterationHistoryAction,
    competitors,
    handleCompetitorAction,
    setCompetitors,
    requirementSolution,
    handleRequirementSolutionAction,
    resetAllState
  } = usePRDState();

  // 本地状态
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [hasReviewed, setHasReviewed] = useState(false);

  // 计算当前章节和完成状态
  const currentChapter = chapters[currentChapterIndex];
  const isLastChapter = currentChapterIndex === chapters.length - 1;

  // 检查完成状态的逻辑
  const isCurrentChapterComplete = () => {
    return currentChapter?.questions.every(question => {
      if (question.isRequired) {
        return answers[question.id] && answers[question.id].trim().length > 0;
      }
      return true;
    }) ?? false;
  };

  // 检查特定章节是否完成
  const isChapterComplete = (chapterIndex: number) => {
    const chapter = chapters[chapterIndex];
    return chapter?.questions.every(question => {
      if (question.isRequired) {
        return answers[question.id] && answers[question.id].trim().length > 0;
      }
      return true;
    }) ?? false;
  };

  const isComplete = isCurrentChapterComplete();

  const handleStartClick = () => {
    setShowStartScreen(false);
    setShowChapters(true);
    setWorkflowStage('guiding');
    setViewMode('single');
  };



  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertState({ type, message });
    setTimeout(() => setAlertState({ type: null, message: '' }), 3000);
  };

  const handleAIAction = async (actionType: string, questionId?: string) => {
    try {
      const success = await handleAIActionHook(actionType, questionId, {
        answers,
        userScenarios,
        competitors,
        changeRecords,
        iterationHistory,
        requirementSolution,
        handleAnswerChange,
        handleUserScenarioAction,
        handleCompetitorAction,
        handleChangeRecordAction,
        handleIterationHistoryAction,
        handleRequirementSolutionAction,
        setUserScenarios,
        setCompetitors
      });

      if (success) {
        showAlert('success', getSuccessMessage(actionType));
      }
    } catch (error) {
      console.error('AI操作失败:', error);
      showAlert('error', `AI操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const getSuccessMessage = (actionType: string) => {
    switch (actionType) {
      case 'expand-user-scenarios': return '用户场景扩展成功！';
      case 'competitor-analysis': return '竞品分析生成成功！';
      case 'review-content': return '内容审查完成！';
      case 'generate-prd': return 'PRD文档生成成功！';
      default: return 'AI建议生成成功！';
    }
  };

  const handleContentReview = async () => {
    try {
      setWorkflowStage('ai-review');
      await handleAIAction('review-content');
      setHasReviewed(true);
    } catch (error) {
      console.error('内容审查失败:', error);
      showAlert('error', '内容审查失败，请重试');
    }
  };

  const handleGeneratePRD = async () => {
    try {
      setWorkflowStage('prd-generation');
      const success = await handleAIActionHook('generate-prd', undefined, {
        answers,
        userScenarios,
        competitors,
        changeRecords,
        iterationHistory,
        requirementSolution,
        handleAnswerChange,
        handleUserScenarioAction,
        handleCompetitorAction,
        handleChangeRecordAction,
        handleIterationHistoryAction,
        handleRequirementSolutionAction,
        setUserScenarios,
        setCompetitors
      });
      
      if (success) {
        setWorkflowStage('completed');
        showAlert('success', 'PRD文档生成成功！');
      }
    } catch (error) {
      setWorkflowStage('ai-review');
      console.error('PRD生成失败:', error);
      showAlert('error', 'PRD生成失败，请重试');
    }
  };

  const handleBackToModify = () => {
    setWorkflowStage('guiding');
    setViewMode('overview');
  };

  const handleSelectChapter = (chapterIndex: number) => {
    setCurrentChapterIndex(chapterIndex);
    setViewMode('single');
  };

  const copyGeneratedPRD = () => {
    if (generatedPRD) {
      navigator.clipboard.writeText(generatedPRD);
      showAlert('success', 'PRD已复制到剪贴板');
    }
  };

  const downloadGeneratedPRD = () => {
    if (generatedPRD) {
      const blob = new Blob([generatedPRD], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'PRD文档.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showAlert('success', 'PRD文档下载成功');
    }
  };

  const handleRestart = () => {
    // 重置所有状态回到最开始
    setWorkflowStage('welcome');
    setShowStartScreen(true);
    setShowChapters(false);
    setCurrentChapterIndex(0);
    setViewMode('single');
    setHasReviewed(false);
    // 清空所有填写的数据
    resetAllState();
  };

  // 渲染章节卡片
  const renderChapterCards = () => {
    // 安全检查
    if (!currentChapter) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">加载中...</p>
        </div>
      );
    }

    if (viewMode === 'overview') {
      return (
        <div className="space-y-8 animate-card-appear">
          {/* 标题和说明 */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold text-gray-800">选择要修改的部分</h1>
            <p className="text-gray-600">点击任意卡片进入编辑模式</p>
          </div>

          {/* 横向布局：所有卡片依次排列 */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {chapters.map((chapter, index) => {
              const chapterComplete = isChapterComplete(index);
              return (
                <div
                  key={chapter.id}
                  onClick={() => handleSelectChapter(index)}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <Expandable defaultExpanded={false}>
                    <ExpandableCard 
                      collapsedSize={{ width: 700, height: 120 }} 
                      className="mx-auto"
                      hoverToExpand={false}
                    >
                      <ExpandableCardHeader className="py-6 h-full">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">{chapter.title}</h3>
                            <p className="text-sm text-gray-500">{chapter.description}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {chapterComplete ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                        </div>
                      </ExpandableCardHeader>
                    </ExpandableCard>
                  </Expandable>
                </div>
              );
            })}
          </div>

          {/* 重新进行AI审查按钮 */}
          <div className="flex justify-center pt-8">
            <Button
              onClick={handleContentReview}
              disabled={Object.values(isAILoading).some(Boolean)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              重新进行AI审查
            </Button>
          </div>
        </div>
      );
    }

    // 单个卡片视图
    return (
      <div className="w-full max-w-4xl mx-auto py-12 flex flex-col items-center justify-center animate-card-appear" style={{ minHeight: '80vh' }}>
        {/* 步骤指示器 */}
        <div className="mb-12 w-full max-w-2xl space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentChapterIndex + 1) / chapters.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm font-medium text-center text-gray-600">
            步骤 {currentChapterIndex + 1} / {chapters.length}
          </div>
        </div>
      
        <div className="w-full flex justify-center">
          <Expandable 
            key={currentChapter.id} 
            expandDirection="both"
            expandBehavior="push"
            defaultExpanded={currentChapterIndex !== 0}
          >
            <ExpandableCard 
              collapsedSize={{ width: 480, height: 140 }} 
              expandedSize={{ width: 800, height: undefined }} 
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
                      <h2 className="text-lg font-semibold text-gray-800">{currentChapter.title}</h2>
                      <p className="text-sm text-gray-500">{currentChapter.description}</p>
                    </div>
                  </div>
                </ExpandableCardHeader>
              </ExpandableTrigger>
              
              <ExpandableContent preset="fade" stagger staggerChildren={0.1}>
                <ExpandableCardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="pt-4 pb-2">
                    <div className="grid grid-cols-2 gap-6 pr-2">
                      {currentChapter.questions.map(question => (
                        <div key={question.id} className={question.gridColumn || 'col-span-1'}>
                          <PRDQuestionInput
                            question={question}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            isAILoading={isAILoading}
                            onAIAction={handleAIAction}
                            changeRecords={changeRecords}
                            onChangeRecordAction={handleChangeRecordAction}
                            userScenarios={userScenarios}
                            onUserScenarioAction={handleUserScenarioAction}
                            iterationHistory={iterationHistory}
                            onIterationHistoryAction={handleIterationHistoryAction}
                            competitors={competitors}
                            onCompetitorAction={handleCompetitorAction}
                            requirementSolution={requirementSolution}
                            onRequirementSolutionAction={handleRequirementSolutionAction}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </ExpandableCardContent>
                
                <ExpandableCardFooter>
                  <div className="flex items-center justify-between w-full pt-4">
                    <Button 
                      variant="outline" 
                      className="border-gray-300" 
                      onClick={handlePreviousChapter} 
                      disabled={currentChapterIndex === 0}
                    >
                      上一步
                    </Button>
                    
                    {isLastChapter ? (
                      <div className="flex-1 mx-4 flex justify-end">
                        {!hasReviewed ? (
                          <Button
                            onClick={handleContentReview}
                            disabled={Object.values(isAILoading).some(Boolean)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            AI内容审查
                          </Button>
                        ) : (
                          <div className="flex gap-3">
                            <Button 
                              onClick={handleContentReview}
                              disabled={Object.values(isAILoading).some(Boolean)}
                              variant="outline" 
                              className="px-6 py-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              重新审查
                            </Button>
                            <Button 
                              onClick={() => setWorkflowStage('ai-review')}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              查看结果
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button 
                        className="bg-orange-500 hover:bg-orange-600" 
                        onClick={handleNextChapter} 
                        disabled={!isComplete}
                      >
                        下一步
                      </Button>
                    )}
                  </div>
                </ExpandableCardFooter>
              </ExpandableContent>
            </ExpandableCard>
          </Expandable>
        </div>
      </div>
    );
  };

  // 渲染AI审查视图
  const renderAIReviewView = () => {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl mx-auto">
          <Expandable defaultExpanded={true}>
            <ExpandableCard 
              collapsedSize={{ width: 700, height: 350 }} 
              expandedSize={{ width: 900, height: undefined }} 
              className="mx-auto"
              hoverToExpand={false}
            >
              <ExpandableCardHeader className="py-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">AI内容审查结果</h2>
                    <p className="text-sm text-gray-500">查看详细的评分和改进建议</p>
                  </div>
                </div>
              </ExpandableCardHeader>
              
              <ExpandableContent preset="fade">
                <ExpandableCardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {isAILoading['review-content'] ? (
                    <div className="py-16 px-8 text-center space-y-4">
                      <div className="text-lg">
                        <TextShimmer duration={2}>PM.DEV 正在帮你检查...</TextShimmer>
                      </div>
                    </div>
                  ) : reviewResult ? (
                    <div className="space-y-6 p-6">
                      {/* 内容评分 */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">内容评分</h3>
                        <div className="text-2xl font-bold text-orange-500">
                          {reviewResult.score}/100
                        </div>
                      </div>

                      {/* 总体评价 */}
                      <div>
                        <h4 className="text-base font-medium text-gray-800 mb-2">总体评价</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {reviewResult.summary}
                        </p>
                      </div>

                      {/* 问题清单 */}
                      {reviewResult.issues && reviewResult.issues.length > 0 && (
                        <div>
                          <h4 className="text-base font-medium text-gray-800 mb-3">问题清单</h4>
                          <div className="space-y-3">
                            {reviewResult.issues.map((issue, index) => (
                              <div key={index}>
                                <div className="font-medium text-gray-800">{issue.message}</div>
                                <div className="text-sm text-gray-600 mt-1">{issue.suggestion}</div>
                                <div className="text-xs text-gray-500 mt-1">字段: {issue.field}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 改进建议 */}
                      {reviewResult.recommendations && reviewResult.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-base font-medium text-gray-800 mb-3">改进建议</h4>
                          <div className="space-y-2">
                            {reviewResult.recommendations.map((recommendation, index) => (
                              <p key={index} className="text-gray-700 text-sm leading-relaxed">
                                • {recommendation}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-16 px-8 text-center">
                      <p className="text-gray-500">审查结果将在这里显示</p>
                    </div>
                  )}
                </ExpandableCardContent>
                
                <ExpandableCardFooter>
                  <div className="flex items-center justify-between w-full pt-4">
                    <Button 
                      variant="outline" 
                      className="border-gray-300" 
                      onClick={handleBackToModify}
                    >
                      返回修改
                    </Button>
                    
                    <Button
                      onClick={handleGeneratePRD}
                      disabled={isAILoading['review-content']}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      生成PRD
                    </Button>
                  </div>
                </ExpandableCardFooter>
              </ExpandableContent>
            </ExpandableCard>
          </Expandable>
        </div>
      </div>
    );
  };

  // 渲染PRD生成视图
  const renderPRDGenerationView = () => {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-3xl mx-auto">
          <Expandable defaultExpanded={true}>
            <ExpandableCard 
              collapsedSize={{ width: 600, height: 300 }} 
              expandedSize={{ width: 800, height: undefined }} 
              className="mx-auto"
              hoverToExpand={false}
            >
              <ExpandableCardHeader className="py-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">PRD文档</h2>
                    <p className="text-sm text-gray-500">正在根据您的输入生成专业的产品需求文档</p>
                  </div>
                </div>
              </ExpandableCardHeader>
              
              <ExpandableContent preset="fade">
                <ExpandableCardContent>
                  <div className="py-16 px-8 text-center space-y-4">
                    <div className="text-lg">
                      <TextShimmer duration={2}>PM.DEV 正在给你写 PRD...</TextShimmer>
                    </div>
                  </div>
                </ExpandableCardContent>
              </ExpandableContent>
            </ExpandableCard>
          </Expandable>
        </div>
      </div>
    );
  };

  // 渲染完成视图
  const renderCompletedView = () => {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 flex flex-col items-center justify-center animate-card-appear" style={{ minHeight: '80vh' }}>
        <div className="w-full flex justify-center">
          <Expandable 
            expandDirection="both"
            expandBehavior="push"
            defaultExpanded={true}
          >
            <ExpandableCard 
              collapsedSize={{ width: 480, height: 140 }} 
              expandedSize={{ width: 800, height: undefined }} 
              className="mx-auto"
              hoverToExpand={false}
            >
              <ExpandableTrigger>
                <ExpandableCardHeader className="py-6 cursor-pointer h-full">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-800">生成的PRD文档</h2>
                      <p className="text-sm text-gray-500">您的产品需求文档已生成完成</p>
                    </div>
                  </div>
                </ExpandableCardHeader>
              </ExpandableTrigger>
              
              <ExpandableContent preset="fade" stagger staggerChildren={0.1}>
                <ExpandableCardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="pt-4 pb-2">
                    <div className="pr-2">
                      {generatedPRD ? (
                        <div className="space-y-6">
                          {/* PRD文档内容 */}
                          <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
                            {generatedPRD}
                          </div>
                        </div>
                      ) : (
                        <div className="py-16 px-8 text-center">
                          <p className="text-gray-500">PRD文档内容将在这里显示</p>
                        </div>
                      )}
                    </div>
                  </div>
                </ExpandableCardContent>
                
                <ExpandableCardFooter>
                  <div className="flex items-center justify-between w-full pt-4">
                    <Button 
                      variant="outline" 
                      className="border-gray-300" 
                      onClick={handleRestart}
                    >
                      重新开始
                    </Button>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={copyGeneratedPRD}
                        variant="outline"
                        className="border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-2"
                        disabled={!generatedPRD}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        复制
                      </Button>
                      
                      <Button
                        onClick={downloadGeneratedPRD}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                        disabled={!generatedPRD}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载
                      </Button>
                    </div>
                  </div>
                </ExpandableCardFooter>
              </ExpandableContent>
            </ExpandableCard>
          </Expandable>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl mx-auto">
        
        {/* Alert 提示 - 顶部显示 */}
        {alertState.type && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="pointer-events-auto animate-in fade-in-0 slide-in-from-top-2 duration-300">
              {alertState.type === 'success' ? (
                <AlertSuccess>{alertState.message}</AlertSuccess>
              ) : (
                <AlertError>{alertState.message}</AlertError>
              )}
            </div>
          </div>
        )}
        
        {workflowStage === 'welcome' && showStartScreen && (
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="text-center space-y-12 max-w-2xl">
              <h1 className="text-6xl font-normal text-black">PRD GAME START</h1>
              <div className="flex justify-center">
                <button
                  onClick={handleStartClick}
                  className="btn-class-name"
                >
                  <div className="back"></div>
                  <div className="front"></div>
                </button>
              </div>
            </div>
          </div>
        )}
        

        
        {workflowStage === 'guiding' && showChapters && renderChapterCards()}
        
        {workflowStage === 'ai-review' && renderAIReviewView()}
        
        {workflowStage === 'prd-generation' && renderPRDGenerationView()}
        
        {workflowStage === 'completed' && renderCompletedView()}

        {/* 自定义样式 */}
        <style>{`
          @keyframes card-appear {
            0% { opacity: 0; transform: translateY(30px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-card-appear {
            animation: card-appear 0.6s ease-out forwards;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
          
          .btn-class-name {
            --primary: 249, 115, 22;
            --secondary: 234, 88, 12;
            width: 60px;
            height: 50px;
            border: none;
            outline: none;
            cursor: pointer;
            user-select: none;
            touch-action: manipulation;
            outline: 8px solid rgb(var(--primary), .2);
            border-radius: 50%;
            position: relative;
            transition: .3s;
          }

          .btn-class-name .back {
            background: rgb(var(--secondary));
            border-radius: 50%;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }

          .btn-class-name .front {
            background: linear-gradient(135deg, rgba(var(--primary), .8) 0%, rgba(var(--primary)) 50%, rgba(var(--primary), .9) 100%);
            box-shadow: 0 4px 12px rgba(var(--secondary), .3);
            border-radius: 50%;
            position: absolute;
            border: 1px solid rgba(var(--secondary), .3);
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            transform: translateY(-10%);
            transition: all .2s ease;
          }

          .btn-class-name:active .front {
            transform: translateY(-2%);
            box-shadow: 0 2px 6px rgba(var(--secondary), .2);
          }

          .btn-class-name:hover {
            outline: 8px solid rgb(var(--primary), .4);
          }

          .btn-class-name:hover .front {
            transform: translateY(-12%);
            box-shadow: 0 6px 16px rgba(var(--secondary), .4);
          }
        `}</style>
      </div>
    </div>
  );
} 