"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment } from "@react-three/drei"

function CityGrid() {
  const gridRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (gridRef.current) {
      gridRef.current.position.z = (clock.getElapsedTime() * 0.5) % 20
    }
  })

  return (
    <group ref={gridRef}>
      {/* Horizontal grid lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, -5, -i * 2]}>
          <planeGeometry args={[100, 0.05]} />
          <meshBasicMaterial color="#00F3FF" opacity={0.3} transparent />
        </mesh>
      ))}

      {/* Vertical grid lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[i * 5 - 50, -5, -20]}>
          <planeGeometry args={[0.05, 40]} />
          <meshBasicMaterial color="#FF00FF" opacity={0.3} transparent />
        </mesh>
      ))}
    </group>
  )
}

function NeonLights() {
  const lightsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (lightsRef.current) {
      lightsRef.current.children.forEach((child, i) => {
        // Make the lights pulse at different rates
        const intensity = Math.sin(clock.getElapsedTime() * (0.5 + i * 0.1)) * 0.5 + 1
        if (child instanceof THREE.PointLight) {
          child.intensity = intensity * 2
        }
      })
    }
  })

  return (
    <group ref={lightsRef}>
      <pointLight position={[-10, 5, -5]} color="#FF00FF" intensity={2} distance={20} />
      <pointLight position={[10, 5, -15]} color="#00FF9D" intensity={2} distance={20} />
      <pointLight position={[0, 8, -10]} color="#00F3FF" intensity={2} distance={20} />
      <pointLight position={[-5, 3, -20]} color="#FFE600" intensity={2} distance={20} />
    </group>
  )
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  const { viewport } = useThree()

  useEffect(() => {
    if (!particlesRef.current) return

    // Randomize initial positions
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50 // x
      positions[i + 1] = (Math.random() - 0.5) * 30 // y
      positions[i + 2] = (Math.random() - 0.5) * 50 // z
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  }, [])

  useFrame(({ clock }) => {
    if (!particlesRef.current) return

    // Animate particles
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    const time = clock.getElapsedTime() * 0.2

    for (let i = 0; i < positions.length; i += 3) {
      // Add subtle movement
      positions[i + 1] += Math.sin(time + i) * 0.01 // y movement
      positions[i + 2] -= 0.05 // z movement (moving toward camera)

      // Reset particles that go out of bounds
      if (positions[i + 2] > 10) positions[i + 2] = -30
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
    particlesRef.current.rotation.y = time * 0.05
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={500} array={new Float32Array(500 * 3)} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#00F3FF" opacity={0.7} transparent sizeAttenuation />
    </points>
  )
}

export default function CyberpunkScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <color attach="background" args={["#0A0A0A"]} />
      <fog attach="fog" args={["#0A0A0A", 10, 50]} />

      <CityGrid />
      <NeonLights />
      <FloatingParticles />

      <Environment files="/hdri/dikhololo_night_1k.hdr" />
    </Canvas>
  )
}

