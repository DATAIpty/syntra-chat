"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Edit, RotateCcw, Check, X } from "lucide-react"
import type { Message } from "@/types"

interface MessageBubbleProps {
  message: Message
  isEditing?: boolean
  editingContent?: string
  onEditingContentChange?: (content: string) => void
  onEdit?: (messageId: string) => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
  onRegenerate?: (messageId: string) => void
  onCopy?: (content: string) => void
  className?: string
}

export function MessageBubble({
  message,
  isEditing = false,
  editingContent = "",
  onEditingContentChange,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onRegenerate,
  onCopy,
  className,
}: MessageBubbleProps) {
  const isUser = message.role === "user"
  const [showActions, setShowActions] = React.useState(false)

  return (
    <div
      className={cn(
        "group flex gap-3 py-4 px-4 hover:bg-syntra-dark-800/50 transition-colors",
        isUser ? "flex-row-reverse" : "flex-row",
        className,
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar className="size-8 border-2 border-syntra-dark-600">
        <div
          className={cn(
            "size-full rounded-full flex items-center justify-center text-xs font-medium",
            isUser ? "bg-syntra-primary text-syntra-text-primary" : "bg-syntra-dark-700 text-syntra-text-secondary",
          )}
        >
          {isUser ? "U" : "AI"}
        </div>
      </Avatar>

      <div className={cn("flex-1 space-y-2", isUser ? "text-right" : "text-left")}>
        {isEditing ? (
          <div className={cn("max-w-[80%]", isUser ? "ml-auto" : "mr-auto")}>
            <Textarea
              value={editingContent}
              onChange={(e) => onEditingContentChange?.(e.target.value)}
              className="min-h-[80px] bg-syntra-dark-700 border-syntra-dark-600 text-syntra-text-primary resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={onSaveEdit} className="bg-syntra-primary hover:bg-syntra-primary-dark">
                <Check className="size-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelEdit} className="hover:bg-syntra-dark-600">
                <X className="size-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "inline-block max-w-[80%] rounded-lg px-4 py-2 text-sm leading-relaxed text-pretty",
              isUser
                ? "bg-syntra-primary text-syntra-text-primary ml-auto"
                : "bg-syntra-dark-700 text-syntra-text-primary border border-syntra-dark-600",
            )}
          >
            {message.content}
          </div>
        )}

        {showActions && !isEditing && (
          <div
            className={cn(
              "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isUser ? "justify-end" : "justify-start",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy?.(message.content)}
              className="h-6 px-2 text-syntra-text-secondary hover:text-syntra-text-primary hover:bg-syntra-dark-600"
              title="Copy message"
            >
              <Copy className="size-3" />
            </Button>
            {isUser && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(message.id)}
                className="h-6 px-2 text-syntra-text-secondary hover:text-syntra-text-primary hover:bg-syntra-dark-600"
                title="Edit message"
              >
                <Edit className="size-3" />
              </Button>
            )}
            {!isUser && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRegenerate(message.id)}
                className="h-6 px-2 text-syntra-text-secondary hover:text-syntra-text-primary hover:bg-syntra-dark-600"
                title="Regenerate response"
              >
                <RotateCcw className="size-3" />
              </Button>
            )}
          </div>
        )}

        <div className={cn("text-xs text-syntra-text-muted", isUser ? "text-right" : "text-left")}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  )
}
