'use client';

import { useState } from 'react';
import { DEFAULT_MODEL, getAllModels } from '@/config/models';

// 测试结果类型
interface TestResult {
  id: string;
  model: string;
  query: string;
  response: string;
  timestamp: Date;
  status: 'success' | 'error' | 'loading';
  error?: string;
  rawError?: unknown; // 使用 unknown 替代 any
  hasWebSearchCapability: boolean;
  testType: 'web-search' | 'basic-chat' | 'thinking';
  webSearchEnabled: boolean; // 实际是否启用了web search
  reasoningContent?: string; // DeepSeek推理内容
  finalContent?: string; // DeepSeek最终答案
}

export default function WebSearchTestPage() {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [customModelId, setCustomModelId] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);

  // 重点测试的模型列表
  const focusModels = [
    'gpt-4o',
    'gpt-4o-search', 
    'o3-mini',
    'claude-3.7-sonnet',
    'gemini-2.0-flash',
    'deepseek-r1'
  ];

  // 获取模型的显示信息
  const getModelDisplayInfo = (modelId: string) => {
    const model = getAllModels().find(m => m.id === modelId);
    const isFocus = focusModels.includes(modelId);
    const specialFeature = 
      modelId.includes('search') ? '🔍 专业搜索' :
      modelId.includes('o3') ? '🧠 推理专家' :
      modelId.includes('claude-3.7') ? '🆕 Claude 3.7' :
      modelId.includes('gemini-2.0') ? '⚡ Gemini 2.0' :
      modelId.includes('deepseek-r1') ? '🔬 推理模型' :
      '';
    
    return {
      name: model?.name || modelId,
      isFocus,
      specialFeature,
      hasWebSearch: model?.hasWebSearch || false
    };
  };

  // 重点模型快速测试
  const runFocusModelTest = async (modelId: string, testType: 'web-search' | 'basic-chat' | 'thinking') => {
    const testQueries = {
      'web-search': ["OpenAI最新发布的模型是什么？有哪些新功能？"],
      'thinking': ["我面前有三个盒子：A、B、C。一个盒子里有奖品。每个盒子上都有一句话。A盒子上写着：'奖品在这个盒子里'。B盒子上写着：'奖品不在这里'。C盒子上写着：'奖品不在A盒子里'。已知这三句话中只有一句是真的。请问奖品在哪个盒子里？请解释你的推理过程。"],
      'basic-chat': ["你好，请介绍一下你自己和你的能力"]
    };
    
    const query = testQueries[testType][0];
    const enableWebSearch = testType === 'web-search';
    
    // 直接使用指定的modelId进行测试
    await runTestWithSpecificModel(query, testType, enableWebSearch, modelId);
  };

  // 使用指定模型执行测试的函数
  const runTestWithSpecificModel = async (query: string, testType: 'web-search' | 'basic-chat' | 'thinking', enableWebSearch: boolean, modelIdToUse: string) => {
    const testId = Date.now().toString();
    const modelConfig = getAllModels().find(m => m.id === modelIdToUse);
    const hasWebSearchCapability = modelConfig?.hasWebSearch || false;

    const newResult: TestResult = {
      id: testId,
      model: modelIdToUse,
      query,
      response: '',
      timestamp: new Date(),
      status: 'loading',
      hasWebSearchCapability,
      testType,
      webSearchEnabled: enableWebSearch
    };

    setTestResults(prev => [newResult, ...prev]);
    setIsLoading(true);

    try {
      let systemPrompt = "你是一个AI助手。";
      
      if (testType === 'web-search' && enableWebSearch) {
        systemPrompt = `你是一个AI助手，具有实时网络搜索能力。

重要指示：
1. 当用户询问需要最新信息的问题时，你必须使用网络搜索功能获取实时、准确的信息。
2. 在回答开始时明确说明"我正在为您搜索最新信息..."。
3. 在回答中包含具体的搜索来源和时间信息。
4. 如果能搜索到信息，请提供详细的最新数据。
5. 如果无法搜索，请明确说明原因。

请现在就使用你的搜索功能来回答用户的问题。`;
      } else if (testType === 'thinking') {
        systemPrompt = `你是一个具有强大逻辑推理和分析能力的AI助手。

重要指示：
1. 面对复杂问题，必须展示你的"思维链"(Chain of Thought)。
2. 在给出最终答案之前，请分步、详细地列出你的思考过程、推理逻辑或分析步骤。
3. 使用"第一步"、"第二步"、"因此"、"我的推理是"等词语来组织你的思路。
4. 你的回答应该清晰、有条理，让用户能轻松跟上你的逻辑。

请现在开始，运用你的推理能力，分析并回答用户的问题。`;
      } else {
        systemPrompt = "你是一个AI助手，请根据你的训练数据回答问题。如果问题涉及实时信息，请说明你无法获取最新数据。";
      }

      const response = await fetch('/api/chat-multi-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelIdToUse,
          messages: [
            {
              role: 'user',
              content: query
            }
          ],
          context: systemPrompt,
          enableWebSearch: enableWebSearch
        }),
      });

      if (!response.ok) {
        let errorBody = null;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = { message: await response.text() };
        }
        const errorMessage = (errorBody as { error?: { message?: string } })?.error?.message || `API错误: ${response.status} ${response.statusText}`;
        const error = new Error(errorMessage);
        (error as { raw?: unknown }).raw = errorBody; // 将原始错误附加到error对象
        throw error;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedReasoningContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            
            if (!jsonStr || jsonStr === '[DONE]') continue;
            
            try {
              const parsedChunk = JSON.parse(jsonStr);
              
              // 处理 Claude 扩展思考的格式 (content数组包含thinking和text块)
              const claudeContent = parsedChunk.content;
              if (claudeContent && Array.isArray(claudeContent)) {
                for (const contentBlock of claudeContent) {
                  if (contentBlock.type === 'thinking' && contentBlock.thinking) {
                    accumulatedReasoningContent += contentBlock.thinking;
                    setTestResults(prev => 
                      prev.map(result => 
                        result.id === testId
                          ? { 
                              ...result, 
                              reasoningContent: accumulatedReasoningContent,
                              response: accumulatedReasoningContent + '\n\n' + accumulatedContent,
                              status: 'loading' 
                            }
                          : result
                      )
                    );
                  } else if (contentBlock.type === 'text' && contentBlock.text) {
                    accumulatedContent += contentBlock.text;
                    setTestResults(prev => 
                      prev.map(result => 
                        result.id === testId
                          ? { 
                              ...result, 
                              finalContent: accumulatedContent,
                              response: (accumulatedReasoningContent ? accumulatedReasoningContent + '\n\n' : '') + accumulatedContent,
                              status: 'loading' 
                            }
                          : result
                      )
                    );
                  }
                }
              }
              
              // 处理 DeepSeek 推理模型的特殊格式 (delta中包含reasoning_content)
              const deltaReasoningContent = parsedChunk.choices?.[0]?.delta?.reasoning_content;
              const deltaContent = parsedChunk.choices?.[0]?.delta?.content;
              
              if (deltaReasoningContent) {
                accumulatedReasoningContent += deltaReasoningContent;
                setTestResults(prev => 
                  prev.map(result => 
                    result.id === testId
                      ? { 
                          ...result, 
                          reasoningContent: accumulatedReasoningContent,
                          response: accumulatedReasoningContent + '\n\n' + accumulatedContent,
                          status: 'loading' 
                        }
                      : result
                  )
                );
              }
              
              if (deltaContent) {
                accumulatedContent += deltaContent;
                setTestResults(prev => 
                  prev.map(result => 
                    result.id === testId
                      ? { 
                          ...result, 
                          finalContent: accumulatedContent,
                          response: (accumulatedReasoningContent ? accumulatedReasoningContent + '\n\n' : '') + accumulatedContent,
                          status: 'loading' 
                        }
                      : result
                  )
                );
              }

              const finishReason = parsedChunk.choices?.[0]?.finish_reason;
              if (finishReason === 'stop' || finishReason === 'length') {
                setTestResults(prev => 
                  prev.map(result => 
                    result.id === testId
                      ? { 
                          ...result, 
                          reasoningContent: accumulatedReasoningContent || undefined,
                          finalContent: accumulatedContent || undefined,
                          response: (accumulatedReasoningContent ? accumulatedReasoningContent + '\n\n' : '') + accumulatedContent,
                          status: 'success' 
                        }
                      : result
                  )
                );
                return;
              }
            } catch {
              continue;
            }
          }
        }
      }

    } catch (error) {
      console.error('测试失败:', error);
      setTestResults(prev => 
        prev.map(result => 
          result.id === testId
            ? { 
                ...result, 
                status: 'error', 
                error: error instanceof Error ? error.message : '未知错误',
                rawError: (error as { raw?: unknown }).raw // 保存原始错误信息
              }
            : result
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 执行测试的通用函数（用于自定义测试）
  const runTest = async (query: string, testType: 'web-search' | 'basic-chat' | 'thinking', enableWebSearch: boolean) => {
    const modelIdToUse = useCustomModel && customModelId.trim() ? customModelId.trim() : selectedModel;
    await runTestWithSpecificModel(query, testType, enableWebSearch, modelIdToUse);
  };

  // 自定义测试
  const runCustomTest = (testType: 'web-search' | 'basic-chat' | 'thinking') => {
    if (!customQuery.trim()) return;
    const enableWebSearch = testType === 'web-search';
    runTest(customQuery, testType, enableWebSearch);
  };

  // 清空结果
  const clearResults = () => {
    setTestResults([]);
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'loading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // 获取测试类型标签颜色
  const getTestTypeColor = (testType: 'web-search' | 'basic-chat' | 'thinking') => {
    switch (testType) {
      case 'thinking':
        return 'bg-purple-100 text-purple-800';
      case 'web-search':
        return 'bg-blue-100 text-blue-800';
      case 'basic-chat':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 检查响应是否包含web search特征
  const analyzeResponse = (response: string, testType: 'web-search' | 'basic-chat' | 'thinking') => {
    const webSearchIndicators = [
      '搜索', '查找', '最新', '实时', '当前', '今天', '现在',
      'search', 'searched', 'according to', '根据', 'recent', 
      'current', 'latest', 'update', '更新', 'information',
      '正在为您搜索', '我正在搜索', '搜索结果显示', '最新信息'
    ];

    const noSearchIndicators = [
      '无法获取最新', '没有实时', '训练数据', '知识截止',
      '无法访问', '不能获取', '截至我的知识', '我无法'
    ];
    
    const thinkingIndicators = [
      '步骤', '第一步', '第二步', '首先', '其次', '因此', '所以', '推理过程', '分析如下', '综上所述', 
      'step 1', 'step 2', 'reasoning', 'therefore', 'let\'s think step by step'
    ];

    switch (testType) {
      case 'thinking':
        const hasThinkingFeatures = thinkingIndicators.some(indicator => response.toLowerCase().includes(indicator.toLowerCase()));
        return hasThinkingFeatures ? '✅ 疑似使用了思维链' : '❓ 未检测到明确的思考过程';
      
      case 'web-search':
        const hasWebSearchFeatures = webSearchIndicators.some(indicator => response.toLowerCase().includes(indicator.toLowerCase()));
        const hasNoSearchFeaturesOnWebSearch = noSearchIndicators.some(indicator => response.toLowerCase().includes(indicator.toLowerCase()));
        if (hasWebSearchFeatures && !hasNoSearchFeaturesOnWebSearch) return '✅ 疑似使用了网络搜索';
        if (hasNoSearchFeaturesOnWebSearch) return '❌ 明确表示无法搜索';
        return '❓ 未明确是否搜索';

      case 'basic-chat':
        const hasNoSearchFeaturesOnBasic = noSearchIndicators.some(indicator => response.toLowerCase().includes(indicator.toLowerCase()));
        return hasNoSearchFeaturesOnBasic ? '✅ 正确识别无搜索能力' : '📝 基础对话模式';
      
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🤖 AI 模型能力综合测试平台</h1>
          <p className="text-gray-600 mb-6">
            在此平台，我们可以全面地测试和对比模型的 
            <strong className="text-blue-600">网络搜索</strong>、
            <strong className="text-purple-600">思维链推理</strong> 及 
            <strong className="text-gray-600">基础对话</strong> 能力。
          </p>

          {/* 重点测试模型区域 */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              🎯 重点测试模型 
              <span className="text-sm font-normal text-blue-600">(核心AI能力验证)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {focusModels.map(modelId => {
                const { name, specialFeature, hasWebSearch } = getModelDisplayInfo(modelId);
                return (
                  <div key={modelId} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800 text-sm truncate">{name}</span>
                      {hasWebSearch && <span className="text-green-500 text-xs">🌐</span>}
                    </div>
                    {specialFeature && (
                      <div className="text-xs text-blue-600 mb-2">{specialFeature}</div>
                    )}
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => runFocusModelTest(modelId, 'web-search')}
                        disabled={isLoading}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        🔍
                      </button>
                      <button
                        onClick={() => runFocusModelTest(modelId, 'thinking')}
                        disabled={isLoading}
                        className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:opacity-50"
                      >
                        🧠
                      </button>
                      <button
                        onClick={() => runFocusModelTest(modelId, 'basic-chat')}
                        disabled={isLoading}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50"
                      >
                        💬
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 模型选择 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3">1. 选择模型</h3>
            <div className="flex items-center gap-4 mb-3">
              <label className="block text-sm font-medium text-gray-700">
                预设模型:
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={useCustomModel}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              >
                {getAllModels().map(model => {
                  const { isFocus, specialFeature } = getModelDisplayInfo(model.id);
                  return (
                    <option key={model.id} value={model.id}>
                      {isFocus ? '⭐ ' : ''}{model.name} {model.hasWebSearch ? '🌐' : '📝'} {specialFeature}
                    </option>
                  );
                })}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                ⭐ 重点测试模型，🌐 支持网络搜索，📝 基础对话
              </p>
            </div>
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useCustomModel"
                    checked={useCustomModel}
                    onChange={(e) => setUseCustomModel(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="useCustomModel" className="text-sm font-medium text-gray-700">
                    使用自定义模型ID (例如: `us.anthropic.claude-3-5-sonnet...`)
                  </label>
               </div>
              {useCustomModel && (
                <input
                  type="text"
                  value={customModelId}
                  onChange={(e) => setCustomModelId(e.target.value)}
                  placeholder="在此输入完整的模型ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
          
          {/* 自定义测试 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3">2. 自定义测试</h3>
            <div className="w-full">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="输入你的问题，比如：'今天苹果股价是多少？'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <button
                  onClick={() => runCustomTest('web-search')}
                  disabled={isLoading || !customQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🌐 搜索测试
                </button>
                <button
                  onClick={() => runCustomTest('thinking')}
                  disabled={isLoading || !customQuery.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🧠 思维链测试
                </button>
                <button
                  onClick={() => runCustomTest('basic-chat')}
                  disabled={isLoading || !customQuery.trim()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💬 基础测试
                </button>
              </div>
            </div>
          </div>

          {/* 清空按钮 */}
          {testResults.length > 0 && (
            <div className="mb-6">
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                清空所有结果
              </button>
            </div>
          )}
        </div>

        {/* 测试结果 */}
        <div className="space-y-4">
          {testResults.map((result) => (
            <div key={result.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900 break-all">
                    {focusModels.includes(result.model) ? '⭐ ' : ''}{result.model}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTestTypeColor(result.testType)}`}>
                    {result.testType === 'web-search' ? '🌐 网络搜索' :
                     result.testType === 'thinking' ? '🧠 思维链' :
                     '💬 基础对话'
                    }
                  </span>
                  {result.hasWebSearchCapability && result.testType === 'web-search' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      配置支持搜索
                    </span>
                  )}
                  {result.reasoningContent && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      🔬 包含推理过程
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${getStatusColor(result.status)}`}>
                    {result.status === 'loading' ? '测试中...' : 
                     result.status === 'success' ? '完成' : '失败'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">测试查询：</h4>
                <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-800">
                  {result.query}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">AI回复：</h4>
                  {result.status === 'success' && (
                    <span className="text-sm font-semibold text-gray-700">
                      {analyzeResponse(result.response, result.testType)}
                    </span>
                  )}
                </div>
                
                {/* DeepSeek 推理模型的特殊显示 */}
                {result.reasoningContent && result.finalContent ? (
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                        🔬 推理过程 (Reasoning Content)
                      </h5>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-gray-800">
                        <pre className="whitespace-pre-wrap font-sans">{result.reasoningContent}</pre>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                        ✅ 最终答案 (Final Content)
                      </h5>
                      <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-gray-800">
                        <pre className="whitespace-pre-wrap font-sans">{result.finalContent}</pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-800">
                    {result.status === 'error' ? (
                      <div>
                        <p className="text-red-600 font-semibold">错误: {result.error}</p>
                        {result.rawError && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                              显示原始错误JSON
                            </summary>
                            <pre className="mt-1 p-2 bg-red-50 text-red-700 rounded-md text-xs whitespace-pre-wrap">
                              {JSON.stringify(result.rawError, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ) : result.status === 'loading' ? (
                      <span className="text-blue-600">
                        {result.response || '正在等待模型响应...'}
                        <span className="animate-pulse">|</span>
                      </span>
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans">{result.response}</pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {testResults.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">测试平台已就绪</h3>
            <p className="text-gray-500 mb-4">
              请选择一个模型和测试类型，开始全面验证AI模型的能力。
            </p>
            <div className="text-sm text-gray-400">
              重点测试模型：GPT-4o, GPT-4o Search, o3-mini, Claude 3.7, Gemini 2.0, DeepSeek R1
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 