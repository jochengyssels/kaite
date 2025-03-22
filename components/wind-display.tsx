"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface WindDisplayProps {
  windSpeed: number
  windDirection: number
}

export default function WindDisplay({ windSpeed, windDirection }: WindDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = Math.min(canvas.parentElement?.clientWidth || 300, 300)
    canvas.width = size
    canvas.height = size

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = (canvas.width / 2) * 0.8

    // Compass circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 2
    ctx.stroke()

    // Cardinal directions
    const directions = ["N", "E", "S", "W"]
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#64748b"

    directions.forEach((dir, i) => {
      const angle = (i * Math.PI) / 2 - Math.PI / 2
      const x = centerX + radius * 0.85 * Math.cos(angle)
      const y = centerY + radius * 0.85 * Math.sin(angle)
      ctx.fillText(dir, x, y)
    })

    // Wind direction arrow
    const arrowLength = radius * 0.7
    const arrowAngle = (windDirection - 90) * (Math.PI / 180)

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX + arrowLength * Math.cos(arrowAngle), centerY + arrowLength * Math.sin(arrowAngle))

    const headLength = 15
    const angle1 = arrowAngle - Math.PI / 6
    const angle2 = arrowAngle + Math.PI / 6

    const arrowTipX = centerX + arrowLength * Math.cos(arrowAngle)
    const arrowTipY = centerY + arrowLength * Math.sin(arrowAngle)

    ctx.lineTo(arrowTipX - headLength * Math.cos(angle1), arrowTipY - headLength * Math.sin(angle1))
    ctx.moveTo(arrowTipX, arrowTipY)
    ctx.lineTo(arrowTipX - headLength * Math.cos(angle2), arrowTipY - headLength * Math.sin(angle2))

    ctx.strokeStyle = "#0284c7"
    ctx.lineWidth = 3
    ctx.stroke()

    // Wind speed in center
    ctx.font = "bold 24px sans-serif"
    ctx.fillStyle = "#0284c7"
    ctx.fillText(`${windSpeed}`, centerX, centerY - 15)
    ctx.font = "14px sans-serif"
    ctx.fillText("knots", centerX, centerY + 15)
  }, [windSpeed, windDirection])

  return (
    <div className="relative w-full max-w-[300px] aspect-square rounded-full border border-sky-400 shadow-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-md">
      
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
