"use client"

import { useEffect, useRef } from "react"

interface NeonTextProps {
  text: string
  color?: string
}

export default function NeonText({ text, color = "#00FF9D" }: NeonTextProps) {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const textElement = textRef.current
    if (!textElement) return

    const handleMouseMove = () => {
      const intensity = Math.random() * 0.2 + 0.8 // Random intensity between 0.8 and 1.0
      textElement.style.textShadow = `0 0 5px ${color}, 0 0 ${10 * intensity}px ${color}`
    }

    const interval = setInterval(handleMouseMove, 100)
    return () => clearInterval(interval)
  }, [color])

  return (
    <div
      ref={textRef}
      className="inline-block font-bold tracking-wider"
      style={{
        color: color,
        textShadow: `0 0 5px ${color}, 0 0 10px ${color}`,
      }}
    >
      {text}
    </div>
  )
}

