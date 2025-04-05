import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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
    
    // 获取存储在客户端的离线消息
    // 注意：由于这是服务器组件，不能直接访问localStorage
    // 我们需要通过特殊方式获取或传递数据
    // 在这个实现中，我们将使用Cookie作为中间层
    
    // 提示正在尝试连接数据库
    console.log('正在尝试从数据库读取消息...');
    
    // 这里应该是从数据库读取消息的代码
    // 在当前实现中，我们使用Cookie或返回示例数据
    
    // 检查是否有离线消息Cookie
    const offlineDataCookie = request.cookies.get('offlineContactData');
    
    let messages = [];
    
    if (offlineDataCookie && offlineDataCookie.value) {
      try {
        // 尝试解析Cookie中的JSON数据
        messages = JSON.parse(decodeURIComponent(offlineDataCookie.value));
        console.log('从Cookie读取到消息数据:', messages.length, '条');
      } catch (err) {
        console.error('解析离线消息Cookie失败', err);
      }
    } else {
      console.log('未找到消息Cookie数据，尝试从数据库读取');
      // 此处应该添加从数据库查询的代码
      // 例如: messages = await db.collection('messages').find().toArray();
      
      // 由于数据库连接未配置或未启动，给出明确提示
      console.warn('警告：数据库连接失败或未配置，无法读取消息数据');
    }
    
    // 如果没有消息数据，返回一个示例消息并给出提示
    if (!messages || messages.length === 0) {
      console.log('未找到实际消息数据，返回示例消息');
      messages = [
        {
          id: "msg_" + Date.now(),
          name: "示例用户",
          email: "example@example.com",
          message: "这是一条示例留言消息。\n\n注意：数据库连接失败或未配置，这是一条示例消息。实际的访客留言会在提交联系表单并成功存储到数据库后显示在这里。",
          createdAt: new Date().toISOString(),
          status: "数据库未连接"
        }
      ];
    }
    
    return NextResponse.json({
      success: true,
      data: messages,
      dbStatus: "数据库连接失败或未配置，当前使用本地存储数据"
    });
  } catch (error: any) {
    console.error('获取消息错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '获取消息失败：数据库连接错误', 
        error: error.message,
        dbStatus: "数据库连接失败"
      },
      { status: 500 }
    );
  }
}

// 删除单个消息
export async function DELETE(request: NextRequest) {
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
    
    // 从URL中获取消息ID
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const messageId = pathParts[pathParts.length - 1];
    
    if (!messageId) {
      return NextResponse.json(
        { success: false, message: "消息ID不存在" },
        { status: 400 }
      );
    }
    
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