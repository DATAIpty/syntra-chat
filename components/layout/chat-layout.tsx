"use client"

import React from "react"

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex flex-col">
      {children}
    </div>
  )
}