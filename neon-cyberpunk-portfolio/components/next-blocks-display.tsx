"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { useRef, useState, useEffect } from "react"
import * as THREE from "three"

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      setIsMobile(mobile)
    }
  }, [])

  return isMobile
}

const BoxWithEdges = ({ position, scale = 1 }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.5 * scale, 0.5 * scale, 0.5 * scale]} />
        <meshPhysicalMaterial
          color="#00FF9D"
          roughness={0.1}
          metalness={0.8}
          transparent={true}
          opacity={0.9}
          transmission={0.5}
          clearcoat={1}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale)]} />
        <lineBasicMaterial color="#FF00FF" linewidth={2} />
      </lineSegments>
    </group>
  )
}

const BoxLetter = ({ letter, position, scale = 1 }) => {
  const group = useRef()

  const getLetterShape = (letter) => {
    const shapes = {
      // 邓字结构 (16x16 grid) - 用户提供的结构
      邓: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      // 英文字母
      w: [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0],
      ],
      e: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
      ],
      l: [
        [1, 0],
        [1, 0],
        [1, 0],
        [1, 0],
        [1, 1],
      ],
      c: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1],
      ],
      o: [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0],
      ],
      m: [
        [1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
      ],
    }
    return shapes[letter] || []
  }

  const letterShape = getLetterShape(letter)

  return (
    <group ref={group} position={position}>
      {letterShape.map((row, i) =>
        row.map((cell, j) => {
          if (cell) {
            // 调整不同字母的偏移量
            let xOffset, yOffset

            if (letter === "邓") {
              // 16x16 网格的邓字需要特殊处理
              const gridSize = 0.25 * scale // 更小的网格尺寸
              xOffset = (j - 8) * gridSize // 居中
              yOffset = (8 - i) * gridSize // 居中，y轴反转
            } else {
              // 其他字母保持原来的处理方式
              xOffset = j * 0.5 * scale
              yOffset = (letterShape.length - 1 - i) * 0.5 * scale

              // 根据字母调整中心位置
              xOffset = xOffset - (letter === "m" ? 1 : letter === "w" ? 1 : 0.5) * scale
            }

            return (
              <BoxWithEdges key={`${i}-${j}`} position={[xOffset, yOffset, 0]} scale={letter === "邓" ? 0.5 : scale} />
            )
          }
          return null
        }),
      )}
    </group>
  )
}

const Scene = () => {
  const orbitControlsRef = useRef()
  const isMobile = useIsMobile()

  // 计算每个字母的宽度，用于确定间距
  const getLetterWidth = (letter) => {
    switch (letter) {
      case "w":
        return 1
      case "m":
        return 1
      case "o":
        return 1.5
      case "e":
        return 1
      case "l":
        return 0
      case "c":
        return 0
      default:
        return 2.0
    }
  }

  // 计算每个字母的位置，确保有间隙
  const calculatePositions = () => {
    const letters = ["w", "e", "l", "c", "o", "m", "e"]
    const positions = []
    let currentX = 0

    // 首先计算总宽度，用于居中
    const totalWidth = letters.reduce((sum, letter, i) => {
      return sum + getLetterWidth(letter) + (i < letters.length - 1 ? 1.0 : 0) // 加上间隙
    }, 0)

    // 起始位置，使整体居中
    currentX = -totalWidth / 2

    // 计算每个字母的位置
    letters.forEach((letter, i) => {
      const width = getLetterWidth(letter)
      positions.push([currentX + width / 2, 0, 0])
      currentX += width + 1.0 // 加上固定间隙
    })

    return positions
  }

  const letterPositions = calculatePositions()

  return (
    <>
      <group position={[0, 2, 0]} rotation={[0, Math.PI / 1.5, 0]}>
        <BoxLetter letter="邓" position={[0, 0, 0]} />
      </group>

      <group position={[0, -2, 0]} rotation={[0, Math.PI / 1.5, 0]}>
        {["w", "e", "l", "c", "o", "m", "e"].map((letter, i) => (
          <BoxLetter key={i} letter={letter} position={letterPositions[i]} scale={0.8} />
        ))}
      </group>

      <OrbitControls
        ref={orbitControlsRef}
        enableZoom={false}
        enablePan={false}
        enableRotate
        autoRotate
        autoRotateSpeed={2}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      <Environment files="/hdri/dikhololo_night_1k.hdr" />
    </>
  )
}

export default function NextBlocksDisplay() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [15, 5, 15], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  )
}

