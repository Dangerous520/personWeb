"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Github, Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import NeonText from "@/components/neon-text"
import GlitchEffect from "@/components/glitch-effect"
import SkillBar from "@/components/skill-bar"
import ProjectCard from "@/components/project-card"
import TerminalContact from "@/components/terminal-contact"
import CyberpunkScene from "@/components/cyberpunk-scene"
import NextBlocksDisplay from "@/components/next-blocks-display"
import TetrisGame from "@/components/tetris-game"

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home")
  const [isLoading, setIsLoading] = useState(true)
  const [isEasterEggActive, setIsEasterEggActive] = useState(false)
  const logoClickCount = useRef(0)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Add scan line effect
    const scanLineStyle = document.createElement("style")
    scanLineStyle.innerHTML = `
      body::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          to bottom,
          transparent,
          transparent 1px,
          rgba(255, 255, 255, 0.03) 1px,
          rgba(255, 255, 255, 0.03) 2px
        );
        pointer-events: none;
        z-index: 100;
        animation: scanlines 0.5s linear infinite;
      }
      
      @keyframes scanlines {
        from { background-position: 0 0; }
        to { background-position: 0 -2px; }
      }
    `
    document.head.appendChild(scanLineStyle)

    return () => {
      clearTimeout(timer)
      document.head.removeChild(scanLineStyle)
    }
  }, [])

  const handleLogoClick = () => {
    logoClickCount.current += 1
    if (logoClickCount.current === 5) {
      setIsEasterEggActive(!isEasterEggActive)
      logoClickCount.current = 0
      console.log("彩蛋已激活!")
    }
  }

  const handleNavClick = (section: string) => {
    setActiveSection(section)
    
    // 当选择俄罗斯方块游戏时，滚动到该区域并防止页面滚动
    if (section === "tetris") {
      const tetrisSection = document.getElementById("tetris")
      if (tetrisSection) {
        tetrisSection.scrollIntoView({ behavior: "smooth" })
        // 聚焦游戏容器
        setTimeout(() => {
          const gameContainer = tetrisSection.querySelector("[tabindex='0']")
          if (gameContainer) {
            // @ts-ignore
            gameContainer.focus()
          }
        }, 1000)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0A0A0A]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-[#00FF9D] rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-[#FF00FF] rounded-full animate-spin-slow"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[#00F3FF] text-xl font-mono">100%</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-[#0A0A0A] text-white ${isEasterEggActive ? "pixel-mode" : ""}`}>
      {/* 3D Background Scene */}
      <div className="fixed inset-0 z-0">
        <CyberpunkScene />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-[#00FF9D] cursor-pointer" onClick={handleLogoClick}>
              <NeonText text="CYBER.DEV" color="#00FF9D" />
            </div>
            <nav className="hidden md:flex space-x-8">
              {["首页", "关于", "技能", "项目", "游戏", "联系"].map((item, index) => {
                const sectionKeys = ["home", "about", "skills", "projects", "tetris", "contact"]
                return (
                  <button
                    key={sectionKeys[index]}
                    onClick={() => handleNavClick(sectionKeys[index])}
                    className={`relative text-sm uppercase tracking-wider hover:text-[#00F3FF] transition-colors ${
                      activeSection === sectionKeys[index] ? "text-[#00F3FF]" : "text-gray-300"
                    }`}
                  >
                    <span>{item}</span>
                    {activeSection === sectionKeys[index] && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF00FF] to-[#00FF9D]"></span>
                    )}
                  </button>
                )
              })}
            </nav>
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Hero Section */}
        <section
          id="home"
          className={`min-h-[80vh] flex flex-col justify-center ${activeSection !== "home" ? "hidden" : ""}`}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl text-[#00F3FF]">你好，我是</h2>
                <GlitchEffect>
                  <h1 className="text-5xl md:text-7xl font-bold mt-2 bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] text-transparent bg-clip-text font-yuweiShufa">
                    邓宗林
                  </h1>
                </GlitchEffect>
                <h3 className="text-2xl mt-4 text-[#FFE600]">软件工程专业工程师</h3>
              </div>
              <p className="text-gray-300 font-mono leading-relaxed">
                在<span className="text-[#00FF9D]">设计</span>与<span className="text-[#FF00FF]">技术</span>
                的交汇处构建数字体验。专注于使用前沿技术创建高效实用的大数据应用程序。
              </p>
              <div className="flex space-x-4 pt-4">
                <Button className="bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] text-white border-none hover:opacity-90">
                  查看项目
                </Button>
                <Button variant="outline" className="border-[#00F3FF] text-[#00F3FF] hover:bg-[#00F3FF]/10">
                  联系我
                </Button>
              </div>
              <div className="flex space-x-4 pt-4">
                <Link href="https://github.com/Dangerous520" className="text-gray-400 hover:text-[#00FF9D] transition-colors">
                  <Github className="h-6 w-6" />
                </Link>
                <Link href="#contact" className="text-gray-400 hover:text-[#00FF9D] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" fill="none" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18c0-2 3-3 6-3s6 1 6 3" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="relative h-80 md:h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF00FF]/20 to-[#00FF9D]/20 rounded-lg blur-3xl opacity-30"></div>
              <div className="relative z-10 w-64 h-64 md:w-80 md:h-80">
                <div className="cyberpunk-avatar h-full">
                  <NextBlocksDisplay />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className={`py-20 ${activeSection !== "about" ? "hidden" : ""}`}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="inline-block text-3xl font-bold relative">
                <NeonText text="关于我" color="#00F3FF" />
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF00FF] to-[#00FF9D]"></span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF00FF]/20 to-[#00FF9D]/20 rounded-lg blur-xl opacity-30"></div>
                <div className="relative z-10">
                  <Image
                    src="/placeholder.svg?height=600&width=500"
                    alt="About Me"
                    width={500}
                    height={600}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="space-y-6 font-mono">
                <h3 className="text-2xl font-bold text-[#00FF9D] font-['YuWeiShufa']">我是谁?</h3>
                <p className="text-gray-300">
                  我是一名拥有丰富经验的<span className="text-[#FF00FF]">软件工程本科生</span>，
                  本科毕业于<span className="text-[#FFE600]">烟台大学</span>，专注于构建高效实用的应用程序。
                </p>
                <p className="text-gray-300">
                  我的专长包括<span className="text-[#00F3FF]">C#</span>、
                  <span className="text-[#FFE600]">Python</span>、
                  <span className="text-[#FF00FF]">Unity</span>、
                  <span className="text-[#00F3FF]">React</span>、
                  <span className="text-[#FFE600]">Node.js</span>和
                  <span className="text-[#FF00FF]">HarmonyOS</span>
                  开发。
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="text-[#00F3FF] font-bold">位置</h4>
                    <p>中国|四川|宜宾</p>
                  </div>
                  <div>
                    <h4 className="text-[#00F3FF] font-bold">学历</h4>
                    <p>烟台大学 本科</p>
                  </div>
                  <div>
                    <h4 className="text-[#00F3FF] font-bold">自由职业</h4>
                    <p>可接单</p>
                  </div>
                  <div>
                    <h4 className="text-[#00F3FF] font-bold">语言</h4>
                    <p>中文，英语</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] text-white border-none hover:opacity-90">
                    下载简历
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className={`py-20 ${activeSection !== "skills" ? "hidden" : ""}`}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="inline-block text-3xl font-bold relative">
                <NeonText text="我的技能" color="#00F3FF" />
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF00FF] to-[#00FF9D]"></span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#00FF9D]">技术能力</h3>
                <div className="space-y-4">
                  <SkillBar name="C# / .NET" percentage={95} color="#00F3FF" />
                  <SkillBar name="Python" percentage={92} color="#00FF9D" />
                  <SkillBar name="Unity" percentage={88} color="#FF00FF" />
                  <SkillBar name="React / Next.js" percentage={90} color="#FFE600" />
                  <SkillBar name="HarmonyOS开发" percentage={85} color="#00F3FF" />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#00FF9D]">工具与技术</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    "C#",
                    "Python",
                    "C++",
                    "React",
                    "Node.js",
                    "HarmonyOS",
                    "JavaScript",
                    "TypeScript",
                    "Next.js",
                    "Unity",
                    "MongoDB",
                    "Docker",
                  ].map((tech) => (
                    <div
                      key={tech}
                      className="flex items-center justify-center p-4 rounded-lg bg-black/40 border border-[#00F3FF]/30 hover:border-[#00F3FF] transition-colors"
                    >
                      <span className="text-sm text-center">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className={`py-20 ${activeSection !== "projects" ? "hidden" : ""}`}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="inline-block text-3xl font-bold relative">
                <NeonText text="我的项目" color="#00F3FF" />
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF00FF] to-[#00FF9D]"></span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ProjectCard
                title="霓虹仪表盘"
                description="具有实时数据可视化和赛博朋克美学的未来主义管理面板。"
                image="/placeholder.svg?height=300&width=500"
                tags={["React", "D3.js", "Firebase"]}
                link="https://example.com"
              />
              <ProjectCard
                title="HarmonyOS应用"
                description="基于HarmonyOS的跨设备应用程序，支持多设备协同工作。"
                image="/placeholder.svg?height=300&width=500"
                tags={["HarmonyOS", "Java", "DevEco Studio"]}
                link="https://example.com"
              />
              <ProjectCard
                title="智能助手"
                description="具有高级自然语言处理能力的AI驱动应用。"
                image="/placeholder.svg?height=300&width=500"
                tags={["Python", "C#", "Machine Learning"]}
                link="https://example.com"
              />
              <ProjectCard
                title="数据分析平台"
                description="用于工业物联网数据的可视化平台，支持实时监控。"
                image="/placeholder.svg?height=300&width=500"
                tags={["React", "Node.js", "MongoDB"]}
                link="https://example.com"
              />
              <ProjectCard
                title="电子商务系统"
                description="完整的电子商务解决方案，包括前端和后端。"
                image="/placeholder.svg?height=300&width=500"
                tags={["C#", ".NET", "SQL Server"]}
                link="https://example.com"
              />
              <ProjectCard
                title="个人作品集"
                description="具有现代设计和交互元素的个人作品集网站。"
                image="/placeholder.svg?height=300&width=500"
                tags={["Next.js", "Three.js", "TailwindCSS"]}
                link="https://example.com"
              />
            </div>
          </div>
        </section>

        {/* Tetris Game Section */}
        <section id="tetris" className={`${activeSection !== "tetris" ? "hidden" : ""}`}>
          <TetrisGame />
        </section>

        {/* Contact Section */}
        <section id="contact" className={`py-20 ${activeSection !== "contact" ? "hidden" : ""}`}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="inline-block text-3xl font-bold relative">
                <NeonText text="联系我" color="#00F3FF" />
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF00FF] to-[#00FF9D]"></span>
              </h2>
            </div>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" />
                        <circle cx="12" cy="10" r="3" stroke="currentColor" fill="none" strokeWidth={2} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18c0-2 3-3 6-3s6 1 6 3" />
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
                  <div className="relative w-48 h-48 border-2 border-[#00F3FF] p-2 rounded-lg">
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
          </div>
        </section>
      </main>

      <footer className="border-t border-[#00F3FF]/20 py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-xl font-bold text-[#00FF9D] mb-4 md:mb-0">
              <NeonText text="邓宗林" color="#00FF9D" />
            </div>
            <div className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} 邓宗林. 保留所有权利.</div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="https://github.com/Dangerous520" className="text-gray-400 hover:text-[#00FF9D] transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#contact" className="text-gray-400 hover:text-[#00FF9D] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" />
                  <circle cx="12" cy="10" r="3" stroke="currentColor" fill="none" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18c0-2 3-3 6-3s6 1 6 3" />
                </svg>
              </Link>
              <Link href="mailto:Deng_8245@2925.com" className="text-gray-400 hover:text-[#00FF9D] transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* 隐藏的管理入口 */}
          <div className="text-center mt-8">
            <Link href="/admin" className="text-gray-700 hover:text-gray-500 text-xs opacity-30 hover:opacity-70 transition-opacity">
              管理入口
            </Link>
            <span className="text-gray-700 mx-2 opacity-30">•</span>
            <Link href="/api-debug" className="text-gray-700 hover:text-gray-500 text-xs opacity-30 hover:opacity-70 transition-opacity">
              API调试
            </Link>
          </div>
        </div>
      </footer>

      {/* Cursor effect */}
      <div
        id="cursor-effect"
        className="fixed pointer-events-none z-50 w-4 h-4 rounded-full bg-[#00FF9D] opacity-0 mix-blend-screen"
      ></div>
    </div>
  )
}

