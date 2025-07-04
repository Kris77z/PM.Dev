'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IconPlus, 
  IconTrash, 
  IconEye, 
  IconArrowBack,
  IconSettings,
  IconX,
  IconRocket,
  IconBook,
  IconCode,
  IconBulb,
  IconTarget,
  IconHelp,
  IconUpload,
  IconFolder,
  IconFile
} from '@tabler/icons-react'
import { getDocumentData, saveDocumentData, DocumentItem } from '@/lib/document-data'

// 图标组件映射
const IconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  IconRocket,
  IconBook,
  IconCode,
  IconBulb,
  IconTarget,
  IconHelp,
  IconSettings
}

// 增强的富文本编辑器组件
const RichTextEditor = ({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  // 自动调整高度
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    
    onChange(newText)
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus()
      if (placeholder && !selectedText) {
        // 如果插入的是占位符，选中占位符文本
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length)
      } else {
        textarea.setSelectionRange(start + before.length, end + before.length)
      }
    }, 0)
  }

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = value.substring(0, start) + text + value.substring(end)
    
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const altText = file.name.replace(/\.[^/.]+$/, '') // 移除文件扩展名作为alt文本
      const imageMarkdown = `![${altText}](${dataUrl})`
      insertAtCursor(imageMarkdown)
    }
    reader.readAsDataURL(file)
    
    // 清空input以允许重复选择同一文件
    event.target.value = ''
  }

  const insertLink = () => {
    const url = prompt('请输入链接地址:')
    if (url) {
      insertText('[', `](${url})`, '链接文字')
    }
  }

  const insertImage = () => {
    fileInputRef.current?.click()
  }

  const insertTable = () => {
    const tableMarkdown = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 行1 | 数据 | 数据 |
| 行2 | 数据 | 数据 |
`
    insertAtCursor(tableMarkdown)
  }

  // 处理拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        const altText = file.name.replace(/\.[^/.]+$/, '')
        const imageMarkdown = `![${altText}](${dataUrl})`
        insertAtCursor(imageMarkdown)
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* 工具栏 */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => insertText('**', '**', '粗体文字')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="加粗"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertText('*', '*', '斜体文字')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 italic"
          title="斜体"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertText('`', '`', '代码')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 font-mono"
          title="行内代码"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          onClick={() => insertText('```\n', '\n```', '代码块')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="代码块"
        >
          { }
        </button>
        
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => insertText('# ', '', '一级标题')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="一级标题"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertText('## ', '', '二级标题')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="二级标题"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertText('### ', '', '三级标题')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="三级标题"
        >
          H3
        </button>
        
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => insertText('- ', '', '列表项')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="无序列表"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => insertText('1. ', '', '列表项')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="有序列表"
        >
          1.
        </button>
        
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={insertLink}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="插入链接"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="插入图片"
        >
          📷
        </button>
        <button
          type="button"
          onClick={insertTable}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="插入表格"
        >
          📊
        </button>
        
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => insertText('> ', '', '引用文字')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="引用"
        >
          ❝
        </button>
        <button
          type="button"
          onClick={() => insertText('---\n', '', '')}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
          title="分割线"
        >
          ─
        </button>
      </div>
      
      {/* 文本区域 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        placeholder={placeholder}
        className="w-full px-3 py-2 border-0 focus:ring-0 focus:outline-none resize-none font-mono text-sm leading-relaxed"
        style={{ minHeight: '200px' }}
      />
      
      {/* 底部提示 */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
        支持 Markdown 语法 • 可直接拖拽图片到编辑器 • Ctrl/Cmd + Z 撤销
      </div>
    </div>
  )
}

export default function DocsAdminPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [selectedLevel1, setSelectedLevel1] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'level1' | 'level2'>('level1')
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)
  const [newDocument, setNewDocument] = useState<Partial<DocumentItem>>({
    level: 1,
    icon: 'IconBook'
  })

  const iconOptions = [
    'IconBook', 'IconCode', 'IconBulb', 'IconTarget', 'IconRocket', 
    'IconSettings', 'IconHelp'
  ]

  // 加载文档数据
  useEffect(() => {
    const data = getDocumentData()
    setDocuments(data)
  }, [])

  const level1Documents = documents.filter(doc => doc.level === 1)
  const level2Documents = documents.filter(doc => doc.level === 2 && doc.parentId === selectedLevel1)

  // 获取二级文档数量
  const getLevel2Count = (parentId: string) => {
    return documents.filter(doc => doc.level === 2 && doc.parentId === parentId).length
  }

  // 渲染图标
  const renderIcon = (iconName: string) => {
    const IconComponent = IconMap[iconName] || IconBook
    return <IconComponent className="h-4 w-4" />
  }

  // 解析内容获取标题信息
  const parseContent = (content: string): { firstHeading?: string; secondHeading?: string; subHeadings?: string[] } => {
    if (!content) return {}
    
    const lines = content.split('\n')
    let firstHeading = ''
    let secondHeading = ''
    const subHeadings: string[] = []
    
    for (const line of lines) {
      if (line.startsWith('# ') && !firstHeading) {
        firstHeading = line.substring(2).trim()
      } else if (line.startsWith('## ') && !secondHeading) {
        secondHeading = line.substring(3).trim()
      } else if (line.startsWith('### ')) {
        subHeadings.push(line.substring(4).trim())
      }
    }
    
    return { firstHeading, secondHeading, subHeadings }
  }

  // 更新文档
  const handleUpdateDocument = (id: string, field: string, value: string) => {
    const updatedDocuments = documents.map(doc => {
      if (doc.id === id) {
        const updated = { ...doc, [field]: value }
        
        // 如果更新的是内容，自动解析标题
        if (field === 'content') {
          const parsed = parseContent(value)
          Object.assign(updated, parsed)
        }
        
        return updated
      }
      return doc
    })
    
    setDocuments(updatedDocuments)
    setEditingId(null)
    setEditingField(null)
  }

  // 添加文档
  const handleAddDocument = () => {
    if (!newDocument.label) return
    
    const id = newDocument.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const document: DocumentItem = {
      id,
      label: newDocument.label,
      level: newDocument.level || 1,
      parentId: currentView === 'level2' ? selectedLevel1 || undefined : newDocument.parentId,
      icon: newDocument.icon || 'IconBook',
      content: newDocument.content || '',
      firstHeading: '',
      secondHeading: '',
      subHeadings: []
    }
    
    // 如果有内容，解析标题
    if (newDocument.content) {
      const parsed = parseContent(newDocument.content)
      Object.assign(document, parsed)
    }
    
    setDocuments([...documents, document])
    setNewDocument({ level: currentView === 'level2' ? 2 : 1, icon: 'IconBook' })
    setShowAddForm(false)
  }

  // 删除文档
  const handleDeleteDocument = (id: string) => {
    if (confirm('确定要删除这个文档吗？这将同时删除其所有子文档。')) {
      // 删除文档及其子文档
      const toDelete = [id]
      const children = documents.filter(doc => doc.parentId === id)
      toDelete.push(...children.map(child => child.id))
      
      setDocuments(documents.filter(doc => !toDelete.includes(doc.id)))
    }
  }

  // 发布到文档展示页面
  const handlePublishToLive = () => {
    if (confirm('确定要发布当前文档结构到展示页面吗？这将覆盖现有的文档内容。')) {
      try {
        saveDocumentData(documents)
        alert('发布成功！文档已更新到展示页面。请刷新文档展示页面查看最新内容。')
      } catch (error) {
        console.error('发布失败:', error)
        alert('发布失败，请重试。')
      }
    }
  }

  // 管理二级文档
  const handleManageLevel2 = (parentId: string) => {
    setSelectedLevel1(parentId)
    setCurrentView('level2')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 h-[calc(100vh-4rem)]">
          {/* 左侧边栏 - 固定宽度，不滚动 */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-8 flex flex-col min-h-[calc(100vh-4rem)]">
              <div className="flex-1">
                {/* 标题区域 */}
                <div className="mb-6">
                  <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <IconSettings className="h-6 w-6 text-blue-500" />
                    PM Assistant 文档管理
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">管理知识库文档的目录结构和内容</p>
                </div>

                {/* 当前视图指示器 */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    {currentView === 'level1' ? (
                      <>
                        <IconFolder className="h-4 w-4" />
                        <span className="font-medium">一级目录管理</span>
                      </>
                    ) : (
                      <>
                        <IconFile className="h-4 w-4" />
                        <span className="font-medium">二级目录管理</span>
                        <span className="text-sm">({documents.find(d => d.id === selectedLevel1)?.label})</span>
                      </>
                    )}
                  </div>
                  {currentView === 'level2' && (
                    <button
                      onClick={() => setCurrentView('level1')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← 返回一级目录
                    </button>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-3 mb-6">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <IconPlus className="h-4 w-4" />
                    {currentView === 'level1' ? '添加一级目录' : '添加二级目录'}
                  </button>
                </div>

                {/* 统计信息 */}
                <div className="bg-white rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">文档统计</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>一级目录: {level1Documents.length} 个</div>
                    <div>二级目录: {documents.filter(d => d.level === 2).length} 个</div>
                    <div>总计: {documents.length} 个</div>
                  </div>
                </div>
              </div>

              {/* 底部操作按钮 */}
              <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={handlePublishToLive}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full"
                >
                  <IconUpload className="h-4 w-4" />
                  发布到展示页面
                </button>
                <button
                  onClick={() => router.push('/vibe-coding')}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors w-full px-3 py-2 rounded-md hover:bg-blue-50"
                >
                  <IconEye className="h-5 w-5" />
                  <span>预览文档</span>
                </button>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-full px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <IconArrowBack className="h-5 w-5" />
                  <span>返回首页</span>
                </button>
              </div>
            </div>
          </div>

          {/* 右侧内容区域 - 可滚动 */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {/* 表格头部 */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentView === 'level1' ? '一级目录管理' : '二级目录管理'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {currentView === 'level1' 
                    ? '管理一级目录的名称和图标，点击"管理内容"进入二级目录管理' 
                    : '管理二级目录的名称、图标和具体内容'}
                </p>
              </div>

              {/* 表格内容 */}
              <div className="p-6">
                {currentView === 'level1' ? (
                  // 一级目录管理表格
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">目录信息</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">子目录数量</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {level1Documents.map((doc) => (
                          <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="text-blue-500">
                                  {editingId === doc.id && editingField === 'icon' ? (
                                    <select
                                      value={doc.icon}
                                      onChange={(e) => handleUpdateDocument(doc.id, 'icon', e.target.value)}
                                      onBlur={() => {
                                        setEditingId(null)
                                        setEditingField(null)
                                      }}
                                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                                      autoFocus
                                    >
                                      {iconOptions.map(icon => (
                                        <option key={icon} value={icon}>{icon}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingId(doc.id)
                                        setEditingField('icon')
                                      }}
                                      className="hover:bg-gray-100 p-1 rounded"
                                      title="点击编辑图标"
                                    >
                                      {renderIcon(doc.icon || 'IconBook')}
                                    </button>
                                  )}
                                </div>
                                <div className="flex-1">
                                  {editingId === doc.id && editingField === 'label' ? (
                                    <input
                                      type="text"
                                      defaultValue={doc.label}
                                      className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                                      onBlur={(e) => handleUpdateDocument(doc.id, 'label', e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          handleUpdateDocument(doc.id, 'label', e.currentTarget.value)
                                        }
                                      }}
                                      autoFocus
                                    />
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingId(doc.id)
                                        setEditingField('label')
                                      }}
                                      className="font-medium text-gray-900 hover:bg-gray-100 px-2 py-1 rounded text-left w-full"
                                      title="点击编辑名称"
                                    >
                                      {doc.label}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600">
                                {getLevel2Count(doc.id)} 个子目录
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleManageLevel2(doc.id)}
                                  className="text-blue-500 hover:text-blue-700 text-sm px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                                  title="管理子目录内容"
                                >
                                  管理内容
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-gray-500 hover:text-red-500 transition-colors"
                                  title="删除"
                                >
                                  <IconTrash className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // 二级目录管理表格
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">目录信息</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">内容标题</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {level2Documents.map((doc) => (
                          <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="text-blue-500">
                                  {editingId === doc.id && editingField === 'icon' ? (
                                    <select
                                      value={doc.icon}
                                      onChange={(e) => handleUpdateDocument(doc.id, 'icon', e.target.value)}
                                      onBlur={() => {
                                        setEditingId(null)
                                        setEditingField(null)
                                      }}
                                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                                      autoFocus
                                    >
                                      {iconOptions.map(icon => (
                                        <option key={icon} value={icon}>{icon}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingId(doc.id)
                                        setEditingField('icon')
                                      }}
                                      className="hover:bg-gray-100 p-1 rounded"
                                      title="点击编辑图标"
                                    >
                                      {renderIcon(doc.icon || 'IconBook')}
                                    </button>
                                  )}
                                </div>
                                <div className="flex-1">
                                  {editingId === doc.id && editingField === 'label' ? (
                                    <input
                                      type="text"
                                      defaultValue={doc.label}
                                      className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                                      onBlur={(e) => handleUpdateDocument(doc.id, 'label', e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          handleUpdateDocument(doc.id, 'label', e.currentTarget.value)
                                        }
                                      }}
                                      autoFocus
                                    />
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingId(doc.id)
                                        setEditingField('label')
                                      }}
                                      className="font-medium text-gray-900 hover:bg-gray-100 px-2 py-1 rounded text-left w-full"
                                      title="点击编辑名称"
                                    >
                                      {doc.label}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {doc.firstHeading || '无一级标题'}
                                </div>
                                {doc.secondHeading && (
                                  <div className="text-xs text-gray-600">
                                    {doc.secondHeading}
                                  </div>
                                )}
                                {doc.subHeadings && doc.subHeadings.length > 0 && (
                                  <div className="text-xs text-gray-500">
                                    {doc.subHeadings.slice(0, 2).join(', ')}
                                    {doc.subHeadings.length > 2 && '...'}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedDocument(doc)}
                                  className="text-blue-500 hover:text-blue-700 text-sm px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                                  title="编辑内容"
                                >
                                  编辑内容
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-gray-500 hover:text-red-500 transition-colors"
                                  title="删除"
                                >
                                  <IconTrash className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 添加文档弹窗 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentView === 'level1' ? '添加一级目录' : '添加二级目录'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目录名称</label>
                <input
                  type="text"
                  value={newDocument.label || ''}
                  onChange={(e) => setNewDocument({ ...newDocument, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入目录名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">图标</label>
                <select
                  value={newDocument.icon}
                  onChange={(e) => setNewDocument({ ...newDocument, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              
              {currentView === 'level2' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                  <RichTextEditor
                    value={newDocument.content || ''}
                    onChange={(value) => setNewDocument({ ...newDocument, content: value })}
                    placeholder="输入目录内容（支持Markdown格式）"
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddDocument}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 文档详情弹窗（仅用于二级目录内容编辑） */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">编辑内容 - {selectedDocument.label}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <RichTextEditor
                  value={selectedDocument.content || ''}
                  onChange={(value) => {
                    if (selectedDocument) {
                      const updatedDoc = { ...selectedDocument, content: value }
                      const parsed = parseContent(value)
                      Object.assign(updatedDoc, parsed)
                      setSelectedDocument(updatedDoc)
                      handleUpdateDocument(selectedDocument.id, 'content', value)
                    }
                  }}
                  placeholder="输入文档内容（支持Markdown格式）"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  完成编辑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 