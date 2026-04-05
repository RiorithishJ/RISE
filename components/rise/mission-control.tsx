"use client"

import { useState, useEffect } from "react"
import { HolographicPanel } from "./holographic-panel"
import { ProgressRing } from "./progress-ring"
import { RadarChart } from "./radar-chart"
import { Flame, Target, Brain, Clock } from "lucide-react"

const skillsData = [
  { label: "Focus", value: 85 },
  { label: "Learning", value: 72 },
  { label: "Coding", value: 90 },
  { label: "Fitness", value: 65 },
  { label: "Reading", value: 78 },
  { label: "Sleep", value: 70 },
]

const weeklyData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const memories = [
  "Prefers deep work in mornings",
  "Goal: Launch startup by Q4",
  "Learning: Rust & Systems",
  "Weakness: Context switching",
]

export function MissionControl() {
  const [streak, setStreak] = useState(0)
  const [weeklyProgress, setWeeklyProgress] = useState<boolean[]>([])

  useEffect(() => {
    // Simulate data
    setStreak(12)
    setWeeklyProgress([true, true, true, true, true, false, false])
  }, [])

  return (
    <HolographicPanel 
      title="Mission Control" 
      className="h-full"
      delay={600}
    >
      <div className="flex flex-col h-full p-4 gap-5 overflow-y-auto">
        {/* Career Goal Progress */}
        <div className="flex justify-center">
          <ProgressRing 
            value={68}
            label="Career Goal"
            sublabel="Launch MVP"
            size={130}
          />
        </div>

        {/* Skills Radar */}
        <div>
          <h3 className="text-xs font-mono tracking-[0.2em] uppercase mb-3 text-[rgba(0,245,255,0.6)]">
            Skills Matrix
          </h3>
          <div className="flex justify-center">
            <RadarChart data={skillsData} size={160} />
          </div>
        </div>

        {/* Weekly Consistency */}
        <div>
          <h3 className="text-xs font-mono tracking-[0.2em] uppercase mb-3 text-[rgba(0,245,255,0.6)]">
            Weekly Consistency
          </h3>
          <div className="flex justify-between gap-2">
            {weeklyData.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: weeklyProgress[i] 
                      ? "linear-gradient(135deg, rgba(0, 245, 255, 0.3) 0%, rgba(123, 47, 255, 0.2) 100%)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: weeklyProgress[i]
                      ? "1px solid rgba(0, 245, 255, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: weeklyProgress[i]
                      ? "0 0 10px rgba(0, 245, 255, 0.3)"
                      : "none",
                  }}
                >
                  {weeklyProgress[i] && (
                    <div 
                      className="w-2 h-2 rounded-full bg-[#00f5ff]"
                      style={{ boxShadow: "0 0 8px #00f5ff" }}
                    />
                  )}
                </div>
                <span className="text-[9px] font-mono text-white/40">
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Counter */}
        <div 
          className="flex items-center justify-between p-3 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(255, 100, 0, 0.15) 0%, rgba(255, 50, 0, 0.1) 100%)",
            border: "1px solid rgba(255, 100, 0, 0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="text-2xl"
              style={{ animation: "fire 0.5s ease-in-out infinite" }}
            >
              🔥
            </div>
            <div>
              <span className="text-xs font-mono text-white/50">Current Streak</span>
              <div className="flex items-baseline gap-1">
                <span 
                  className="text-2xl font-bold font-mono"
                  style={{ 
                    color: "#ff6600",
                    textShadow: "0 0 10px rgba(255, 100, 0, 0.5)",
                  }}
                >
                  {streak}
                </span>
                <span className="text-xs font-mono text-white/40">days</span>
              </div>
            </div>
          </div>
          <Flame 
            className="w-8 h-8" 
            style={{ 
              color: "#ff6600",
              filter: "drop-shadow(0 0 10px rgba(255, 100, 0, 0.5))",
            }}
          />
        </div>

        {/* Next Action Card */}
        <div>
          <h3 className="text-xs font-mono tracking-[0.2em] uppercase mb-3 text-[rgba(0,245,255,0.6)]">
            Next Action
          </h3>
          <div 
            className="p-4 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, rgba(0, 102, 255, 0.05) 100%)",
              border: "1px solid rgba(0, 245, 255, 0.2)",
            }}
          >
            <div className="flex items-start gap-3">
              <Target 
                className="w-5 h-5 mt-0.5"
                style={{ color: "#00f5ff" }}
              />
              <div>
                <span className="text-sm font-mono text-white">
                  Complete API integration
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3 text-white/40" />
                  <span className="text-xs font-mono text-white/40">
                    Est. 2 hours • High Priority
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Bank */}
        <div>
          <h3 className="text-xs font-mono tracking-[0.2em] uppercase mb-3 text-[rgba(0,245,255,0.6)] flex items-center gap-2">
            <Brain className="w-3 h-3" />
            Memory Bank
          </h3>
          <div className="space-y-2">
            {memories.map((memory, i) => (
              <div
                key={i}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-mono"
                style={{
                  background: "rgba(123, 47, 255, 0.1)",
                  border: "1px solid rgba(123, 47, 255, 0.2)",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                <div 
                  className="w-1.5 h-1.5 rounded-full bg-[#7b2fff]"
                  style={{ boxShadow: "0 0 6px #7b2fff" }}
                />
                {memory}
              </div>
            ))}
          </div>
        </div>
      </div>
    </HolographicPanel>
  )
}
