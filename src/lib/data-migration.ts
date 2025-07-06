import { DocumentItem, saveDocumentData, getDocumentDataSync } from './document-data';

/**
 * 数据迁移工具
 * 帮助将 localStorage 中的数据迁移到 Supabase
 */

// 从 localStorage 获取原始数据
export const getLocalStorageData = (): DocumentItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('pm-assistant-documents');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取 localStorage 数据失败:', error);
  }
  return [];
};

// 将 localStorage 数据迁移到 Supabase
export const migrateLocalDataToSupabase = async (): Promise<{
  success: boolean;
  message: string;
  migratedCount: number;
}> => {
  try {
    // 检查 Supabase 是否配置
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        success: false,
        message: 'Supabase 未配置，请先设置环境变量',
        migratedCount: 0
      };
    }

    // 获取 localStorage 数据
    const localData = getLocalStorageData();
    if (localData.length === 0) {
      return {
        success: false,
        message: '本地存储中没有找到数据',
        migratedCount: 0
      };
    }

    // 保存到 Supabase
    const success = await saveDocumentData(localData);
    
    if (success) {
      return {
        success: true,
        message: `成功迁移 ${localData.length} 条文档数据到云端`,
        migratedCount: localData.length
      };
    } else {
      return {
        success: false,
        message: '迁移失败，请检查网络连接和 Supabase 配置',
        migratedCount: 0
      };
    }
  } catch (error) {
    console.error('数据迁移失败:', error);
    return {
      success: false,
      message: `迁移失败: ${error instanceof Error ? error.message : '未知错误'}`,
      migratedCount: 0
    };
  }
};

// 从 Supabase 下载数据到 localStorage（作为备份）
export const downloadSupabaseDataToLocal = async (): Promise<{
  success: boolean;
  message: string;
  downloadedCount: number;
}> => {
  try {
    // 动态导入以避免 SSR 问题
    const { getDocumentData } = await import('./document-data');
    
    // 从 Supabase 获取数据
    const supabaseData = await getDocumentData();
    
    if (supabaseData.length === 0) {
      return {
        success: false,
        message: 'Supabase 中没有找到数据',
        downloadedCount: 0
      };
    }

    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pm-assistant-documents', JSON.stringify(supabaseData));
    }

    return {
      success: true,
      message: `成功下载 ${supabaseData.length} 条文档数据到本地`,
      downloadedCount: supabaseData.length
    };
  } catch (error) {
    console.error('数据下载失败:', error);
    return {
      success: false,
      message: `下载失败: ${error instanceof Error ? error.message : '未知错误'}`,
      downloadedCount: 0
    };
  }
};

// 比较本地和云端数据
export const compareLocalAndSupabaseData = async (): Promise<{
  localCount: number;
  supabaseCount: number;
  isDifferent: boolean;
  recommendation: string;
}> => {
  try {
    const localData = getLocalStorageData();
    
    // 动态导入以避免 SSR 问题
    const { getDocumentData } = await import('./document-data');
    const supabaseData = await getDocumentData();

    const localCount = localData.length;
    const supabaseCount = supabaseData.length;
    const isDifferent = localCount !== supabaseCount || 
      JSON.stringify(localData) !== JSON.stringify(supabaseData);

    let recommendation = '';
    if (localCount > supabaseCount) {
      recommendation = '本地数据更多，建议上传到云端';
    } else if (supabaseCount > localCount) {
      recommendation = '云端数据更多，建议下载到本地';
    } else if (isDifferent) {
      recommendation = '数据内容不同，建议手动检查';
    } else {
      recommendation = '数据已同步';
    }

    return {
      localCount,
      supabaseCount,
      isDifferent,
      recommendation
    };
  } catch (error) {
    console.error('数据比较失败:', error);
    return {
      localCount: 0,
      supabaseCount: 0,
      isDifferent: true,
      recommendation: '比较失败，请检查配置'
    };
  }
};

// 导出数据为 JSON 文件
export const exportDataAsJSON = (data: DocumentItem[], filename: string = 'pm-assistant-documents.json'): void => {
  if (typeof window === 'undefined') return;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 从 JSON 文件导入数据
export const importDataFromJSON = (file: File): Promise<DocumentItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          resolve(data);
        } else {
          reject(new Error('文件格式错误：期望数组格式'));
        }
      } catch (error) {
        reject(new Error('文件解析失败：无效的JSON格式'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}; 