"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// 后端API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function TerminalContact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "初始化联系协议...",
    "建立安全连接...",
    "连接已建立。",
    "请输入您的信息:",
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Blink cursor
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  // 检查后端连接状态
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时
        
        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal
        }).catch(() => null);
        
        clearTimeout(timeoutId);
        
        if (!response || !response.ok) {
          console.log("后端不可用，切换到离线模式");
          setIsOfflineMode(true);
        }
      } catch (error) {
        console.log("检查后端连接失败，切换到离线模式", error);
        setIsOfflineMode(true);
      }
    };
    
    checkBackendConnection();
  }, []);

  // 模拟后端响应（离线模式使用）
  const simulateBackendResponse = async (data: any) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "消息已成功保存（离线模式）",
          data: {
            id: `offline-${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString()
          }
        });
      }, 1500);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 播放终端声音
    const audio = new Audio("/sounds/terminal.mp3")
    audio.volume = 0.2
    audio.play().catch((e) => console.log("播放音频失败:", e))

    if (currentStep === 0) {
      setTerminalLines((prev) => [...prev, `> 姓名: ${name}`, "处理中..."])
      setTimeout(() => {
        setTerminalLines((prev) => [...prev, "姓名已接受。请输入您的电子邮箱:"])
        setCurrentStep(1)
      }, 1000)
    } else if (currentStep === 1) {
      setTerminalLines((prev) => [...prev, `> 电子邮箱: ${email}`, "验证电子邮箱..."])
      setTimeout(() => {
        setTerminalLines((prev) => [...prev, "电子邮箱已验证。请输入您的消息:"])
        setCurrentStep(2)
      }, 1000)
    } else if (currentStep === 2) {
      setTerminalLines((prev) => [...prev, `> 消息: ${message}`, "处理消息..."])
      
      // 清除之前的错误
      setError(null)
      setIsSubmitting(true)
      
      const contactData = {
        name,
        email,
        message
      };
      
      try {
        let result;
        
        if (isOfflineMode) {
          // 离线模式：模拟后端响应
          result = await simulateBackendResponse(contactData) as any;
          setTerminalLines((prev) => [
            ...prev,
            "检测到离线模式...",
            "模拟数据处理中...",
          ]);
        } else {
          // 在线模式：发送到实际后端
          try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(contactData)
            });
            
            if (response.ok) {
              result = await response.json();
            } else {
              throw new Error(`提交失败 (${response.status})`);
            }
          } catch (fetchError) {
            console.error("API请求失败，切换到离线模式", fetchError);
            setTerminalLines((prev) => [
              ...prev,
              "后端连接失败，切换到离线模式...",
            ]);
            
            // 请求失败时切换到离线模式
            setIsOfflineMode(true);
            result = await simulateBackendResponse(contactData) as any;
          }
        }
        
        if (result.success) {
          const modeText = isOfflineMode ? "（离线模式 - 数据将在后端可用时同步）" : "";
          setTerminalLines((prev) => [
            ...prev,
            "消息已接收。加密数据...",
            "传输完成。",
            `感谢您的留言。我会尽快回复您。${modeText}`,
            `消息ID: ${result.data.id}`,
          ]);
          setCurrentStep(3);
          
          // 如果是离线模式，将数据保存到本地存储
          if (isOfflineMode) {
            try {
              const offlineData = JSON.parse(localStorage.getItem('offlineContactData') || '[]');
              offlineData.push({
                ...contactData,
                id: result.data.id,
                createdAt: result.data.createdAt,
                synced: false
              });
              localStorage.setItem('offlineContactData', JSON.stringify(offlineData));
              console.log("数据已保存到本地存储，等待后端同步");
            } catch (storageError) {
              console.error("保存到本地存储失败", storageError);
            }
          }
        } else {
          throw new Error(result.message || '提交失败');
        }
      } catch (error) {
        console.error('提交联系表单出错:', error);
        setError(error instanceof Error ? error.message : '提交失败，请稍后再试');
        setTerminalLines((prev) => [
          ...prev,
          "错误: 传输失败",
          `原因: ${error instanceof Error ? error.message : '未知错误'}`,
          "请稍后重试或使用其他联系方式。"
        ]);
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-[#00F3FF]/30 rounded-lg p-4 h-[400px] flex flex-col">
      <div className="flex items-center justify-between border-b border-[#00F3FF]/30 pb-2 mb-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-[#00F3FF] font-['ZiHun59']">
          {isOfflineMode ? "cyber_contact.exe [离线模式]" : "cyber_contact.exe"}
        </div>
        <div></div>
      </div>

      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto font-['ZiHun59'] text-sm text-[#00FF9D] mb-4 scrollbar-thin scrollbar-thumb-[#00F3FF]/30 scrollbar-track-transparent"
      >
        {terminalLines.map((line, index) => (
          <div key={index} className="mb-1">
            {line.startsWith(">") ? <span className="text-[#FF00FF]">{line}</span> : line}
            {line.startsWith("错误") && <span className="text-red-500">{line}</span>}
            {line.includes("离线模式") && !line.startsWith(">") && <span className="text-yellow-500">{line}</span>}
          </div>
        ))}
        {currentStep < 3 && !error && (
          <div className="flex items-center">
            <span className="mr-2">
              {currentStep === 0 && "姓名:"}
              {currentStep === 1 && "电子邮箱:"}
              {currentStep === 2 && "消息:"}
            </span>
            <span className="inline-block">
              {currentStep === 0 && name}
              {currentStep === 1 && email}
              {currentStep === 2 && message}
              {cursorVisible && <span className="inline-block w-2 h-4 bg-[#00FF9D] ml-0.5 animate-pulse"></span>}
            </span>
          </div>
        )}
      </div>

      {currentStep < 3 && !error && (
        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="space-y-3">
            {currentStep === 0 && (
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入您的姓名"
                className="bg-black/60 border-[#00F3FF]/30 text-[#00FF9D] placeholder:text-gray-500 font-['ZiHun59']"
                required
              />
            )}

            {currentStep === 1 && (
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入您的电子邮箱"
                className="bg-black/60 border-[#00F3FF]/30 text-[#00FF9D] placeholder:text-gray-500 font-['ZiHun59']"
                required
              />
            )}

            {currentStep === 2 && (
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入您的消息"
                className="bg-black/60 border-[#00F3FF]/30 text-[#00FF9D] placeholder:text-gray-500 min-h-[100px] font-['ZiHun59']"
                required
              />
            )}

            <Button
              type="submit"
              className="w-full bg-black border border-[#00F3FF] text-[#00F3FF] hover:bg-[#00F3FF]/10 font-['ZiHun59']"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-t-transparent border-[#00F3FF] rounded-full animate-spin mr-2"></span>
                  提交中...
                </span>
              ) : (
                <>
                  {currentStep === 0 && "提交姓名"}
                  {currentStep === 1 && "提交邮箱"}
                  {currentStep === 2 && "发送消息"}
                </>
              )}
            </Button>
          </div>
        </form>
      )}
      
      {error && (
        <div className="mt-auto">
          <Button
            onClick={() => {
              setError(null)
              setTerminalLines((prev) => [...prev, "重新尝试..."]);
            }}
            className="w-full bg-black border border-red-500 text-red-500 hover:bg-red-500/10 font-['ZiHun59']"
          >
            重试
          </Button>
        </div>
      )}
    </div>
  )
}

