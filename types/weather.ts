import * as THREE from 'three';

export interface RealtimeWeatherProps {
  wind_speed: number | string
  wind_direction: number | string
  temperature: number | string
  precipitation: number | string
  location: string
}

export interface ForecastItem {
  time: string
  windSpeed: number
  windDirection: number
  temperature: number
  gust: number
  rain: number
}

export interface ForecastWeatherProps {
  forecast: ForecastItem[]
}

export interface FullForecastWeatherProps {
  forecast: ForecastItem[]
}

export interface GoldenWindow {
  start_time: string
  end_time: string
  score: number
}

export interface GoldenKiteLineProps {
  forecast: ForecastItem[]
  goldenWindow: GoldenWindow
}


export interface WindCanvasProps {
  windSpeed?: number
  windDirection?: number
  density?: number
  color?: string
}

// Define the particle type
export interface WindParticle {
  line: THREE.Line
  speed: number
  x: number
  y: number
  width: number
  height: number
}