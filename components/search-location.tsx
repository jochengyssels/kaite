"use client"

import { Search, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SearchLocationProps {
  query: string
  setQuery: (value: string) => void
  suggestions: string[]
  handleAutocomplete: (value: string) => void
  handleSearch: () => void
  loading: boolean
  onSuggestionSelect: (suggestion: string) => void
  isFadingOut: boolean
  setIsFadingOut: (value: boolean) => void
}

export default function SearchLocation({
  query,
  setQuery,
  suggestions,
  handleAutocomplete,
  handleSearch,
  loading,
  onSuggestionSelect,
  isFadingOut,
  setIsFadingOut
}: SearchLocationProps) {
  const handleBlur = () => {
    setIsFadingOut(true)
    setTimeout(() => {
      setIsFadingOut(false)
    }, 200)
  }

  return (
    <Card className="p-8 bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl transition-all">
      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sky-500 dark:border-slate-700">
            <Search className="h-5 w-5 ml-3 text-slate-400" />
            <Input
              type="text"
              placeholder="Search for a kiteboarding spot..."
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={query}
              onChange={(e) => handleAutocomplete(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onBlur={handleBlur}
            />
          </div>

          {suggestions.length > 0 && (
            <div className={`absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700 max-h-60 overflow-auto transition-opacity duration-200 ${isFadingOut ? "opacity-0" : "opacity-100"}`}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-sky-100 dark:hover:bg-slate-700 cursor-pointer border-b last:border-none dark:border-slate-700 flex items-center gap-2 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault() // Prevent blur before click registers
                    onSuggestionSelect(suggestion)
                  }}
                >
                  <MapPin className="h-4 w-4 text-sky-500" />
                  <span className="text-sm font-medium">{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full bg-sky-600 hover:bg-sky-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          onClick={handleSearch}
          disabled={loading || !query}
        >
          {loading ? "Searching..." : "Find Wind Conditions"}
        </Button>
      </div>
    </Card>
  )
}
