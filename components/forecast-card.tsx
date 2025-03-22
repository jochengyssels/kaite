"use client"

import { MapPin, Thermometer, Wind, CloudRain, Compass, Clock, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ForecastItem {
  time: string
  windSpeed: number
  windDirection: number
  temperature: number
  gust: number
  rain: number
}

interface ResultsCardProps {
  results: {
    wind_speed: number
    wind_direction: number
    temperature: number
    precipitation: number
    forecast?: ForecastItem[]
  }
  location: string
}

export default function ResultsCard({ results, location }: ResultsCardProps) {
  const { wind_speed, wind_direction, temperature, precipitation, forecast } = results

  const forecastPreview = forecast?.slice(0, 4) || []
  const fullForecast = forecast || []

  console.log("✅ Forecast preview:", forecastPreview)
  console.log("✅ Forecast full list:", fullForecast)

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="p-8 bg-white/70 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl text-slate-800 dark:text-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <MapPin className="text-sky-500" />
            <h2 className="text-2xl font-semibold">Realtime Conditions for {location}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <Wind className="h-6 w-6 text-sky-600" />
              <p className="text-sm text-muted-foreground">Wind Speed</p>
              <p className="font-medium text-lg">{wind_speed} knots</p>
            </div>
            <div className="flex flex-col items-center">
              <Compass className="h-6 w-6 text-sky-600" />
              <p className="text-sm text-muted-foreground">Direction</p>
              <p className="font-medium text-lg">{wind_direction}&deg;</p>
            </div>
            <div className="flex flex-col items-center">
              <Thermometer className="h-6 w-6 text-sky-600" />
              <p className="text-sm text-muted-foreground">Temp</p>
              <p className="font-medium text-lg">{temperature}&deg;C</p>
            </div>
            <div className="flex flex-col items-center">
              <CloudRain className="h-6 w-6 text-sky-600" />
              <p className="text-sm text-muted-foreground">Rain Chance</p>
              <p className="font-medium text-lg">{precipitation}%</p>
            </div>
          </div>
        </div>
      </Card>

      {forecastPreview.length > 0 && (
        <Card className="p-8 bg-white/70 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl text-slate-800 dark:text-slate-100">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Clock className="text-sky-500" />
              <h2 className="text-2xl font-semibold">Upcoming Forecast</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {forecastPreview.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <p className="text-sm font-medium mb-1">
                    {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <Wind className="h-5 w-5 text-sky-600" />
                  <p className="text-sm">{item.windSpeed} kt</p>
                  <Compass className="h-4 w-4 text-sky-600" />
                  <p className="text-sm">{item.windDirection}&deg;</p>
                  <Thermometer className="h-4 w-4 text-sky-600" />
                  <p className="text-sm">{item.temperature}&deg;C</p>
                  <CloudRain className="h-4 w-4 text-sky-600" />
                  <p className="text-sm">{item.rain}%</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {Array.isArray(fullForecast) && fullForecast.length > 0 && (
        <Card className="p-8 bg-white/80 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl text-slate-800 dark:text-slate-100">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Activity className="text-sky-500" />
              <h2 className="text-2xl font-semibold">Full 3-Day Wind Forecast</h2>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {fullForecast.map((item, index) => (
                <div key={index} className="grid grid-cols-2 sm:grid-cols-6 gap-2 border-b border-slate-300 dark:border-slate-700 py-2 text-sm items-center">
                  <span className="col-span-2">{new Date(item.time).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{item.windSpeed} kt</span>
                  <span>{item.windDirection}&deg;</span>
                  <span>{item.gust} kt gust</span>
                  <span>{item.rain}% rain</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
