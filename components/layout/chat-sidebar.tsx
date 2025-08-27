"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConversationListItem } from "@/components/chat/conversation-list-item"
import { Plus, Search, Settings, LogOut, X } from "lucide-react"
import { ConversationListItem as ConversationType } from "@/types/chat"
import { User } from "@/types"

interface ChatSidebarProps {
  conversations: ConversationType[]
  activeConversationId?: string
  user: User
  isOpen?: boolean
  onToggle?: () => void
  onNewConversation: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation?: (id: string) => void
  onRenameConversation?: (id: string, newTitle: string) => void
  onLogout?: () => void
  onOpenSettings?: () => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
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
  searchQuery = "",
  onSearchChange,
  className,
}: ChatSidebarProps) {
  const [localSearch, setLocalSearch] = React.useState("")
  
  const searchValue = onSearchChange ? searchQuery : localSearch
  const setSearchValue = onSearchChange || setLocalSearch

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    (conv.preview && conv.preview.toLowerCase().includes(searchValue.toLowerCase()))
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onToggle} 
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-sidebar-foreground">
                Conversations
              </h2>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onToggle} 
                  className="lg:hidden hover:bg-sidebar-accent"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <Button 
              onClick={onNewConversation} 
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="size-4" />
              New Conversation
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
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
                  <p className="text-muted-foreground text-sm">
                    {searchValue ? "No conversations found" : "No conversations yet"}
                  </p>
                  {!searchValue && (
                    <Button
                      variant="ghost"
                      className="mt-2 text-primary hover:text-primary/80"
                      onClick={onNewConversation}
                    >
                      Start your first conversation
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border bg-sidebar-accent">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 p-3 hover:bg-sidebar-accent"
                >
                  <Avatar className="size-8 border border-primary/20">
                    <div className="size-full bg-primary rounded-full flex items-center justify-center text-sm font-medium text-primary-foreground">
                      {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                <DropdownMenuItem
                  onClick={onOpenSettings}
                  className="text-popover-foreground hover:bg-accent"
                >
                  <Settings className="size-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  onClick={onLogout} 
                  className="text-destructive hover:bg-destructive/10 focus:text-destructive"
                >
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