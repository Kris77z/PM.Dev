import { NextResponse } from 'next/server'
import { getDocumentData, saveDocumentData } from '@/lib/document-data'

export async function GET() {
  try {
    const documents = await getDocumentData()
    return NextResponse.json({
      success: true,
      data: documents
    })
  } catch (error) {
    console.error('API: 获取文档失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '获取文档失败',
        message: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const documents = await request.json()
    
    if (!Array.isArray(documents)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '数据格式错误',
          message: '期望收到文档数组'
        }, 
        { status: 400 }
      )
    }

    const success = await saveDocumentData(documents)
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: '文档保存成功' 
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: '保存失败',
          message: '数据已保存到本地存储作为备份'
        }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API: 保存文档失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '保存文档失败',
        message: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
} 