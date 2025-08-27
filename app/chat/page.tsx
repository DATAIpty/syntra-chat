"use client"

import React from "react"
import { ChatLayout } from "@/components/layout/chat-layout"
import { ChatSidebar } from "@/components/layout/chat-sidebar"
import { WelcomeScreen } from "@/components/chat/welcome-screen"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MessageInput } from "@/components/chat/message-input"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { NewConversationModal } from "@/components/modals/new-conversation-modal"
import { UserSettingsModal } from "@/components/modals/user-settings-modal"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Menu } from "lucide-react"

// Import your hooks
import { useApp } from "@/hooks/useAppState"
import { useChatSession } from "@/hooks/useChat"
import { chatApi } from "@/lib/api"
import { CreateConversationRequest } from "@/types/chat"

export default function ChatPage() {
  const { auth, ui, chat, collections, search } = useApp()
  const chatSession = useChatSession(chat.activeConversationId)
  const { toast } = useToast()
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [chatSession.messages, chatSession.streamingMessage])

  // Get personalities and roles with fallbacks
  const [personalities, setPersonalities] = React.useState([])
  const [roles, setRoles] = React.useState([])
  
  React.useEffect(() => {
    const loadConfigOptions = async () => {
      try {
        const [personalitiesData, rolesData] = await Promise.all([
          chatApi.chat.getPersonalities(),
          chatApi.chat.getRoles()
        ])
        setPersonalities(personalitiesData)
        setRoles(rolesData)
      } catch (error) {
        console.error('Failed to load config options:', error)
      }
    }
    loadConfigOptions()
  }, [])

  const handleCreateConversation = async (data: CreateConversationRequest) => {
    try {
      const response = await chat.createAndSelectConversation(data)
      toast({
        title: "Conversation created",
        description: `Started: ${response.title}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!chat.activeConversationId || !message.trim()) return
    
    try {
      await chatSession.sendMessage(message.trim())
      chat.setMessageInput("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await chat.deleteConversation(conversationId)
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      })
    }
  }

  const handleRenameConversation = async (conversationId: string, newTitle: string) => {
    try {
      // You'll need to add this mutation to your hooks
      // await chat.updateConversationTitle(conversationId, newTitle)
      toast({
        title: "Conversation renamed",
        description: "Title updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to rename conversation",
        variant: "destructive",
      })
    }
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleStartConversationFromPrompt = (prompt: string) => {
    if (chat.activeConversationId) {
      // If there's an active conversation, just set the message
      chat.setMessageInput(prompt)
    } else {
      // Otherwise, open the new conversation modal
      chat.setMessageInput(prompt)
      ui.newConversationModal.setOpen(true)
    }
  }

  // Loading state
  if (auth.isLoading || chat.isLoadingConversations) {
    return (
      <ChatLayout>
        <div className="flex h-screen bg-background">
          <div className="w-80 bg-sidebar border-r border-sidebar-border p-4">
            <Skeleton className="h-10 w-full mb-4 bg-muted" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-muted" />
              ))}
            </div>
          </div>
          <div className="flex-1 bg-background" />
        </div>
      </ChatLayout>
    )
  }

  // Not authenticated
  if (!auth.isAuthenticated) {
    return null // Middleware will redirect
  }

  const activeConversation = chatSession.conversation

  return (
    <ChatLayout>
      <div className="flex h-screen bg-background">
        <ChatSidebar
          conversations={chat.conversations}
          activeConversationId={chat.activeConversationId || undefined}
          user={auth.user!}
          isOpen={ui.sidebar.isOpen}
          onToggle={ui.sidebar.toggle}
          onNewConversation={() => ui.newConversationModal.setOpen(true)}
          onSelectConversation={(id) => {
            chat.setActiveConversation(id)
            ui.sidebar.closeSidebarOnMobile()
          }}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onLogout={auth.logout}
          onOpenSettings={() => ui.userSettingsModal.setOpen(true)}
          searchQuery={search.query}
          onSearchChange={search.setQuery}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="icon"
              onClick={ui.sidebar.toggle}
              className="hover:bg-muted"
            >
              <Menu className="size-5" />
            </Button>
            <h1 className="font-heading font-semibold text-foreground text-balance">
              {activeConversation?.title || "Syntra Chat"}
            </h1>
            <div className="w-10" />
          </div>

          {/* Chat Content */}
          {!chat.activeConversationId ? (
            <WelcomeScreen onStartConversation={handleStartConversationFromPrompt} />
          ) : (
            <>
              {/* Messages Area */}
              <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="space-y-0">
                  {chatSession.isLoadingHistory ? (
                    <div className="p-4 space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <Skeleton className="w-8 h-8 rounded-full bg-muted" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4 bg-muted" />
                            <Skeleton className="h-4 w-1/2 bg-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    chatSession.messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isEditing={chat.editingMessageId === message.id}
                        onEdit={() => chat.setEditingMessageId(message.id)}
                        onSaveEdit={(newContent) => chatSession.editMessage(message.id, newContent)}
                        onCancelEdit={() => chat.setEditingMessageId(null)}
                        onRegenerate={() => chatSession.regenerateMessage(message.id)}
                        onCopy={handleCopyMessage}
                        isRegenerating={chatSession.isRegenerating}
                      />
                    ))
                  )}
                  
                  {/* Streaming message */}
                  {chatSession.streamingMessage && (
                    <MessageBubble
                      message={{
                        id: 'streaming',
                        conversation_id: chat.activeConversationId!,
                        role: 'assistant',
                        content: chatSession.streamingMessage,
                        timestamp: new Date().toISOString(),
                      }}
                      isStreaming={true}
                    />
                  )}
                  
                  {/* Typing indicator */}
                  {chatSession.isStreaming && !chatSession.streamingMessage && (
                    <TypingIndicator className="px-4 py-2" />
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <MessageInput
                value={chat.messageInput}
                onChange={chat.setMessageInput}
                onSend={handleSendMessage}
                isLoading={chatSession.isStreaming}
                placeholder="Type your message..."
                onStop={chatSession.stopStream}
              />
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewConversationModal
        open={ui.newConversationModal.isOpen}
        onOpenChange={ui.newConversationModal.setOpen}
        onCreateConversation={handleCreateConversation}
        collections={collections}
        personalityTypes={personalities}
        roleTypes={roles}
        isCreating={chat.isCreating}
      />

      <UserSettingsModal
        open={ui.userSettingsModal.isOpen}
        onOpenChange={ui.userSettingsModal.setOpen}
        user={auth.user!}
        onUpdateUser={async (updates) => {
          // Handle user updates
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          })
        }}
      />
    </ChatLayout>
  )
}