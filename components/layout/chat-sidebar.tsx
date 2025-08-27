"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConversationListItem } from "@/components/chat/conversation-list-item"
import { Plus, Search, Settings, LogOut, X } from "lucide-react"
import type { Conversation, User } from "@/types"

interface ChatSidebarProps {
  conversations: Conversation[]
  activeConversationId?: string
  user: User
  isOpen?: boolean
  onToggle?: () => void
  onNewConversation: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation?: (id: string) => void
  onRenameConversation?: (id: string) => void
  onLogout?: () => void
  onOpenSettings?: () => void
  className?: string
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  user,
  isOpen = true,
  onToggle,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onLogout,
  onOpenSettings,
  className,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-syntra-dark-900 border-r border-syntra-dark-700 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-syntra-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-syntra-text-primary">Conversations</h2>
              <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden hover:bg-syntra-dark-700">
                <X className="size-4" />
              </Button>
            </div>

            <Button onClick={onNewConversation} variant="syntra" className="w-full justify-start gap-2">
              <Plus className="size-4" />
              New Conversation
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-syntra-dark-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-syntra-text-muted" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-syntra-dark-700 border-syntra-dark-600 text-syntra-text-primary placeholder:text-syntra-text-muted"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={conversation.id === activeConversationId}
                    onClick={() => onSelectConversation(conversation.id)}
                    onDelete={onDeleteConversation}
                    onRename={onRenameConversation}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-syntra-text-muted text-sm">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-syntra-dark-700 bg-syntra-dark-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 p-3 hover:bg-syntra-dark-700">
                  <Avatar className="size-8 border border-syntra-electric">
                    <div className="size-full bg-syntra-primary rounded-full flex items-center justify-center text-sm font-medium text-syntra-text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-syntra-text-primary">{user.name}</p>
                    <p className="text-xs text-syntra-text-muted">{user.organization}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-syntra-dark-800 border-syntra-dark-600">
                <DropdownMenuItem
                  onClick={onOpenSettings}
                  className="text-syntra-text-primary hover:bg-syntra-dark-700"
                >
                  <Settings className="size-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-syntra-dark-600" />
                <DropdownMenuItem onClick={onLogout} className="text-syntra-danger hover:bg-syntra-danger/10">
                  <LogOut className="size-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  )
}
