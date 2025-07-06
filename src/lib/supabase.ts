import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface DatabaseDocumentItem {
  id: string
  label: string
  level: number
  parent_id: string | null
  content: string | null
  first_heading: string | null
  second_heading: string | null
  sub_headings: string[] | null
  created_at: string
  updated_at: string
} 