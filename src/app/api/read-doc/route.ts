import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * 获取文档内容的API路由
 * 
 * 这个路由接收文件名作为查询参数，并返回文件内容。
 * 文件名应该是相对于docs目录的路径。
 * 
 * @param request 包含查询参数的请求对象
 * @returns 文档内容或错误信息
 */
export async function GET(request: Request) {
  try {
    // 从URL获取文件名参数
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: '必须提供文件名参数' },
        { status: 400 }
      );
    }

    // 安全性检查：确保文件名不包含目录遍历尝试
    if (filename.includes('..')) {
      return NextResponse.json(
        { error: '文件名包含非法字符' },
        { status: 400 }
      );
    }

    // 获取项目根目录
    const projectRoot = process.cwd();
    
    // 构建文档存储目录的绝对路径
    const docsDir = path.join(projectRoot, 'docs');
    
    // 构建文件的完整路径
    const filePath = path.join(docsDir, filename);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (err) {
      console.error(`文件不存在: ${filePath}`, err);
      return NextResponse.json(
        { error: `文件不存在: ${filename}` },
        { status: 404 }
      );
    }

    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8');
    
    // 直接返回文本内容，不使用JSON封装
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8'
      }
    });

  } catch (err) {
    console.error('读取文档时出错:', err);
    return NextResponse.json(
      { error: `读取文档时出错: ${(err as Error).message}` },
      { status: 500 }
    );
  }
} 