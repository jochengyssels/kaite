"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface KiteSizeCalculatorProps {
  windSpeed: number
  userWeight: number
  className?: string
}

export default function KiteSizeCalculator({ windSpeed, userWeight, className }: KiteSizeCalculatorProps) {
  // Calculate recommended kite sizes based on wind speed and user weight
  const kiteSizes = useMemo(() => {
    // Base kite sizes for a 75kg rider
    const baseKiteSizes = [
      { minWind: 0, maxWind: 8, sizes: [] }, // Too light
      { minWind: 8, maxWind: 12, sizes: [12, 14, 15] }, // Light wind
      { minWind: 12, maxWind: 16, sizes: [10, 12] }, // Medium wind
      { minWind: 16, maxWind: 22, sizes: [8, 9, 10] }, // Good wind
      { minWind: 22, maxWind: 28, sizes: [6, 7, 8] }, // Strong wind
      { minWind: 28, maxWind: 35, sizes: [5, 6] }, // Very strong wind
      { minWind: 35, maxWind: 100, sizes: [] }, // Too strong
    ]

    // Weight adjustment factor
    const weightFactor = userWeight / 75

    // Find the appropriate wind range
    const windRange = baseKiteSizes.find((range) => windSpeed >= range.minWind && windSpeed < range.maxWind)

    if (!windRange || windRange.sizes.length === 0) {
      return {
        sizes: [],
        message: windSpeed < 8 ? "Wind too light for kiteboarding" : "Wind too strong for kiteboarding",
      }
    }

    // Adjust kite sizes based on rider weight
    const adjustedSizes = windRange.sizes.map((size) => {
      // Heavier riders need bigger kites, lighter riders need smaller kites
      const adjustedSize = Math.round(size * weightFactor)
      return adjustedSize
    })

    // Remove duplicates and sort
    const uniqueSizes = [...new Set(adjustedSizes)].sort((a, b) => a - b)

    return {
      sizes: uniqueSizes,
      message: "",
    }
  }, [windSpeed, userWeight])

  // Calculate probability for each kite size
  const kiteProbabilities = useMemo(() => {
    if (kiteSizes.sizes.length === 0) return []

    // Calculate probabilities based on wind speed position within the range
    const probabilities = kiteSizes.sizes.map((size, index, array) => {
      // For simplicity, assign higher probability to middle sizes
      if (array.length === 1) return 100
      if (array.length === 2) {
        // For two sizes, check where in the wind range we are
        if (windSpeed < 14) return index === 0 ? 40 : 60
        return index === 0 ? 60 : 40
      }

      // For three sizes
      if (index === 0) return 20 // Smallest size
      if (index === array.length - 1) return 20 // Largest size
      return 60 // Middle size(s)
    })

    return kiteSizes.sizes.map((size, i) => ({
      size,
      probability: probabilities[i],
    }))
  }, [kiteSizes, windSpeed])

  // Get color based on probability
  const getColorClass = (probability: number) => {
    if (probability >= 60) return "bg-green-500"
    if (probability >= 40) return "bg-amber-500"
    return "bg-blue-500"
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-medium">Recommended Kite Sizes</h3>

      {kiteSizes.message ? (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-center">{kiteSizes.message}</div>
      ) : kiteProbabilities.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {kiteProbabilities.map(({ size, probability }) => (
            <div key={size} className="flex flex-col items-center">
              <div className="text-2xl font-bold">{size}m</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                <div
                  className={`${getColorClass(probability)} h-2 rounded-full`}
                  style={{ width: `${probability}%` }}
                />
              </div>
              <div className="text-xs mt-1">{probability}%</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-center">
          No suitable kite size for these conditions
        </div>
      )}
    </div>
  )
}

