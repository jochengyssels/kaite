"use client"

import { Card } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { ForecastItem } from "@/types/weather"

interface FullForecastWeatherProps {
  forecast: ForecastItem[]
}

export default function FullForecastWeather({ forecast = [] }: FullForecastWeatherProps) {
  if (!forecast.length) return null

  return (
    <Card className="p-8 bg-gradient-to-br from-white/80 to-sky-50/80 dark:from-slate-800/70 dark:to-sky-900/60 backdrop-blur-md rounded-3xl shadow-xl text-slate-800 dark:text-slate-100">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="text-sky-500" />
          <h2 className="text-2xl font-semibold">Full 3-Day Wind Forecast</h2>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {forecast.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-2 sm:grid-cols-6 gap-2 border-b border-slate-300 dark:border-slate-700 py-2 text-sm items-center"
            >
              <span className="col-span-2">
                {new Date(item.time).toLocaleString([], {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>{item.windSpeed} kt</span>
              <span>{item.windDirection}&deg;</span>
              <span>{item.gust} kt gust</span>
              <span>{item.rain}% rain</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
