'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconEdit,
  IconTrash,
  IconPlus,
  IconHome,
  IconBold,
  IconItalic,
  IconCode,
  IconLink,
  IconList,
  IconListNumbers,
  IconBlockquote,
  IconPhoto,
  IconDeviceFloppy,
  IconX,
  IconEye,
  IconRefresh
} from '@tabler/icons-react';
import { TreeView, TreeNode } from '@/components/ui/tree-view';
import { saveDocumentData, getDocumentData, DocumentItem } from '@/lib/document-data';

export default function AdminDocsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [showEditor, setShowEditor] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 图片数据存储
  const [imageDataMap, setImageDataMap] = useState<Map<string, string>>(new Map());

  // 加载文档数据
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getDocumentData();
      console.log('📊 加载的数据:', data.length, '条记录');
      setDocuments(data);
      if (data.length > 0 && !selectedNodeId) {
        setSelectedNodeId(data[0].id);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      setSaveStatus('❌ 加载失败');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 转换文档数据为树形结构
  const convertToTreeData = (docs: DocumentItem[]): TreeNode[] => {
    const level1Items = docs.filter(doc => doc.level === 1);
    
    return level1Items.map(item => ({
      id: item.id,
      label: item.label,
      children: docs
        .filter(doc => doc.level === 2 && doc.parentId === item.id)
        .map(child => ({
          id: child.id,
          label: child.label,
          data: child
        })),
      data: item
    }));
  };

  // 获取当前选中的文档
  const getSelectedDocument = (): DocumentItem | null => {
    return documents.find(doc => doc.id === selectedNodeId) || null;
  };

  // 处理节点点击
  const handleNodeClick = (node: TreeNode) => {
    setSelectedNodeId(node.id);
    // 如果正在编辑其他内容，先关闭编辑器
    if (showEditor && showEditor !== node.id) {
      setShowEditor(null);
    }
  };

  // 添加新项目
  const addNewItem = (parentId?: string) => {
    const newId = Date.now().toString();
    const level = parentId ? 2 : 1;
    const newItem: DocumentItem = {
      id: newId,
      label: '新文档',
      level,
      parentId,
      content: level === 2 ? '# 新文档\n\n在这里添加内容...' : undefined
    };
    const newDocs = [...documents, newItem];
    setDocuments(newDocs);
    setSelectedNodeId(newId);
    
    // 如果是二级文档，直接打开编辑器
    if (level === 2) {
      setTimeout(() => {
        openEditor(newId, newItem.content || '');
      }, 100);
    }
  };

  // 删除项目
  const deleteItem = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    
    if (confirm(`确定要删除 &quot;${doc.label}&quot; 吗？${doc.level === 1 ? '这将同时删除所有子文档。' : ''}`)) {
      let newDocs = documents.filter(doc => doc.id !== id);
      
      // 如果删除的是一级目录，同时删除其子文档
      if (doc.level === 1) {
        newDocs = newDocs.filter(d => d.parentId !== id);
      }
      
      setDocuments(newDocs);
      
      if (selectedNodeId === id) {
        setSelectedNodeId(newDocs.length > 0 ? newDocs[0].id : null);
      }
      
      // 如果正在编辑被删除的文档，关闭编辑器
      if (showEditor === id) {
        setShowEditor(null);
      }

      // 立即保存到数据库
      setSaveStatus('🗑️ 正在删除...');
      try {
        const success = await saveDocumentData(newDocs);
        if (success) {
          setSaveStatus('✅ 删除成功');
        } else {
          setSaveStatus('❌ 删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        setSaveStatus('❌ 删除失败');
      }
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // 开始编辑标题
  const startEdit = (id: string, field: string, value: string) => {
    setEditingId(id);
    setEditingField(field);
    setEditingValue(value);
  };

  // 保存标题编辑
  const saveEdit = () => {
    if (editingId && editingField) {
      setDocuments(documents.map(doc => 
        doc.id === editingId 
          ? { ...doc, [editingField]: editingValue }
          : doc
      ));
      setEditingId(null);
      setEditingField(null);
      setEditingValue('');
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setEditingValue('');
  };

  // 打开内容编辑器
  const openEditor = (id: string, content: string) => {
    setShowEditor(id);
    // 清空之前的图片数据映射
    setImageDataMap(new Map());
    
    // 将base64图片转换为简洁的ID形式
    let editableContent = content || '';
    const newImageDataMap = new Map<string, string>();
    
    // 查找并替换所有base64图片
    const base64ImageRegex = /!\[([^\]]*)\]\(data:image\/[^;]+;base64,([^)]+)\)/g;
    editableContent = editableContent.replace(base64ImageRegex, (fullMatch, altText, base64Data) => {
      const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 存储图片数据
      newImageDataMap.set(imageId, `data:image/jpeg;base64,${base64Data}`);
      
      // 返回简洁的ID形式
      return `![${altText}](${imageId})`;
    });
    
    // 更新图片数据映射
    setImageDataMap(newImageDataMap);
    setEditorContent(editableContent);
  };



  // 简单的Markdown预览渲染函数
  const renderMarkdownPreview = (content: string): string => {
    let html = content;
    
    // 处理标题
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // 处理粗体和斜体
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // 处理内联代码
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // 处理代码块
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // 处理链接
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 处理图片 - 使用内存中的图片数据
    html = html.replace(/!\[(.+?)\]\((.+?)\)/g, (match, altText, src) => {
      // 检查是否是图片ID，如果是则从内存中获取base64数据
      const imageData = imageDataMap.get(src);
      const actualSrc = imageData || src;
      return `<img src="${actualSrc}" alt="${altText}" style=\"max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);\" />`;
    });
    
    // 处理列表
    html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
    
    // 处理引用
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    
    // 处理换行
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  // 保存编辑器内容
  const saveEditorContent = () => {
    if (showEditor) {
      const updatedDocs = documents.map(doc => {
        if (doc.id === showEditor) {
          // 将图片ID转换为完整的base64数据
          let processedContent = editorContent;
          imageDataMap.forEach((base64Data, imageId) => {
            const imageIdRegex = new RegExp(`\\!\\[([^\\]]+)\\]\\(${imageId}\\)`, 'g');
            processedContent = processedContent.replace(imageIdRegex, `![$1](${base64Data})`);
          });
          
          const updated = { ...doc, content: processedContent };
          
          // 自动解析标题
          const lines = processedContent.split('\n');
          const firstHeading = lines.find(line => line.startsWith('# '))?.replace('# ', '') || '';
          const secondHeading = lines.find(line => line.startsWith('## '))?.replace('## ', '') || '';
          const subHeadings = lines.filter(line => line.startsWith('### ')).map(line => line.replace('### ', ''));
          
          return {
            ...updated,
            firstHeading,
            secondHeading,
            subHeadings
          };
        }
        return doc;
      });
      
      setDocuments(updatedDocs);
      setShowEditor(null);
      setEditorContent('');
      // 清空图片数据映射
      setImageDataMap(new Map());
    }
  };

  // 保存所有更改到数据库
  const saveAllChanges = async () => {
    setIsSaving(true);
    setSaveStatus('💾 正在保存...');
    
    try {
      const success = await saveDocumentData(documents);
      if (success) {
        setSaveStatus('✅ 保存成功');
      } else {
        setSaveStatus('❌ 保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      setSaveStatus('❌ 保存失败');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // 刷新数据
  const refreshData = async () => {
    await loadData();
    setSaveStatus('🔄 数据已刷新');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // 预览页面
  const previewPage = () => {
    window.open('/vibe-coding', '_blank');
  };

  // 富文本编辑器工具栏
  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    let newText = '';
    const beforeText = editorContent.substring(0, start);
    const afterText = editorContent.substring(end);

    switch (syntax) {
      case 'bold':
        newText = `${beforeText}**${textToInsert}**${afterText}`;
        break;
      case 'italic':
        newText = `${beforeText}*${textToInsert}*${afterText}`;
        break;
      case 'code':
        newText = `${beforeText}\`${textToInsert}\`${afterText}`;
        break;
      case 'codeblock':
        newText = `${beforeText}\n\`\`\`\n${textToInsert || '// 在这里输入代码'}\n\`\`\`\n${afterText}`;
        break;
      case 'link':
        newText = `${beforeText}[${textToInsert || '链接文本'}](${placeholder || 'https://example.com'})${afterText}`;
        break;
      case 'ul':
        newText = `${beforeText}\n- ${textToInsert || '列表项'}\n${afterText}`;
        break;
      case 'ol':
        newText = `${beforeText}\n1. ${textToInsert || '列表项'}\n${afterText}`;
        break;
      case 'quote':
        newText = `${beforeText}\n> ${textToInsert || '引用内容'}\n${afterText}`;
        break;
      default:
        return;
    }

    setEditorContent(newText);
    
    // 重新聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, start + textToInsert.length + syntax.length * 2);
      } else {
        const newCursorPos = start + (syntax === 'codeblock' ? 4 : 2);
        textarea.setSelectionRange(newCursorPos, newCursorPos + (placeholder ? placeholder.length : 0));
      }
    }, 10);
  };

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        // 生成一个简短的图片标识符
        const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 存储图片数据到内存
        setImageDataMap(prev => new Map(prev).set(imageId, base64));
        
        // 在光标位置插入简洁的图片标记
        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const beforeText = editorContent.substring(0, start);
          const afterText = editorContent.substring(end);
          
          const imageMarkdown = `![${file.name}](${imageId})`;
          
          // 在光标位置插入图片标记
          const newContent = beforeText + imageMarkdown + afterText;
          setEditorContent(newContent);
          
          // 重新设置光标位置
          setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + imageMarkdown.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 10);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理拖拽上传
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        // 生成一个简短的图片标识符
        const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 存储图片数据到内存
        setImageDataMap(prev => new Map(prev).set(imageId, base64));
        
        // 在光标位置插入简洁的图片标记
        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const beforeText = editorContent.substring(0, start);
          const afterText = editorContent.substring(end);
          
          const imageMarkdown = `![${file.name}](${imageId})`;
          
          // 在光标位置插入图片标记
          const newContent = beforeText + imageMarkdown + afterText;
          setEditorContent(newContent);
          
          // 重新设置光标位置
          setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + imageMarkdown.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 10);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };



  const selectedDoc = getSelectedDocument();
  const treeData = convertToTreeData(documents);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧树形视图 */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">📚 文档管理</h1>
          
          {/* 状态显示 */}
          {saveStatus && (
            <div className="text-xs text-center p-2 bg-blue-50 text-blue-700 rounded border mb-3">
              {saveStatus}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-2">
            <button
              onClick={() => addNewItem()}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <IconPlus className="h-4 w-4" />
              新建目录
            </button>
            
            {selectedDoc && selectedDoc.level === 1 && (
              <button
                onClick={() => addNewItem(selectedDoc.id)}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <IconPlus className="h-4 w-4" />
                新建文档
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={saveAllChanges}
                disabled={isSaving}
                className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <IconDeviceFloppy className="h-4 w-4" />
                {isSaving ? '保存中...' : '保存'}
              </button>
              
              <button
                onClick={refreshData}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <IconRefresh className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={previewPage}
                className="flex-1 bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <IconEye className="h-4 w-4" />
                预览
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <IconHome className="h-4 w-4" />
                首页
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-4">
          <TreeView
            data={treeData}
            onNodeClick={handleNodeClick}
            selectedIds={selectedNodeId ? [selectedNodeId] : []}
            className="bg-transparent border-0"
            showLines={false}
            indent={16}
          />
        </div>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            {/* 头部信息 */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    {editingId === selectedDoc.id && editingField === 'label' ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="text-xl font-bold bg-gray-50 border border-gray-300 rounded px-3 py-2 w-full"
                        autoFocus
                      />
                    ) : (
                      <h1
                        className="text-xl font-bold text-gray-900 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded"
                        onClick={() => startEdit(selectedDoc.id, 'label', selectedDoc.label)}
                      >
                        {selectedDoc.label}
                      </h1>
                    )}
                    
                    <div className="text-sm text-gray-500 mt-1 px-3">
                      {selectedDoc.level === 1 ? '📁 目录' : '📄 文档'}
                      {selectedDoc.content && ` • ${selectedDoc.content.length} 字符`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedDoc.level === 2 && (
                    <button
                      onClick={() => openEditor(selectedDoc.id, selectedDoc.content || '')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <IconEdit className="h-4 w-4" />
                      编辑
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteItem(selectedDoc.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <IconTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 内容展示 */}
            <div className="flex-1 overflow-auto">
              <div className="px-6 py-6">
                {selectedDoc.level === 2 && selectedDoc.content ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                        {selectedDoc.content}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                    {selectedDoc.level === 1 ? (
                      <div>
                        <p className="mb-4">📁 这是一个目录</p>
                        <p>请在左侧添加文档来组织内容</p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4">📄 空白文档</p>
                        <p>点击"编辑"按钮来添加内容</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">📚 选择一个文档开始编辑</p>
              <p>或在左侧创建新的目录和文档</p>
            </div>
          </div>
        )}
      </div>

      {/* 富文本编辑器模态框 */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-none max-h-none m-4 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">✏️ 编辑文档</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveEditorContent}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <IconDeviceFloppy className="h-4 w-4" />
                  保存
                </button>
                <button
                  onClick={() => setShowEditor(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <IconX className="h-4 w-4" />
                  取消
                </button>
              </div>
            </div>

            {/* 工具栏 */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-1 flex-wrap">
                {/* 文本格式 */}
                <div className="flex items-center gap-1 mr-4">
                  <button
                    onClick={() => insertMarkdown('bold', '粗体文本')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="粗体"
                  >
                    <IconBold className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('italic', '斜体文本')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="斜体"
                  >
                    <IconItalic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('code', '内联代码')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="内联代码"
                  >
                    <IconCode className="h-4 w-4" />
                  </button>
                </div>

                {/* 列表 */}
                <div className="flex items-center gap-1 mr-4">
                  <button
                    onClick={() => insertMarkdown('ul')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="无序列表"
                  >
                    <IconList className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('ol')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="有序列表"
                  >
                    <IconListNumbers className="h-4 w-4" />
                  </button>
                </div>

                {/* 其他 */}
                <div className="flex items-center gap-1 mr-4">
                  <button
                    onClick={() => insertMarkdown('link')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="链接"
                  >
                    <IconLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('quote')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="引用"
                  >
                    <IconBlockquote className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('codeblock')}
                    className="p-2 hover:bg-gray-200 rounded text-xs"
                    title="代码块"
                  >
                    {'{}'}
                  </button>
                </div>

                {/* 图片上传 */}
                <div className="flex items-center gap-1">
                  <label className="p-2 hover:bg-gray-200 rounded cursor-pointer" title="上传图片">
                    <IconPhoto className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 编辑器 */}
            <div className="flex-1 p-4 flex gap-4 min-h-0 overflow-hidden">
              {/* 编辑区域 */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="text-sm text-gray-600 mb-2">✏️ 编辑区域</div>
                <textarea
                  id="content-editor"
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="w-full flex-1 border border-gray-300 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
                  placeholder="# 文档标题

在这里编写 Markdown 内容...

支持拖拽图片上传！"
                />
              </div>
              
              {/* 预览区域 */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="text-sm text-gray-600 mb-2">👁️ 预览区域</div>
                <div className="flex-1 border border-gray-300 rounded-lg p-4 bg-white overflow-auto">
                  <div 
                    className="prose max-w-none break-words"
                    style={{ 
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdownPreview(editorContent)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 