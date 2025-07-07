import { createClient } from '@supabase/supabase-js';

// 数据库中的文档项接口
export interface DatabaseDocumentItem {
  id: string;
  label: string;
  level: number;
  parent_id?: string;
  content?: string;
  first_heading?: string;
  second_heading?: string;
  sub_headings?: string[];
  created_at?: string;
  updated_at?: string;
}

// 创建 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 检查环境变量是否配置
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here');
};

// 创建 Supabase 客户端（如果未配置则使用空值）
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// 测试连接函数
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  error?: string;
  details?: unknown;
}> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase 环境变量未配置',
      details: {
        url: supabaseUrl,
        keyConfigured: !!supabaseAnonKey
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('count')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    return {
      success: true,
      details: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: error
    };
  }
}; 