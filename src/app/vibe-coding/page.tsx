'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconHome } from '@tabler/icons-react';
import { TreeView, TreeNode } from '@/components/ui/tree-view';
import { getDocumentData, DocumentItem } from '@/lib/document-data';
import { motion } from 'framer-motion';

export default function VibeCodingPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 加载文档数据
  useEffect(() => {
    const data = getDocumentData();
    setDocuments(data);
    
    // 默认选择第一个有内容的二级文档
    const firstContentDoc = data.find(doc => doc.level === 2 && doc.content);
    if (firstContentDoc) {
      setSelectedNodeId(firstContentDoc.id);
    }
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

  // 渲染 Markdown 内容
  const renderMarkdownContent = (content: string) => {
    // 简单的 Markdown 渲染，你可以替换为更完整的 Markdown 解析器
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // 处理标题
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-6">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-700 mb-3 mt-5">
            {line.substring(4)}
          </h3>
        );
      }
      
      // 处理代码块
      if (line.startsWith('```')) {
        return <div key={index} className="my-4" />;
      }
      
      // 处理列表
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-6 mb-2 text-gray-700">
            {line.substring(2)}
          </li>
        );
      }
      
      // 处理有序列表
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={index} className="ml-6 mb-2 text-gray-700">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      
      // 处理引用
      if (line.startsWith('> ')) {
        return (
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700">
            {line.substring(2)}
          </blockquote>
        );
      }
      
      // 处理粗体和斜体
      let processedLine = line;
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      processedLine = processedLine.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');
      
      // 处理空行
      if (line.trim() === '') {
        return <div key={index} className="mb-4" />;
      }
      
      // 普通段落
      return (
        <p key={index} className="text-gray-700 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />
      );
    });
  };

  const selectedDoc = getSelectedDocument();
  const treeData = convertToTreeData(documents);

  return (
    <div className="min-h-screen bg-white flex">
      {/* 左侧导航栏 */}
      <div className="w-80 bg-gray-50 flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-6">
          <h1 className="text-xl font-bold text-gray-900">Vibe Coding</h1>
          <p className="text-sm text-gray-600 mt-1">知识库文档</p>
        </div>

        {/* 树形导航 */}
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

        {/* 底部按钮 */}
        <div className="px-6 pb-6">
          <motion.button
            onClick={() => router.push('/')}
            className="w-full flex items-center py-2 px-3 cursor-pointer transition-all duration-200 relative group rounded-md mx-1 hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="flex items-center justify-center w-6 h-6 mr-3"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.15 }}
            >
              <IconHome className="h-4 w-4" />
            </motion.div>
            <span className="text-base font-medium">返回首页</span>
          </motion.button>
        </div>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            {/* 文档头部 */}
            <div className="bg-white px-6 py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedDoc.label}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDoc.level === 1 ? '一级目录' : '二级目录'}
                </p>
              </div>
            </div>

            {/* 文档内容 */}
            <div className="flex-1 overflow-auto">
              <div className="px-6">
                {selectedDoc.level === 2 && selectedDoc.content ? (
                  <div className="prose prose-lg max-w-none">
                    {renderMarkdownContent(selectedDoc.content)}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    {selectedDoc.level === 1 ? (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">{selectedDoc.label}</h2>
                        <p className="text-lg">这是一个目录分类</p>
                        <p className="text-sm mt-2">请在左侧选择具体的文档查看内容</p>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">暂无内容</h2>
                        <p className="text-lg">该文档还没有添加内容</p>
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
              <h2 className="text-2xl font-bold mb-4">欢迎来到 Vibe Coding</h2>
              <p className="text-lg">请在左侧选择一个文档开始阅读</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 