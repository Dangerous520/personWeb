import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// 创建字体实例
const inter = Inter({ subsets: ['latin'] })

// 元数据
export const metadata: Metadata = {
  title: '邓宗林 | 全栈开发工程师',
  description: '邓宗林的个人网站 - 全栈开发工程师，专注于C#、Python、React和HarmonyOS开发',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-[#0A0A0A]`}>
        {children}
      </body>
    </html>
  )
}
