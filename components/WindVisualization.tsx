"use client"
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'

interface WindVisualizationProps {
  windSpeed: number
  windDirection: number
  optimalWindow?: [string, string]
}

function WindParticles({ windSpeed, windDirection }: { windSpeed: number, windDirection: number }) {
  const particles = useRef<Float32Array>()
  const dirVector = useMemo(() => {
    const rad = (windDirection - 90) * (Math.PI / 180)
    return new THREE.Vector2(Math.cos(rad), Math.sin(rad)).normalize()
  }, [windDirection])

  useEffect(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = 0
    }
    particles.current = positions
  }, [])

  useFrame((_, delta) => {
    if (!particles.current) return
    
    for (let i = 0; i < particles.current.length; i += 3) {
      particles.current[i] += dirVector.x * windSpeed * delta * 0.5
      particles.current[i + 1] += dirVector.y * windSpeed * delta * 0.5
      
      if (Math.abs(particles.current[i]) > 5 || Math.abs(particles.current[i + 1]) > 5) {
        particles.current[i] = (Math.random() - 0.5) * 10
        particles.current[i + 1] = (Math.random() - 0.5) * 10
      }
    }
  })

  return particles.current ? (
    <Points positions={particles.current as Float32Array}>
      <PointMaterial
        transparent
        size={0.1}
        color="#3b82f6"
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  ) : null
}

export default function WindVisualization({ windSpeed, windDirection, optimalWindow }: WindVisualizationProps) {
  return (
    <div className="h-[400px] relative bg-white rounded-lg shadow-lg">
      <Canvas orthographic camera={{ zoom: 50, position: [0, 0, 10] }}>
        <WindParticles windSpeed={windSpeed} windDirection={windDirection} />
        <gridHelper args={[10, 10, '#ccc', '#eee']} position={[0, 0, -1]} />
      </Canvas>
      
      {optimalWindow && (
        <div className="absolute top-4 right-4 bg-yellow-100 p-3 rounded-lg shadow-md">
          <h3 className="font-semibold text-yellow-800">Golden Window</h3>
          <p className="text-sm text-yellow-700">
            {optimalWindow[0]} - {optimalWindow[1]}
          </p>
        </div>
      )}
    </div>
  )
}
