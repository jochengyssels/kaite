"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"
import { WindCanvasProps, WindParticle } from "@/types/weather"


export default function WindCanvas({ windSpeed = 15, windDirection = 45, density = 100, color }: WindCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  // Calculate normalized wind speed (0-1)
  const normalizedSpeed = Math.min(Math.max(windSpeed / 30, 0.1), 1)

  // Convert wind direction to radians (subtract 90 to align with compass directions)
  const windAngle = ((windDirection - 90) * Math.PI) / 180

  // Determine wind vector components
  const windVectorX = Math.cos(windAngle)
  const windVectorY = Math.sin(windAngle)

  useEffect(() => {
    if (!mountRef.current) return

    // Setup scene
    const scene = new THREE.Scene()

    // Get container dimensions
    const container = mountRef.current
    const { width, height } = container.getBoundingClientRect()

    // Setup camera - use orthographic for consistent size across view
    const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000)
    camera.position.z = 10

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)

    // Clear previous canvas if it exists
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    container.appendChild(renderer.domElement)

    // Determine particle count based on density and screen size
    const particleCount = Math.floor(density * (width / 800))

    // Determine color based on theme and wind speed
    const baseColor = color || (theme === "dark" ? "#88ccff" : "#3498db")
    const colorObj = new THREE.Color(baseColor)

    // Create particles group with proper typing
    const particles: WindParticle[] = []

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      // Create a line for each particle
      const lineLength = 5 + normalizedSpeed * 15 // Longer lines for stronger winds

      // Create geometry for the line
      const geometry = new THREE.BufferGeometry()

      // Create two points for the line
      const positions = new Float32Array(6) // 2 points × 3 coordinates

      // Set initial position randomly within the view
      const x = Math.random() * width - width / 2
      const y = Math.random() * height - height / 2

      // First point
      positions[0] = x
      positions[1] = y
      positions[2] = 0

      // Second point - in the direction of the wind
      positions[3] = x + windVectorX * lineLength
      positions[4] = y + windVectorY * lineLength
      positions[5] = 0

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

      // Create line material
      const material = new THREE.LineBasicMaterial({
        color: colorObj,
        transparent: true,
        opacity: 0.2 + normalizedSpeed * 0.6 * (0.3 + Math.random() * 0.7), // Vary opacity
        linewidth: 1,
      })

      // Create the line
      const line = new THREE.Line(geometry, material)

      // Add to scene
      scene.add(line)

      // Store particle data for animation
      particles.push({
        line,
        speed: (0.5 + Math.random() * 0.5) * normalizedSpeed * 2, // Vary speed slightly
        x,
        y,
        width,
        height,
      })
    }

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate)

      // Update each particle
      particles.forEach((particle) => {
        // Move in wind direction
        particle.x += windVectorX * particle.speed * windSpeed * 0.2
        particle.y += windVectorY * particle.speed * windSpeed * 0.2

        // Reset position when out of bounds
        const buffer = 50 // Buffer to prevent popping
        if (
          particle.x < -width / 2 - buffer ||
          particle.x > width / 2 + buffer ||
          particle.y < -height / 2 - buffer ||
          particle.y > height / 2 + buffer
        ) {
          // Reset to the opposite side of the direction
          particle.x = -windVectorX * (width / 2 + buffer) + (Math.random() * width - width / 2) * 0.2
          particle.y = -windVectorY * (height / 2 + buffer) + (Math.random() * height - height / 2) * 0.2
        }

        // Update line position
        const positions = particle.line.geometry.attributes.position.array as Float32Array
        positions[0] = particle.x
        positions[1] = particle.y
        positions[2] = 0
        positions[3] = particle.x + windVectorX * (5 + normalizedSpeed * 15)
        positions[4] = particle.y + windVectorY * (5 + normalizedSpeed * 15)
        positions[5] = 0

        particle.line.geometry.attributes.position.needsUpdate = true
      })

      renderer.render(scene, camera)

      return () => {
        cancelAnimationFrame(animationId)
      }
    }

    const animationCleanup = animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return

      const { width, height } = mountRef.current.getBoundingClientRect()

      // Update camera
      const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000)
      camera.position.z = 10

      // Update renderer
      renderer.setSize(width, height)

      // Update particles
      particles.forEach((particle) => {
        particle.width = width
        particle.height = height
      })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      animationCleanup()
      renderer.dispose()

      // Clean up geometries and materials
      particles.forEach((particle) => {
        particle.line.geometry.dispose()
        ;(particle.line.material as THREE.Material).dispose()
      })
    }
  }, [windSpeed, windDirection, density, theme, color, normalizedSpeed, windAngle, windVectorX, windVectorY])

  return (
    <div
      ref={mountRef}
      className="w-full h-full rounded-lg overflow-hidden pointer-events-none"
      style={{ minHeight: "300px" }}
    />
  )
}

