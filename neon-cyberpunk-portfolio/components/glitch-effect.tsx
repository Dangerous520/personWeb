"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface GlitchEffectProps {
  children: React.ReactNode
  className?: string
}

export default function GlitchEffect({ children, className }: GlitchEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }

    // Randomly trigger glitch effect
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        triggerGlitch()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <div className="relative z-10">{children}</div>

      {isGlitching && (
        <>
          <div
            className="absolute top-0 left-0 w-full h-full z-0"
            style={{
              clipPath: "polygon(0 15%, 100% 15%, 100% 30%, 0 30%)",
              transform: "translate(5px, 0)",
              opacity: 0.8,
            }}
          >
            {children}
          </div>
          <div
            className="absolute top-0 left-0 w-full h-full z-0"
            style={{
              clipPath: "polygon(0 65%, 100% 65%, 100% 80%, 0 80%)",
              transform: "translate(-5px, 0)",
              opacity: 0.8,
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  )
}

