"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, UserCircle, Calendar } from "lucide-react"
import NeonText from "@/components/neon-text"

// 留言类型定义
interface Message {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

// 后端API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function MessagesPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  // 尝试从本地存储恢复认证状态
  useEffect(() => {
    const authState = localStorage.getItem("messages_auth")
    if (authState === "authenticated") {
      setIsAuthenticated(true)
      fetchMessages()
    }
  }, [])

  // 验证密码
  const handlePasswordSubmit = () => {
    setIsLoading(true)
    setError("")

    // 检查硬编码的密码
    const expectedPassword = "deng301096"
    
    if (password === expectedPassword) {
      // 密码匹配，设置认证状态
      setIsAuthenticated(true)
      localStorage.setItem("messages_auth", "authenticated")
      fetchMessages()
    } else {
      // 密码不正确
      setError("密码不正确")
    }
    
    setIsLoading(false)
  }

  // 获取留言数据
  const fetchMessages = async () => {
    setIsLoading(true)
    
    try {
      // 从本地存储获取留言数据
      const localData = localStorage.getItem('offlineContactData')
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setMessages(parsedData);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error("解析本地存储数据失败", err);
        }
      }
      
      // 如果没有有效的本地数据，显示一条提示消息
      setMessages([{
        id: "guide_" + Date.now(),
        name: "系统提示",
        email: "system@example.com",
        message: "目前没有访客留言。\n\n当有人通过首页的联系终端提交留言后，会显示在这里。",
        createdAt: new Date().toISOString()
      }]);
    } catch (err) {
      console.error("获取留言错误:", err);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem("messages_auth")
    setIsAuthenticated(false)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("zh-CN", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // 如果未认证，显示登录页面
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-black/40 backdrop-blur-md rounded-lg border border-[#00F3FF]/30">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#00F3FF] mb-2">查看留言</h2>
            <p className="text-gray-400">请输入密码查看访客留言</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Input
                id="password"
                type="password"
                placeholder="管理密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="bg-black/60 border-[#FF00FF]/30 focus:border-[#FF00FF]"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <Button
              onClick={handlePasswordSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] hover:opacity-90"
            >
              {isLoading ? "验证中..." : "查看留言"}
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

  // 显示留言列表
  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          <NeonText text="访客留言" color="#00F3FF" />
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
            退出
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-[#00F3FF] border-r-2 border-b-2 border-transparent"></div>
          <p className="mt-4 text-[#00F3FF]">加载留言中...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400">暂无留言</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages.map((message) => (
            <Card key={message.id} className="bg-black/40 backdrop-blur-md border border-[#00F3FF]/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <UserCircle className="h-5 w-5 text-[#FF00FF]" />
                    <span className="text-lg text-[#FF00FF]">{message.name}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center space-x-2 text-sm text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>{message.email}</span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap border-t border-[#00F3FF]/20 pt-3 mt-1">
                  {message.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 