import type React from "react"

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return <div className="h-screen overflow-hidden bg-syntra-black">{children}</div>
}
