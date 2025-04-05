"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Mail, UserCircle, Calendar, Trash2, LogOut } from "lucide-react"
import NeonText from "@/components/neon-text"

// 定义留言类型
interface Message {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
  status?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  
  // 从localStorage检查现有令牌
  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    const expiry = localStorage.getItem("token_expiry")
    
    if (token && expiry && new Date(expiry) > new Date()) {
      setIsLoggedIn(true)
      fetchMessages(token)
    }
  }, [])
  
  // 登录处理
  const handleLogin = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: "admin", // 添加默认用户名
          password 
        }),
      })
      
      // 检查响应类型
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.error("非JSON响应:", await response.text());
        throw new Error("服务器返回了非JSON响应，请确保后端服务正在运行");
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || "登录失败");
      }
      
      // 保存令牌到localStorage
      localStorage.setItem("admin_token", data.data.token);
      // 设置过期时间为24小时后
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      localStorage.setItem("token_expiry", expiry.toISOString());
      
      setIsLoggedIn(true);
      fetchMessages(data.data.token);
    } catch (err: any) {
      console.error("登录错误:", err);
      setError(err.message || "登录时出错，请确保后端服务正在运行");
    } finally {
      setIsLoading(false);
    }
  }
  
  // 登出处理
  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("token_expiry")
    setIsLoggedIn(false)
    setMessages([])
  }
  
  // 获取留言列表
  const fetchMessages = async (token: string) => {
    setIsLoading(true);
    try {
      // 尝试从后端API获取消息数据
      console.log("尝试从后端API获取消息数据...");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/contact`, 
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error("会话已过期，请重新登录");
        }
        throw new Error(data.message || "获取留言失败");
      }
      
      // 确保我们有数据
      if (data.success && data.data && Array.isArray(data.data)) {
        setMessages(data.data);
        
        // 如果后端返回消息为空，则可能显示本地消息
        if (data.data.length === 0) {
          // 尝试获取本地离线消息
          const offlineData = localStorage.getItem('offlineContactData');
          if (offlineData) {
            try {
              const offlineMessages = JSON.parse(offlineData);
              if (offlineMessages && offlineMessages.length > 0) {
                setMessages(offlineMessages);
                setError("数据库中没有消息，当前显示的是本地存储的离线消息");
              }
            } catch (e) {
              console.error("解析本地存储数据失败", e);
            }
          }
        }
      } else {
        throw new Error("获取留言失败：无效的响应格式");
      }
    } catch (err: any) {
      console.error("获取留言错误:", err);
      setError(err.message || "获取留言失败");
      
      // 如果API请求失败，尝试使用本地存储的消息
      const offlineData = localStorage.getItem('offlineContactData');
      if (offlineData) {
        try {
          const messages = JSON.parse(offlineData);
          setMessages(messages);
          setError("数据库连接失败，当前显示的是本地存储的离线消息");
        } catch (parseErr) {
          console.error("解析本地存储数据失败", parseErr);
          // 显示一个示例消息
          setMessages([{
            id: "example_" + Date.now(),
            name: "示例用户",
            email: "example@example.com",
            message: "这是一条示例留言消息。数据库连接失败，无法读取实际的留言数据。",
            createdAt: new Date().toISOString(),
            status: "数据库未连接"
          }]);
        }
      } else {
        // 没有本地数据，显示示例消息
        setMessages([{
          id: "example_" + Date.now(),
          name: "示例用户",
          email: "example@example.com",
          message: "这是一条示例留言消息。数据库连接失败，无法读取实际的留言数据。",
          createdAt: new Date().toISOString(),
          status: "数据库未连接"
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // 删除留言
  const deleteMessage = async (id: string) => {
    if (!confirm("确定要删除这条留言吗？")) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("未授权，请先登录");
      }
      
      // 检查是否是本地离线数据或测试数据
      const isOfflineId = id.startsWith("offline-") || id.startsWith("example_");
      
      if (isOfflineId) {
        // 如果是离线ID或示例ID，只从本地存储中删除
        if (id.startsWith("offline-")) {
          const offlineData = localStorage.getItem('offlineContactData');
          if (offlineData) {
            const messages = JSON.parse(offlineData);
            const updatedMessages = messages.filter((msg: any) => msg.id !== id);
            localStorage.setItem('offlineContactData', JSON.stringify(updatedMessages));
          }
        }
        
        // 无论是离线消息还是示例消息，都从UI中移除
        setMessages(prev => prev.filter(msg => msg.id !== id));
        setIsLoading(false);
        return;
      }
      
      // 不是离线ID或示例ID，调用后端API删除
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      console.log(`尝试删除消息: ${apiBaseUrl}/contact/${id}`);
      
      const response = await fetch(
        `${apiBaseUrl}/contact/${id}`, 
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.error("非JSON响应:", await response.text());
        throw new Error("服务器返回了非JSON响应");
      }
      
      const data = await response.json();
      console.log("删除响应:", data);
      
      if (!response.ok) {
        const errorMessage = data.detail || data.message || "删除失败";
        throw new Error(errorMessage);
      }
      
      // 更新消息列表
      setMessages(prev => prev.filter(msg => msg.id !== id));
      
    } catch (err: any) {
      console.error("删除消息错误:", err);
      setError(err.message || "删除失败");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("zh-CN", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-black/40 backdrop-blur-md rounded-lg border border-[#00F3FF]/30">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#00F3FF] mb-2">管理员登录</h2>
            <p className="text-gray-400">请输入密码查看访客留言</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Input
                id="password"
                type="password"
                placeholder="管理员密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/60 border-[#FF00FF]/30 focus:border-[#FF00FF]"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] hover:opacity-90"
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
            
            <div className="text-center">
              <button 
                onClick={() => router.push("/")}
                className="text-[#00F3FF] text-sm hover:underline"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          <NeonText text="管理控制台" color="#00F3FF" />
        </h1>
        
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-[#00F3FF] text-[#00F3FF] hover:bg-[#00F3FF]/10"
          >
            返回首页
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" /> 退出登录
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="bg-black/40 border border-[#00F3FF]/20">
          <TabsTrigger value="messages" className="data-[state=active]:bg-[#00F3FF]/20">
            访客留言 {messages.length > 0 && <Badge className="ml-2 bg-[#FF00FF]">{messages.length}</Badge>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="mt-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>暂无留言</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {messages.map((msg) => (
                <Card key={msg.id} className="bg-black/40 border border-[#00F3FF]/30 hover:border-[#00F3FF]/60 transition-colors">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center text-[#00FF9D]">
                        <UserCircle className="mr-2 h-5 w-5" />
                        {msg.name}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Mail className="mr-2 h-4 w-4" />
                        {msg.email}
                      </CardDescription>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(msg.createdAt)}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <div>
                      {msg.status && (
                        <Badge className="bg-blue-600">{msg.status}</Badge>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMessage(msg.id)}
                      className="bg-red-600/30 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> 删除
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 