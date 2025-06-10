import { NextRequest, NextResponse } from 'next/server';
import { getModelConfig, ModelConfig } from '@/config/models';
import { ProxyAgent, request as undiciRequest } from 'undici';

// PRD AI功能类型
type AIFunction = 
  | 'expand-user-scenarios' 
  | 'generate-requirement-goal'
  | 'competitor-analysis' 
  | 'review-content'
  | 'generate-prd';

interface AIRequest {
  function: AIFunction;
  data: Record<string, unknown>;
  modelId?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const { function: aiFunction, data, modelId = 'gemini-2.0-flash' } = body;

    console.log(`处理AI请求: ${aiFunction}, 使用模型: ${modelId}`);

    switch (aiFunction) {
      case 'expand-user-scenarios':
        return await handleUserScenariosExpansion(data, modelId);
      case 'generate-requirement-goal':
        return await handleRequirementGoalGeneration(data, modelId);
      case 'competitor-analysis':
        return await handleCompetitorAnalysis(data, modelId);
      case 'review-content':
        return await handleContentReview(data, modelId);
      case 'generate-prd':
        return await handlePRDGeneration(data, modelId);
      default:
        return NextResponse.json(
          { error: '不支持的AI功能' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI服务错误:', error);
    return NextResponse.json(
      { error: '内部服务器错误', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 1. 用户场景扩展（不需要联网）
async function handleUserScenariosExpansion(data: Record<string, unknown>, modelId: string) {
  const { requirementIntro, businessLine } = data;
  
  if (!requirementIntro) {
    return NextResponse.json(
      { error: '需求介绍内容不能为空' },
      { status: 400 }
    );
  }

  const prompt = `作为一名专业的产品经理，请基于以下需求信息，深入分析并扩展用户使用场景。

**业务线**：${businessLine || '未指定'}
**需求介绍**：
${requirementIntro}

请从以下维度分析用户场景：
1. **用户类型细分**：不同经验水平、使用频率、业务角色的用户群体
2. **具体使用场景**：什么时候、什么地方、什么情况下会使用这个功能
3. **深层痛点分析**：用户在当前情况下遇到的具体问题和困难

要求：
- 生成3-5个典型且具有代表性的用户场景
- 每个场景要具体、实用，避免泛泛而谈
- 痛点分析要深入、有针对性，体现真实的用户痛苦
- 覆盖不同类型的用户群体和使用情境

请严格按照以下JSON格式输出，不要添加任何额外的文字：
[
  {
    "userType": "具体的用户类型（如：加密货币新手用户）",
    "scenario": "详细的使用场景描述（包含时间、地点、动机等具体信息）",
    "painPoint": "用户的具体痛点和困难（要具体到操作层面的问题）"
  }
]`;

  try {
    const result = await callAI(modelId, prompt, false); // 不需要联网搜索
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

// 2. 需求目标生成（不需要联网）
async function handleRequirementGoalGeneration(data: Record<string, unknown>, modelId: string) {
  const { requirementIntro, businessLine, userScenarios } = data;
  
  if (!requirementIntro) {
    return NextResponse.json(
      { error: '需求介绍内容不能为空' },
      { status: 400 }
    );
  }

  if (!userScenarios || !Array.isArray(userScenarios) || userScenarios.length === 0) {
    return NextResponse.json(
      { error: '请先完成用户场景分析，再生成需求目标' },
      { status: 400 }
    );
  }

  const prompt = `作为一名专业的产品经理，请基于以下信息，生成一个清晰、具体、可衡量的需求目标。

**业务线**：${businessLine || '未指定'}
**需求介绍**：
${requirementIntro}

**用户场景分析**：
${JSON.stringify(userScenarios, null, 2)}

请基于以上信息，生成一个需求目标，要求：

## 目标制定原则
1. **用户导向**：明确针对哪类用户群体
2. **痛点聚焦**：明确要解决的核心痛点
3. **方案清晰**：说明通过什么方式解决
4. **效果可衡量**：描述预期达到的具体效果

## 目标格式要求
- 语言简洁明了，一段话说清楚
- 逻辑清晰：目标用户 → 核心痛点 → 解决方案 → 预期效果
- 具体可执行，避免空泛的描述
- 与用户场景高度关联

请直接输出需求目标内容，不要添加任何解释性文字。`;

  try {
    const result = await callAI(modelId, prompt, false); // 不需要联网搜索
    
    return NextResponse.json({
      success: true,
      goal: result
    });
  } catch (error) {
    console.error('需求目标生成失败:', error);
    return NextResponse.json(
      { error: '需求目标生成失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 3. 竞品分析（使用联网搜索）
async function handleCompetitorAnalysis(data: Record<string, unknown>, modelId: string = 'gemini-2.0-flash') {
  const { requirementIntro, businessLine, requirementGoal } = data;
  
  if (!requirementIntro) {
    return NextResponse.json(
      { error: '需求介绍内容不能为空' },
      { status: 400 }
    );
  }

  const searchPrompt = `作为一名专业的产品经理和市场分析师，请对以下产品需求进行深度竞品分析。

**业务线**：${businessLine || '未指定'}
**需求介绍**：${requirementIntro}
**需求目标**：${requirementGoal || '未指定'}

请使用联网搜索功能，获取最新的市场信息，并提供一份专业的竞品分析报告。报告应包含：

## 1. 主要竞品列表
- 找出3-5个主要竞争对手
- 包含产品名称、公司背景、市场地位
- 重点关注与我们需求相关的产品或功能

## 2. 功能对比分析
- 各竞品的核心功能特点
- 用户界面和交互设计特色
- 技术实现方案和架构特点
- 功能的完整性和易用性对比

## 3. 优劣势深度分析
**各竞品优势：**
- 功能亮点和创新点
- 用户体验优势
- 技术或商业模式优势

**各竞品不足：**
- 功能缺陷或限制
- 用户痛点和投诉
- 技术债务或架构问题

## 4. 市场机会与建议
- 识别市场空白点和未满足的需求
- 分析我们的差异化竞争优势
- 提出具体的产品策略建议
- 给出功能优先级和实现路径建议

请基于最新的2024-2025年市场信息进行分析，确保信息的时效性和准确性。

**关键输出要求：**
1. 只输出JSON数据，不要任何介绍、总结或解释性文字
2. 不要使用代码块标记，直接输出JSON
3. 所有内容必须使用中文
4. 确保JSON格式完全正确，可以被程序直接解析

输出格式(请严格遵循，不要添加任何其他内容)：
{
  "competitors": [
    {
      "name": "竞品名称",
      "features": "核心功能特点和技术方案，至少50字的详细描述",
      "advantages": "主要优势和亮点，具体说明用户价值",
      "disadvantages": "不足和问题，用户痛点和限制",
      "marketPosition": "市场地位、用户规模、商业模式"
    }
  ],
  "summary": "整体分析总结和我们的差异化机会建议"
}`;

  try {
    const result = await callAI(modelId, searchPrompt, true); // 启用联网搜索
    
    // 尝试解析为JSON格式以支持结构化数据
    let parsedResult;
    try {
      // 清理返回的文本，移除可能的代码块标记和多余文字
      let cleanedResult = result.trim();
      
      console.log('原始AI返回内容前200字符:', cleanedResult.substring(0, 200));
      
      // 更强力的清理逻辑
      // 1. 移除markdown代码块标记
      cleanedResult = cleanedResult.replace(/^```json\s*/gm, '').replace(/\s*```$/gm, '');
      cleanedResult = cleanedResult.replace(/^```\s*/gm, '').replace(/\s*```$/gm, '');
      
      // 2. 移除开头的任何非JSON文字（如"好的，作为产品经理..."）
      const jsonStartIndex = cleanedResult.indexOf('{');
      if (jsonStartIndex > 0) {
        cleanedResult = cleanedResult.substring(jsonStartIndex);
      }
      
      // 3. 移除结尾的任何非JSON文字
      const jsonEndIndex = cleanedResult.lastIndexOf('}');
      if (jsonEndIndex > 0 && jsonEndIndex < cleanedResult.length - 1) {
        cleanedResult = cleanedResult.substring(0, jsonEndIndex + 1);
      }
      
      // 4. 如果还有多个JSON对象，取第一个完整的
      const jsonMatch = cleanedResult.match(/\{[\s\S]*?\}(?=\s*$|\s*\{)/);
      if (jsonMatch) {
        cleanedResult = jsonMatch[0];
      }
      
      console.log('清理后的JSON内容前200字符:', cleanedResult.substring(0, 200));
      
      if (cleanedResult.includes('{') && cleanedResult.includes('}')) {
        parsedResult = JSON.parse(cleanedResult);
        
        // 检查是否有竞品数组
        if (parsedResult.competitors && Array.isArray(parsedResult.competitors)) {
          console.log('成功解析竞品分析JSON数据，竞品数量:', parsedResult.competitors.length);
          return NextResponse.json({
            success: true,
            competitors: parsedResult.competitors,
            summary: parsedResult.summary || '竞品分析完成'
          });
        }
      }
    } catch (parseError) {
      console.warn('JSON解析失败:', parseError);
      console.log('解析失败的内容:', cleanedResult.substring(0, 300));
    }
    
    // 如果不是新格式，返回原始结果以保持兼容性
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

// 3. 内容审查（需要联网获取最新最佳实践）
async function handleContentReview(data: Record<string, unknown>, modelId: string) {
  const { answers, changeRecords, userScenarios, iterationHistory } = data;
  
  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json(
      { error: 'PRD数据不能为空' },
      { status: 400 }
    );
  }

  const prompt = `作为一名资深产品专家和PRD审查师，请对以下PRD内容进行专业审查和评分。

=== PRD表单数据 ===
${JSON.stringify(answers, null, 2)}

=== 变更记录 ===
${JSON.stringify(changeRecords, null, 2)}

=== 用户场景分析 ===
${JSON.stringify(userScenarios, null, 2)}

=== 功能迭代历史 ===
${JSON.stringify(iterationHistory, null, 2)}

请按照以下维度进行评分审查（总分100分）：

## 评分标准
1. **需求完整性（25分）**：需求介绍、目标、背景是否完整清晰
2. **用户价值（20分）**：用户场景、痛点分析是否深入准确
3. **方案设计（20分）**：功能设计、业务逻辑是否合理完善
4. **技术可行性（15分）**：技术实现、数据需求是否可行
5. **项目管理（10分）**：优先级、时间规划、人员配置是否合理
6. **风险控制（10分）**：边缘场景、异常处理是否充分

请严格按照以下JSON格式输出：
{
  "score": 总分数字（0-100）,
  "isReadyForGeneration": 是否建议生成PRD（boolean）,
  "issues": [
    {
      "level": "error/warning/info",
      "field": "问题字段名",
      "message": "问题描述",
      "suggestion": "改进建议"
    }
  ],
  "summary": "总体评价摘要",
  "recommendations": ["改进建议1", "改进建议2"]
}`;

  try {
    const result = await callAI(modelId, prompt, true); // 使用联网获取最新最佳实践
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

// 4. PRD生成（不需要联网）
async function handlePRDGeneration(data: Record<string, unknown>, modelId: string) {
  const { answers, changeRecords, userScenarios, iterationHistory } = data;
  
  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json(
      { error: 'PRD数据不能为空' },
      { status: 400 }
    );
  }

  const prompt = `作为一名资深产品经理，请基于以下结构化数据，生成一份完整、专业、规范的产品需求文档（PRD）。

=== PRD表单数据 ===
${JSON.stringify(answers, null, 2)}

=== 变更记录 ===
${JSON.stringify(changeRecords, null, 2)}

=== 用户场景分析 ===
${JSON.stringify(userScenarios, null, 2)}

=== 功能迭代历史 ===
${JSON.stringify(iterationHistory, null, 2)}

请生成一份结构化、易读的PRD文档，包含以下章节：

1. 需求概述
2. 用户分析与场景
3. 功能需求详述
4. 技术需求与约束
5. 项目计划与里程碑
6. 风险评估与应对

要求：
- 语言专业、逻辑清晰
- 结构完整、层次分明
- 内容具体、可执行
- 格式规范、易于阅读

请以纯文本格式输出，不要使用markdown语法。`;

  try {
    const result = await callAI(modelId, prompt, false); // 不需要联网搜索
    
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

// AI调用统一函数 - 借鉴chat-multi的正确逻辑
async function callAI(modelId: string, prompt: string, enableWebSearch: boolean = false): Promise<string> {
  const config = getModelConfig(modelId);
  
  if (!config) {
    throw new Error(`模型配置未找到: ${modelId}`);
  }

  if (!config.apiKey) {
    throw new Error(`模型 ${modelId} 的API密钥未配置`);
  }

  const messages: ChatMessage[] = [{ role: 'user', content: prompt }];

  console.log(`调用AI: ${config.provider} - ${config.name}, 联网: ${enableWebSearch}`);

  // Google/Gemini 处理
  if (config.provider === 'google') {
    return await callGeminiAPI(config, messages, enableWebSearch);
  }

  // 其他提供商处理
  return await callOtherAPI(config, messages, enableWebSearch);
}

// Gemini API调用（带重试机制）
async function callGeminiAPI(config: ModelConfig, messages: ChatMessage[], enableWebSearch: boolean): Promise<string> {
  const contents = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  };

  // 配置网络搜索
  if (enableWebSearch && config.hasWebSearch) {
    requestBody.tools = [{ google_search: {} }];
  }

  const geminiUrl = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;

  // 重试逻辑
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini请求尝试 ${attempt}/${maxRetries}`);
      
      // 使用代理
      const proxyAgent = new ProxyAgent('http://127.0.0.1:7890');
      
      const response = await undiciRequest(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        dispatcher: proxyAgent,
        headersTimeout: 60000,  // 增加到60秒
        bodyTimeout: 60000,     // 增加到60秒
        connectTimeout: 30000   // 连接超时30秒
      });

      if (response.statusCode !== 200) {
        const errorText = await response.body.text();
        console.error('Gemini API错误:', response.statusCode, errorText);
        throw new Error(`Gemini API错误: ${response.statusCode} ${errorText}`);
      }

      const result = await response.body.json() as Record<string, unknown>;
      const content = (result.candidates as Array<{content: {parts: Array<{text: string}>}}>)?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('Gemini返回空内容');
      }

      console.log('Gemini请求成功');
      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Gemini请求尝试 ${attempt} 失败:`, lastError.message);
      
      // 如果是网络连接错误且还有重试机会，等待后重试
      if (attempt < maxRetries && (
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ETIMEDOUT') ||
        lastError.message.includes('ENOTFOUND') ||
        lastError.message.includes('socket')
      )) {
        const waitTime = attempt * 2000; // 2秒、4秒的递增等待
        console.log(`等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // 非网络错误或最后一次尝试失败，直接抛出
      break;
    }
  }

  throw new Error(`Gemini请求失败: ${lastError?.message || '未知错误'}`);
}

// 其他API调用
async function callOtherAPI(config: ModelConfig, messages: ChatMessage[], enableWebSearch: boolean): Promise<string> {
  // TODO: 暂时未实现其他提供商的web search功能
  console.log(`网络搜索功能: ${enableWebSearch ? '启用' : '禁用'}`);
  
  const requestBody = {
    model: config.model,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
    stream: false // 为了简化，先不使用流式
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 设置认证头
  switch (config.provider) {
    case 'openai-proxy':
      headers['x-auth-key'] = config.apiKey;
      break;
    case 'anthropic-proxy':
    case 'openrouter':
    default:
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
  }

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误: ${response.status} ${errorText}`);
    }

    const result = await response.json() as {choices: Array<{message: {content: string}}>};
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('API返回空内容');
    }

    return content;
  } catch (error) {
    console.error('API请求失败:', error);
    throw new Error(`API请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// JSON解析辅助函数
function parseJSONResponse(response: string): unknown {
  try {
    // 尝试直接解析
    return JSON.parse(response);
  } catch {
    // 尝试提取JSON块
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                     response.match(/\[[\s\S]*\]/) || 
                     response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0].replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    }
    throw new Error('无法解析AI响应为JSON格式');
  }
} 