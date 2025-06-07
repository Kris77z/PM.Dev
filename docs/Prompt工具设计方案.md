# Prompt工具设计方案

## 📋 项目概述

基于Cherry Studio的Assistant和Regular Prompts系统，为PM Assistant设计一个完整的Prompt管理工具，让用户能够创建、管理和快速调用各种Prompt模板。

## 🎯 功能目标

### 核心功能
1. **Prompt模板库**: 分类管理不同用途的Prompt模板
2. **参数化模板**: 支持变量替换，如 `{{product_name}}`, `{{target_audience}}`
3. **快速调用**: 一键应用Prompt并调用AI模型生成内容
4. **分类管理**: 按用途分类（运营文案、技术文档、产品规划等）
5. **模板分享**: 导入导出Prompt模板
6. **效果追踪**: 记录Prompt的使用效果和用户反馈

### 用户场景
1. **产品经理**: 快速生成PRD、用户故事、竞品分析
2. **运营人员**: 生成各种营销文案、社媒内容
3. **技术人员**: 生成技术文档、代码注释、API文档
4. **通用用户**: 使用预设模板快速完成常见任务

## 🏗️ 系统架构

### 页面结构
```
/prompt-house
├── 侧边栏
│   ├── 分类列表
│   ├── 我的模板
│   └── 公共模板
├── 主内容区
│   ├── 模板列表
│   ├── 模板详情
│   └── 模板编辑器
└── 右侧面板
    ├── 参数配置
    ├── 预览效果
    └── 生成结果
```

### 数据结构设计

```typescript
// Prompt模板数据结构
interface PromptTemplate {
  id: string
  name: string
  description: string
  category: PromptCategory
  tags: string[]
  template: string              // 支持 {{variable}} 语法
  variables: PromptVariable[]   // 模板变量定义
  examples: PromptExample[]     // 使用示例
  author: string
  isPublic: boolean
  usageCount: number
  rating: number
  createdAt: Date
  updatedAt: Date
}

// 模板变量定义
interface PromptVariable {
  name: string                  // 变量名，如 product_name
  label: string                 // 显示标签，如 "产品名称"
  type: 'text' | 'textarea' | 'select' | 'number'
  description: string           // 变量说明
  defaultValue?: string         // 默认值
  options?: string[]            // select类型的选项
  required: boolean             // 是否必填
  placeholder?: string          // 输入提示
}

// 使用示例
interface PromptExample {
  title: string
  variables: Record<string, string>  // 变量值
  expectedOutput: string             // 期望输出
}

// 分类定义
enum PromptCategory {
  MARKETING = 'marketing',      // 运营文案
  PRODUCT = 'product',          // 产品规划
  TECHNICAL = 'technical',      // 技术文档
  ANALYSIS = 'analysis',        // 分析报告
  CREATIVE = 'creative',        // 创意内容
  GENERAL = 'general'           // 通用模板
}

// 使用记录
interface PromptUsage {
  id: string
  templateId: string
  variables: Record<string, string>
  generatedContent: string
  model: string
  rating?: number
  feedback?: string
  createdAt: Date
}
```

## 🎨 界面设计

### 1. 主页面布局

```typescript
// pages/prompt-house/page.tsx
export default function PromptHousePage() {
  return (
    <div className="prompt-house-container">
      {/* 侧边栏 */}
      <PromptSidebar />
      
      {/* 主内容区 */}
      <div className="main-content">
        <PromptHeader />
        <PromptGrid />
      </div>
      
      {/* 右侧面板 */}
      <PromptPanel />
    </div>
  )
}
```

### 2. 模板卡片组件

```typescript
// components/prompt/PromptCard.tsx
interface PromptCardProps {
  template: PromptTemplate
  onUse: (template: PromptTemplate) => void
  onEdit: (template: PromptTemplate) => void
  onDelete: (templateId: string) => void
}

export const PromptCard: React.FC<PromptCardProps> = ({
  template,
  onUse,
  onEdit,
  onDelete
}) => {
  return (
    <div className="prompt-card">
      <div className="card-header">
        <h3 className="template-name">{template.name}</h3>
        <div className="card-actions">
          <button onClick={() => onUse(template)} className="use-button">
            使用
          </button>
          <DropdownMenu>
            <DropdownItem onClick={() => onEdit(template)}>编辑</DropdownItem>
            <DropdownItem onClick={() => onDelete(template.id)}>删除</DropdownItem>
          </DropdownMenu>
        </div>
      </div>
      
      <p className="template-description">{template.description}</p>
      
      <div className="template-meta">
        <span className="category-tag">{template.category}</span>
        <div className="template-stats">
          <span>使用 {template.usageCount} 次</span>
          <StarRating rating={template.rating} readonly />
        </div>
      </div>
      
      <div className="template-tags">
        {template.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      
      {template.variables.length > 0 && (
        <div className="variables-preview">
          <span className="variables-count">
            {template.variables.length} 个参数
          </span>
          <div className="variables-list">
            {template.variables.slice(0, 3).map(variable => (
              <span key={variable.name} className="variable-tag">
                {variable.label}
              </span>
            ))}
            {template.variables.length > 3 && <span>...</span>}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 3. 模板编辑器

```typescript
// components/prompt/PromptEditor.tsx
interface PromptEditorProps {
  template?: PromptTemplate
  onSave: (template: PromptTemplate) => void
  onCancel: () => void
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<PromptTemplate>>(
    template || {
      name: '',
      description: '',
      category: PromptCategory.GENERAL,
      template: '',
      variables: [],
      tags: [],
      isPublic: false
    }
  )

  const [variables, setVariables] = useState<PromptVariable[]>(
    template?.variables || []
  )

  return (
    <div className="prompt-editor">
      <div className="editor-header">
        <h2>{template ? '编辑模板' : '创建新模板'}</h2>
        <div className="header-actions">
          <button onClick={onCancel} className="cancel-button">
            取消
          </button>
          <button onClick={handleSave} className="save-button">
            保存
          </button>
        </div>
      </div>

      <div className="editor-content">
        {/* 基本信息 */}
        <div className="section">
          <h3>基本信息</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>模板名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="输入模板名称"
              />
            </div>
            
            <div className="form-field">
              <label>分类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as PromptCategory})}
              >
                <option value={PromptCategory.MARKETING}>运营文案</option>
                <option value={PromptCategory.PRODUCT}>产品规划</option>
                <option value={PromptCategory.TECHNICAL}>技术文档</option>
                <option value={PromptCategory.ANALYSIS}>分析报告</option>
                <option value={PromptCategory.CREATIVE}>创意内容</option>
                <option value={PromptCategory.GENERAL}>通用模板</option>
              </select>
            </div>
          </div>
          
          <div className="form-field">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="描述这个模板的用途和特点"
              rows={3}
            />
          </div>
          
          <div className="form-field">
            <label>标签</label>
            <TagInput
              tags={formData.tags || []}
              onChange={(tags) => setFormData({...formData, tags})}
              placeholder="添加标签，按回车确认"
            />
          </div>
        </div>

        {/* Prompt模板 */}
        <div className="section">
          <h3>Prompt模板</h3>
          <div className="template-editor">
            <textarea
              value={formData.template}
              onChange={(e) => setFormData({...formData, template: e.target.value})}
              placeholder="输入Prompt模板，使用 {{变量名}} 来定义变量"
              rows={10}
              className="template-textarea"
            />
            <div className="editor-help">
              <p>💡 使用 <code>{`{{变量名}}`}</code> 来定义可替换的变量</p>
              <p>例如：为 <code>{`{{product_name}}`}</code> 写一份产品介绍</p>
            </div>
          </div>
        </div>

        {/* 变量定义 */}
        <div className="section">
          <h3>变量定义</h3>
          <VariableEditor
            variables={variables}
            onChange={setVariables}
            templateContent={formData.template || ''}
          />
        </div>

        {/* 预览 */}
        <div className="section">
          <h3>预览</h3>
          <PromptPreview
            template={formData.template || ''}
            variables={variables}
          />
        </div>
      </div>
    </div>
  )
}
```

### 4. 变量编辑器

```typescript
// components/prompt/VariableEditor.tsx
interface VariableEditorProps {
  variables: PromptVariable[]
  onChange: (variables: PromptVariable[]) => void
  templateContent: string
}

export const VariableEditor: React.FC<VariableEditorProps> = ({
  variables,
  onChange,
  templateContent
}) => {
  // 从模板内容中提取变量
  const extractedVariables = useMemo(() => {
    const regex = /\{\{(\w+)\}\}/g
    const matches = [...templateContent.matchAll(regex)]
    return [...new Set(matches.map(match => match[1]))]
  }, [templateContent])

  // 确保所有提取的变量都有定义
  useEffect(() => {
    const newVariables = [...variables]
    let hasChanges = false

    extractedVariables.forEach(varName => {
      if (!variables.find(v => v.name === varName)) {
        newVariables.push({
          name: varName,
          label: varName,
          type: 'text',
          description: '',
          required: true
        })
        hasChanges = true
      }
    })

    if (hasChanges) {
      onChange(newVariables)
    }
  }, [extractedVariables, variables, onChange])

  const updateVariable = (index: number, updates: Partial<PromptVariable>) => {
    const newVariables = [...variables]
    newVariables[index] = { ...newVariables[index], ...updates }
    onChange(newVariables)
  }

  const removeVariable = (index: number) => {
    const newVariables = variables.filter((_, i) => i !== index)
    onChange(newVariables)
  }

  return (
    <div className="variable-editor">
      {variables.length === 0 ? (
        <div className="no-variables">
          <p>在模板中使用 <code>{`{{变量名}}`}</code> 来定义变量</p>
        </div>
      ) : (
        <div className="variables-list">
          {variables.map((variable, index) => (
            <div key={variable.name} className="variable-item">
              <div className="variable-header">
                <span className="variable-name">{`{{${variable.name}}}`}</span>
                <button
                  onClick={() => removeVariable(index)}
                  className="remove-button"
                  title="删除变量"
                >
                  ×
                </button>
              </div>
              
              <div className="variable-config">
                <div className="config-row">
                  <div className="config-field">
                    <label>显示名称</label>
                    <input
                      type="text"
                      value={variable.label}
                      onChange={(e) => updateVariable(index, { label: e.target.value })}
                      placeholder="变量的显示名称"
                    />
                  </div>
                  
                  <div className="config-field">
                    <label>类型</label>
                    <select
                      value={variable.type}
                      onChange={(e) => updateVariable(index, { type: e.target.value as any })}
                    >
                      <option value="text">单行文本</option>
                      <option value="textarea">多行文本</option>
                      <option value="select">下拉选择</option>
                      <option value="number">数字</option>
                    </select>
                  </div>
                  
                  <div className="config-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={variable.required}
                        onChange={(e) => updateVariable(index, { required: e.target.checked })}
                      />
                      必填
                    </label>
                  </div>
                </div>
                
                <div className="config-row">
                  <div className="config-field full-width">
                    <label>描述</label>
                    <input
                      type="text"
                      value={variable.description}
                      onChange={(e) => updateVariable(index, { description: e.target.value })}
                      placeholder="变量的用途说明"
                    />
                  </div>
                </div>
                
                <div className="config-row">
                  <div className="config-field">
                    <label>默认值</label>
                    <input
                      type="text"
                      value={variable.defaultValue || ''}
                      onChange={(e) => updateVariable(index, { defaultValue: e.target.value })}
                      placeholder="默认值（可选）"
                    />
                  </div>
                  
                  <div className="config-field">
                    <label>输入提示</label>
                    <input
                      type="text"
                      value={variable.placeholder || ''}
                      onChange={(e) => updateVariable(index, { placeholder: e.target.value })}
                      placeholder="输入框提示文字"
                    />
                  </div>
                </div>
                
                {variable.type === 'select' && (
                  <div className="config-row">
                    <div className="config-field full-width">
                      <label>选项（每行一个）</label>
                      <textarea
                        value={variable.options?.join('\n') || ''}
                        onChange={(e) => updateVariable(index, { 
                          options: e.target.value.split('\n').filter(Boolean) 
                        })}
                        placeholder="选项1&#10;选项2&#10;选项3"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 5. 模板使用面板

```typescript
// components/prompt/PromptUsagePanel.tsx
interface PromptUsagePanelProps {
  template: PromptTemplate
  onGenerate: (prompt: string, variables: Record<string, string>) => void
  onClose: () => void
}

export const PromptUsagePanel: React.FC<PromptUsagePanelProps> = ({
  template,
  onGenerate,
  onClose
}) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [generatedPrompt, setGeneratedPrompt] = useState('')

  // 初始化变量默认值
  useEffect(() => {
    const defaultValues: Record<string, string> = {}
    template.variables.forEach(variable => {
      if (variable.defaultValue) {
        defaultValues[variable.name] = variable.defaultValue
      }
    })
    setVariableValues(defaultValues)
  }, [template])

  // 实时生成预览
  useEffect(() => {
    let prompt = template.template
    template.variables.forEach(variable => {
      const value = variableValues[variable.name] || `{{${variable.name}}}`
      prompt = prompt.replace(new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'), value)
    })
    setGeneratedPrompt(prompt)
  }, [template, variableValues])

  const handleVariableChange = (variableName: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value
    }))
  }

  const handleGenerate = () => {
    // 验证必填字段
    const missingRequired = template.variables
      .filter(v => v.required && !variableValues[v.name])
      .map(v => v.label)

    if (missingRequired.length > 0) {
      alert(`请填写必填字段：${missingRequired.join(', ')}`)
      return
    }

    onGenerate(generatedPrompt, variableValues)
  }

  return (
    <div className="prompt-usage-panel">
      <div className="panel-header">
        <h3>{template.name}</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="panel-content">
        {/* 变量输入 */}
        <div className="variables-section">
          <h4>参数配置</h4>
          <div className="variables-form">
            {template.variables.map(variable => (
              <div key={variable.name} className="variable-input">
                <label>
                  {variable.label}
                  {variable.required && <span className="required">*</span>}
                </label>
                
                {variable.description && (
                  <p className="variable-description">{variable.description}</p>
                )}
                
                {variable.type === 'text' && (
                  <input
                    type="text"
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    placeholder={variable.placeholder}
                  />
                )}
                
                {variable.type === 'textarea' && (
                  <textarea
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    placeholder={variable.placeholder}
                    rows={3}
                  />
                )}
                
                {variable.type === 'select' && (
                  <select
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                  >
                    <option value="">请选择...</option>
                    {variable.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                
                {variable.type === 'number' && (
                  <input
                    type="number"
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    placeholder={variable.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 预览 */}
        <div className="preview-section">
          <h4>Prompt预览</h4>
          <div className="prompt-preview">
            <pre>{generatedPrompt}</pre>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="panel-actions">
          <button onClick={handleGenerate} className="generate-button">
            生成内容
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 🗂️ 预设模板库

### 运营文案类

```typescript
const marketingTemplates: PromptTemplate[] = [
  {
    id: 'product-intro',
    name: '产品介绍文案',
    description: '为产品生成吸引人的介绍文案',
    category: PromptCategory.MARKETING,
    template: `请为{{product_name}}写一份产品介绍文案。

产品信息：
- 产品名称：{{product_name}}
- 目标用户：{{target_audience}}
- 核心功能：{{core_features}}
- 产品优势：{{advantages}}
- 使用场景：{{use_cases}}

要求：
1. 文案要吸引人，突出产品价值
2. 语言要{{tone}}
3. 字数控制在{{word_count}}字以内
4. 包含明确的行动号召

请生成专业的产品介绍文案。`,
    variables: [
      {
        name: 'product_name',
        label: '产品名称',
        type: 'text',
        description: '你的产品名称',
        required: true,
        placeholder: '例如：智能项目管理工具'
      },
      {
        name: 'target_audience',
        label: '目标用户',
        type: 'text',
        description: '产品的主要目标用户群体',
        required: true,
        placeholder: '例如：中小企业团队、产品经理'
      },
      {
        name: 'core_features',
        label: '核心功能',
        type: 'textarea',
        description: '产品的主要功能特性',
        required: true,
        placeholder: '例如：任务管理、团队协作、进度跟踪'
      },
      {
        name: 'advantages',
        label: '产品优势',
        type: 'textarea',
        description: '相比竞品的优势',
        required: true,
        placeholder: '例如：界面简洁、操作便捷、价格实惠'
      },
      {
        name: 'use_cases',
        label: '使用场景',
        type: 'textarea',
        description: '产品的典型使用场景',
        required: true,
        placeholder: '例如：项目规划、日常办公、团队沟通'
      },
      {
        name: 'tone',
        label: '文案风格',
        type: 'select',
        description: '文案的语言风格',
        required: true,
        options: ['专业严谨', '轻松活泼', '简洁明了', '温暖亲切']
      },
      {
        name: 'word_count',
        label: '字数要求',
        type: 'number',
        description: '文案的字数限制',
        required: true,
        defaultValue: '300'
      }
    ],
    tags: ['产品介绍', '营销文案', '商业'],
    author: 'system',
    isPublic: true,
    usageCount: 0,
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  {
    id: 'social-media-post',
    name: '社媒内容生成',
    description: '为不同社交媒体平台生成合适的内容',
    category: PromptCategory.MARKETING,
    template: `请为{{platform}}平台创作一条关于{{topic}}的内容。

内容要求：
- 平台：{{platform}}
- 主题：{{topic}}
- 目标：{{goal}}
- 风格：{{style}}
- 包含话题标签：{{hashtags}}

请根据{{platform}}平台的特点，创作符合平台调性的内容，确保能够吸引用户互动。`,
    variables: [
      {
        name: 'platform',
        label: '社交平台',
        type: 'select',
        description: '选择发布的社交媒体平台',
        required: true,
        options: ['微信朋友圈', '微博', '小红书', '抖音', 'LinkedIn', 'Twitter']
      },
      {
        name: 'topic',
        label: '内容主题',
        type: 'text',
        description: '要发布的内容主题',
        required: true,
        placeholder: '例如：新产品发布、行业观点、生活分享'
      },
      {
        name: 'goal',
        label: '发布目标',
        type: 'select',
        description: '这条内容的主要目标',
        required: true,
        options: ['品牌宣传', '产品推广', '用户互动', '知识分享', '引流转化']
      },
      {
        name: 'style',
        label: '内容风格',
        type: 'select',
        description: '内容的表达风格',
        required: true,
        options: ['专业权威', '轻松幽默', '温暖治愈', '激励正能量', '干货实用']
      },
      {
        name: 'hashtags',
        label: '相关标签',
        type: 'text',
        description: '相关的话题标签，用逗号分隔',
        required: false,
        placeholder: '例如：产品经理,职场,效率工具'
      }
    ],
    tags: ['社交媒体', '内容营销', '品牌推广'],
    author: 'system',
    isPublic: true,
    usageCount: 0,
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]
```

### 产品规划类

```typescript
const productTemplates: PromptTemplate[] = [
  {
    id: 'user-story',
    name: '用户故事生成',
    description: '根据功能需求生成标准的用户故事',
    category: PromptCategory.PRODUCT,
    template: `请为{{feature_name}}功能编写用户故事。

功能信息：
- 功能名称：{{feature_name}}
- 目标用户：{{user_role}}
- 功能描述：{{feature_description}}
- 业务价值：{{business_value}}
- 优先级：{{priority}}

请按照标准的用户故事格式编写：
"作为一个[用户角色]，我希望[功能描述]，以便[业务价值]"

同时请提供：
1. 详细的功能描述
2. 验收标准（至少3条）
3. 可能的边界情况
4. 与其他功能的关联性`,
    variables: [
      {
        name: 'feature_name',
        label: '功能名称',
        type: 'text',
        description: '要开发的功能名称',
        required: true,
        placeholder: '例如：用户登录、商品搜索、订单支付'
      },
      {
        name: 'user_role',
        label: '用户角色',
        type: 'text',
        description: '使用该功能的用户角色',
        required: true,
        placeholder: '例如：普通用户、管理员、商家'
      },
      {
        name: 'feature_description',
        label: '功能描述',
        type: 'textarea',
        description: '功能的详细描述',
        required: true,
        placeholder: '描述这个功能要实现什么，如何使用'
      },
      {
        name: 'business_value',
        label: '业务价值',
        type: 'textarea',
        description: '这个功能能带来什么业务价值',
        required: true,
        placeholder: '例如：提升用户体验、增加转化率、降低运营成本'
      },
      {
        name: 'priority',
        label: '优先级',
        type: 'select',
        description: '功能的开发优先级',
        required: true,
        options: ['高', '中', '低']
      }
    ],
    tags: ['用户故事', '需求分析', '产品规划'],
    author: 'system',
    isPublic: true,
    usageCount: 0,
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]
```

## 🔧 技术实现

### 1. 数据存储

```typescript
// lib/prompt-storage.ts
export class PromptStorage {
  private static readonly STORAGE_KEY = 'pm-assistant-prompts'
  private static readonly USAGE_KEY = 'pm-assistant-prompt-usage'

  static saveTemplate(template: PromptTemplate): void {
    const templates = this.getAllTemplates()
    const existingIndex = templates.findIndex(t => t.id === template.id)
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template
    } else {
      templates.push(template)
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates))
  }

  static getAllTemplates(): PromptTemplate[] {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) {
      // 初始化预设模板
      const defaultTemplates = [...marketingTemplates, ...productTemplates]
      this.saveTemplates(defaultTemplates)
      return defaultTemplates
    }
    return JSON.parse(stored)
  }

  static getTemplatesByCategory(category: PromptCategory): PromptTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category)
  }

  static deleteTemplate(templateId: string): void {
    const templates = this.getAllTemplates().filter(t => t.id !== templateId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates))
  }

  static recordUsage(usage: PromptUsage): void {
    const usages = this.getAllUsages()
    usages.push(usage)
    
    // 只保留最近1000条使用记录
    if (usages.length > 1000) {
      usages.splice(0, usages.length - 1000)
    }
    
    localStorage.setItem(this.USAGE_KEY, JSON.stringify(usages))
    
    // 更新模板使用次数
    this.incrementUsageCount(usage.templateId)
  }

  private static incrementUsageCount(templateId: string): void {
    const templates = this.getAllTemplates()
    const template = templates.find(t => t.id === templateId)
    if (template) {
      template.usageCount++
      this.saveTemplate(template)
    }
  }

  static getAllUsages(): PromptUsage[] {
    const stored = localStorage.getItem(this.USAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static exportTemplates(): string {
    const templates = this.getAllTemplates().filter(t => !t.isPublic)
    return JSON.stringify(templates, null, 2)
  }

  static importTemplates(jsonData: string): number {
    try {
      const importedTemplates: PromptTemplate[] = JSON.parse(jsonData)
      let importCount = 0
      
      importedTemplates.forEach(template => {
        // 生成新的ID避免冲突
        template.id = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        template.createdAt = new Date()
        template.updatedAt = new Date()
        this.saveTemplate(template)
        importCount++
      })
      
      return importCount
    } catch (error) {
      throw new Error('导入失败：文件格式不正确')
    }
  }
}
```

### 2. Prompt处理工具

```typescript
// lib/prompt-processor.ts
export class PromptProcessor {
  static processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template
    
    // 替换所有变量
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      processed = processed.replace(regex, value)
    })
    
    return processed
  }

  static extractVariables(template: string): string[] {
    const regex = /\{\{(\w+)\}\}/g
    const matches = [...template.matchAll(regex)]
    return [...new Set(matches.map(match => match[1]))]
  }

  static validateTemplate(template: PromptTemplate): string[] {
    const errors: string[] = []
    
    if (!template.name.trim()) {
      errors.push('模板名称不能为空')
    }
    
    if (!template.template.trim()) {
      errors.push('模板内容不能为空')
    }
    
    const extractedVars = this.extractVariables(template.template)
    const definedVars = template.variables.map(v => v.name)
    
    // 检查是否有未定义的变量
    const undefinedVars = extractedVars.filter(v => !definedVars.includes(v))
    if (undefinedVars.length > 0) {
      errors.push(`以下变量未定义：${undefinedVars.join(', ')}`)
    }
    
    // 检查是否有多余的变量定义
    const unusedVars = definedVars.filter(v => !extractedVars.includes(v))
    if (unusedVars.length > 0) {
      errors.push(`以下变量未使用：${unusedVars.join(', ')}`)
    }
    
    return errors
  }

  static generatePreview(template: PromptTemplate, variables: Record<string, string>): string {
    const processed = this.processTemplate(template.template, variables)
    
    // 如果还有未填充的变量，用占位符显示
    const remainingVars = this.extractVariables(processed)
    let preview = processed
    
    remainingVars.forEach(varName => {
      const variable = template.variables.find(v => v.name === varName)
      const placeholder = variable ? `[${variable.label}]` : `[${varName}]`
      preview = preview.replace(new RegExp(`\\{\\{${varName}\\}\\}`, 'g'), placeholder)
    })
    
    return preview
  }
}
```

## 🚀 实施计划

### 第一阶段：基础框架 (2-3天)
1. **页面结构搭建**
   - 创建 `/prompt-house` 路由
   - 实现基础布局和导航
   - 集成到侧边栏

2. **数据结构实现**
   - 定义TypeScript接口
   - 实现本地存储逻辑
   - 创建预设模板库

### 第二阶段：核心功能 (3-4天)
1. **模板管理**
   - 模板列表和卡片组件
   - 模板编辑器
   - 分类和搜索功能

2. **变量系统**
   - 变量编辑器
   - 参数化处理
   - 预览功能

### 第三阶段：使用体验 (2-3天)
1. **模板使用**
   - 使用面板
   - 与AI模型集成
   - 结果展示和保存

2. **高级功能**
   - 导入导出
   - 使用统计
   - 评分反馈

### 第四阶段：优化完善 (1-2天)
1. **用户体验优化**
   - 界面美化
   - 交互优化
   - 性能优化

2. **功能扩展**
   - 模板分享
   - 批量操作
   - 快捷键支持

## 📊 成功指标

### 功能完整性
- [ ] 模板创建、编辑、删除功能
- [ ] 变量系统完整实现
- [ ] 与AI模型无缝集成
- [ ] 导入导出功能正常

### 用户体验
- [ ] 界面直观易用
- [ ] 操作流程顺畅
- [ ] 响应速度快
- [ ] 错误处理友好

### 数据管理
- [ ] 数据持久化可靠
- [ ] 模板库丰富实用
- [ ] 使用统计准确
- [ ] 备份恢复功能

---

*文档创建时间：2024年1月*  
*参考项目：Cherry Studio Assistant系统* 