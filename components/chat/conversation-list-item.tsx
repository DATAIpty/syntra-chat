"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageCircle, MoreHorizontal, Edit2, Trash2, Check, X } from "lucide-react"
import { ConversationListItem as ConversationItem } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"

interface ConversationListItemProps {
  conversation: ConversationItem
  isActive?: boolean
  onClick: () => void
  onDelete?: (id: string) => void
  onRename?: (id: string, newTitle: string) => void
  className?: string
}

export function ConversationListItem({
  conversation,
  isActive,
  onClick,
  onDelete,
  onRename,
  className,
}: ConversationListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title)

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditTitle(conversation.title)
  }

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename?.(conversation.id, editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle(conversation.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div
      className={cn(
        "group relative p-3 rounded-lg cursor-pointer transition-colors border border-transparent hover:bg-secondary/50",
        isActive && "bg-secondary border-primary/20",
        className,
      )}
    >
      <div className="flex items-start gap-3" onClick={!isEditing ? onClick : undefined}>
        <div className="mt-1">
          <MessageCircle 
            className={cn(
              "size-4 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSaveEdit()
                  }}
                >
                  <Check className="size-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelEdit()
                  }}
                >
                  <X className="size-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-sm text-foreground truncate leading-tight">
                {conversation.title}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {conversation.message_count} message{conversation.message_count !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(conversation.updated_at)}
                </p>
              </div>
              {conversation.preview && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {conversation.preview}
                </p>
              )}
            </>
          )}
        </div>

        {/* Actions menu - only show when not editing */}
        {!isEditing && (onDelete || onRename) && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon" 
                  className="h-6 w-6 hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onRename && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEdit()
                    }}
                  >
                    <Edit2 className="size-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(conversation.id)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}