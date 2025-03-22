// components/forecast-weather.tsx
"use client"

import { Card } from "@/components/ui/card"
import { ForecastWeatherProps } from "@/types/weather"
import { Clock, Wind, Compass, Thermometer, CloudRain } from "lucide-react"



const ForecastWeather = ({ forecast }: ForecastWeatherProps) => {
  if (!forecast?.length) return null

  return (
    <Card className="p-8 bg-gradient-to-br from-white/70 to-sky-50/70 dark:from-slate-800/60 dark:to-sky-900/50 backdrop-blur-md rounded-3xl shadow-xl">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="text-sky-500" />
          <h2 className="text-2xl font-semibold">Next Hours Forecast</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {forecast.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-2 rounded-xl bg-white/30 dark:bg-slate-700/30"
            >
              <p className="text-sm font-medium mb-1">
                {new Date(item.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <div className="flex items-center gap-1 text-sky-600">
                <Wind className="h-4 w-4" />
                <span className="text-sm">{item.windSpeed} kt</span>
              </div>
              <div className="flex items-center gap-1 text-sky-600">
                <Compass className="h-4 w-4" />
                <span className="text-sm">{item.windDirection}&deg;</span>
              </div>
              <div className="flex items-center gap-1 text-sky-600">
                <Thermometer className="h-4 w-4" />
                <span className="text-sm">{item.temperature}&deg;C</span>
              </div>
              <div className="flex items-center gap-1 text-sky-600">
                <CloudRain className="h-4 w-4" />
                <span className="text-sm">{item.rain}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default ForecastWeather
