"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ApiDebugPage() {
  const router = useRouter()
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [testPassword, setTestPassword] = useState("deng301096")
  const [passwordResult, setPasswordResult] = useState<any>(null)

  const checkApiStatus = async () => {
    setLoading(true)
    setError("")
    
    try {
      // 检查健康端点
      const response = await fetch("/api/health")
      const healthResult = await checkEndpoint(response)
      
      // 检查管理API状态
      const adminStatusResponse = await fetch("/api/admin/status")
      const adminStatusResult = await checkEndpoint(adminStatusResponse)
      
      setApiStatus({
        health: healthResult,
        adminStatus: adminStatusResult
      })
    } catch (err: any) {
      console.error("API调试错误:", err)
      setError(err.message || "检查API状态时出错")
    } finally {
      setLoading(false)
    }
  }
  
  const checkEndpoint = async (response: Response) => {
    const contentType = response.headers.get("content-type") || ""
    
    if (contentType.includes("application/json")) {
      try {
        const data = await response.json()
        return {
          status: response.status,
          ok: response.ok,
          contentType,
          data
        }
      } catch (err) {
        return {
          status: response.status,
          ok: response.ok,
          contentType,
          error: "无法解析JSON",
          text: await response.text()
        }
      }
    } else {
      return {
        status: response.status,
        ok: response.ok,
        contentType,
        text: await response.text()
      }
    }
  }
  
  const testPasswordMatch = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch(`/api/admin/test-password/${encodeURIComponent(testPassword)}`)
      const result = await checkEndpoint(response)
      setPasswordResult(result)
    } catch (err: any) {
      console.error("密码测试错误:", err)
      setError(err.message || "测试密码时出错")
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    checkApiStatus()
  }, [])
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#00F3FF]">API 调试页面</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push("/")}
          className="border-[#00F3FF] text-[#00F3FF] hover:bg-[#00F3FF]/10"
        >
          返回首页
        </Button>
      </div>
      
      <div className="mb-6">
        <Button 
          onClick={checkApiStatus} 
          disabled={loading}
          className="bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] hover:opacity-90 mr-4"
        >
          {loading ? "检查中..." : "检查API状态"}
        </Button>
      </div>
      
      <div className="mb-6 bg-black/40 border border-[#00F3FF]/30 rounded-md p-4">
        <h2 className="text-xl font-bold text-[#00FF9D] mb-4">密码测试</h2>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">输入密码</label>
            <input
              type="text"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="w-full px-3 py-2 bg-black/60 border border-[#FF00FF]/30 rounded-md text-white"
            />
          </div>
          <Button 
            onClick={testPasswordMatch} 
            disabled={loading}
            className="bg-[#00F3FF] text-black hover:bg-[#00F3FF]/80"
          >
            测试密码
          </Button>
        </div>
        
        {passwordResult && (
          <div className="mt-4">
            <h3 className="text-[#00F3FF] font-bold mb-2">测试结果:</h3>
            <pre className="p-3 bg-black/60 rounded-md overflow-auto text-sm">
              {JSON.stringify(passwordResult.data?.data || passwordResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500 p-4 rounded-md mb-6">
          <h3 className="text-red-500 font-bold mb-2">错误</h3>
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {apiStatus && (
        <div className="space-y-8">
          <div className="bg-black/40 border border-[#00F3FF]/30 rounded-md p-4">
            <h2 className="text-xl font-bold text-[#00FF9D] mb-4">健康检查 (/api/health)</h2>
            <div className="grid gap-2">
              <div>
                <span className="text-[#00F3FF] font-bold">状态码: </span>
                <span className={apiStatus.health.ok ? "text-green-400" : "text-red-400"}>
                  {apiStatus.health.status}
                </span>
              </div>
              <div>
                <span className="text-[#00F3FF] font-bold">Content-Type: </span>
                <span>{apiStatus.health.contentType}</span>
              </div>
              <div>
                <span className="text-[#00F3FF] font-bold">响应数据: </span>
                <pre className="mt-2 p-3 bg-black/60 rounded-md overflow-auto text-sm">
                  {apiStatus.health.data 
                    ? JSON.stringify(apiStatus.health.data, null, 2) 
                    : apiStatus.health.text}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="bg-black/40 border border-[#00F3FF]/30 rounded-md p-4">
            <h2 className="text-xl font-bold text-[#00FF9D] mb-4">管理API状态 (/api/admin/status)</h2>
            <div className="grid gap-2">
              <div>
                <span className="text-[#00F3FF] font-bold">状态码: </span>
                <span className={apiStatus.adminStatus.ok ? "text-green-400" : "text-red-400"}>
                  {apiStatus.adminStatus.status}
                </span>
              </div>
              <div>
                <span className="text-[#00F3FF] font-bold">Content-Type: </span>
                <span>{apiStatus.adminStatus.contentType}</span>
              </div>
              <div>
                <span className="text-[#00F3FF] font-bold">响应数据: </span>
                <pre className="mt-2 p-3 bg-black/60 rounded-md overflow-auto text-sm">
                  {apiStatus.adminStatus.data 
                    ? JSON.stringify(apiStatus.adminStatus.data, null, 2) 
                    : apiStatus.adminStatus.text}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          如果API状态检查失败，请确保后端服务正在运行，并且Next.js配置已正确设置API代理。
        </p>
      </div>
    </div>
  )
} 