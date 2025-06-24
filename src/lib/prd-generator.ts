import { 
  UserScenario, 
  CompetitorItem, 
  ChangeRecord, 
  IterationHistory, 
  RequirementSolution 
} from '@/types/prd';

interface PRDGenerationData {
  answers: { [key: string]: string };
  changeRecords: ChangeRecord[];
  userScenarios: UserScenario[];
  iterationHistory: IterationHistory[];
  competitors: CompetitorItem[];
  requirementSolution: RequirementSolution;
}

export function generatePRDDocument(data: PRDGenerationData): string {
  const { answers, changeRecords, userScenarios, iterationHistory, competitors, requirementSolution } = data;
  
  // 生成PRD文档
  const prd = `## 1. 需求介绍

**产品背景和需求概述：** ${answers['c1_requirement_intro'] || '暂未提及'}

**所属业务线：** ${answers['c1_business_line'] || '暂未提及'}

**团队成员配置：**

<div class="simple-table">

| 产品经理 | 前端开发 | 后端开发 | 数据分析 |
|----------|----------|----------|----------|
| ${answers['c1_product_manager'] || '暂未提及'} | ${answers['c1_frontend_dev'] || '暂未提及'} | ${answers['c1_backend_dev'] || '暂未提及'} | ${answers['c1_data_analyst'] || '暂未提及'} |

</div>



**变更记录：**

<div class="simple-table">

| 版本 | 修订人 | 修订日期 | 修订原因 |
|------|--------|----------|----------|
${generateChangeRecordsTable(changeRecords)}

</div>

## 2. 需求分析

**用户场景分析：**

<div style="overflow-x: auto;" data-table="user-scenarios">

| 用户类型 | 使用场景 | 痛点分析 | 期望功能 | 使用频率 |
|----------|----------|----------|----------|----------|
${generateUserScenariosTable(userScenarios)}

</div>

**需求目标：** ${answers['c2_requirement_goal'] || '暂未提及'}

## 3. 竞品分析

<div style="overflow-x: auto;" data-table="competitors">

| 产品名称 | 功能特点 | 主要优势 | 不足之处 | 市场地位 | 定价策略 | 用户评价 |
|----------|----------|----------|----------|----------|----------|----------|
${generateCompetitorsTable(competitors)}

</div>

## 4. 需求方案

<div style="overflow-x: auto;" data-table="requirements">

| 需求名称 | 优先级 | 功能点/流程 | 业务逻辑 | 数据需求 | 边缘处理 | 解决痛点 | 对应模块 | 验收标准 |
|----------|--------|-------------|----------|----------|----------|----------|----------|----------|
${generateRequirementSolutionTable(requirementSolution)}

</div>

**开放问题：** ${requirementSolution.requirements.length > 0 && requirementSolution.requirements[0].openIssues ? requirementSolution.requirements.map(r => r.openIssues).filter(Boolean).join('; ') : '暂无'}

## 5. 其余事项

**相关文档链接：** ${answers['c5_related_docs'] || '暂未提及'}

**功能迭代历史：**

<div class="simple-table">

| 版本 | 负责人 | 发布日期 | 迭代内容 |
|------|--------|----------|----------|
${generateIterationHistoryTable(iterationHistory)}

</div>`;

  return prd;
}

function generateChangeRecordsTable(changeRecords: ChangeRecord[]): string {
  if (!changeRecords || changeRecords.length === 0) {
    return '| 1.0 | 暂未提及 | 暂未提及 | 暂未提及 |';
  }
  
  return changeRecords
    .map(record => `| ${record.version || '暂未提及'} | ${record.modifier || '暂未提及'} | ${record.date || '暂未提及'} | ${record.reason || '暂未提及'} |`)
    .join('\n');
}

function generateUserScenariosTable(userScenarios: UserScenario[]): string {
  if (!userScenarios || userScenarios.length === 0) {
    return '| 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 |';
  }
  
  return userScenarios
    .map(scenario => `| ${scenario.userType || '暂未提及'} | ${scenario.scenario || '暂未提及'} | ${scenario.painPoint || '暂未提及'} | 暂未提及 | 暂未提及 |`)
    .join('\n');
}

function generateCompetitorsTable(competitors: CompetitorItem[]): string {
  if (!competitors || competitors.length === 0) {
    return '| 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 |';
  }
  
  return competitors
    .map(competitor => `| ${competitor.name || '暂未提及'} | ${competitor.features || '暂未提及'} | ${competitor.advantages || '暂未提及'} | ${competitor.disadvantages || '暂未提及'} | ${competitor.marketPosition || '暂未提及'} | 暂未提及 | 暂未提及 |`)
    .join('\n');
}

function generateRequirementSolutionTable(requirementSolution: RequirementSolution): string {
  if (!requirementSolution || !requirementSolution.requirements || requirementSolution.requirements.length === 0) {
    return '| 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 |';
  }
  
  return requirementSolution.requirements
    .map(req => `| ${req.name || '暂未提及'} | ${req.priority || '暂未提及'} | ${req.features || '暂未提及'} | ${req.businessLogic || '暂未提及'} | ${req.dataRequirements || '暂未提及'} | ${req.edgeCases || '暂未提及'} | ${req.painPoints || '暂未提及'} | ${req.modules || '暂未提及'} | ${req.openIssues || '暂未提及'} |`)
    .join('\n');
}

function generateIterationHistoryTable(iterationHistory: IterationHistory[]): string {
  if (!iterationHistory || iterationHistory.length === 0) {
    return '| 暂未提及 | 暂未提及 | 暂未提及 | 暂未提及 |';
  }
  
  return iterationHistory
    .map(history => `| ${history.version || '暂未提及'} | ${history.author || '暂未提及'} | ${history.date || '暂未提及'} | ${history.content || '暂未提及'} |`)
    .join('\n');
} 