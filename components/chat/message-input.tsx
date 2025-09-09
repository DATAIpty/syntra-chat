"use client"

import React, { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Square, Plus, Paperclip } from "lucide-react"
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
  placeholder = "Message Syntra...",
  className,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isLoading) {
      onSend(value.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        // Allow new line with Shift/Ctrl/Cmd+Enter
        return
      } else {
        // Send message with Enter
        e.preventDefault()
        if (value.trim() && !isLoading) {
          onSend(value.trim())
        }
      }
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px' // Reset to min height
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 200 // Max height in pixels
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px'
    }
  }, [value])

  // Focus textarea when not loading
  useEffect(() => {
    if (textareaRef.current && !isLoading) {
      textareaRef.current.focus()
    }
  }, [isLoading])

  const canSend = value.trim().length > 0 && !isLoading
  const isEmpty = value.trim().length === 0

  return (
    <div className={cn("p-4 bg-background border-t border-border/50", className)}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* Main Input Container */}
          <div className={cn(
            "relative flex items-end bg-card border border-border rounded-2xl shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-md",
            isLoading && "border-primary/30"
          )}>
            
            {/* Attachment Button (placeholder for future) */}
            <div className="flex items-end p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
                disabled={isLoading}
                title="Attach files (coming soon)"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Text Input Area */}
            <div className="flex-1 min-h-[44px] max-h-[200px] overflow-hidden">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                rows={1}
                className={cn(
                  "w-full resize-none border-0 bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0",
                  "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                )}
                style={{
                  minHeight: '24px',
                  maxHeight: '200px',
                  lineHeight: '1.5',
                }}
              />
            </div>

            {/* Send/Stop Button */}
            <div className="flex items-end p-2">
              {isLoading ? (
                <Button
                  type="button"
                  onClick={onStop}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Stop generating"
                >
                  <Square className="h-4 w-4 fill-current" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!canSend}
                  className={cn(
                    "h-8 w-8 rounded-lg transition-all duration-200",
                    canSend
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                  title={canSend ? "Send message" : "Type a message to send"}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Status/Helper Text */}
          <div className="flex items-center justify-between mt-2 px-3">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                  </div>
                  <span>Syntra is typing...</span>
                </span>
              ) : (
                <span>Press Enter to send</span>
              )}
            </div>
            
            {/* Character count for long messages */}
            {value.length > 500 && (
              <div className="text-xs text-muted-foreground">
                {value.length}/2000
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}