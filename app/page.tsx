"use client"

import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {
    // Redirect to login page
    window.location.href = "/login"
  }, [])

  return (
    <div className="min-h-screen bg-syntra-black flex items-center justify-center">
      <div className="text-syntra-text-primary">Redirecting to login...</div>
    </div>
  )
}
