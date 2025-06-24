import { NextRequest, NextResponse } from 'next/server';
import { getModelConfig, ModelConfig } from '@/config/models';
import { ProxyAgent, request as undiciRequest } from 'undici';
import {
  getUserScenariosPrompt,
  getRequirementGoalPrompt,
  getCompetitorAnalysisPrompt,
  getFeatureSuggestionPrompt,
  getBusinessLogicPrompt,
  getEdgeCasesPrompt,
  getReviewPrompt,
  getPRDGenerationPrompt,
  type UserScenariosData,
  type RequirementGoalData,
  type CompetitorAnalysisData,
  type FeatureSuggestionData,
  type BusinessLogicData,
  type EdgeCasesData,
  type ReviewData,
  type PRDGenerationData
} from '@/prompts';

// PRD AI功能类型
type AIFunction = 
  | 'expand-user-scenarios' 
  | 'generate-requirement-goal'
  | 'competitor-analysis' 
  | 'review-content'
  | 'generate-prd'
  | 'suggest-features'
  | 'suggest-business-logic'
  | 'suggest-edge-cases';

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
      case 'suggest-features':
        return await handleFeatureSuggestion(data, modelId);
      case 'suggest-business-logic':
        return await handleBusinessLogicSuggestion(data, modelId);
      case 'suggest-edge-cases':
        return await handleEdgeCasesSuggestion(data, modelId);
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

  const promptData: UserScenariosData = {
    businessLine: businessLine as string,
    requirementIntro: requirementIntro as string
  };

  try {
    const prompt = getUserScenariosPrompt(promptData);
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

  const promptData: RequirementGoalData = {
    businessLine: businessLine as string,
    requirementIntro: requirementIntro as string,
    userScenarios: userScenarios as unknown[]
  };

  try {
    const prompt = getRequirementGoalPrompt(promptData);
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

  const promptData: CompetitorAnalysisData = {
    businessLine: businessLine as string,
    requirementIntro: requirementIntro as string,
    requirementGoal: requirementGoal as string
  };

  try {
    const searchPrompt = getCompetitorAnalysisPrompt(promptData);
    const result = await callAI(modelId, searchPrompt, true); // 启用联网搜索
    
    // 尝试解析为JSON格式以支持结构化数据
    let parsedResult;
    // 清理返回的文本，移除可能的代码块标记和多余文字
    let cleanedResult = result.trim();
    try {
      
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
  const { answers, changeRecords, userScenarios, iterationHistory, requirementSolution } = data;
  
  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json(
      { error: 'PRD数据不能为空' },
      { status: 400 }
    );
  }

  const promptData: ReviewData = {
    answers: answers as { [key: string]: string },
    changeRecords: changeRecords as unknown[],
    userScenarios: userScenarios as unknown[],
    iterationHistory: iterationHistory as unknown[],
    requirementSolution: requirementSolution
  };

  try {
    const prompt = getReviewPrompt(promptData);
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
  const { answers, changeRecords, userScenarios, iterationHistory, requirementSolution } = data;
  
  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json(
      { error: 'PRD数据不能为空' },
      { status: 400 }
    );
  }

  const promptData: PRDGenerationData = {
    answers: answers as { [key: string]: string },
    changeRecords: changeRecords as unknown[],
    userScenarios: userScenarios as unknown[],
    iterationHistory: iterationHistory as unknown[],
    requirementSolution: requirementSolution
  };

  try {
    const prompt = getPRDGenerationPrompt(promptData);
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

// 5. 功能建议（不需要联网）
async function handleFeatureSuggestion(data: Record<string, unknown>, modelId: string) {
  const { requirement, userScenarios, competitorAnalysis } = data;
  
  if (!requirement) {
    return NextResponse.json(
      { error: '需求描述不能为空' },
      { status: 400 }
    );
  }

  const promptData: FeatureSuggestionData = {
    requirement: requirement as string,
    userScenarios: userScenarios as unknown[],
    competitorAnalysis: competitorAnalysis as string
  };

  try {
    const prompt = getFeatureSuggestionPrompt(promptData);
    const result = await callAI(modelId, prompt, false);
    const suggestions = parseJSONResponse(result);
    
    return NextResponse.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('功能建议失败:', error);
    return NextResponse.json(
      { error: '功能建议失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 6. 业务逻辑建议（不需要联网）
async function handleBusinessLogicSuggestion(data: Record<string, unknown>, modelId: string) {
  const { featureName, requirement } = data;
  
  if (!featureName) {
    return NextResponse.json(
      { error: '功能名称不能为空' },
      { status: 400 }
    );
  }

  const promptData: BusinessLogicData = {
    featureName: featureName as string,
    requirement: requirement as string
  };

  try {
    const prompt = getBusinessLogicPrompt(promptData);
    const result = await callAI(modelId, prompt, false);
    
    return NextResponse.json({
      success: true,
      suggestion: result
    });
  } catch (error) {
    console.error('业务逻辑建议失败:', error);
    return NextResponse.json(
      { error: '业务逻辑建议失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 7. 边缘场景建议（不需要联网）
async function handleEdgeCasesSuggestion(data: Record<string, unknown>, modelId: string) {
  const { featureName, businessLogic } = data;
  
  if (!featureName) {
    return NextResponse.json(
      { error: '功能名称不能为空' },
      { status: 400 }
    );
  }

  const promptData: EdgeCasesData = {
    featureName: featureName as string,
    businessLogic: businessLogic as string
  };

  try {
    const prompt = getEdgeCasesPrompt(promptData);
    const result = await callAI(modelId, prompt, false);
    const suggestions = parseJSONResponse(result);
    
    return NextResponse.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('边缘场景建议失败:', error);
    return NextResponse.json(
      { error: '边缘场景建议失败', details: error instanceof Error ? error.message : String(error) },
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
      
      // 只在开发环境使用代理
      const proxyAgent = process.env.NODE_ENV === 'development' 
        ? new ProxyAgent('http://127.0.0.1:7890')
        : undefined;
      
      const response = await undiciRequest(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        ...(proxyAgent && { dispatcher: proxyAgent }),
        headersTimeout: 60000,  // 增加到60秒
        bodyTimeout: 60000      // 增加到60秒
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

// JSON解析辅助函数 - 增强版，能处理各种AI返回格式
function parseJSONResponse(response: string): unknown {
  console.log('原始AI响应:', response.substring(0, 500) + (response.length > 500 ? '...' : ''));
  
  try {
    // 尝试直接解析
    return JSON.parse(response);
  } catch {
    // 清理响应文本
    let cleanedResponse = response.trim();
    
    // 移除可能的markdown代码块标记
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // 尝试提取JSON对象
    const patterns = [
      // 标准JSON对象
      /\{[\s\S]*\}/,
      // JSON数组
      /\[[\s\S]*\]/,
      // 在文本中间的JSON对象
      /(?:response|result|output|json)[\s:]*(\{[\s\S]*?\})/i,
      // 在冒号后的JSON对象
      /:[\s]*(\{[\s\S]*?\})/,
      // 最后的JSON对象
      /.*(\{[\s\S]*\}).*$/
    ];
    
    for (const pattern of patterns) {
      const match = cleanedResponse.match(pattern);
      if (match) {
        try {
          const jsonStr = (match[1] || match[0]).trim();
          console.log('尝试解析JSON:', jsonStr.substring(0, 200) + '...');
          const parsed = JSON.parse(jsonStr);
          console.log('JSON解析成功');
          return parsed;
        } catch (e) {
          console.log('JSON解析失败:', e instanceof Error ? e.message : String(e));
          continue;
        }
      }
    }
    
    // 如果所有模式都失败，尝试从响应中构建一个基本的审查结果
    console.log('尝试从文本中提取信息...');
    
    // 查找评分
    const scoreMatch = cleanedResponse.match(/(?:分数|评分|score)[\s:：]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 60; // 默认60分
    
    // 查找是否建议生成PRD
    const readyMatch = cleanedResponse.match(/(?:建议|推荐|ready)[\s\S]*?(?:生成|generation)/i);
    const isReadyForGeneration = readyMatch ? !cleanedResponse.includes('不建议') && !cleanedResponse.includes('不推荐') : score >= 70;
    
    // 构建默认响应
    const fallbackResponse = {
      score,
      isReadyForGeneration,
      issues: [
        {
          level: "warning",
          field: "AI解析",
          message: "AI返回格式不规范，已使用默认解析",
          suggestion: "建议完善内容后重新审查"
        }
      ],
      summary: cleanedResponse.substring(0, 200) + (cleanedResponse.length > 200 ? '...' : ''),
      recommendations: ["建议完善PRD内容", "重新进行AI审查"]
    };
    
    console.log('使用备用解析结果:', fallbackResponse);
    return fallbackResponse;
  }
} 