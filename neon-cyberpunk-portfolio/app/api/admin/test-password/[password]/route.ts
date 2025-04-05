import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest, 
  { params }: { params: { password: string } }
) {
  const testPassword = params.password;
  console.log("Testing password:", testPassword);

  try {
    // 确保环境变量正确，添加硬编码的后备URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/test-password/${encodeURIComponent(testPassword)}`
      : `http://localhost:8000/api/admin/test-password/${encodeURIComponent(testPassword)}`;
    
    console.log(`发送密码测试请求: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false, 
          message: "后端API请求失败", 
          error: errorText,
          status: response.status
        }, 
        { status: 500 }
      );
    }
    
    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("密码测试API错误:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "密码测试请求出错", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
} 