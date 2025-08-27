"use client"
import { cn } from "@/lib/utils"
import { MessageCircle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Conversation } from "@/types"

interface ConversationListItemProps {
  conversation: Conversation
  isActive?: boolean
  onClick: () => void
  onDelete?: (id: string) => void
  onRename?: (id: string) => void
  className?: string
}

export function ConversationListItem({
  conversation,
  isActive = false,
  onClick,
  onDelete,
  onRename,
  className,
}: ConversationListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-syntra-dark-700",
        isActive && "bg-syntra-dark-800 border border-syntra-primary/30",
        className,
      )}
      onClick={onClick}
    >
      <MessageCircle className="size-4 text-syntra-text-secondary shrink-0" />

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-syntra-text-primary truncate">{conversation.title}</h3>
        <p className="text-xs text-syntra-text-muted truncate">{conversation.messages.length} messages</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 opacity-0 group-hover:opacity-100 hover:bg-syntra-dark-600 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-syntra-dark-800 border-syntra-dark-600">
          {onRename && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onRename(conversation.id)
              }}
              className="text-syntra-text-primary hover:bg-syntra-dark-700"
            >
              Rename
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete(conversation.id)
              }}
              className="text-syntra-danger hover:bg-syntra-danger/10"
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
