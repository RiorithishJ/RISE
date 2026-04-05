"use client"

import { useState } from "react"

interface SetupScreenProps {
  onInitialize: (password: string) => Promise<void>
}

export function SetupScreen({ onInitialize }: SetupScreenProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setError("")
    setIsLoading(true)
    await onInitialize(password)
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#05070d]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(0,245,255,.08), transparent 35%), radial-gradient(circle at 80% 80%, rgba(123,47,255,.08), transparent 35%)",
        }}
      />

      <div className="w-full max-w-md p-8 relative z-10"
        style={{
          background: "rgba(6,10,18,0.72)",
          border: "1px solid rgba(0,245,255,.35)",
          boxShadow: "0 0 30px rgba(0,245,255,.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="text-center mb-6">
          <div className="text-3xl font-semibold tracking-[0.2em] text-[#00f5ff]">RISE</div>
          <div className="text-sm text-[#97a9bb] mt-2">SECURE YOUR RISE</div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm text-[#9ec6de]">Set your access password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-3 bg-[#0a1220] text-white"
            style={{ border: "1px solid rgba(0,245,255,.35)" }}
          />

          <label className="block text-sm text-[#9ec6de]">Confirm password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-3 bg-[#0a1220] text-white"
            style={{ border: "1px solid rgba(0,245,255,.35)" }}
          />

          {error && <div className="text-sm text-red-400">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 font-semibold tracking-[0.12em]"
            style={{
              background: "linear-gradient(90deg, #00f5ff, #7b2fff)",
              color: "#001019",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "INITIALIZING..." : "INITIALIZE RISE"}
          </button>
        </div>
      </div>
    </div>
  )
}
