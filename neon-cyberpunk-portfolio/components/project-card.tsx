"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface ProjectCardProps {
  title: string
  description: string
  image: string
  tags: string[]
  link: string
}

export default function ProjectCard({ title, description, image, tags, link }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    // Play hover sound
    const audio = new Audio("/sounds/hover.mp3")
    audio.volume = 0.1
    audio.play().catch((e) => console.log("Audio play failed:", e))
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div
      className="group relative rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-2"
      style={{
        boxShadow: isHovered ? "0 0 20px rgba(0, 255, 157, 0.3)" : "none",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>

      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          width={500}
          height={300}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded bg-black/60 border border-[#00F3FF]/30 text-[#00F3FF]">
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={link}
          className="inline-flex items-center text-sm text-[#00FF9D] hover:text-white transition-colors"
        >
          查看项目 <ExternalLink className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {isHovered && (
        <div className="absolute top-2 right-2 z-20">
          <span className="inline-block px-2 py-1 text-xs font-bold bg-[#FF00FF] text-white rounded">热门</span>
        </div>
      )}
    </div>
  )
}

