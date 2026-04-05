import { execSync } from "child_process"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    let gpuInfo = ""
    try {
      gpuInfo = execSync(
        "nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv,noheader,nounits",
        { stdio: ["ignore", "pipe", "pipe"] },
      )
        .toString()
        .trim()
    } catch {
      gpuInfo = "0, 0, 0, 0"
    }

    const [memUsed = "0", memTotal = "0", gpuUtil = "0", temp = "0"] = gpuInfo.split(", ")

    const memInfo = execSync("free -m").toString()
    const memLines = memInfo.split("\n")[1].trim().split(/\s+/)
    const ramTotal = memLines[1] || "0"
    const ramUsed = memLines[2] || "0"

    const cpuLine = execSync("top -bn1 | grep '%Cpu(s)' || true").toString().trim()
    const cpuMatch = cpuLine.match(/([0-9]+\.?[0-9]*)\s*id/)
    const cpuIdle = cpuMatch ? Number(cpuMatch[1]) : 0
    const cpuUsage = Math.max(0, Math.min(100, Math.round(100 - cpuIdle)))

    const diskLine = execSync("df -h / | tail -1").toString().trim().split(/\s+/)
    const diskUsed = diskLine[2] || "0"
    const diskTotal = diskLine[1] || "0"
    const diskPercent = diskLine[4] || "0%"

    return NextResponse.json({
      cpu: {
        usage: cpuUsage,
      },
      gpu: {
        memoryUsed: memUsed,
        memoryTotal: memTotal,
        utilization: gpuUtil,
        temperature: temp,
      },
      ram: {
        used: ramUsed,
        total: ramTotal,
      },
      disk: {
        used: diskUsed,
        total: diskTotal,
        percent: diskPercent,
      },
      ollama: "running",
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "status error" }, { status: 200 })
  }
}
