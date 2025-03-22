"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Send, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UnifiedInputProps {
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

export default function UnifiedInput({
  query,
  setQuery,
  suggestions,
  handleAutocomplete,
  handleSearch,
  loading,
  onSuggestionSelect,
  isFadingOut,
  setIsFadingOut,
}: UnifiedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const clearInput = () => {
    setQuery("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={cn(
          "relative flex items-center w-full bg-white dark:bg-slate-800 rounded-full shadow-md transition-all duration-200",
          isFocused ? "ring-2 ring-sky-500 shadow-lg" : "hover:shadow-lg",
        )}
      >
        <div className="flex-1 flex items-center">
          <Search className="h-5 w-5 ml-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter a kitespot or ask me anything..."
            className="flex-1 py-4 px-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
            value={query}
            onChange={(e) => handleAutocomplete(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onClick={clearInput}
              className="p-1 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || !query}
          className={cn(
            "rounded-full h-10 w-10 mr-1 flex items-center justify-center",
            query ? "bg-sky-600 hover:bg-sky-700" : "bg-slate-200 dark:bg-slate-700",
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div
          className={cn(
            "absolute z-10 w-full max-w-3xl mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border dark:border-slate-700 max-h-60 overflow-auto transition-opacity duration-200",
            isFadingOut ? "opacity-0" : "opacity-100",
          )}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer border-b dark:border-slate-700 flex items-center gap-2"
              onClick={() => onSuggestionSelect(suggestion)}
            >
              <MapPin className="h-4 w-4 text-sky-500" />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

