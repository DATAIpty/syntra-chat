// Fixed ChatPage component with proper scrolling

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
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const messagesContainerRef = React.useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = React.useState(false)
  const [scrollTimeout, setScrollTimeout] = React.useState<NodeJS.Timeout>()
  const lastMessageCountRef = React.useRef(0)
  const programmaticScrollRef = React.useRef(false)

  const scrollToBottom = React.useCallback((force = false) => {
    if (!messagesEndRef.current) return
    
    // Don't auto-scroll if user is manually scrolling, unless forced
    if (!force && isUserScrolling) return
    
    // Mark as programmatic scroll to avoid triggering user scroll detection
    programmaticScrollRef.current = true
    
    messagesEndRef.current.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end' 
    })
    
    // Reset the flag after scroll completes
    setTimeout(() => {
      programmaticScrollRef.current = false
    }, 500)
  }, [isUserScrolling])

  // Handle user scrolling detection with better thresholds
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Ignore programmatic scrolls
    if (programmaticScrollRef.current) return
    
    const container = e.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = container
    
    // Increased threshold for better UX - user must scroll up more than 150px from bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150
    
    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    
    if (isNearBottom) {
      // User is near bottom, enable auto-scroll
      setIsUserScrolling(false)
    } else {
      // User has scrolled up significantly, disable auto-scroll
      setIsUserScrolling(true)
      
      // Reset user scrolling state after 3 seconds of no scroll activity
      const timeout = setTimeout(() => {
        // Double-check if still near bottom when timeout fires
        const { scrollTop: currentScrollTop, scrollHeight: currentScrollHeight, clientHeight: currentClientHeight } = container
        const stillNearBottom = currentScrollHeight - currentScrollTop - currentClientHeight < 150
        
        if (stillNearBottom) {
          setIsUserScrolling(false)
        }
      }, 3000) // Increased from 1 second to 3 seconds
      
      setScrollTimeout(timeout)
    }
  }, [scrollTimeout])

  // Only auto-scroll when NEW messages arrive (not on every render)
  React.useEffect(() => {
    const currentMessageCount = chatSession.messages.length
    const hasNewMessage = currentMessageCount > lastMessageCountRef.current
    
    // Update the ref for next comparison
    lastMessageCountRef.current = currentMessageCount
    
    // Only scroll if there's a new message and user isn't manually scrolling
    if (hasNewMessage && !isUserScrolling) {
      // Small delay to ensure message is rendered
      setTimeout(() => scrollToBottom(), 50)
    }
  }, [chatSession.messages.length, scrollToBottom, isUserScrolling])

  // Handle streaming message updates separately
  React.useEffect(() => {
    // Auto-scroll during streaming if user isn't scrolling
    if (chatSession.streamingMessage && !isUserScrolling) {
      scrollToBottom()
    }
  }, [chatSession.streamingMessage, scrollToBottom, isUserScrolling])

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
      
      // Force scroll to bottom when user sends a message (override user scrolling)
      setIsUserScrolling(false) // Reset user scrolling state
      setTimeout(() => scrollToBottom(true), 100)
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
      await chat.updateConversationTitle(conversationId, newTitle)
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
      chat.setMessageInput(prompt)
    } else {
      chat.setMessageInput(prompt)
      ui.newConversationModal.setOpen(true)
    }
  }

  // Loading state
  if (auth.isLoading || chat.isLoadingConversations) {
    return (
      <ChatLayout>
        <div className="flex h-full bg-background">
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
  if (!auth.isAuthenticated || !auth.user) {
    return null // Middleware will redirect
  }

  const activeConversation = chatSession.conversation

  return (
    <ChatLayout>
      <div className="flex h-full bg-background">
        <ChatSidebar
          conversations={chat.conversations}
          activeConversationId={chat.activeConversationId || undefined}
          user={auth.user!}
          isOpen={ui.sidebar.isOpen}
          onToggle={ui.sidebar.toggle}
          onNewConversation={() => ui.newConversationModal.setOpen(true)}
          onSelectConversation={(id) => {
    // Use the enhanced selectConversation instead of setActiveConversation
    chat.selectConversation(id);
    ui.sidebar.closeSidebarOnMobile();
  }}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onLogout={auth.logout}
          onOpenSettings={() => ui.userSettingsModal.setOpen(true)}
          searchQuery={search.query}
          onSearchChange={search.setQuery}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
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
              {/* Messages Area - Fixed height with independent scroll */}
              <div 
                className="flex-1 overflow-y-auto px-4 py-4"
                onScroll={handleScroll}
                ref={messagesContainerRef}
                style={{ 
                  scrollBehavior: isUserScrolling ? 'auto' : 'smooth'
                }}
              >
                <div className="space-y-6 max-w-4xl mx-auto min-h-0">
                  {chatSession.isLoadingHistory ? (
                    <div className="space-y-6">
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
                    <>
                      {chatSession.messages.map((message) => (
                        <MessageBubble
                          key={`${message.id}-${message.timestamp}`}
                          message={message}
                          onCopy={handleCopyMessage}
                          onEdit={chatSession.editMessage}
                          onRegenerate={chatSession.regenerateMessage}
                          isStreaming={message.id.startsWith('temp-ai-') && chatSession.isStreaming}
                          isRegenerating={chatSession.isRegenerating}
                        />
                      ))}
                      
                      {/* Typing indicator */}
                      {chatSession.isStreaming && !chatSession.streamingMessage && !chatSession.messages.some(m => m.id.startsWith('temp-ai-')) && (
                        <TypingIndicator />
                      )}
                      
                      {/* Scroll anchor */}
                      <div ref={messagesEndRef} className="h-1" />
                    </>
                  )}
                </div>
              </div>

              {/* Scroll to bottom button - show when user is scrolling up */}
              {isUserScrolling && (
    <div className="absolute bottom-20 right-8 z-10">
      <Button
        size="sm"
        variant="outline"
        className="rounded-full shadow-lg bg-background hover:bg-muted"
        onClick={() => {
          setIsUserScrolling(false)
          scrollToBottom(true)
        }}
      >
        Scroll to bottom
      </Button>
    </div>
  )}

              {/* Message Input - Fixed at bottom */}
              <div className="shrink-0 border-t border-border bg-background">
                <MessageInput
                  value={chat.messageInput}
                  onChange={chat.setMessageInput}
                  onSend={handleSendMessage}
                  isLoading={chatSession.isStreaming}
                  placeholder="Type your message..."
                  onStop={chatSession.stopStream}
                />
              </div>
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
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          })
        }}
      />
    </ChatLayout>
  )
}