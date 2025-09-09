"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { 
  Copy, 
  Edit2, 
  RefreshCw, 
  Check, 
  X, 
  User, 
  Bot,
  Loader2 
} from "lucide-react"
import { ChatMessage } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"

interface MessageBubbleProps {
  message: ChatMessage
  isEditing?: boolean
  isStreaming?: boolean
  isRegenerating?: boolean
  onEdit?: (messageId: string, newContent: string) => void | Promise<void>
  onRegenerate?: (messageId: string) => void | Promise<void>
  onCopy?: (content: string) => void | Promise<void>
  className?: string
}

export function MessageBubble({
  message,
  isEditing = false,
  isStreaming = false,
  isRegenerating = false,
  onEdit,
  onRegenerate,
  onCopy,
  className,
}: MessageBubbleProps) {
  const [editContent, setEditContent] = useState(message.content)
  const [showActions, setShowActions] = useState(false)
  const [isEditingLocal, setIsEditingLocal] = useState(false)
  
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  // Reset edit content when message content changes
  React.useEffect(() => {
    setEditContent(message.content)
  }, [message.content])

  const handleStartEdit = () => {
    setEditContent(message.content)
    setIsEditingLocal(true)
  }

  const handleSaveEdit = async () => {
    if (editContent.trim() !== message.content && onEdit) {
      try {
        await onEdit(message.id, editContent.trim())
        setIsEditingLocal(false)
      } catch (error) {
        // Handle error if needed
        console.error('Failed to edit message:', error)
      }
    } else {
      setIsEditingLocal(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditingLocal(false)
  }

  const handleRegenerate = async () => {
    if (onRegenerate) {
      try {
        await onRegenerate(message.id)
      } catch (error) {
        console.error('Failed to regenerate message:', error)
      }
    }
  }

  const handleCopy = async () => {
    if (onCopy) {
      try {
        await onCopy(message.content)
      } catch (error) {
        console.error('Failed to copy message:', error)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  const currentlyEditing = isEditing || isEditingLocal

  return (
    <div
      className={cn(
        "group relative py-3 hover:bg-muted/30 transition-colors",
        className,
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn(
        "flex gap-3 max-w-4xl mx-auto",
        isUser && "flex-row-reverse"
      )}>
        {/* Avatar */}
        <Avatar className="size-8 shrink-0">
          <div className={cn(
            "size-full rounded-full flex items-center justify-center text-sm font-medium",
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
          </div>
        </Avatar>

        {/* Message Content */}
        <div className={cn(
          "flex-1 min-w-0",
          isUser && "text-right"
        )}>
          {/* Message Header */}
          <div className={cn(
            "flex items-center gap-2 mb-1",
            isUser && "justify-end"
          )}>
            <span className="text-sm font-medium text-foreground">
              {isUser ? "You" : "Assistant"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            {message.metadata?.edited && (
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            )}
          </div>

          {/* Message Body */}
          {currentlyEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] bg-input border-border text-foreground resize-none"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  <X className="size-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Check className="size-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "relative rounded-lg px-4 py-2 max-w-full",
              isUser 
                ? "bg-primary text-primary-foreground ml-auto" 
                : "bg-card border border-border text-card-foreground"
            )}>
              <div className="whitespace-pre-wrap break-words text-sm">
                {message.content || (isStreaming ? '' : 'Message content not available')}
                {isStreaming && (
                  <span className="animate-pulse">▊</span>
                )}
              </div>
              
              {message.metadata?.tokens_used && (
                <div className="mt-2 pt-2 border-t border-current/10 text-xs opacity-70">
                  {message.metadata.tokens_used} tokens
                  {message.metadata.processing_time && 
                    ` • ${Math.round(message.metadata.processing_time)}ms`
                  }
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {!currentlyEditing && (showActions || isRegenerating) && (
            <div className={cn(
              "flex items-center gap-1 mt-2 transition-opacity",
              isUser ? "justify-end" : "justify-start"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted"
                onClick={handleCopy}
                title="Copy message"
              >
                <Copy className="size-3" />
              </Button>
              
              {isUser && onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-muted"
                  onClick={handleStartEdit}
                  title="Edit message"
                >
                  <Edit2 className="size-3" />
                </Button>
              )}
              
              {isAssistant && onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-muted"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  title="Regenerate response"
                >
                  {isRegenerating ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RefreshCw className="size-3" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}