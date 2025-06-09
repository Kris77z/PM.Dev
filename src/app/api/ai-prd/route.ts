import { NextRequest, NextResponse } from 'next/server';
import { getModelConfig } from '@/config/models';

// PRD AI功能类型
type AIFunction = 'expand-user-scenarios' | 'competitor-analysis' | 'generate-prd' | 'review-content';

interface AIRequest {
  function: AIFunction;
  data: Record<string, unknown>;
  modelId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const { function: aiFunction, data, modelId = 'gpt-4o' } = body;

    console.log(`处理AI请求: ${aiFunction}`);

    switch (aiFunction) {
      case 'expand-user-scenarios':
        return await handleUserScenariosExpansion(data, modelId);
      case 'competitor-analysis':
        return await handleCompetitorAnalysis(data, modelId);
      case 'generate-prd':
        return await handlePRDGeneration(data, modelId);
      case 'review-content':
        return await handleContentReview(data, modelId);
      default:
        return NextResponse.json(
          { error: '不支持的AI功能' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI服务错误:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}

// 1. 用户场景扩展
async function handleUserScenariosExpansion(data: Record<string, unknown>, modelId: string) {
  const { requirementIntro } = data;
  
  if (!requirementIntro) {
    return NextResponse.json(
      { error: '需求介绍内容不能为空' },
      { status: 400 }
    );
  }

  const prompt = `基于以下需求介绍，请分析并扩展可能的用户使用场景。

需求介绍：
${requirementIntro}

请从以下维度分析用户场景：
1. 用户类型（新手用户、专业用户、管理员等）
2. 使用场景（具体的使用情况和环境）
3. 痛点分析（用户在当前情况下遇到的问题）

请生成3-5个典型的用户场景，格式如下：
[
  {
    "userType": "用户类型",
    "scenario": "详细的使用场景描述",
    "painPoint": "用户痛点分析"
  }
]

要求：
- 每个场景要具体、实用
- 痛点分析要深入、有针对性
- 覆盖不同类型的用户群体
- 输出标准JSON格式`;

  try {
    const result = await callAI(modelId, prompt);
    const scenarios = parseJSONResponse(result);
    
    return NextResponse.json({
      success: true,
      scenarios
    });
  } catch (error) {
    console.error('用户场景扩展失败:', error);
    return NextResponse.json(
      { error: '用户场景扩展失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 2. 竞品分析（使用联网搜索）
async function handleCompetitorAnalysis(data: Record<string, unknown>, modelId: string = 'gpt-4o') {
  const { requirementIntro, businessLine } = data;
  
  if (!requirementIntro) {
    return NextResponse.json(
      { error: '需求介绍内容不能为空' },
      { status: 400 }
    );
  }

  // 使用Perplexity进行联网搜索
  const searchPrompt = `分析以下产品需求的竞品情况：

需求介绍：${requirementIntro}
业务线：${businessLine || '未指定'}

请搜索市面上相关的产品和功能，进行竞品分析，包括：

1. **主要竞品列表**
   - 产品名称和公司
   - 核心功能特点
   - 目标用户群体

2. **功能对比分析**
   - 各竞品的优势功能
   - 功能的差异化点
   - 技术实现方式

3. **优劣势分析**
   - 每个竞品的优势
   - 存在的不足和缺陷
   - 用户评价和反馈

4. **机会与建议**
   - 市场空白点
   - 可以改进的方向
   - 差异化竞争策略
   - 实现建议

请基于最新的市场信息进行分析，提供详细的竞品调研报告。`;

  try {
    const result = await callAI(modelId, searchPrompt, true); // 使用联网搜索
    
    return NextResponse.json({
      success: true,
      analysis: result
    });
  } catch (error) {
    console.error('竞品分析失败:', error);
    return NextResponse.json(
      { error: '竞品分析失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 3. PRD生成
async function handlePRDGeneration(data: Record<string, unknown>, modelId: string) {
  const { answers, changeRecords, userScenarios, iterationHistory } = data;
  
  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json(
      { error: 'PRD数据不能为空' },
      { status: 400 }
    );
  }

  const prompt = `基于以下PRD数据，生成一份完整、专业的产品需求文档：

=== PRD表单数据 ===
${JSON.stringify(answers, null, 2)}

=== 变更记录 ===
${JSON.stringify(changeRecords, null, 2)}

=== 用户场景 ===
${JSON.stringify(userScenarios, null, 2)}

=== 迭代历史 ===
${JSON.stringify(iterationHistory, null, 2)}

请生成一份结构清晰、内容完整的PRD文档，包含以下章节：

# 产品需求文档 (PRD)

## 1. 需求介绍
- 基本信息表格
- 需求背景和目标
- 变更记录

## 2. 需求分析  
- 用户场景分析
- 目标用户画像
- 需求目标和价值

## 3. 竞品分析
- 竞争对手分析
- 功能对比
- 差异化优势

## 4. 需求方案
- 功能架构
- 详细功能设计
- 业务流程
- 数据需求
- 技术方案
- 优先级规划

## 5. 其他事项
- 相关文档
- 风险评估
- 时间规划
- 资源需求

要求：
- 内容详细，逻辑清晰
- 使用Markdown格式
- 包含表格、列表等结构化内容
- 突出重点和关键信息
- 专业的产品文档风格`;

  try {
    const result = await callAI(modelId, prompt);
    
    return NextResponse.json({
      success: true,
      prd: result
    });
  } catch (error) {
    console.error('PRD生成失败:', error);
    return NextResponse.json(
      { error: 'PRD生成失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 4. 内容审查
async function handleContentReview(data: Record<string, unknown>, modelId: string) {
  const { answers, changeRecords, userScenarios, iterationHistory } = data;
  
  const prompt = `请审查以下PRD内容的完善程度，并给出专业建议：

=== PRD数据 ===
${JSON.stringify({ answers, changeRecords, userScenarios, iterationHistory }, null, 2)}

请从以下维度进行评估：

1. **完整性检查**
   - 必填字段是否完整
   - 关键信息是否缺失
   - 内容深度是否足够

2. **质量评估**
   - 需求描述是否清晰
   - 用户场景是否合理
   - 方案设计是否完善

3. **逻辑一致性**
   - 各部分内容是否一致
   - 是否存在矛盾
   - 逻辑关系是否清晰

4. **专业程度**
   - 是否符合PRD标准
   - 表达是否专业
   - 结构是否合理

请输出以下格式的审查结果：
{
  "score": 85, // 0-100分
  "isReadyForGeneration": true, // 是否建议生成PRD
  "issues": [
    {
      "level": "warning", // error/warning/info
      "field": "字段名",
      "message": "具体问题描述",
      "suggestion": "改进建议"
    }
  ],
  "summary": "整体评估总结",
  "recommendations": ["改进建议1", "改进建议2"]
}`;

  try {
    const result = await callAI(modelId, prompt);
    const review = parseJSONResponse(result);
    
    return NextResponse.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('内容审查失败:', error);
    return NextResponse.json(
      { error: '内容审查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// AI调用统一函数
async function callAI(modelId: string, prompt: string, useWebSearch: boolean = false): Promise<string> {
  const config = getModelConfig(modelId);
  
  if (!config) {
    throw new Error(`模型配置未找到: ${modelId}`);
  }

  if (!config.apiKey) {
    throw new Error(`模型 ${modelId} 的API密钥未配置`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 不同provider的认证方式
  if (config.provider === 'openai-proxy') {
    headers['x-auth-key'] = config.apiKey;
  } else {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  // 添加自定义headers
  if (config.headers) {
    Object.assign(headers, config.headers);
  }

  // 构建请求体，根据模型类型启用网络搜索
  const requestBody: Record<string, unknown> = {
    model: config.model,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    stream: false
  };

  // 为支持网络搜索的模型添加搜索工具
  if (useWebSearch && config.hasWebSearch) {
    if (config.provider === 'anthropic-proxy') {
      // Claude Web Search API
      requestBody.tools = [
        {
          type: 'web_search',
          web_search: {}
        }
      ];
    } else if (config.provider === 'google') {
      // Gemini Google Search Grounding
      requestBody.tools = [
        {
          googleSearch: {}
        }
      ];
    } else if (config.provider === 'openai-proxy') {
      // GPT-4o 搜索预览功能（通过系统提示启用）
      const messages = requestBody.messages as Array<{ role: string; content: string }>;
      messages.unshift({
        role: 'system',
        content: '你可以使用网络搜索来获取最新信息。当需要最新或实时信息时，请主动搜索相关内容。'
      });
    }
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API调用失败: ${response.status} ${errorText}`);
  }

  const responseData = await response.json();
  
  // 处理响应格式
  return responseData.choices?.[0]?.message?.content || '';
}

// JSON解析辅助函数
function parseJSONResponse(response: string): unknown {
  try {
    // 尝试直接解析
    return JSON.parse(response);
  } catch {
    // 尝试提取JSON块
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\[[\s\S]*\]/) || response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
    }
    throw new Error('无法解析AI响应为JSON格式');
  }
} 