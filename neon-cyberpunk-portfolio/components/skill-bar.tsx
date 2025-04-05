"use client"

import { useEffect, useRef, useState } from "react"

interface SkillBarProps {
  name: string
  percentage: number
  color: string
}

export default function SkillBar({ name, percentage, color }: SkillBarProps) {
  const [width, setWidth] = useState(0)
  const barRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (barRef.current) {
      observer.observe(barRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isVisible) {
      // Play sound effect
      const audio = new Audio("/sounds/beep.mp3")
      audio.volume = 0.1
      audio.play().catch((e) => console.log("Audio play failed:", e))

      // Animate width
      setTimeout(() => {
        setWidth(percentage)
      }, 100)
    }
  }, [isVisible, percentage])

  return (
    <div ref={barRef} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-mono">{name}</span>
        <span className="text-sm font-mono">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-gray-800">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        ></div>
      </div>
    </div>
  )
}

