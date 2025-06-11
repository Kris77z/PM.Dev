import React from 'react';
import { Loader2, Sparkles, Plus, X } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Question, 
  ChangeRecord, 
  UserScenario, 
  IterationHistory, 
  CompetitorItem, 
  RequirementSolution 
} from '@/types/prd';

interface PRDQuestionInputProps {
  question: Question;
  answers: { [key: string]: string };
  onAnswerChange: (questionId: string, value: string) => void;
  isAILoading: { [key: string]: boolean };
  onAIAction: (actionType: string, questionId?: string) => void;
  
  // 动态组件相关props
  changeRecords?: ChangeRecord[];
  onChangeRecordAction?: (action: 'add' | 'remove' | 'update', index?: number, field?: keyof ChangeRecord, value?: string) => void;
  
  userScenarios?: UserScenario[];
  onUserScenarioAction?: (action: 'add' | 'remove' | 'update', index?: number, field?: keyof UserScenario, value?: string) => void;
  
  iterationHistory?: IterationHistory[];
  onIterationHistoryAction?: (action: 'add' | 'remove' | 'update', index?: number, field?: keyof IterationHistory, value?: string) => void;
  
  competitors?: CompetitorItem[];
  onCompetitorAction?: (action: 'add' | 'remove' | 'update', index?: number, field?: keyof CompetitorItem, value?: string) => void;
  
  requirementSolution?: RequirementSolution;
  onRequirementSolutionAction?: (action: 'add' | 'remove' | 'update' | 'updatePrototype', index?: number, field?: string, value?: string) => void;
}

export function PRDQuestionInput({
  question,
  answers,
  onAnswerChange,
  isAILoading,
  onAIAction,
  changeRecords,
  onChangeRecordAction,
  userScenarios,
  onUserScenarioAction,
  iterationHistory,
  onIterationHistoryAction,
  competitors,
  onCompetitorAction,
  requirementSolution,
  onRequirementSolutionAction
}: PRDQuestionInputProps) {
  // 统一样式类名
  const inputClassName = "border-gray-300";
  const textareaClassName = "border-gray-300";

  // 业务线选择
  if (question.type === 'select') {
    return (
      <div>
        <Label className="block text-md font-medium text-gray-700 mb-2">
          {question.text} {question.isRequired && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex flex-wrap gap-6">
          {question.options?.map((option) => (
            <label key={option} className="flex items-center space-x-3 cursor-pointer">
              <Checkbox 
                id={`${question.id}-${option}`}
                checked={answers[question.id] === option}
                onCheckedChange={() => onAnswerChange(question.id, option)}
                className="border-gray-400"
              />
              <span className="text-base">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // 优先级选择
  if (question.type === 'priority-select') {
    return (
      <div>
        <Label className="block text-md font-medium text-gray-700 mb-2">
          {question.text} {question.isRequired && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex flex-wrap gap-6">
          {['High', 'Middle', 'Low'].map((priority) => (
            <label key={priority} className="flex items-center space-x-3 cursor-pointer">
              <Checkbox 
                checked={answers[question.id] === priority}
                onCheckedChange={() => onAnswerChange(question.id, priority)}
                className="border-gray-400"
              />
              <span className="text-base">{priority}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // 变更记录动态组件
  if (question.id === 'c1_change_records' && changeRecords && onChangeRecordAction) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-md font-medium text-gray-700">变更记录</Label>
          <button
            onClick={() => onChangeRecordAction('add')}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
          >
            <Plus className="h-3 w-3 mr-1" />
            添加记录
          </button>
        </div>
        
        <div className="space-y-4">
          {changeRecords.map((record, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">变更记录 #{index + 1}</h4>
                {changeRecords.length > 1 && (
                  <Button
                    onClick={() => onChangeRecordAction('remove', index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">版本</Label>
                  <Input
                    value={record.version}
                    onChange={(e) => onChangeRecordAction('update', index, 'version', e.target.value)}
                    placeholder="0.1"
                    className={`${inputClassName} text-sm`}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">修订人</Label>
                  <Input
                    value={record.modifier}
                    onChange={(e) => onChangeRecordAction('update', index, 'modifier', e.target.value)}
                    placeholder="@xxx"
                    className={`${inputClassName} text-sm`}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">修订日期</Label>
                  <Input
                    value={record.date}
                    onChange={(e) => onChangeRecordAction('update', index, 'date', e.target.value)}
                    placeholder="2025-06-08"
                    className={`${inputClassName} text-sm`}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">修订原因</Label>
                  <Input
                    value={record.reason}
                    onChange={(e) => onChangeRecordAction('update', index, 'reason', e.target.value)}
                    placeholder="功能优化"
                    className={`${inputClassName} text-sm`}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600 mb-1 block">修订内容</Label>
                  <Textarea
                    value={record.content}
                    onChange={(e) => onChangeRecordAction('update', index, 'content', e.target.value)}
                    rows={2}
                    placeholder="描述本次修订的具体内容..."
                    className={`${textareaClassName} text-sm`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 用户场景动态组件
  if (question.type === 'dynamic-user-scenarios' && userScenarios && onUserScenarioAction) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-md font-medium text-gray-700">用户使用场景</Label>
          <div className="flex gap-1">
            <button
              onClick={() => onAIAction('expand-user-scenarios')}
              disabled={isAILoading['expand-user-scenarios']}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
            >
              {isAILoading['expand-user-scenarios'] ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              AI扩展
            </button>
            <button
              onClick={() => onUserScenarioAction('add')}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
            >
              <Plus className="h-3 w-3 mr-1" />
              添加用户
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {userScenarios.map((scenario, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">用户场景 #{index + 1}</h4>
                {userScenarios.length > 1 && (
                  <Button
                    onClick={() => onUserScenarioAction('remove', index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">用户类型</Label>
                  <Input
                    value={scenario.userType}
                    onChange={(e) => onUserScenarioAction('update', index, 'userType', e.target.value)}
                    placeholder="如：新用户、活跃用户、企业用户..."
                    className={`${inputClassName} text-sm`}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">使用场景</Label>
                  <Textarea
                    value={scenario.scenario}
                    onChange={(e) => onUserScenarioAction('update', index, 'scenario', e.target.value)}
                    rows={2}
                    placeholder="详细描述用户在什么情况下会使用这个功能..."
                    className={`${textareaClassName} text-sm`}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">痛点分析</Label>
                  <Textarea
                    value={scenario.painPoint}
                    onChange={(e) => onUserScenarioAction('update', index, 'painPoint', e.target.value)}
                    rows={2}
                    placeholder="用户在当前情况下遇到的问题和困难..."
                    className={`${textareaClassName} text-sm`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 功能迭代历史动态组件
  if (question.type === 'dynamic-iteration-history' && iterationHistory && onIterationHistoryAction) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-md font-medium text-gray-700">功能迭代历史</Label>
          <button
            onClick={() => onIterationHistoryAction('add')}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
          >
            <Plus className="h-3 w-3 mr-1" />
            添加记录
          </button>
        </div>
        
        <div className="space-y-4">
          {iterationHistory.map((history, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">迭代记录 #{index + 1}</h4>
                {iterationHistory.length > 1 && (
                  <Button
                    onClick={() => onIterationHistoryAction('remove', index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">版本</Label>
                    <Input
                      value={history.version}
                      onChange={(e) => onIterationHistoryAction('update', index, 'version', e.target.value)}
                      placeholder="v1.0"
                      className={`${inputClassName} text-sm`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">负责人</Label>
                    <Input
                      value={history.author}
                      onChange={(e) => onIterationHistoryAction('update', index, 'author', e.target.value)}
                      placeholder="@xxx"
                      className={`${inputClassName} text-sm`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">发布日期</Label>
                    <Input
                      value={history.date}
                      onChange={(e) => onIterationHistoryAction('update', index, 'date', e.target.value)}
                      placeholder="2025-06-08"
                      className={`${inputClassName} text-sm`}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">迭代内容</Label>
                  <Textarea
                    value={history.content}
                    onChange={(e) => onIterationHistoryAction('update', index, 'content', e.target.value)}
                    rows={2}
                    placeholder="描述本次迭代的主要功能和改进..."
                    className={`${textareaClassName} text-sm`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // AI竞品分析
  if (question.type === 'ai-competitor' && competitors && onCompetitorAction) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-md font-medium text-gray-700">
            {question.text} {question.isRequired && <span className="text-red-500">*</span>}
          </Label>
          <div className="flex gap-1">
            <button
              onClick={() => onAIAction('competitor-analysis')}
              disabled={isAILoading['competitor-analysis']}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
            >
              {isAILoading['competitor-analysis'] ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              AI找竞品
            </button>
            <button
              onClick={() => onCompetitorAction('add')}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
            >
              <Plus className="h-3 w-3 mr-1" />
              添加竞品
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {competitors.map((competitor, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">竞品 {index + 1}</h4>
                {competitors.length > 1 && (
                  <Button
                    onClick={() => onCompetitorAction('remove', index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1 block">产品名称 *</Label>
                <Input
                  value={competitor.name}
                  onChange={(e) => onCompetitorAction('update', index, 'name', e.target.value)}
                  placeholder="如：微信支付、支付宝、雪球App"
                  className={inputClassName}
                />
              </div>
              
              <div className="mt-3 space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">核心功能</Label>
                  <Textarea
                    value={competitor.features}
                    onChange={(e) => onCompetitorAction('update', index, 'features', e.target.value)}
                    placeholder="核心功能特点、用户界面特色、技术方案..."
                    rows={2}
                    className={textareaClassName}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">优势</Label>
                    <Textarea
                      value={competitor.advantages}
                      onChange={(e) => onCompetitorAction('update', index, 'advantages', e.target.value)}
                      placeholder="功能亮点、用户体验优势..."
                      rows={2}
                      className={textareaClassName}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">不足</Label>
                    <Textarea
                      value={competitor.disadvantages}
                      onChange={(e) => onCompetitorAction('update', index, 'disadvantages', e.target.value)}
                      placeholder="功能缺陷、用户痛点..."
                      rows={2}
                      className={textareaClassName}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">市场地位</Label>
                  <Input
                    value={competitor.marketPosition}
                    onChange={(e) => onCompetitorAction('update', index, 'marketPosition', e.target.value)}
                    placeholder="如：市场领导者、细分市场第一..."
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 动态需求方案组件
  if (question.type === 'dynamic-requirement-solution' && requirementSolution && onRequirementSolutionAction) {
    return (
      <div>
        {/* 共享的界面原型 */}
        <div className="mb-4">
          <Label className="text-xs font-medium text-gray-600 mb-1 block">
            界面原型 <span className="text-xs text-gray-500">(整个需求方案共用)</span>
          </Label>
          <Input
            value={requirementSolution.sharedPrototype}
            onChange={(e) => onRequirementSolutionAction('updatePrototype', undefined, undefined, e.target.value)}
            placeholder="Figma链接：https://www.figma.com/..."
            className={inputClassName}
          />
        </div>

        {/* 需求列表 */}
        <div className="flex items-center justify-between mb-2">
          <Label className="text-md font-medium text-gray-700">需求列表</Label>
          <button
            onClick={() => onRequirementSolutionAction('add')}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
          >
            <Plus className="h-3 w-3 mr-1" />
            添加需求
          </button>
        </div>
        
        <div className="space-y-4">
          {requirementSolution.requirements.map((req, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">需求 {index + 1}</h4>
                {requirementSolution.requirements.length > 1 && (
                  <Button
                    onClick={() => onRequirementSolutionAction('remove', index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* 需求名称和优先级 */}
              <div className="space-y-3 mb-4">
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">需求名称 *</Label>
                  <Input
                    value={req.name}
                    onChange={(e) => onRequirementSolutionAction('update', index, 'name', e.target.value)}
                    placeholder="如：智能交易助手、社交交流平台"
                    className={inputClassName}
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">优先级 *</Label>
                  <div className="flex gap-4">
                    {(['High', 'Middle', 'Low'] as const).map((priority) => (
                      <label key={priority} className="flex items-center space-x-1 cursor-pointer">
                        <Checkbox 
                          checked={req.priority === priority}
                          onCheckedChange={() => onRequirementSolutionAction('update', index, 'priority', priority)}
                          className="border-gray-400"
                        />
                        <span className="text-sm">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 其他字段 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">功能点/流程 *</Label>
                  <Textarea
                    value={req.features}
                    onChange={(e) => onRequirementSolutionAction('update', index, 'features', e.target.value)}
                    placeholder="主要功能点和操作流程..."
                    rows={2}
                    className={textareaClassName}
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">业务逻辑/规则说明</Label>
                  <Textarea
                    value={req.businessLogic}
                    onChange={(e) => onRequirementSolutionAction('update', index, 'businessLogic', e.target.value)}
                    placeholder="详细的业务规则和逻辑说明..."
                    rows={2}
                    className={textareaClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">数据需求/校验</Label>
                  <Textarea
                    value={req.dataRequirements}
                    onChange={(e) => onRequirementSolutionAction('update', index, 'dataRequirements', e.target.value)}
                    placeholder="数据结构、校验规则、存储要求等..."
                    rows={2}
                    className={textareaClassName}
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">特殊状态/边缘处理</Label>
                  <Textarea
                    value={req.edgeCases}
                    onChange={(e) => onRequirementSolutionAction('update', index, 'edgeCases', e.target.value)}
                    placeholder="异常情况、边缘场景的处理方案..."
                    rows={2}
                    className={textareaClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">解决用户痛点 *</Label>
                  <Textarea
                    value={req.painPoints}
                    onChange={(e) => onRequirementSolutionAction('update', index, 'painPoints', e.target.value)}
                    placeholder="说明此需求如何解决用户的具体痛点..."
                    rows={2}
                    className={textareaClassName}
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">对应模块</Label>
                  <Textarea
                    value={req.modules}
                    onChange={(e) => onRequirementSolutionAction('update', index, 'modules', e.target.value)}
                    placeholder="涉及的系统模块、组件等..."
                    rows={2}
                    className={textareaClassName}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1 block">开放问题/待定决策</Label>
                <Textarea
                  value={req.openIssues}
                  onChange={(e) => onRequirementSolutionAction('update', index, 'openIssues', e.target.value)}
                  placeholder="尚未确定的问题、需要进一步讨论的决策点..."
                  rows={2}
                  className={textareaClassName}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Input类型
  if (question.type === 'input') {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-md font-medium text-gray-700">
            {question.text} 
            {question.isRequired && <span className="text-red-500">*</span>}
            {question.isOptional && <span className="text-gray-400">(可选)</span>}
          </Label>
          {question.hasAI && (
            <button
              onClick={() => onAIAction(question.aiPrompt || '', question.id)}
              disabled={isAILoading[question.aiPrompt || '']}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
            >
              {isAILoading[question.aiPrompt || ''] ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              AI建议
            </button>
          )}
        </div>
        
        <Input
          value={answers[question.id] || ''}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          placeholder={question.placeholder}
          className={inputClassName}
        />
      </div>
    );
  }

  // 默认为textarea
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-md font-medium text-gray-700">
          {question.text} 
          {question.isRequired && <span className="text-red-500">*</span>}
          {question.isOptional && <span className="text-gray-400">(可选)</span>}
        </Label>
        {question.hasAI && (
          <button
            onClick={() => onAIAction(question.aiPrompt || '', question.id)}
            disabled={isAILoading[question.aiPrompt || '']}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
          >
            {isAILoading[question.aiPrompt || ''] ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            {question.aiPrompt === 'generate-requirement-goal' ? 'AI扩展' : 'AI建议'}
          </button>
        )}
      </div>
      
      <Textarea
        value={answers[question.id] || ''}
        onChange={(e) => onAnswerChange(question.id, e.target.value)}
        placeholder={question.placeholder}
        rows={4}
        className={textareaClassName}
      />
      
      {question.hint && (
        <p className="text-xs text-gray-500 mt-1">{question.hint}</p>
      )}
    </div>
  );
} 