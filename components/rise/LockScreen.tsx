"use client"

import { useEffect, useMemo, useState } from "react"

interface LockScreenProps {
  onUnlock: (password: string) => Promise<boolean>
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [denied, setDenied] = useState(false)

  const secondsLeft = useMemo(() => {
    if (!lockedUntil) return 0
    return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
  }, [lockedUntil])

  useEffect(() => {
    if (!lockedUntil) return
    const t = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        setLockedUntil(null)
        setAttempts(0)
      }
    }, 250)
    return () => clearInterval(t)
  }, [lockedUntil])

  const handleUnlock = async () => {
    if (lockedUntil && Date.now() < lockedUntil) return

    const ok = await onUnlock(password)
    if (ok) {
      setPassword("")
      setAttempts(0)
      setDenied(false)
      return
    }

    const next = attempts + 1
    setAttempts(next)
    setDenied(true)
    setTimeout(() => setDenied(false), 500)
    if (next >= 3) {
      setLockedUntil(Date.now() + 30_000)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#05070d]">
      <div className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,245,255,.08) 3px, rgba(0,245,255,.08) 4px)",
        }}
      />

      <div
        className="w-full max-w-md p-8 relative z-10"
        style={{
          background: denied ? "rgba(60,8,8,.78)" : "rgba(6,10,18,.75)",
          border: denied ? "1px solid rgba(255,72,72,.6)" : "1px solid rgba(0,245,255,.35)",
          boxShadow: denied ? "0 0 35px rgba(255,72,72,.35)" : "0 0 30px rgba(0,245,255,.15)",
          backdropFilter: "blur(12px)",
          transform: denied ? "translateX(4px)" : "none",
          transition: "all .2s ease",
        }}
      >
        <div className="text-center mb-6">
          <div className="text-3xl text-[#00f5ff] tracking-[0.2em]">RISE</div>
          <div className="text-sm text-[#9ec6de] mt-2">RISE LOCKED</div>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          className="w-full px-3 py-3 bg-[#0a1220] text-white"
          style={{ border: "1px solid rgba(0,245,255,.35)" }}
          placeholder="Enter password"
        />

        <button
          onClick={handleUnlock}
          className="w-full mt-4 py-3 font-semibold tracking-[0.1em]"
          disabled={Boolean(lockedUntil && Date.now() < lockedUntil)}
          style={{
            background: "linear-gradient(90deg, #00f5ff, #7b2fff)",
            color: "#001019",
            opacity: lockedUntil && Date.now() < lockedUntil ? 0.55 : 1,
          }}
        >
          UNLOCK RISE
        </button>

        {denied && <div className="text-center text-red-400 mt-3">ACCESS DENIED</div>}
        {lockedUntil && Date.now() < lockedUntil && (
          <div className="text-center text-amber-300 mt-3">Too many attempts. Retry in {secondsLeft}s</div>
        )}
      </div>
    </div>
  )
}
