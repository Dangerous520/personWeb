import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 确保环境变量正确，添加硬编码的后备URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/status`
      : 'http://localhost:8000/api/admin/status';
      
    console.log(`检查管理API状态: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 如果响应不成功，获取错误信息
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorMessage = '后端API请求失败';
      let errorData = null;

      if (contentType.includes('application/json')) {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } else {
        const errorText = await response.text();
        console.error(`后端非JSON错误响应: ${errorText}`);
        errorMessage = `后端服务错误: ${response.status} ${response.statusText}`;
      }

      return NextResponse.json(
        { success: false, message: errorMessage, error: errorData },
        { status: response.status }
      );
    }

    // 获取JSON响应并返回
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('管理状态API错误:', error);
    return NextResponse.json(
      { success: false, message: '管理状态请求处理出错', error: error.message },
      { status: 500 }
    );
  }
} 