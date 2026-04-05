"use client"

export function ScanLines() {
  return (
    <>
      {/* Static scan lines overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 100,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 245, 255, 0.02) 2px,
            rgba(0, 245, 255, 0.02) 4px
          )`,
        }}
        aria-hidden="true"
      />
      
      {/* Moving scan line */}
      <div 
        className="fixed left-0 right-0 h-[2px] pointer-events-none"
        style={{
          zIndex: 101,
          background: `linear-gradient(
            90deg,
            transparent 0%,
            rgba(0, 245, 255, 0.1) 20%,
            rgba(0, 245, 255, 0.3) 50%,
            rgba(0, 245, 255, 0.1) 80%,
            transparent 100%
          )`,
          boxShadow: "0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3)",
          animation: "scanline 8s linear infinite",
        }}
        aria-hidden="true"
      />
    </>
  )
}
