"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Newspaper, ExternalLink, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NewsSource {
  id: string | null
  name: string
}

interface NewsItem {
  source: NewsSource
  author: string | null
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string
}

export default function KitesurfingNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get(
          "https://newsapi.org/v2/everything?q=kitesurfing&apiKey=99fe7e8961a7413d9570d94173f60b22",
        )
        const data = response.data.articles
        setNews(data.slice(0, 8)) // Show top 8 news items
      } catch (error) {
        console.error("Error fetching news:", error)
        setError("Failed to load kitesurfing news. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return "Recently"
    }
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            <CardTitle>Kitesurfing News</CardTitle>
          </div>
          <Badge variant="outline" className="bg-white/20 text-white hover:bg-white/30 transition-colors">
            Live
          </Badge>
        </div>
        <CardDescription className="text-blue-100">Latest updates from the kitesurfing world</CardDescription>
      </CardHeader>

      <ScrollArea className="h-[600px]">
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-500">Loading the latest kitesurfing news...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <p className="text-slate-500">{error}</p>
            </div>
          ) : news.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Newspaper className="h-10 w-10 text-slate-400 mb-4" />
              <p className="text-slate-500">No kitesurfing news available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((item, index) => (
                <div key={index} className="border-b border-slate-200 last:border-0 pb-6 last:pb-0">
                  {item.urlToImage && (
                    <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg bg-slate-100">
                      {/* Use a div with background image instead of Next.js Image component */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-500"
                        style={{ backgroundImage: `url(${item.urlToImage})` }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <div className="flex items-center gap-2 text-white text-xs">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(item.publishedAt), "MMM d, yyyy")}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{getTimeAgo(item.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {item.title}
                    </a>
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Badge variant="outline" className="bg-slate-100 hover:bg-slate-200">
                      {item.source.name}
                    </Badge>
                    {item.author && <span>by {item.author}</span>}
                  </div>

                  <p className={`text-sm text-slate-600 ${expandedItems[index] ? "" : "line-clamp-3"}`}>
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(index)} className="text-xs px-2 h-7">
                      {expandedItems[index] ? "Show less" : "Read more"}
                    </Button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Visit source <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

