import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取 Authorization 头
    const authHeader = request.headers.get('Authorization');
    
    // 简单验证令牌存在
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: "未授权访问" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "消息ID不存在" },
        { status: 400 }
      );
    }
    
    // 在实际实现中，这里会调用删除消息的逻辑
    // 现在我们只返回成功响应
    
    return NextResponse.json({
      success: true,
      message: "消息已删除"
    });
  } catch (error: any) {
    console.error('删除消息错误:', error);
    return NextResponse.json(
      { success: false, message: '删除消息失败', error: error.message },
      { status: 500 }
    );
  }
} 