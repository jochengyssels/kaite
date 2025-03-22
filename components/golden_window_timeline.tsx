import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { format } from 'date-fns';

interface ForecastItem {
  time: string;
  windSpeed: number;
  windDirection: number;
}

interface GoldenWindow {
  start_time: string;
  end_time: string;
  score: number;
}

interface GoldenWindowTimelineProps {
  forecast: ForecastItem[];
  goldenWindow: GoldenWindow;
}

const GoldenWindowTimeline: React.FC<GoldenWindowTimelineProps> = ({ forecast, goldenWindow }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!forecast.length || !goldenWindow || !svgRef.current) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse times
    const startTime = new Date(goldenWindow.start_time);
    const endTime = new Date(goldenWindow.end_time);
    const allTimes = forecast.map(f => new Date(f.time));

    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(allTimes) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(forecast, d => d.windSpeed) || 0])
      .range([height, 0]);

    // Add golden window area
    svg.append("rect")
      .attr("x", x(startTime))
      .attr("width", x(endTime) - x(startTime))
      .attr("y", 0)
      .attr("height", height)
      .attr("fill", "rgba(255, 215, 0, 0.3)")
      .attr("rx", 4);

    // Add wind speed line
    const line = d3.line<ForecastItem>()
      .x(d => x(new Date(d.time)))
      .y(d => y(d.windSpeed));

    svg.append("path")
      .datum(forecast)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d} kt`));

  }, [forecast, goldenWindow]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mt-4">
      <h3 className="text-lg font-semibold mb-4">Optimal Kite Window</h3>
      <svg ref={svgRef} className="w-full" />
      {goldenWindow && (
        <div className="mt-4 text-sm">
          <p>Best Time: {format(new Date(goldenWindow.start_time), 'MMM dd HH:mm')} 
             - {format(new Date(goldenWindow.end_time), 'HH:mm')}</p>
          <p>Quality Score: {Math.round(goldenWindow.score * 100)}%</p>
        </div>
      )}
    </div>
  );
};

export default GoldenWindowTimeline;
