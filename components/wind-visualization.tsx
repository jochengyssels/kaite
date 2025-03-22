"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import WindCanvas from "./wind-canvas"
import { Compass, Wind } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface WindVisualizationProps {
  windSpeed: number
  windDirection: number
}

export default function WindVisualization({ windSpeed, windDirection }: WindVisualizationProps) {
  // Function to determine wind quality for kiteboarding
  const getWindQuality = (speed: number) => {
    if (speed < 8) return { label: "Too Light", color: "bg-slate-400", textColor: "text-slate-400" }
    if (speed < 12) return { label: "Light", color: "bg-blue-400", textColor: "text-blue-400" }
    if (speed < 18) return { label: "Good", color: "bg-green-500", textColor: "text-green-500" }
    if (speed < 25) return { label: "Strong", color: "bg-yellow-500", textColor: "text-yellow-500" }
    return { label: "Very Strong", color: "bg-red-500", textColor: "text-red-500" }
  }

  const windQuality = getWindQuality(windSpeed)

  // Determine wind color based on quality
  const windColor = {
    "Too Light": "#94a3b8",
    Light: "#60a5fa",
    Good: "#22c55e",
    Strong: "#eab308",
    "Very Strong": "#ef4444",
  }[windQuality.label]

  // Get compass direction name
  const getCompassDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-sky-600" />
          <CardTitle className="text-xl">Wind Flow</CardTitle>
        </div>
        <Badge className={`${windQuality.color} text-white`}>{windQuality.label}</Badge>
      </CardHeader>
      <CardContent className="p-0 relative aspect-square">
        <div className="absolute inset-0">
          <WindCanvas windSpeed={windSpeed} windDirection={windDirection} density={150} color={windColor} />
        </div>
        <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
          <div className="text-center mb-1 font-semibold">Wind Direction</div>
          <div className="flex items-center justify-center gap-2">
            <Compass className="h-5 w-5 text-sky-600" />
            <span className="font-medium">
              {windDirection}° ({getCompassDirection(windDirection)})
            </span>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
          <div className="text-center mb-1 font-semibold">Wind Speed</div>
          <div className="flex items-center justify-center gap-2">
            <Wind className="h-5 w-5 text-sky-600" />
            <span className="font-medium">{windSpeed} knots</span>
          </div>
        </div>

        {/* Direction indicator */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: "2px dashed rgba(255,255,255,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="absolute"
            style={{
              width: "60px",
              height: "60px",
              transform: `rotate(${windDirection}deg)`,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div className="h-2 w-16 relative" style={{ backgroundColor: windColor }}>
              <div
                className="absolute -right-1 -top-2 w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: `12px solid ${windColor}`,
                  transform: "rotate(90deg)",
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

