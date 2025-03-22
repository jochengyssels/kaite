"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Wind, Info, ChevronDown, ChevronUp, Thermometer, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import KiteSizeCalculator from "@/components/kitesizecalculator"
import { cn } from "@/lib/utils"

interface ForecastItem {
  time: string
  windSpeed: number
  windDirection: number
  temperature: number
  gust: number
  rain: number
}

interface GoldenWindow {
  start_time: string
  end_time: string
  score: number
}

interface GoldenKiteLineProps {
  forecast: ForecastItem[]
  goldenWindow: GoldenWindow
  className?: string
}

export default function GoldenKiteLine({ forecast, goldenWindow, className }: GoldenKiteLineProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [userWeight, setUserWeight] = useState(75)
  const [showDetails, setShowDetails] = useState(false)
  const [currentHoverTime, setCurrentHoverTime] = useState<string | null>(null)
  const [currentHoverSpeed, setCurrentHoverSpeed] = useState<number | null>(null)

  // Calculate average wind speed during golden window
  const goldenWindowForecasts = forecast.filter((item) => {
    const itemTime = new Date(item.time).getTime()
    return (
      itemTime >= new Date(goldenWindow.start_time).getTime() && itemTime <= new Date(goldenWindow.end_time).getTime()
    )
  })

  const averageWindSpeed =
    goldenWindowForecasts.length > 0
      ? goldenWindowForecasts.reduce((sum, item) => sum + item.windSpeed, 0) / goldenWindowForecasts.length
      : 0

  useEffect(() => {
    if (!chartRef.current || !forecast.length) return

    // Limit forecast to 3 days
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const limitedForecast = forecast.filter((item) => {
      const itemDate = new Date(item.time)
      return itemDate <= threeDaysFromNow
    })

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove()

    // Get container dimensions for responsive chart
    const containerWidth = chartRef.current.clientWidth
    const containerHeight = 180

    // D3 visualization implementation
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Parse times
    const allTimes = limitedForecast.map((f) => new Date(f.time))

    // Create scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(allTimes) as [Date, Date])
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(limitedForecast, (d) => Math.max(d.windSpeed, d.gust)) || 0])
      .nice()
      .range([height, 0])

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickSize(-height)
          .tickFormat(() => ""),
      )
      .attr("color", "rgba(100, 116, 139, 0.1)")
      .select(".domain")
      .remove()

    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => ""),
      )
      .attr("color", "rgba(100, 116, 139, 0.1)")
      .select(".domain")
      .remove()

    // Highlight golden window on the chart
    const startTime = new Date(goldenWindow.start_time)
    const endTime = new Date(goldenWindow.end_time)

    svg
      .append("rect")
      .attr("x", x(startTime))
      .attr("y", 0)
      .attr("width", x(endTime) - x(startTime))
      .attr("height", height)
      .attr("fill", "rgba(245, 158, 11, 0.15)")
      .attr("rx", 4)

    // Add wind speed line
    const line = d3
      .line<ForecastItem>()
      .x((d) => x(new Date(d.time)))
      .y((d) => y(d.windSpeed))
      .curve(d3.curveCatmullRom.alpha(0.5))

    svg
      .append("path")
      .datum(limitedForecast)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2.5)
      .attr("d", line)

    // Add gust line
    const gustLine = d3
      .line<ForecastItem>()
      .x((d) => x(new Date(d.time)))
      .y((d) => y(d.gust))
      .curve(d3.curveCatmullRom.alpha(0.5))

    svg
      .append("path")
      .datum(limitedForecast)
      .attr("fill", "none")
      .attr("stroke", "#93c5fd")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,2")
      .attr("d", gustLine)

    // Add data points
    svg
      .selectAll(".dot")
      .data(limitedForecast)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(new Date(d.time)))
      .attr("cy", (d) => y(d.windSpeed))
      .attr("r", 3)
      .attr("fill", "#3b82f6")
      .attr("stroke", "white")
      .attr("stroke-width", 1)

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((d) => format(d as Date, "MMM dd")),
      )
      .attr("font-size", "10px")

    svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `${d}`),
      )
      .attr("font-size", "10px")

    // Add y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#64748b")
      .text("Wind Speed (knots)")

        // Add wind direction arrows
      const arrowSize = 10;
      const arrowSpacing = width / limitedForecast.length; // Adjust spacing based on data density
  
      svg.selectAll(".wind-arrow")
        .data(limitedForecast)
        .enter()
        .append("path")
        .attr("class", "wind-arrow")
        .attr("transform", (d, i) => {
          const x = i * arrowSpacing;
          const y = -arrowSize - 5; // Position above the chart
          return `translate(${x}, ${y}) rotate(${d.windDirection})`;
        })
        .attr("d", `M0,0 L${arrowSize},0 L${arrowSize / 2},${arrowSize / 2} Z`) // Simple arrowhead
        .attr("fill", "black")
        .attr("stroke", "black");
    // Add legend
    const legend = svg.append("g").attr("transform", `translate(${width - 120}, 0)`)

    // Wind speed legend
    legend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 10)
      .attr("x2", 20)
      .attr("y2", 10)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2.5)

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 13)
      .text("Wind Speed")
      .style("font-size", "10px")
      .style("fill", "#64748b")

    // Gust legend
    legend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 30)
      .attr("x2", 20)
      .attr("y2", 30)
      .attr("stroke", "#93c5fd")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,2")

    legend.append("text").attr("x", 25).attr("y", 33).text("Gusts").style("font-size", "10px").style("fill", "#64748b")

    // Add interactive overlay for tooltips
    const bisect = d3.bisector((d: ForecastItem) => new Date(d.time)).left

    const focus = svg.append("g").attr("class", "focus").style("display", "none")

    focus.append("circle").attr("r", 5).attr("fill", "#3b82f6").attr("stroke", "white").attr("stroke-width", 2)

    const overlay = svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .style("opacity", 0)
      .on("mouseover", () => focus.style("display", null))
      .on("mouseout", () => {
        focus.style("display", "none")
        setCurrentHoverTime(null)
        setCurrentHoverSpeed(null)
      })
      .on("mousemove", mousemove)

    function mousemove(event: any) {
      const x0 = x.invert(d3.pointer(event)[0])
      const i = bisect(limitedForecast, x0, 1)
      const d0 = limitedForecast[i - 1]
      const d1 = limitedForecast[i]
      if (!d0 || !d1) return

      const d = x0.getTime() - new Date(d0.time).getTime() > new Date(d1.time).getTime() - x0.getTime() ? d1 : d0

      focus.attr("transform", `translate(${x(new Date(d.time))},${y(d.windSpeed)})`)

      setCurrentHoverTime(d.time)
      setCurrentHoverSpeed(d.windSpeed)
    }

    // Handle window resize
    const handleResize = () => {
      if (chartRef.current) {
        // Re-render chart on window resize
        d3.select(chartRef.current).selectAll("*").remove()
        // We could call the chart creation function here, but for simplicity
        // we'll rely on the useEffect to re-render when dependencies change
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [forecast, goldenWindow])

  // Calculate quality score color
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500"
    if (score >= 0.6) return "bg-lime-500"
    if (score >= 0.4) return "bg-amber-500"
    if (score >= 0.2) return "bg-orange-500"
    return "bg-red-500"
  }

  // Calculate average temperature and gust during golden window
  const averageTemperature =
    goldenWindowForecasts.length > 0
      ? goldenWindowForecasts.reduce((sum, item) => sum + item.temperature, 0) / goldenWindowForecasts.length
      : 0

  const averageGust =
    goldenWindowForecasts.length > 0
      ? goldenWindowForecasts.reduce((sum, item) => sum + item.gust, 0) / goldenWindowForecasts.length
      : 0

  return (
    <Card
      className={cn(
        "overflow-hidden bg-gradient-to-br from-white/80 to-amber-50/80 dark:from-slate-800/70 dark:to-amber-900/60 backdrop-blur-md rounded-3xl shadow-xl text-slate-800 dark:text-slate-100",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-xl">Golden Kite Window</CardTitle>
          </div>
          <Badge className={`${getScoreColor(goldenWindow.score)}`}>
            {Math.round(goldenWindow.score * 100)}% Perfect
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="relative">
          <div ref={chartRef} className="w-full h-[180px]" />

          {currentHoverTime && currentHoverSpeed !== null && (
            <div className="absolute top-0 right-0 bg-white/90 dark:bg-slate-800/90 p-2 text-xs rounded shadow">
              <div>Time: {format(new Date(currentHoverTime), "MMM dd HH:mm")}</div>
              <div>Wind: {currentHoverSpeed} knots</div>
            </div>
          )}
        </div>

        {/* Golden window info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-amber-50/50 dark:bg-amber-900/20 p-3 rounded-lg">
          <div>
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Best Time Window</p>
            <p className="font-medium">
              {format(new Date(goldenWindow.start_time), "MMM dd HH:mm")} -{" "}
              {format(new Date(goldenWindow.end_time), "HH:mm")}
            </p>
          </div>
          <div>
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Average Wind</p>
            <p className="font-medium flex items-center gap-1">
              <Wind className="h-4 w-4" />
              {averageWindSpeed.toFixed(1)} knots
            </p>
          </div>
          <div>
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Average Temp</p>
            <p className="font-medium flex items-center gap-1">
              <Thermometer className="h-4 w-4" />
              {averageTemperature.toFixed(1)}°C
            </p>
          </div>
          <div>
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Average Gust</p>
            <p className="font-medium flex items-center gap-1">
              <Zap className="h-4 w-4" />
              {averageGust.toFixed(1)} knots
            </p>
          </div>
        </div>

        {/* User weight input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-1">
              Your Weight
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Adjust your weight to get personalized kite size recommendations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <span className="text-sm font-medium">{userWeight} kg</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Custom slider implementation for better visibility */}
            <input
              type="range"
              min="40"
              max="140"
              value={userWeight}
              onChange={(e) => setUserWeight(Number.parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((userWeight - 40) / 100) * 100}%, #e2e8f0 ${((userWeight - 40) / 100) * 100}%, #e2e8f0 100%)`,
              }}
            />
          </div>
        </div>

        {/* Kite size calculator */}
        <KiteSizeCalculator windSpeed={averageWindSpeed} userWeight={userWeight} />

        {/* Toggle details button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-center w-full text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Details
            </>
          )}
        </button>

        {/* Detailed forecast */}
        {showDetails && (
          <div className="border-t border-amber-200/50 dark:border-amber-900/50 pt-4 mt-2">
            <h4 className="text-sm font-medium mb-2">Hourly Forecast</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-2 text-sm">
              {forecast.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-3 gap-2 py-1 px-2 rounded",
                    new Date(item.time) >= new Date(goldenWindow.start_time) &&
                      new Date(item.time) <= new Date(goldenWindow.end_time)
                      ? "bg-amber-100/50 dark:bg-amber-900/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/50",
                  )}
                >
                  <span>{format(new Date(item.time), "MMM dd HH:mm")}</span>
                  <span className="flex items-center gap-1">
                    <Wind className="h-3 w-3" /> {item.windSpeed} kt
                  </span>
                  <span>{item.gust} kt gust</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

