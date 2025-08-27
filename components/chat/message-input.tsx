"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({
  value,
  onChange,
  onSend,
  isLoading = false,
  placeholder = "Type your message...",
  className,
}: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSend()
      }
    }
  }

  return (
    <div className={cn("bg-syntra-dark-900 border-t border-syntra-dark-700 p-4", className)}>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[44px] max-h-32 resize-none bg-syntra-dark-700 border-syntra-dark-600 text-syntra-text-primary placeholder:text-syntra-text-muted focus:border-syntra-primary focus:ring-syntra-primary/20"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          variant="electric"
          size="icon"
          className="size-11 shrink-0"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  )
}
