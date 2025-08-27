"use client"

import React, { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (message: string) => void
  onStop?: () => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  placeholder = "Type your message...",
  className,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isLoading) {
      onSend(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return
      } else {
        // Send message with Enter
        e.preventDefault()
        if (value.trim() && !isLoading) {
          onSend(value)
        }
      }
    }
  }

  const handleStop = () => {
    onStop?.()
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px'
    }
  }, [value])

  // Focus on mount
  useEffect(() => {
    if (textareaRef.current && !isLoading) {
      textareaRef.current.focus()
    }
  }, [isLoading])

  return (
    <div className={cn("border-t border-border bg-background p-4", className)}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className="min-h-[44px] max-h-[200px] resize-none bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 py-3"
            />
            
            {/* Character count or status indicator */}
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {isLoading ? "Sending..." : `${value.length}`}
            </div>
          </div>

          {/* Send/Stop Button */}
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleStop}
              className="h-11 w-11 shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10"
              title="Stop generation"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!value.trim() || isLoading}
              className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              title="Send message (Enter)"
            >
              <Send className="size-4" />
            </Button>
          )}
        </div>
        
        {/* Helper text */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isLoading && onStop && (
            <span className="text-destructive">Click stop button to cancel</span>
          )}
        </div>
      </form>
    </div>
  )
}