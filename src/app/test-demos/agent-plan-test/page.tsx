'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ResearchPlan, { ResearchTask } from '@/components/ui/research-plan'

// 基于真实日志的研究数据
const mockResearchData = {
  topic: "区块链技术在供应链管理中的实际应用案例和效果评估",
  totalSteps: 15,
  cycles: 2,
  duration: "45秒",
  tasks: [
    {
      id: "1",
      title: "研究规划",
      status: "completed",
      priority: "high",
      level: 0,
      dependencies: [],
      subtasks: [
        {
          id: "1.1",
          title: "确定研究范围",
          description: "明确研究的具体领域和边界，包括技术应用、教学效果、实施挑战等方面",
          status: "completed",
          priority: "high",
          tools: ["research-planner", "scope-analyzer"]
        },
        {
          id: "1.2", 
          title: "制定研究计划",
          description: "设计详细的研究步骤和方法论，确保研究的系统性和完整性",
          status: "completed",
          priority: "high",
          tools: ["planning-assistant", "methodology-designer"]
        },
        {
          id: "1.3",
          title: "识别关键问题",
          description: "列出需要重点关注的核心问题和研究假设",
          status: "completed", 
          priority: "medium",
          tools: ["question-generator", "hypothesis-builder"]
        }
      ]
    },
    {
      id: "2",
      title: "信息搜集 - 第1轮",
      status: "completed",
      priority: "high", 
      level: 0,
      dependencies: ["1"],
      subtasks: [
        {
          id: "2.1",
          title: "搜索-1",
          description: "搜索区块链在供应链管理中的案例研究和性能指标",
          status: "completed",
          priority: "high",
          tools: ["web-search", "academic-database"]
        },
        {
          id: "2.2",
          title: "发现-1", 
          description: "找到5条相关资料，包括实施案例和效果分析",
          status: "completed",
          priority: "high",
          tools: ["content-analyzer", "relevance-scorer"]
        },
        {
          id: "2.3",
          title: "搜索-2",
          description: "搜索区块链对供应链可追溯性的影响及实证证据",
          status: "completed",
          priority: "medium",
          tools: ["case-study-finder", "impact-analyzer"]
        },
        {
          id: "2.4",
          title: "搜索完成",
          description: "第1轮成功收集到20条高质量的研究资料",
          status: "completed",
          priority: "medium", 
          tools: ["data-consolidator", "quality-checker"]
        }
      ]
    },
    {
      id: "3",
      title: "内容增强 - 第1轮",
      status: "completed",
      priority: "high",
      level: 0,
      dependencies: ["2"],
      subtasks: [
        {
          id: "3.1",
          title: "筛选优质资源",
          description: "从20条资料中选择最有价值的进行深度分析",
          status: "completed",
          priority: "high",
          tools: ["resource-filter", "quality-assessor"]
        },
        {
          id: "3.2",
          title: "深度抓取分析",
          description: "成功深度分析了2篇重要文献，获得详细内容",
          status: "completed", 
          priority: "medium",
          tools: ["content-extractor", "deep-analyzer"]
        }
      ]
    },
    {
      id: "4", 
      title: "深度分析 - 第1轮",
      status: "completed",
      priority: "high",
      level: 0,
      dependencies: ["3"],
      subtasks: [
        {
          id: "4.1",
          title: "文献分析",
          description: "深入分析7篇重要文献，发现研究空白需要补充",
          status: "completed",
          priority: "high", 
          tools: ["literature-analyzer", "gap-identifier"]
        },
        {
          id: "4.2",
          title: "决策评估",
          description: "评估信息完整性，决定继续深入搜集资料",
          status: "completed",
          priority: "high",
          tools: ["decision-engine", "completeness-checker"]
        }
      ]
    },
    {
      id: "5",
      title: "信息搜集 - 第2轮",
      status: "in-progress", 
      priority: "high",
      level: 0,
      dependencies: ["4"],
      subtasks: [
        {
          id: "5.1",
          title: "生成新查询",
          description: "基于第1轮分析结果，生成更精确的搜索查询",
          status: "completed",
          priority: "high",
          tools: ["query-optimizer", "search-refiner"]
        },
        {
          id: "5.2",
          title: "执行深度搜索",
          description: "正在执行第2轮搜索，重点关注ROI分析和实际案例",
          status: "in-progress",
          priority: "high", 
          tools: ["advanced-search", "case-collector"]
        },
        {
          id: "5.3",
          title: "资料收集",
          description: "预计收集25条新的研究资料",
          status: "pending",
          priority: "medium",
          tools: ["data-aggregator", "source-validator"]
        }
      ]
    },
    {
      id: "6",
      title: "内容增强 - 第2轮",
      status: "pending", 
      priority: "high",
      level: 0,
      dependencies: ["5"],
      subtasks: [
        {
          id: "6.1",
          title: "质量筛选",
          description: "对新收集的资料进行质量评估和筛选",
          status: "pending",
          priority: "high",
          tools: ["quality-filter", "relevance-ranker"]
        },
        {
          id: "6.2",
          title: "深度分析",
          description: "对筛选出的高质量资源进行深度内容提取",
          status: "pending", 
          priority: "medium",
          tools: ["content-miner", "insight-extractor"]
        }
      ]
    },
    {
      id: "7",
      title: "最终分析与报告生成",
      status: "pending",
      priority: "high",
      level: 0,
      dependencies: ["6"],
      subtasks: [
        {
          id: "7.1",
          title: "综合分析",
          description: "整合两轮搜集的所有资料，进行综合分析",
          status: "pending",
          priority: "high", 
          tools: ["synthesis-engine", "pattern-finder"]
        },
        {
          id: "7.2",
          title: "报告生成",
          description: "基于完整分析结果生成专业研究报告",
          status: "pending",
          priority: "high",
          tools: ["report-generator", "format-optimizer"]
        }
      ]
    }
  ]
}

// 更真实的报告内容，基于日志中的实际报告
const mockReport = `# 区块链技术在供应链管理中的实际应用案例和效果评估

## 一、概述

区块链技术作为一种去中心化、安全透明的分布式账本技术，近年来受到供应链管理领域的广泛关注。其去中心化特性能够提升供应链的透明度和可追溯性，降低信息不对称带来的风险，从而提高效率并降低成本。然而，区块链技术在供应链管理中的应用仍处于发展阶段，其实际效果评估也存在诸多挑战。

本报告基于对45条高质量研究文献的分析，深入评估了区块链技术在供应链管理中的实际应用效果。

## 二、主要发现

### 1. 区块链技术应用场景及案例

区块链技术在供应链管理中具有广泛的应用潜力，主要应用场景包括：

- **食品安全追溯**：沃尔玛利用区块链技术追踪生鲜产品供应链，将食品溯源时间从数天缩短至数秒
- **药品供应链管理**：制药企业通过区块链确保药品流通过程的真实性和安全性
- **奢侈品防伪**：奢侈品牌使用区块链技术防止假冒产品流入市场

这些案例表明，区块链技术能够有效提升供应链的透明度和可追溯性，增强消费者信任。

### 2. 效果评估的关键发现

基于对多个实施案例的分析，我们发现：

- **透明度提升**：供应链可视性平均提高60-80%
- **追溯效率**：产品溯源时间从平均7天缩短至几分钟
- **成本影响**：初期实施成本较高，但长期ROI逐步显现
- **信任度增强**：消费者对产品真实性的信心显著提升

### 3. ROI分析及应用条件

研究表明，区块链技术的投资回报率高度依赖于具体应用场景：

**适合应用区块链的条件：**
1. 需要快速部署资产追踪
2. 需要处理大量供应链数据
3. 需要消除重复性验证任务
4. 存在多方协作信任问题

**ROI评估结果：**
- 大型企业：实施2-3年后ROI为正
- 中小企业：需要更长时间实现投资回报
- 高价值产品：ROI表现更佳

## 三、挑战与限制

### 技术挑战
- 系统集成复杂度高
- 跨平台互操作性有限
- 能耗和性能问题

### 商业挑战
- 初期投资成本高昂
- 需要供应链合作伙伴共同参与
- 缺乏统一的行业标准

### 监管挑战
- 数据隐私保护要求
- 跨境合规复杂性
- 法律框架滞后

## 四、发展趋势

1. **技术标准化**：行业标准逐步完善，互操作性增强
2. **技术融合**：与IoT、AI等技术深度融合
3. **应用拓展**：覆盖更多垂直行业和应用场景
4. **成本降低**：随着技术成熟，实施成本逐步下降

## 五、结论与建议

区块链技术在供应链管理中展现出巨大潜力，但企业应谨慎评估投入产出比。建议：

1. **分阶段实施**：从小规模试点开始，逐步扩大应用范围
2. **合作伙伴协调**：确保供应链各方的技术协调和数据共享
3. **ROI持续评估**：建立完善的效果评估机制
4. **技术选型**：选择成熟稳定的区块链平台

---

**研究统计：**
- 分析文献：45篇高质量研究论文
- 案例研究：15个实际应用案例
- 研究周期：2轮深度分析
- 生成时间：${new Date().toLocaleString('zh-CN')}

**主要数据来源：**
- 学术期刊论文：25篇
- 行业研究报告：12篇
- 企业案例研究：8篇`

// 定义原始数据类型
interface MockSubtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tools?: string[];
}

interface MockTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: MockSubtask[];
}

// 将mock数据转换为新组件需要的格式
const convertToResearchTasks = (tasks: MockTask[]): ResearchTask[] => {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status as 'completed' | 'in-progress' | 'pending',
    priority: task.priority as 'high' | 'medium' | 'low',
    level: task.level,
    dependencies: task.dependencies,
    subtasks: task.subtasks.map((subtask: MockSubtask) => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.description,
      status: subtask.status as 'completed' | 'in-progress' | 'pending',
      priority: subtask.priority as 'high' | 'medium' | 'low',
      tools: subtask.tools
    }))
  }))
}

export default function AgentPlanTestPage() {
  const router = useRouter()
  const [expandedTasks, setExpandedTasks] = useState<string[]>(["1", "2", "5"])

  const handleTaskExpand = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    )
  }

  const researchTasks = convertToResearchTasks(mockResearchData.tasks)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">研究执行监控 - ResearchPlan 组件</h1>
            <p className="text-muted-foreground">基于真实日志数据的UI测试 - 使用新的专用组件</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>

        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">研究主题:</h2>
              <p className="text-sm text-muted-foreground">{mockResearchData.topic}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>步骤: {mockResearchData.totalSteps} | 轮次: {mockResearchData.cycles} | 用时: {mockResearchData.duration}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <ResearchPlan 
            tasks={researchTasks}
            expandedTaskIds={expandedTasks}
            onTaskExpand={handleTaskExpand}
            showReport={true}
            reportContent={mockReport}
          />

          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-3">新组件特性展示</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-900" />
                <span className="text-sm">专用研究监控组件</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-900" />
                <span className="text-sm">黑白简洁风格</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-900" />
                <span className="text-sm">无动画，高性能</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-900" />
                <span className="text-sm">TypeScript 类型安全</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-900" />
                <span className="text-sm">内置报告预览</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-900" />
                <span className="text-sm">灵活的状态管理</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 