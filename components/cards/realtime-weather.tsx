"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { MapPin, Thermometer, Wind, CloudRain, Sun, Sunrise, Sunset, Clock, Moon } from "lucide-react"
import type { RealtimeWeatherProps } from "@/types/weather"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function RealtimeWeather({
  wind_speed,
  wind_direction,
  temperature,
  precipitation,
  location,
}: RealtimeWeatherProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDay, setIsDay] = useState(true)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)

      // Determine if it's day or night (simplified)
      const hours = now.getHours()
      setIsDay(hours >= 6 && hours < 20)
    }, 60000)

    // Initial check
    const now = new Date()
    setCurrentTime(now)
    const hours = now.getHours()
    setIsDay(hours >= 6 && hours < 20)

    return () => clearInterval(timer)
  }, [])

  // Modified formatValue to always return a number or a default value
  const formatValue = (value: number | string, defaultValue = 0): number => {
    if (typeof value === "number") return value
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Calculate "feels like" temperature (simplified wind chill / heat index)
  const feelsLike = (): number => {
    const temp = formatValue(temperature)
    const windSpeed = formatValue(wind_speed)

    if (temp <= 10 && windSpeed > 4.8) {
      // Wind chill formula (simplified)
      return Math.round(
        13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16),
      )
    } else if (temp >= 27) {
      // Heat index (simplified)
      return Math.round(temp + 3)
    }
    return temp
  }

  // Get compass direction name
  const getCompassDirection = (degrees: number): string => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  // Determine weather condition based on precipitation and temperature
  const getWeatherCondition = () => {
    const precip = formatValue(precipitation)
    const temp = formatValue(temperature)

    if (precip >= 70) return { icon: "heavy-rain", name: "Heavy Rain" }
    if (precip >= 40) return { icon: "rain", name: "Rain" }
    if (precip >= 20) return { icon: "light-rain", name: "Light Rain" }
    if (precip >= 10) return { icon: "cloudy", name: "Cloudy" }

    if (temp >= 28) return { icon: "hot", name: "Hot" }
    if (temp <= 5) return { icon: "cold", name: "Cold" }

    return { icon: "sunny", name: isDay ? "Sunny" : "Clear Night" }
  }

  // Get wind speed description
  const getWindDescription = (speed: number): string => {
    if (speed < 5) return "Light Air"
    if (speed < 12) return "Light Breeze"
    if (speed < 20) return "Moderate Breeze"
    if (speed < 29) return "Fresh Breeze"
    if (speed < 39) return "Strong Breeze"
    if (speed < 50) return "Near Gale"
    if (speed < 62) return "Gale"
    return "Storm"
  }

  // Get UV index (estimated based on time of day and precipitation)
  const getUVIndex = (): number => {
    const precip = formatValue(precipitation)
    const hours = currentTime.getHours()

    if (precip >= 40 || hours < 8 || hours > 18) return 0
    if (precip >= 20) return 2

    // Peak UV at noon
    const peakUV = 10
    const hourFromNoon = Math.abs(12 - hours)
    return Math.max(0, Math.round(peakUV - hourFromNoon * 1.5))
  }

  // Get UV index description and color
  const getUVDescription = (index: number) => {
    if (index <= 2) return { text: "Low", color: "text-green-500" }
    if (index <= 5) return { text: "Moderate", color: "text-yellow-500" }
    if (index <= 7) return { text: "High", color: "text-orange-500" }
    if (index <= 10) return { text: "Very High", color: "text-red-500" }
    return { text: "Extreme", color: "text-purple-500" }
  }

  const weatherCondition = getWeatherCondition()
  const windSpeed = formatValue(wind_speed)
  const windDir = formatValue(wind_direction)
  const temp = formatValue(temperature)
  const precip = formatValue(precipitation)
  const compassDir = getCompassDirection(windDir)
  const feelsLikeTemp = feelsLike()
  const uvIndex = getUVIndex()
  const uvDesc = getUVDescription(uvIndex)

  // Estimate humidity based on temperature and precipitation
  const humidity = Math.min(100, Math.round(40 + precip * 0.6))

  // Simulate sunrise/sunset times
  const sunrise = new Date()
  sunrise.setHours(6, 30, 0)

  const sunset = new Date()
  sunset.setHours(19, 45, 0)

  return (
    <Card
      className={cn(
        "p-0 overflow-hidden rounded-3xl shadow-xl",
        isDay
          ? "bg-gradient-to-br from-sky-400/90 via-blue-50/95 to-white/90 text-slate-800"
          : "bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-indigo-900/80 text-white",
      )}
    >
      <div className="relative">
        {/* Weather background effect */}
        <div
          className={cn(
            "absolute inset-0 opacity-20",
            precip >= 40
              ? "bg-[url('/weather-rain.svg')]"
              : precip >= 20
                ? "bg-[url('/weather-cloudy.svg')]"
                : "bg-[url('/weather-sunny.svg')]",
          )}
        ></div>

        {/* Main content */}
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left section - Location and main weather */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-500" />
                <h2 className="text-2xl font-bold">{location}</h2>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-sky-500/80" />
                <span className="text-sm opacity-80">{format(currentTime, "EEEE, MMMM d • h:mm a")}</span>
              </div>

              <div className="flex items-start gap-4 pt-2">
                <div className="text-6xl font-bold">{temp}°</div>
                <div className="space-y-1">
                  <div className="text-lg font-medium">{weatherCondition.name}</div>
                  <div className="text-sm opacity-80">Feels like {feelsLikeTemp}°C</div>
                </div>
              </div>
            </div>

            {/* Right section - Weather icon and compass */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Weather icon */}
              <div className="relative w-24 h-24">
                {precip >= 70 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CloudRain className="h-20 w-20 text-blue-500" />
                  </div>
                )}
                {precip >= 40 && precip < 70 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CloudRain className="h-20 w-20 text-blue-400" />
                  </div>
                )}
                {precip >= 20 && precip < 40 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CloudRain className="h-20 w-20 text-blue-300" />
                  </div>
                )}
                {precip >= 10 && precip < 20 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CloudRain className="h-20 w-20 text-gray-400" strokeWidth={1} />
                  </div>
                )}
                {precip < 10 && isDay && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sun className="h-20 w-20 text-yellow-400" />
                  </div>
                )}
                {precip < 10 && !isDay && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Moon className="h-20 w-20 text-gray-300 dark:text-gray-200" />
                  </div>
                )}
              </div>

              {/* Wind direction compass */}
              <div
                className={cn(
                  "relative w-24 h-24 rounded-full flex items-center justify-center",
                  isDay ? "bg-white/40" : "bg-white/10",
                )}
              >
                {/* Compass markings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute top-2 text-xs font-bold">N</div>
                  <div className="absolute right-2 text-xs font-bold">E</div>
                  <div className="absolute bottom-2 text-xs font-bold">S</div>
                  <div className="absolute left-2 text-xs font-bold">W</div>

                  <div className="w-[1px] h-full bg-gray-300 dark:bg-gray-600 absolute"></div>
                  <div className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 absolute"></div>
                </div>

                {/* Wind direction arrow */}
                <div
                  className="relative w-16 h-16 transition-transform duration-500"
                  style={{ transform: `rotate(${windDir}deg)` }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-blue-500"></div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-16 bg-blue-500 origin-top"></div>
                </div>

                <div className="absolute text-xs font-medium">{windSpeed} kt</div>
              </div>
            </div>
          </div>

          {/* Weather details grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={cn("p-4 rounded-xl", isDay ? "bg-white/40" : "bg-white/10")}>
              <div className="flex items-center gap-2 mb-2">
                <Wind className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Wind</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{windSpeed} kt</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <div
                      className="absolute w-4 h-0.5 bg-blue-500 origin-center"
                      style={{ transform: `rotate(${windDir}deg)` }}
                    ></div>
                    <div
                      className="absolute w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-blue-500 origin-center"
                      style={{ transform: `rotate(${windDir + 90}deg)` }}
                    ></div>
                  </div>
                  <span className="text-sm opacity-80">
                    {compassDir} • {getWindDescription(windSpeed)}
                  </span>
                </div>
              </div>
            </div>

            <div className={cn("p-4 rounded-xl", isDay ? "bg-white/40" : "bg-white/10")}>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-5 w-5 text-red-500" />
                <span className="font-medium">Temperature</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{temp}°C</span>
                <span className="text-sm opacity-80 mt-1">Feels like {feelsLikeTemp}°C</span>
              </div>
            </div>

            <div className={cn("p-4 rounded-xl", isDay ? "bg-white/40" : "bg-white/10")}>
              <div className="flex items-center gap-2 mb-2">
                <CloudRain className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Precipitation</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{precip}%</span>
                <span className="text-sm opacity-80 mt-1">Humidity {humidity}%</span>
              </div>
            </div>

            <div className={cn("p-4 rounded-xl", isDay ? "bg-white/40" : "bg-white/10")}>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">UV Index</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{uvIndex}</span>
                  <span className={cn("text-sm font-medium", uvDesc.color)}>{uvDesc.text}</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-80 mt-1">
                  <Sunrise className="h-3.5 w-3.5" />
                  <span>{format(sunrise, "h:mm a")}</span>
                  <Sunset className="h-3.5 w-3.5 ml-2" />
                  <span>{format(sunset, "h:mm a")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

