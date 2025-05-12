// src/app/test-flow/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateAllDocuments } from '@/lib/documentGenerator';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FlowAnswers } from '@/types';

// 定义文档类型
type DocType = 'PRODUCT_DEFINITION' | 'TECH_STACK' | 'BACKEND_STRUCTURE' | 'FRONTEND_STRUCTURE' | 'APP_FLOW';

// 添加文档结构验证规则
const documentValidationRules: Record<DocType, Array<{ key: string; aliases?: string[]; required: boolean }>> = {
  'PRODUCT_DEFINITION': [
    { key: '产品概述', aliases: ['产品概念', 'App Overview', 'Product Overview', '应用概述'], required: true },
    { key: '用户画像', aliases: ['目标用户', 'Target Users', 'User Persona', '用户分析'], required: true },
    { key: '核心功能', aliases: ['Core Features', '主要功能', 'Key Features', '功能列表'], required: true },
    { key: '竞品分析', aliases: ['Competitive Analysis', '市场竞争', '竞争对手', 'Market Analysis'], required: true },
    { key: '商业模式', aliases: ['Business Model', '盈利模式', '变现策略'], required: true },
  ],
  'TECH_STACK': [
    { key: '前端技术栈', aliases: ['Frontend Stack', '前端框架', 'UI Framework', '前端技术'], required: true },
    { key: '后端技术栈', aliases: ['Backend Stack', '后端框架', 'Server Technology', '后端技术'], required: true },
    { key: '数据库选择', aliases: ['Database', '数据库', 'Database Selection', '数据存储'], required: true },
    { key: '第三方服务', aliases: ['Third-party Services', 'API Integration', '外部服务'], required: false },
    { key: '部署方案', aliases: ['Deployment', '部署策略', '服务器部署', 'Hosting'], required: true },
  ],
  'BACKEND_STRUCTURE': [
    { key: 'API 设计', aliases: ['API Design', 'API 接口', 'API 规范', 'Endpoints'], required: true },
    { key: '数据模型', aliases: ['Data Model', '数据结构', 'Schema', '模型设计'], required: true },
    { key: '认证与授权', aliases: ['Authentication', 'Authorization', '权限控制', 'Security'], required: true },
    { key: '业务逻辑', aliases: ['Business Logic', '核心逻辑', 'Service Layer', '服务逻辑'], required: true },
  ],
  'FRONTEND_STRUCTURE': [
    { key: '页面结构', aliases: ['Page Structure', '页面组织', 'Screens', '视图结构'], required: true },
    { key: '组件设计', aliases: ['Component Design', 'UI Components', '界面组件', '组件结构'], required: true },
    { key: '状态管理', aliases: ['State Management', '数据流', 'Data Flow', '状态设计'], required: true },
    { key: '路由设计', aliases: ['Routing', '导航设计', 'Navigation', '路由结构'], required: true },
  ],
  'APP_FLOW': [
    { key: '用户旅程', aliases: ['User Journey', 'User Flow', '用户体验流程', '交互流程'], required: true },
    { key: '关键流程', aliases: ['Key Processes', 'Core Flows', '主要流程', '业务流程'], required: true },
    { key: '异常处理', aliases: ['Error Handling', '错误处理', 'Edge Cases', '边界情况'], required: true },
  ],
};

// 示例数据 - 与表单结构一致的数据对象
// 使用正确的嵌套结构
const sampleFlowAnswers: FlowAnswers = {
  product: {
    productName: '产品经理助手',
    productDescription: '一个帮助产品经理快速生成产品相关文档的工具，包括产品定义、技术架构、前后端结构和流程图。',
    targetUsers: '产品经理、创业者、小型开发团队',
    coreFunctionality: '根据表单输入自动生成产品文档，支持对文档进行编辑和版本管理，提供常见产品模板。',
    competitiveAdvantage: '比传统文档工具更专注于产品设计流程，内置产品经理思维模型，自动化程度高。',
    businessModel: '免费基础版 + 付费专业版（支持更多模板和团队协作功能）',
    visualStyle: '简洁现代',
    primaryColor: '#4169E1', // 皇家蓝
    brandAccentColors: '#FF6B6B', // 粉红色
    preferredFontName: 'Inter, sans-serif',
  },
  tech: {
    projectType: 'full_stack',
    platformType: 'Web应用为主，未来可能开发移动端',
    backendTech: 'Node.js (Next.js API Routes)',
    architectureStyle: 'Monolithic',
    dbType: 'PostgreSQL',
    apiStyle: 'REST',
    uiLibrary: 'React (Next.js)',
    iconLibrary: 'Lucide React',
    needsAuthentication: '是',
    preferredAuthMethods: ['邮箱/密码', 'GitHub OAuth'],
    deploymentTarget: 'Vercel',
    ciCdPreference: 'GitHub Actions',
    monitoringLoggingPreference: 'Vercel Analytics',
    coreEntities: ['User', 'Document', 'Template'],
    entityRelationships: '一个User可以有多个Document，每个Document基于一个Template',
    technicalRequirements: '需要支持云存储、版本控制、AI内容生成，支持多人协作编辑。',
    timelineConstraints: '3个月内完成MVP，6个月内正式上线',
    budgetConstraints: '前期开发预算20万元',
    prioritization: '文档生成功能 > 模板库 > 团队协作 > 高级分析',
  },
  page: {
    pages: {
      "文档列表页": {
        purpose: "显示用户创建的所有文档，允许创建新文档和管理现有文档",
        coreFunctionality: "文档列表、新建文档按钮、文档搜索、排序和筛选",
        userFlow: "1. 用户登录后首先看到此页面。2. 可以看到所有自己创建的文档。3. 点击新建按钮创建文档。4. 点击文档进入编辑页面。"
      },
      "文档编辑页": {
        purpose: "编辑文档内容，生成AI辅助内容",
        coreFunctionality: "富文本编辑器、AI辅助按钮、保存和导出功能",
        userFlow: "1. 用户选择文档模板。2. 填写表单信息。3. 生成初始文档。4. 编辑和调整内容。5. 保存或导出文档。"
      },
      "仪表盘页": {
        purpose: "提供产品使用统计和重要信息概览",
        coreFunctionality: "使用统计图表、最近活动、快捷链接",
        userFlow: "1. 用户从侧边栏进入仪表盘。2. 查看文档统计和活动。3. 通过快捷方式进入常用功能。"
      }
    },
    flowDescription: "用户登录后进入文档列表页，可以创建新文档或编辑现有文档。创建文档时，会先选择模板，然后填写表单，生成初始文档后进入编辑页面。用户可随时通过仪表盘查看统计信息。"
  }
};

// 文档类型映射 - 界面显示的中文名称（包含英文标识）
const DOC_TYPE_NAMES: Record<DocType, string> = {
  'PRODUCT_DEFINITION': '产品定义 (Product Definition)',
  'TECH_STACK': '技术栈 (Tech Stack)',
  'BACKEND_STRUCTURE': '后端结构 (Backend Structure)',
  'FRONTEND_STRUCTURE': '前端结构 (Frontend Structure)',
  'APP_FLOW': '应用流程 (App Flow)',
};

// 文档类型到文件名的映射
const docTypeToFileName: Record<DocType, string> = {
  'PRODUCT_DEFINITION': 'PRODUCT_DEFINITION.md',
  'TECH_STACK': 'TECH_STACK.md',
  'BACKEND_STRUCTURE': 'BACKEND_STRUCTURE.md',
  'FRONTEND_STRUCTURE': 'FRONTEND_GUIDELINES.md', // 注意这个命名不同
  'APP_FLOW': 'APP_FLOW.md',
};

// 文件名到文档类型的映射
const fileNameToDocType: Record<string, DocType> = {
  'PRODUCT_DEFINITION.md': 'PRODUCT_DEFINITION',
  'TECH_STACK.md': 'TECH_STACK',
  'BACKEND_STRUCTURE.md': 'BACKEND_STRUCTURE',
  'FRONTEND_GUIDELINES.md': 'FRONTEND_STRUCTURE',
  'APP_FLOW.md': 'APP_FLOW',
};

// 单个文档的生成时间接口
interface DocumentGenerationTime {
  documentType: DocType;
  startTime: number;
  endTime: number | null;
  durationMs: number | null;
}

// 文档验证结果接口
interface ValidationResult {
  documentType: DocType;
  isValid: boolean;
  missingSections: string[];
  hasSections: string[];
  debugInfo: string; // 添加调试信息
}

export default function TestFlowPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 新增状态
  const [selectedDocument, setSelectedDocument] = useState<DocType | null>(null);
  const [documentContents, setDocumentContents] = useState<Map<DocType, string>>(new Map());
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');
  
  // 时间记录
  const [totalStartTime, setTotalStartTime] = useState<number | null>(null);
  const [totalEndTime, setTotalEndTime] = useState<number | null>(null);
  const [docGenerationTimes, setDocGenerationTimes] = useState<DocumentGenerationTime[]>([]);

  // 新增状态
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // 验证文档结构是否符合预期
  const validateDocument = (content: string, documentType: DocType): ValidationResult => {
    const rules = documentValidationRules[documentType] || [];
    const missingRules: string[] = [];
    const foundRules: string[] = [];
    const debugInfo: string[] = [];
    
    debugInfo.push(`验证文档: ${documentType}, 规则数量: ${rules.length}`);
    
    rules.forEach(rule => {
      // 记录正在检查的规则
      const ruleTerms = [rule.key, ...(rule.aliases || [])];
      debugInfo.push(`检查规则: "${rule.key}" (${rule.required ? '必需' : '可选'}), 别名: ${rule.aliases?.join(', ') || '无'}`);
      
      // 1. 检查简单文本匹配 (不够精确，但作为后备)
      const simpleTextMatch = ruleTerms.some(term => 
        content.toLowerCase().includes(term.toLowerCase())
      );
      
      // 2. 检查Markdown标题格式 (最精确)
      // 支持多种格式:
      // ## 标题
      // ## 1. 标题
      // ## 1.1 标题
      const titleMatches = ruleTerms.some(term => {
        const titleRegex = new RegExp(`(^|\\n)\\s*#+\\s*(\\d+\\.?\\s*)?([\\d\\.]*\\s*)?${escapeRegExp(term)}\\b`, 'i');
        return titleRegex.test(content);
      });
      
      // 记录匹配结果
      debugInfo.push(`  - 简单文本匹配: ${simpleTextMatch ? '通过' : '未通过'}`);
      debugInfo.push(`  - 标题格式匹配: ${titleMatches ? '通过' : '未通过'}`);
      
      // 优先使用标题匹配结果，如果没有找到标题匹配再使用简单文本匹配
      const sectionExists = titleMatches || simpleTextMatch;
      
      if (sectionExists) {
        foundRules.push(rule.key);
      } else if (rule.required) {
        missingRules.push(rule.key);
      }
    });
    
    debugInfo.push(`验证结果: ${missingRules.length === 0 ? '通过' : '不通过'}, 缺失章节: ${missingRules.length}`);
    
    return {
      documentType,
      isValid: missingRules.length === 0,
      missingSections: missingRules,
      hasSections: foundRules,
      debugInfo: debugInfo.join('\n')
    };
  };

  // 辅助函数：转义正则表达式中的特殊字符
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& 表示整个匹配字符串
  }

  // 获取文档内容
  const fetchDocumentContent = async (documentType: DocType) => {
    if (documentContents.has(documentType)) {
      return; // 已有内容则不再获取
    }
    
    const filename = docTypeToFileName[documentType];
    
    setIsLoadingContent(true);
    try {
      const response = await fetch(`/api/read-doc?filename=${filename}`);
      if (!response.ok) {
        throw new Error(`无法读取文档: ${response.statusText}`);
      }
      const content = await response.text();
      setDocumentContents(prev => {
        const newContents = new Map(prev);
        newContents.set(documentType, content);
        return newContents;
      });
      
      // 验证文档结构
      const result = validateDocument(content, documentType);
      setValidationResults(prev => [...prev.filter(r => r.documentType !== documentType), result]);
    } catch (err) {
      console.error('获取文档内容失败:', err);
      setError(`获取文档内容失败: ${(err as Error).message}`);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // 修改运行测试函数
  const handleRunTest = async () => {
    setError(null);
    setResults([]);
    setIsLoading(true);
    setValidationResults([]);
    setDocumentContents(new Map());
    setTotalStartTime(Date.now());
    setDocGenerationTimes([]);
    
    const docTypesToGenerate: DocType[] = [
      'PRODUCT_DEFINITION',
      'TECH_STACK',
      'BACKEND_STRUCTURE',
      'FRONTEND_STRUCTURE',
      'APP_FLOW',
    ];
    
    // 初始化文档生成时间记录
    setDocGenerationTimes(
      docTypesToGenerate.map(docType => ({
        documentType: docType,
        startTime: Date.now(),
        endTime: null,
        durationMs: null,
      }))
    );

    try {
      // 调用共享的文档生成函数，使用示例数据
      console.log("调用generateAllDocuments，传递的数据:", JSON.stringify(sampleFlowAnswers, null, 2));
      const { generatedDocsMap, errors } = await generateAllDocuments(sampleFlowAnswers);

      console.log("快速测试生成完成。错误:", errors);
      console.log("生成的文档Map:", Array.from(generatedDocsMap.entries()));

      // 更新每个文档的生成时间
      const updatedTimes = docTypesToGenerate.map(docType => {
        const time = docGenerationTimes.find(t => t.documentType === docType) || {
          documentType: docType,
          startTime: totalStartTime || Date.now(),
          endTime: null,
          durationMs: null,
        };
        
        time.endTime = Date.now();
        time.durationMs = time.endTime - time.startTime;
        return time;
      });
      setDocGenerationTimes(updatedTimes);

      // 处理结果 - 使用索引访问而不是未使用的 '_'
      const successfullyGeneratedFilenames = Array.from(generatedDocsMap.entries())
        .filter((entry) => entry[1] !== null) // 过滤掉内容为 null 的条目
        .map((entry) => entry[0]); // 只提取文件名（第一个元素）

      // 输出结果
      if (errors.length > 0) {
        setError(`生成过程中发生 ${errors.length} 个错误。`);
        setResults(successfullyGeneratedFilenames);
      } else if (successfullyGeneratedFilenames.length === 0) {
        setError("所有文档生成均失败。请检查 AI 服务或提示词配置。");
      } else {
        // --- 将生成的文件写入后端 ---
        console.log("尝试写入生成的文件...");
        const writeErrors: string[] = [];
        for (const [filename, content] of generatedDocsMap.entries()) {
          if (content) { // 只有当内容不为 null 时才写入
            try {
              console.log(`写入文件: ${filename}，内容长度: ${content.length} 字符`);
              
              // 获取对应的文档类型
              const docType = fileNameToDocType[filename];
              
              // 更新文档内容缓存
              if (docType) {
                setDocumentContents(prev => {
                  const newMap = new Map(prev);
                  newMap.set(docType, content);
                  return newMap;
                });
                
                // 验证文档结构
                const result = validateDocument(content, docType);
                setValidationResults(prev => [...prev.filter(r => r.documentType !== docType), result]);
              }
              
              // 发送到服务器保存
              const response = await fetch('/api/write-doc', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  filename,
                  content,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 错误: ${errorData.error || response.statusText}`);
              }
            } catch (writeError) {
              console.error(`写入文件 ${filename} 时出错:`, writeError);
              writeErrors.push(`${filename}: ${(writeError as Error).message}`);
            }
          }
        }

        // 根据写入结果设置最终状态
        if (writeErrors.length > 0) {
          setError(`写入文件时发生了 ${writeErrors.length} 个错误: ${writeErrors.join('; ')}`);
        }
        
        setResults(successfullyGeneratedFilenames);
      }
    } catch (err) {
      console.error("生成过程中出错:", err);
      setError(`生成过程中出错: ${(err as Error).message || '未知错误'}`);
    } finally {
      setIsLoading(false);
      setTotalEndTime(Date.now());
    }
  };

  // 计算总生成时间
  const getTotalDuration = () => {
    if (totalStartTime && totalEndTime) {
      return ((totalEndTime - totalStartTime) / 1000).toFixed(2);
    }
    return null;
  };

  // 获取指定文档的生成时间
  const getDocumentDuration = (docType: DocType) => {
    const time = docGenerationTimes.find(t => t.documentType === docType);
    if (time?.durationMs) {
      return (time.durationMs / 1000).toFixed(2);
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">新产品流程快速测试</h1>
        <p className="text-gray-600 mt-2">
          使用预设的示例数据快速触发新产品流程的文档生成。
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">测试控制</h2>
            <p className="text-gray-600 mb-4">
              点击下方按钮使用示例数据生成产品文档。
            </p>
          </div>
          <div className="flex justify-between items-center">
            <button 
              onClick={handleRunTest} 
              disabled={isLoading}
              className={`px-4 py-2 rounded ${isLoading ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600 text-white'} font-medium transition-colors`}
            >
              {isLoading && <span className="mr-2">⏳</span>}
              {isLoading ? '正在生成文档...' : '运行快速测试'}
            </button>
            
            {totalStartTime && totalEndTime && (
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span>总耗时: <strong>{getTotalDuration()}</strong> 秒</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center mb-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              <h3 className="font-bold">错误</h3>
            </div>
            <p>{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mb-6">
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  生成概览
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-2 px-4 font-medium ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  文档内容
                </button>
              </nav>
            </div>
            
            {activeTab === 'overview' && (
              <div className="bg-white rounded shadow-md p-4">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">生成结果</h2>
                  <p className="text-gray-600">
                    成功生成了 {results.length} 个文档
                  </p>
                </div>
                <div className="space-y-4">
                  {Object.entries(DOC_TYPE_NAMES).map(([docType, docName]) => {
                    const typedDocType = docType as DocType;
                    const filename = docTypeToFileName[typedDocType];
                    const isGenerated = results.includes(filename);
                    const validationResult = validationResults.find(v => v.documentType === typedDocType);
                    const duration = getDocumentDuration(typedDocType);
                    
                    return (
                      <div key={docType} className={`flex justify-between items-center p-3 border rounded-md ${isGenerated ? 'bg-white' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2">
                          {isGenerated ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <span className="font-medium">{docName}</span>
                            <div className="text-xs text-gray-500 mt-1">
                              文件名: {filename}
                            </div>
                          </div>
                          
                          {validationResult && (
                            <span className={`text-xs ml-2 px-2 py-1 rounded ${validationResult.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {validationResult.isValid ? "结构验证通过" : "结构不完整"}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {duration && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {duration}秒
                            </span>
                          )}
                          
                          {isGenerated && (
                            <button 
                              className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                              onClick={() => {
                                setSelectedDocument(typedDocType);
                                fetchDocumentContent(typedDocType);
                                setActiveTab('content');
                              }}
                            >
                              查看内容
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {activeTab === 'content' && (
              <div className="bg-white rounded shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">文档内容查看器</h2>
                  <select 
                    value={selectedDocument || ''} 
                    onChange={(e) => {
                      if (e.target.value) {
                        const docType = e.target.value as DocType;
                        setSelectedDocument(docType);
                        fetchDocumentContent(docType);
                      }
                    }}
                    className="border p-2 rounded"
                  >
                    <option value="">选择文档</option>
                    {Object.entries(DOC_TYPE_NAMES).map(([docType, docName]) => (
                      <option key={docType} value={docType}>
                        {docName}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedDocument && (
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-600">
                      正在查看 <span className="font-medium">{DOC_TYPE_NAMES[selectedDocument]}</span>
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      validationResults.find(v => v.documentType === selectedDocument)?.isValid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {validationResults.find(v => v.documentType === selectedDocument)?.isValid 
                        ? "结构验证通过" 
                        : "结构不完整"}
                    </span>
                  </div>
                )}
                <div className="border rounded p-4 bg-gray-50">
                  {isLoadingContent ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-6 bg-gray-200 rounded w-2/4 mt-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ) : selectedDocument && documentContents.has(selectedDocument) ? (
                    <div className="prose max-w-none">
                      <ReactMarkdown>
                        {documentContents.get(selectedDocument) || ''}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      请选择一个文档来查看其内容
                    </div>
                  )}
                </div>
                {selectedDocument && validationResults.find(v => v.documentType === selectedDocument) && (
                  <div className="border-t mt-4 pt-4">
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">验证结果</h4>
                        
                        <button 
                          onClick={() => setShowDebugInfo(!showDebugInfo)}
                          className="text-xs text-blue-600 hover:underline flex items-center"
                        >
                          {showDebugInfo ? '隐藏调试信息' : '显示调试信息'} 
                          <span className="ml-1">{showDebugInfo ? '▲' : '▼'}</span>
                        </button>
                      </div>
                      
                      <div className="text-sm">
                        {(() => {
                          const result = validationResults.find(v => v.documentType === selectedDocument);
                          if (!result) return null;
                          
                          return (
                            <div className="space-y-2">
                              <p>
                                状态: {' '}
                                <span className={`inline-block px-2 py-1 rounded ${result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {result.isValid ? "通过验证" : "验证失败"}
                                </span>
                              </p>
                              
                              {result.hasSections.length > 0 && (
                                <div>
                                  <p className="font-medium">包含章节:</p>
                                  <ul className="list-disc pl-5">
                                    {result.hasSections.map(section => (
                                      <li key={section}>{section}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {result.missingSections.length > 0 && (
                                <div>
                                  <p className="font-medium text-red-500">缺失章节:</p>
                                  <ul className="list-disc pl-5">
                                    {result.missingSections.map(section => (
                                      <li key={section}>{section}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {showDebugInfo && (
                                <div className="mt-4 p-3 bg-gray-100 rounded border text-xs font-mono whitespace-pre-wrap">
                                  {result.debugInfo}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-sm text-gray-500 mt-12">
        <Link href="/" className="text-blue-600 hover:underline">
          返回主应用
        </Link>
      </footer>
    </div>
  );
}