'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconEdit,
  IconTrash,
  IconPlus,
  IconUpload,
  IconHome,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconLink,
  IconList,
  IconListNumbers,
  IconBlockquote,
  IconMinus,
  IconTable,
  IconPhoto,
  IconCloudUpload,
  IconCloudDownload,
  IconRefresh,
  IconDownload,
  IconDatabase
} from '@tabler/icons-react';
import { TreeView, TreeNode } from '@/components/ui/tree-view';
import { saveDocumentData, getDocumentData, DocumentItem } from '@/lib/document-data';
import { 
  migrateLocalDataToSupabase, 
  downloadSupabaseDataToLocal, 
  compareLocalAndSupabaseData,
  exportDataAsJSON,
  getLocalStorageData 
} from '@/lib/data-migration';

export default function AdminDocsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [showEditor, setShowEditor] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 加载文档数据
  useEffect(() => {
    const loadData = async () => {
      const data = await getDocumentData();
      setDocuments(data);
      if (data.length > 0) {
        setSelectedNodeId(data[0].id);
      }
    };
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
  };

  // 添加新项目
  const addNewItem = (parentId?: string) => {
    const newId = Date.now().toString();
    const level = parentId ? 2 : 1;
    const newItem: DocumentItem = {
      id: newId,
      label: '新项目',
      level,
      parentId,
      content: level === 2 ? '# 新项目\n\n在这里添加内容...' : undefined
    };
    const newDocs = [...documents, newItem];
    setDocuments(newDocs);
    setSelectedNodeId(newId);
  };

  // 删除项目
  const deleteItem = (id: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      const newDocs = documents.filter(doc => doc.id !== id);
      setDocuments(newDocs);
      if (selectedNodeId === id) {
        setSelectedNodeId(newDocs.length > 0 ? newDocs[0].id : null);
      }
    }
  };

  // 开始编辑
  const startEdit = (id: string, field: string, value: string) => {
    setEditingId(id);
    setEditingField(field);
    setEditingValue(value);
  };

  // 保存编辑
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
    setEditorContent(content || '');
  };

  // 保存编辑器内容
  const saveEditorContent = () => {
    if (showEditor) {
      const updatedDocs = documents.map(doc => {
        if (doc.id === showEditor) {
          const updated = { ...doc, content: editorContent };
          
          // 自动解析标题
          const lines = editorContent.split('\n');
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
    }
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
      case 'underline':
        newText = `${beforeText}<u>${textToInsert}</u>${afterText}`;
        break;
      case 'strikethrough':
        newText = `${beforeText}~~${textToInsert}~~${afterText}`;
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
      case 'hr':
        newText = `${beforeText}\n---\n${afterText}`;
        break;
      case 'table':
        newText = `${beforeText}\n| 标题1 | 标题2 | 标题3 |\n|-------|-------|-------|\n| 内容1 | 内容2 | 内容3 |\n${afterText}`;
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
        const newCursorPos = start + (syntax === 'codeblock' ? 4 : syntax === 'table' ? 10 : 2);
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
        const imageMarkdown = `![${file.name}](${base64})`;
        setEditorContent(prev => prev + '\n' + imageMarkdown);
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
        const imageMarkdown = `![${file.name}](${base64})`;
        setEditorContent(prev => prev + '\n' + imageMarkdown);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 发布到展示页面
  const handlePublish = async () => {
    const success = await saveDocumentData(documents);
    if (success) {
      alert('已成功发布到云端！所有用户都能看到更新的内容。');
    } else {
      alert('发布失败，数据已保存到本地存储！');
    }
  };

  // 数据迁移：从 localStorage 到 Supabase
  const handleMigrateToSupabase = async () => {
    setIsLoading(true);
    setMigrationStatus('正在迁移数据到云端...');
    
    try {
      const result = await migrateLocalDataToSupabase();
      setMigrationStatus(result.message);
      
      if (result.success) {
        // 重新加载数据
        const data = await getDocumentData();
        setDocuments(data);
        setTimeout(() => setMigrationStatus(''), 3000);
      }
    } catch (error) {
      setMigrationStatus('迁移失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsLoading(false);
    }
  };

  // 数据下载：从 Supabase 到 localStorage
  const handleDownloadFromSupabase = async () => {
    setIsLoading(true);
    setMigrationStatus('正在从云端下载数据...');
    
    try {
      const result = await downloadSupabaseDataToLocal();
      setMigrationStatus(result.message);
      
      if (result.success) {
        // 重新加载数据
        const data = await getDocumentData();
        setDocuments(data);
        setTimeout(() => setMigrationStatus(''), 3000);
      }
    } catch (error) {
      setMigrationStatus('下载失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsLoading(false);
    }
  };

  // 数据比较
  const handleCompareData = async () => {
    setIsLoading(true);
    setMigrationStatus('正在比较本地和云端数据...');
    
    try {
      const result = await compareLocalAndSupabaseData();
      setMigrationStatus(
        `本地: ${result.localCount} 条 | 云端: ${result.supabaseCount} 条 | ${result.recommendation}`
      );
      setTimeout(() => setMigrationStatus(''), 5000);
    } catch (error) {
      setMigrationStatus('比较失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsLoading(false);
    }
  };

  // 导出本地数据
  const handleExportLocalData = () => {
    const localData = getLocalStorageData();
    if (localData.length === 0) {
      setMigrationStatus('本地存储中没有数据可导出');
      setTimeout(() => setMigrationStatus(''), 3000);
      return;
    }
    
    exportDataAsJSON(localData, `pm-assistant-local-backup-${new Date().toISOString().split('T')[0]}.json`);
    setMigrationStatus(`已导出 ${localData.length} 条本地数据`);
    setTimeout(() => setMigrationStatus(''), 3000);
  };

  const selectedDoc = getSelectedDocument();
  const treeData = convertToTreeData(documents);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧树形视图 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex-1 overflow-auto px-6 py-4">
          <TreeView
            data={treeData}
            onNodeClick={handleNodeClick}
            selectedIds={selectedNodeId ? [selectedNodeId] : []}
            className="bg-transparent border-0"
          />
        </div>

        <div className="px-6 pb-6 border-t border-gray-200 space-y-2">
          {/* 状态显示 */}
          {migrationStatus && (
            <div className="text-xs text-center p-2 bg-blue-50 text-blue-700 rounded border">
              {migrationStatus}
            </div>
          )}

          <button
            onClick={() => addNewItem()}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <IconPlus className="h-4 w-4" />
            添加一级目录
          </button>
          
          {selectedDoc && selectedDoc.level === 1 && (
            <button
              onClick={() => addNewItem(selectedDoc.id)}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <IconPlus className="h-4 w-4" />
              添加子目录
            </button>
          )}

          <button
            onClick={handlePublish}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <IconUpload className="h-4 w-4" />
            发布更新
          </button>

          {/* 数据迁移区域 */}
          <div className="border-t pt-2 space-y-1">
            <div className="text-xs text-gray-500 text-center mb-2 flex items-center justify-center gap-1">
              <IconDatabase className="h-3 w-3" />
              数据管理
            </div>
            
            <button
              onClick={handleMigrateToSupabase}
              className="w-full bg-cyan-500 text-white px-3 py-1.5 text-sm rounded hover:bg-cyan-600 transition-colors flex items-center justify-center gap-1"
              disabled={isLoading}
            >
              <IconCloudUpload className="h-3 w-3" />
              上传到云端
            </button>

            <button
              onClick={handleDownloadFromSupabase}
              className="w-full bg-indigo-500 text-white px-3 py-1.5 text-sm rounded hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1"
              disabled={isLoading}
            >
              <IconCloudDownload className="h-3 w-3" />
              从云端下载
            </button>

            <div className="flex gap-1">
              <button
                onClick={handleCompareData}
                className="flex-1 bg-orange-500 text-white px-2 py-1.5 text-xs rounded hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                disabled={isLoading}
              >
                <IconRefresh className="h-3 w-3" />
                比较
              </button>
              
              <button
                onClick={handleExportLocalData}
                className="flex-1 bg-teal-500 text-white px-2 py-1.5 text-xs rounded hover:bg-teal-600 transition-colors flex items-center justify-center gap-1"
                disabled={isLoading}
              >
                <IconDownload className="h-3 w-3" />
                导出
              </button>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <IconHome className="h-4 w-4" />
            返回首页
          </button>
        </div>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            {/* 头部信息 */}
            <div className="bg-white border-b border-gray-200 px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                        className="text-2xl font-bold bg-gray-50 border border-gray-300 rounded px-3 py-2 w-full"
                        autoFocus
                      />
                    ) : (
                      <h1
                        className="text-2xl font-bold text-gray-900 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded"
                        onClick={() => startEdit(selectedDoc.id, 'label', selectedDoc.label)}
                      >
                        {selectedDoc.label}
                      </h1>
                    )}
                    
                    <div className="text-sm text-gray-500 mt-1 px-3">
                      {selectedDoc.level === 1 ? '一级目录' : '二级目录'}
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
                      编辑内容
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
                      <pre className="whitespace-pre-wrap text-gray-700">
                        {selectedDoc.content}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                    {selectedDoc.level === 1 ? (
                      <div>
                        <p className="mb-4">这是一个一级目录</p>
                        <p>请在左侧添加子目录来组织内容</p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4">暂无内容</p>
                        <p>点击&quot;编辑内容&quot;按钮来添加内容</p>
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
              <p className="text-lg mb-2">请选择一个项目</p>
              <p>或在左侧添加新的目录</p>
            </div>
          </div>
        )}
      </div>

      {/* 富文本编辑器模态框 - 全屏 */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-none max-h-none m-4 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">编辑内容</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveEditorContent}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowEditor(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
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
                    onClick={() => insertMarkdown('underline', '下划线文本')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="下划线"
                  >
                    <IconUnderline className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('strikethrough', '删除线文本')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="删除线"
                  >
                    <IconStrikethrough className="h-4 w-4" />
                  </button>
                </div>

                {/* 代码和链接 */}
                <div className="flex items-center gap-1 mr-4">
                  <button
                    onClick={() => insertMarkdown('code', '内联代码')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="内联代码"
                  >
                    <IconCode className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('codeblock')}
                    className="p-2 hover:bg-gray-200 rounded text-xs"
                    title="代码块"
                  >
                    {'{}'}
                  </button>
                  <button
                    onClick={() => insertMarkdown('link')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="链接"
                  >
                    <IconLink className="h-4 w-4" />
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
                    onClick={() => insertMarkdown('quote')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="引用"
                  >
                    <IconBlockquote className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('hr')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="分割线"
                  >
                    <IconMinus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('table')}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="表格"
                  >
                    <IconTable className="h-4 w-4" />
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

            {/* 编辑器 - 全屏 */}
            <div className="flex-1 p-4">
              <textarea
                id="content-editor"
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="w-full h-full border border-gray-300 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="在这里编写Markdown内容...&#10;&#10;支持拖拽图片上传！"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
