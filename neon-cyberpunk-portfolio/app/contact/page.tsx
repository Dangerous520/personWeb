import Image from "next/image"
import Link from "next/link"
import { Github, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import TerminalContact from "@/components/terminal-contact"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-10 text-center text-[#00F3FF]">联系我</h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-[#00FF9D]">取得联系</h3>
          <p className="text-gray-300 font-mono">有项目想法或想要合作？请通过以下任何方式与我联系。</p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#FF00FF]/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-[#FF00FF]" />
              </div>
              <div>
                <h4 className="text-[#00F3FF]">邮箱</h4>
                <p className="text-gray-300">Deng_8245@2925.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#00FF9D]/20 flex items-center justify-center">
                <Github className="h-6 w-6 text-[#00FF9D]" />
              </div>
              <div>
                <h4 className="text-[#00F3FF]">GitHub</h4>
                <p className="text-gray-300">github.com/Dangerous520</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#00F3FF]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6 text-[#00F3FF]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                </svg>
              </div>
              <div>
                <h4 className="text-[#00F3FF]">微信</h4>
                <p className="text-gray-300">wxid_yn1wt9lb5rx722</p>
              </div>
            </div>
          </div>
          
          {/* 微信二维码 */}
          <div className="mt-8">
            <h4 className="text-xl font-bold text-[#00FF9D] mb-4">扫描二维码添加微信</h4>
            <div className="relative w-48 h-48 border-2 border-[#00F3FF] p-2 rounded-lg mx-auto md:mx-0">
              <Image 
                src="/vxcode.jpg" 
                alt="微信二维码" 
                width={180} 
                height={180}
                className="rounded-md"
              />
            </div>
          </div>
        </div>
        
        <div>
          <TerminalContact />
        </div>
      </div>
      
      <div className="mt-20 text-center">
        <h3 className="text-xl font-bold text-[#00F3FF] mb-4">准备好开始一个项目了吗?</h3>
        <Button className="bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] text-white border-none hover:opacity-90">
          立即联系
        </Button>
      </div>
    </div>
  )
} 