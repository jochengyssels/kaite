"use client"

import { useState } from "react"
import axios from "axios"
import { Card } from "@/components/ui/card"
import { Compass, Loader2, Wind } from "lucide-react"
import WindDisplay from "@/components/wind-display"
import ThemeToggle from "@/components/theme-toggle"
import ForecastWeather from "@/components/cards/forecast-weather"
import RealtimeWeather from "@/components/cards/realtime-weather"
import FullForecastWeather from "@/components/cards/full-forecast-weather"
import WindVisualization from "@/components/wind-visualization"
import GoldenKiteLine from "@/components/cards/goldenKiteline"
import KitesurfingNews from "@/components/cards/kitesurfingnews"
import UnifiedInput from "@/components/unified-input"

export default function Page() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [isChat, setIsChat] = useState(false)

  const handleSearch = async (selectedLocation?: string) => {
    const locationToSearch = selectedLocation || query
    if (!locationToSearch) return

    // Check if this is a chat query or a location search
    if (
      locationToSearch.includes("?") ||
      locationToSearch.toLowerCase().startsWith("how") ||
      locationToSearch.toLowerCase().startsWith("what") ||
      locationToSearch.toLowerCase().startsWith("when") ||
      locationToSearch.toLowerCase().startsWith("where") ||
      locationToSearch.toLowerCase().startsWith("why") ||
      locationToSearch.toLowerCase().startsWith("can") ||
      locationToSearch.toLowerCase().startsWith("do") ||
      locationToSearch.toLowerCase().startsWith("tell")
    ) {
      // Handle as chat
      handleChatQuery(locationToSearch)
      return
    }

    // Handle as location search
    setIsChat(false)
    setLoading(true)
    try {
      const response = await axios.get(
        `http://localhost:8000/api/weather?location=${encodeURIComponent(locationToSearch)}`,
      )
      setResults({
        location: locationToSearch,
        basic: response.data.basic,
        enhanced: response.data.enhanced,
        golden_kitewindow: response.data.golden_kitewindow,
        model_used: response.data.model_used,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    }
    setLoading(false)
  }

  const handleChatQuery = async (question: string) => {
    setIsChat(true)
    setLoading(true)

    // Add user message to chat
    setChatMessages((prev) => [...prev, { role: "user", content: question }])

    try {
      const response = await axios.post("http://localhost:8000/api/chat", {
        message: question,
      })

      // Add assistant response to chat
      setChatMessages((prev) => [...prev, { role: "assistant", content: response.data.reply }])
    } catch (error) {
      console.error("Error fetching chat response:", error)
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your request. Please try again.",
        },
      ])
    }

    setLoading(false)
    setQuery("")
  }

  const handleAutocomplete = async (value: string) => {
    setQuery(value)

    // Only fetch location suggestions if it doesn't look like a chat query
    if (
      !value.includes("?") &&
      !value.toLowerCase().startsWith("how") &&
      !value.toLowerCase().startsWith("what") &&
      !value.toLowerCase().startsWith("when") &&
      !value.toLowerCase().startsWith("where") &&
      !value.toLowerCase().startsWith("why") &&
      !value.toLowerCase().startsWith("can") &&
      !value.toLowerCase().startsWith("do") &&
      !value.toLowerCase().startsWith("tell")
    ) {
      try {
        const responsechat = await axios.post("http://localhost:8000/api/chat", { location: value })
        setSuggestions(responsechat.data.reply.split("\n"))
      } catch (error) {
        console.error("❌ Error fetching AI response:", error)
      }
    } else {
      // Clear suggestions for chat queries
      setSuggestions([])
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    const location = suggestion.split(",")[0].trim()
    setQuery(location)
    setIsFadingOut(true)
    setTimeout(() => {
      setSuggestions([])
      setIsFadingOut(false)
    }, 200)
    handleSearch(location)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center p-6 sm:p-10 text-gray-900 dark:text-white space-y-8">
      <header className="w-full max-w-7xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Wind className="h-8 w-8 text-sky-600 dark:text-sky-400" />
          <h1 className="text-4xl font-bold text-sky-900 dark:text-sky-100">Kiteaways Spot Finder</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="w-full max-w-7xl relative">
        <UnifiedInput
          query={query}
          setQuery={setQuery}
          suggestions={suggestions}
          handleAutocomplete={handleAutocomplete}
          handleSearch={() => handleSearch()}
          loading={loading}
          onSuggestionSelect={handleSuggestionSelect}
          isFadingOut={isFadingOut}
          setIsFadingOut={setIsFadingOut}
        />
      </div>

      <main className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
            </div>
          ) : isChat ? (
            <Card className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg">
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-sky-100 dark:bg-sky-900/30 ml-auto max-w-[80%]"
                        : "bg-white dark:bg-slate-700 mr-auto max-w-[80%]"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            </Card>
          ) : results ? (
            <div className="flex flex-col gap-6 w-full">
              <RealtimeWeather
                wind_speed={results.basic.wind_speed}
                wind_direction={results.basic.wind_direction}
                temperature={results.basic.temperature}
                precipitation={results.basic.precipitation}
                location={results.location}
              />
              <WindDisplay windSpeed={results.basic.wind_speed} windDirection={results.basic.wind_direction} />

              {/* Add Golden Window Timeline */}
              <GoldenKiteLine forecast={results.basic.forecast} goldenWindow={results.golden_kitewindow} />

              <ForecastWeather forecast={results.basic.forecast?.slice(0, 4) || []} />

              <FullForecastWeather forecast={results.basic.forecast || []} />

              <div className="space-y-6">
                <WindVisualization windSpeed={results.basic.wind_speed} windDirection={results.basic.wind_direction} />
              </div>

              {/* Optional: Show AI model used */}
              <div className="text-sm text-slate-500 dark:text-slate-400">Prediction model: {results.model_used}</div>
            </div>
          ) : (
            <Card className="p-10 text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg">
              <div className="flex flex-col items-center gap-5">
                <Compass className="h-20 w-20 text-sky-600/40 dark:text-sky-400/40" />
                <p className="text-lg text-slate-700 dark:text-slate-300">
                  Enter a location to see wind conditions or ask me anything about kitesurfing
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* News sidebar */}
        <div className="lg:w-80 xl:w-96">
          <KitesurfingNews />
        </div>
      </main>

      <footer className="mt-auto pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        © {new Date().getFullYear()} Kiteaways - Find the perfect wind for your next adventure
      </footer>
    </div>
  )
}

