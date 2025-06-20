'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, CircleDotDashed, Clock, Loader2, Eye, Copy, FileText, CheckCircle } from 'lucide-react'

// 类型定义
export interface ResearchSubtask {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  tools?: string[]; // MCP 工具或其他工具
}

export interface ResearchTask {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  level: number;
  dependencies: string[];
  subtasks: ResearchSubtask[];
}

export interface ResearchPlanProps {
  tasks: ResearchTask[];
  expandedTaskIds?: string[];
  onTaskExpand?: (taskId: string) => void;
  showReport?: boolean;
  reportContent?: string;
  onReportView?: () => void;
  className?: string;
  enableProgressiveDisplay?: boolean; // 是否启用渐进式显示
  currentStep?: string; // 当前执行的步骤
  isActive?: boolean; // 是否正在执行
}

// 获取状态图标
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-gray-900" />
    case 'in-progress':
      return <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
    case 'pending':
      return <Clock className="h-4 w-4 text-gray-400" />
    default:
      return <Circle className="h-4 w-4 text-gray-400" />
  }
}

// 获取子任务状态图标
const getSubtaskStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <div className="h-3.5 w-3.5 rounded-full bg-gray-900 flex items-center justify-center">
          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )
    case 'in-progress':
      return <CircleDotDashed className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
    case 'pending':
      return <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
    default:
      return <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
  }
}

// 获取状态样式
const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return "bg-gray-100 text-gray-800"
    case 'in-progress':
      return "bg-orange-100 text-orange-700"
    case 'pending':
      return "bg-gray-50 text-gray-500"
    default:
      return "bg-gray-50 text-gray-500"
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'in-progress': return '进行中'
    case 'pending': return '待处理'
    default: return '未知'
  }
}

// 报告预览模态框组件
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
}

function ReportModal({ isOpen, onClose, content, title = "研究报告" }: ReportModalProps) {
  const [copySuccess, setCopySuccess] = useState(false)

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">基于AI研究助手的完整分析报告</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyReport}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copySuccess ? '已复制!' : '复制报告'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="prose prose-sm max-w-none leading-relaxed">
            {content.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0 border-b-2 border-gray-200 pb-3">{line.substring(2)}</h1>
              } else if (line.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold text-gray-800 mb-4 mt-8 border-b border-gray-200 pb-2">{line.substring(3)}</h2>
              } else if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold text-gray-700 mb-3 mt-6">{line.substring(4)}</h3>
              } else if (line.startsWith('#### ')) {
                return <h4 key={index} className="text-lg font-medium text-gray-700 mb-2 mt-4">{line.substring(5)}</h4>
              } else if (line.startsWith('- **')) {
                const match = line.match(/- \*\*(.*?)\*\*[：:](.*)/)
                if (match) {
                  return (
                    <div key={index} className="mb-3 pl-4 border-l-4 border-blue-300 bg-blue-50 p-3 rounded-r-lg">
                      <span className="font-bold text-blue-900 text-base">{match[1]}：</span>
                      <span className="text-gray-700">{match[2]}</span>
                    </div>
                  )
                }
                return <p key={index} className="mb-2 text-gray-700">{line}</p>
              } else if (line.startsWith('- ')) {
                return <li key={index} className="mb-2 text-gray-700 ml-4 list-disc">{line.substring(2)}</li>
              } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
                return <p key={index} className="font-bold text-gray-900 mb-3 mt-6 text-xl bg-gray-100 p-3 rounded-lg">{line.slice(2, -2)}</p>
              } else if (line.match(/^\d+\.\s/)) {
                return <li key={index} className="mb-2 text-gray-700 ml-4 list-decimal font-medium">{line.replace(/^\d+\.\s/, '')}</li>
              } else if (line.trim() === '---') {
                return <hr key={index} className="my-8 border-gray-300 border-t-2" />
              } else if (line.trim() === '') {
                return <div key={index} className="mb-3"></div>
              } else if (line.includes('http://') || line.includes('https://')) {
                // 处理包含链接的行
                const parts = line.split(/(https?:\/\/[^\s]+)/g);
                return (
                  <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                    {parts.map((part, partIndex) => {
                      if (part.match(/^https?:\/\//)) {
                        return (
                          <a 
                            key={partIndex} 
                            href={part} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            {part}
                          </a>
                        );
                      }
                      return part;
                    })}
                  </p>
                );
              } else if (line.includes('*') && !line.startsWith('*')) {
                // 处理行内加粗文本
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                    {parts.map((part, partIndex) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIndex} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              } else {
                return <p key={index} className="mb-3 text-gray-700 leading-relaxed">{line}</p>
              }
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// 渐进式显示逻辑
const getProgressivelyVisibleTasks = (tasks: ResearchTask[]) => {
  if (!tasks || tasks.length === 0) return [];
  
  // 收集已完成和进行中的任务
  const visibleTasks = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (task.status === 'completed' || task.status === 'in-progress') {
      visibleTasks.push(task);
    }
  }
  
  // 如果没有进行中的任务但有已完成的任务，至少显示所有已完成的
  if (visibleTasks.length === 0 && tasks.some(t => t.status === 'completed')) {
    return tasks.filter(t => t.status === 'completed');
  }
  
  return visibleTasks;
};

// 获取任务的可见子任务（渐进式显示）
const getProgressivelyVisibleSubtasks = (task: ResearchTask) => {
  if (!task.subtasks || task.subtasks.length === 0) return [];
  
  // 如果任务已完成，显示所有子任务
  if (task.status === 'completed') {
    return task.subtasks;
  }
  
  // 如果任务进行中，只显示已完成的和第一个进行中的子任务
  if (task.status === 'in-progress') {
    let lastCompletedIndex = -1;
    let currentInProgressIndex = -1;
    
    for (let i = 0; i < task.subtasks.length; i++) {
      if (task.subtasks[i].status === 'completed') {
        lastCompletedIndex = i;
      } else if (task.subtasks[i].status === 'in-progress' && currentInProgressIndex === -1) {
        currentInProgressIndex = i;
        break;
      }
    }
    
    // 如果有进行中的子任务，显示到该子任务
    if (currentInProgressIndex !== -1) {
      return task.subtasks.slice(0, currentInProgressIndex + 1);
    }
    
    // 如果没有进行中的子任务，显示到最后一个已完成的子任务+1个
    if (lastCompletedIndex !== -1) {
      return task.subtasks.slice(0, Math.min(lastCompletedIndex + 2, task.subtasks.length));
    }
    
    // 如果都没有，至少显示第一个子任务
    return task.subtasks.slice(0, 1);
  }
  
  // 如果任务待处理，不显示任何子任务
  return [];
};

// 判断任务是否应该被标记为完成
const shouldTaskBeCompleted = (taskStepKey: string, currentStep: string): boolean => {
  const stepOrder = ['research-planning', 'information-gathering', 'content-enhancement', 'deep-analysis', 'report-generation'];
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const taskStepIndex = stepOrder.indexOf(taskStepKey);
  
  // 如果当前步骤在任务步骤之后，则任务应该完成
  return currentStepIndex > taskStepIndex && taskStepIndex !== -1 && currentStepIndex !== -1;
};

// 主组件
export default function ResearchPlan({ 
  tasks, 
  expandedTaskIds = [], 
  onTaskExpand,
  showReport = false,
  reportContent = "",
  onReportView,
  className = "",
  enableProgressiveDisplay = true, // 默认启用渐进式显示
  currentStep,
  isActive = false
}: ResearchPlanProps) {
  const [localExpandedTasks, setLocalExpandedTasks] = useState<string[]>(expandedTaskIds)
  // 默认展开所有子任务
  const [expandedSubtasks, setExpandedSubtasks] = useState<{[key: string]: boolean}>({})
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // 🔥 关键修复：根据currentStep动态调整任务状态和子任务状态
  const adjustedTasks = currentStep ? tasks.map(task => {
    // 步骤映射
    const stepMapping: { [key: string]: string } = {
      '1': 'research-planning',
      '2': 'information-gathering', 
      '3': 'content-enhancement',
      '4': 'deep-analysis',
      '5': 'report-generation'
    };
    
    const taskStepKey = stepMapping[task.id];
    let taskStatus: 'completed' | 'in-progress' | 'pending';
    
    // 🔥 特殊处理：如果有报告完成的标识，所有任务都应该完成
    const hasReportCompleted = isActive === false || showReport === true || reportContent;
    
    if (hasReportCompleted) {
      taskStatus = 'completed';
    } else if (taskStepKey === currentStep) {
      // 当前执行的任务设为进行中
      taskStatus = 'in-progress';
    } else if (taskStepKey && shouldTaskBeCompleted(taskStepKey, currentStep)) {
      // 已经完成的任务设为完成
      taskStatus = 'completed';
    } else {
      // 未开始的任务设为待处理
      taskStatus = 'pending';
    }
    
         // 🔥 同时调整子任务状态
     const adjustedSubtasks = task.subtasks.map((subtask, subtaskIndex) => {
       if (hasReportCompleted) {
         // 如果整个研究完成，所有子任务都完成
         return { ...subtask, status: 'completed' as const };
       } else if (taskStatus === 'completed') {
         // 如果任务完成，所有子任务都完成
         return { ...subtask, status: 'completed' as const };
       } else if (taskStatus === 'in-progress') {
         // 如果任务进行中，使用更智能的子任务状态分配
         const totalSubtasks = task.subtasks.length;
         
         // 如果有子任务已经是completed状态，保持它们
         if (subtask.status === 'completed') {
           return subtask;
         }
         
         // 如果有子任务已经是in-progress状态，保持它们
         if (subtask.status === 'in-progress') {
           return subtask;
         }
         
         // 对于没有明确状态的子任务，使用顺序逻辑
         // 前面的子任务设为completed，最后一个或两个设为in-progress
         if (subtaskIndex < totalSubtasks - 2) {
           return { ...subtask, status: 'completed' as const };
         } else if (subtaskIndex === totalSubtasks - 1) {
           return { ...subtask, status: 'in-progress' as const };
         } else {
           return { ...subtask, status: 'in-progress' as const };
         }
       } else {
         // 如果任务待处理，所有子任务都待处理
         return { ...subtask, status: 'pending' as const };
       }
     });
    
    return { 
      ...task, 
      status: taskStatus,
      subtasks: adjustedSubtasks
    };
  }) : tasks;
  
  // 调试信息
  console.log('ResearchPlan 渲染参数:', { 
    currentStep, 
    isActive, 
    showReport,
    tasksCount: tasks.length,
    hasReportCompleted: isActive === false || showReport === true,
    originalTasks: tasks.map(t => ({ 
      id: t.id, 
      title: t.title, 
      status: t.status,
      subtaskStatuses: t.subtasks.map(st => st.status)
    })),
    adjustedTasks: adjustedTasks.map(t => ({ 
      id: t.id, 
      title: t.title, 
      status: t.status,
      subtaskStatuses: t.subtasks.map(st => st.status)
    }))
  });
  
  // 应用渐进式显示逻辑（可选）
  const visibleTasks = enableProgressiveDisplay ? getProgressivelyVisibleTasks(adjustedTasks) : adjustedTasks

  const toggleTaskExpansion = (taskId: string) => {
    if (onTaskExpand) {
      onTaskExpand(taskId)
    } else {
      setLocalExpandedTasks((prev) =>
        prev.includes(taskId)
          ? prev.filter((id) => id !== taskId)
          : [...prev, taskId]
      )
    }
  }

  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    // 报告完成的子任务始终保持展开
    if (subtaskId === 'report-generation-complete') return;
    
    const key = `${taskId}-${subtaskId}`
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const effectiveExpandedTasks = onTaskExpand ? expandedTaskIds : localExpandedTasks

  const handleReportView = () => {
    if (onReportView) {
      onReportView()
    } else {
      setIsReportModalOpen(true)
    }
  }

  return (
    <>
      <div className={`bg-background text-foreground h-full overflow-auto p-2 ${className}`}>
        <div className="bg-card rounded-lg overflow-hidden">
          <div className="p-4 overflow-hidden">
            <ul className="space-y-1 overflow-hidden">
              {visibleTasks.map((task, index) => {
                const isExpanded = effectiveExpandedTasks.includes(task.id)
                const visibleSubtasks = enableProgressiveDisplay ? getProgressivelyVisibleSubtasks(task) : task.subtasks

                return (
                  <li key={task.id} className={`${index !== 0 ? "mt-1 pt-2" : ""}`}>
                    {/* Task row */}
                    <div className="group flex items-center px-3 py-1.5 rounded-md hover:bg-muted/50">
                      <div className="mr-2 flex-shrink-0">
                        {getStatusIcon(task.status)}
                      </div>

                      <div
                        className="flex min-w-0 flex-grow cursor-pointer items-center justify-between"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        <div className="mr-2 flex-1 truncate">
                          <span className={`${
                            task.status === "completed" 
                              ? "text-gray-900 font-medium" 
                              : task.status === "in-progress" 
                                ? "text-orange-600 font-medium" 
                                : "text-gray-600"
                          }`}>
                            {task.title}
                          </span>
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                          <span className={`rounded px-1.5 py-0.5 ${getStatusBadgeStyle(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subtasks */}
                    {isExpanded && visibleSubtasks.length > 0 && (
                      <div className="relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-muted-foreground/30" />
                        <ul className="border-muted mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                          {visibleSubtasks.map((subtask: ResearchSubtask) => {
                            const subtaskKey = `${task.id}-${subtask.id}`
                            // 报告完成的子任务始终展开，其他默认展开
                            const isSubtaskExpanded = subtask.id === 'report-generation-complete' 
                              ? true 
                              : expandedSubtasks[subtaskKey] !== false

                            return (
                              <li
                                key={subtask.id}
                                className="group flex flex-col py-0.5 pl-6"
                                onClick={() => toggleSubtaskExpansion(task.id, subtask.id)}
                              >
                                <div className="flex flex-1 items-center rounded-md p-1 hover:bg-muted/30 cursor-pointer">
                                  <div className="mr-2 flex-shrink-0">
                                    {getSubtaskStatusIcon(subtask.status)}
                                  </div>

                                  <span className={`text-sm ${
                                    subtask.status === "completed" 
                                      ? "text-gray-900" 
                                      : subtask.status === "in-progress" 
                                        ? "text-orange-600 font-medium" 
                                        : "text-gray-600"
                                  }`}>
                                    {subtask.title}
                                  </span>
                                </div>

                                {isSubtaskExpanded && (
                                  <div className="text-muted-foreground border-foreground/20 mt-1 ml-1.5 border-l border-dashed pl-5 text-xs overflow-hidden">
                                    <p className="py-1">{subtask.description}</p>
                                    {subtask.tools && subtask.tools.length > 0 && (
                                      <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1.5">
                                        <span className="text-muted-foreground font-medium">
                                          工具组件:
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                          {subtask.tools.map((tool: string, idx: number) => (
                                            <span
                                              key={idx}
                                              className="bg-secondary/40 text-secondary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium shadow-sm"
                                            >
                                              {tool}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* 如果是报告生成完成的子任务，显示报告预览卡片 */}
                                    {subtask.id === 'report-generation-complete' && subtask.status === 'completed' && showReport && reportContent && (
                                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center gap-2 mb-3">
                                          <CheckCircle className="h-5 w-5 text-green-500" />
                                          <span className="font-medium text-green-700">研究报告已完成</span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-3">
                                          PM.DEV 已经完成所有工作，请查收附件。
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                              <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                              <div className="font-medium text-sm">research_report.md</div>
                                              <div className="text-xs text-gray-500">
                                                {reportContent.length > 1000 
                                                  ? `${Math.round(reportContent.length / 1000)} KB` 
                                                  : `${reportContent.length} B`} • 研究报告
                                              </div>
                                            </div>
                                          </div>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleReportView()
                                            }}
                                            className="h-8 w-8 p-0"
                                            title="预览报告"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* 底部报告预览按钮 - 只在没有报告完成子任务时显示 */}
      {showReport && reportContent && !tasks.some(task => 
        task.subtasks.some(subtask => subtask.id === 'report-generation-complete')
      ) && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleReportView} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            预览研究报告
          </Button>
        </div>
      )}

      {/* 报告模态框 */}
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        content={reportContent}
      />
    </>
  )
} 