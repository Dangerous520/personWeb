import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 从请求体中获取密码
    const { password } = body;

    // 本地验证密码
    const correctPassword = "deng301096";
    
    if (password === correctPassword) {
      // 创建一个模拟的令牌，实际项目中应该使用更安全的方法
      const token = "mock_token_" + Date.now();
      
      return NextResponse.json({
        success: true,
        data: {
          token,
          username: "admin",
          expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: "密码不正确" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('登录API错误:', error);
    return NextResponse.json(
      { success: false, message: '登录请求处理出错', error: error.message },
      { status: 500 }
    );
  }
} 