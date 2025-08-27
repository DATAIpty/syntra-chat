"use client"

import React from "react"
import { ChatLayout } from "@/components/layout/chat-layout"
import { ChatSidebar } from "@/components/layout/chat-sidebar"
import { WelcomeScreen } from "@/components/chat/welcome-screen"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MessageInput } from "@/components/chat/message-input"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { NewConversationModal, type ConversationData } from "@/components/modals/new-conversation-modal"
import { UserSettingsModal } from "@/components/modals/user-settings-modal"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Menu } from "lucide-react"
import type { Conversation, Message, User, Collection, PersonalityType, RoleType } from "@/types"

// Mock data
const mockUser: User = {
  id: "1",
  name: "Demo User",
  email: "demo@syntra.com",
  organization: "Syntra Demo Corp",
}

const mockCollections: Collection[] = [
  { id: "1", name: "Project Documentation", description: "All project-related documents", documentCount: 45 },
  { id: "2", name: "HR Policies", description: "Human resources policies and procedures", documentCount: 23 },
  { id: "3", name: "Technical Specs", description: "Technical specifications and architecture", documentCount: 67 },
  { id: "4", name: "Marketing Materials", description: "Marketing campaigns and brand guidelines", documentCount: 34 },
]

const mockPersonalityTypes: PersonalityType[] = [
  { id: "professional", name: "Professional", description: "Formal and business-focused responses" },
  { id: "friendly", name: "Friendly", description: "Warm and approachable communication style" },
  { id: "analytical", name: "Analytical", description: "Data-driven and detail-oriented responses" },
  { id: "creative", name: "Creative", description: "Innovative and out-of-the-box thinking" },
]

const mockRoleTypes: RoleType[] = [
  { id: "assistant", name: "General Assistant", description: "Helpful with various tasks and questions" },
  { id: "analyst", name: "Business Analyst", description: "Focused on data analysis and insights" },
  { id: "consultant", name: "Strategy Consultant", description: "Strategic planning and recommendations" },
  { id: "researcher", name: "Researcher", description: "In-depth research and information gathering" },
]

const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Project Planning Discussion",
    messages: [
      {
        id: "1",
        content: "Can you help me create a project timeline for our Q1 initiatives?",
        role: "user",
        timestamp: new Date("2024-01-15T10:00:00Z"),
        conversationId: "1",
      },
      {
        id: "2",
        content:
          "I'd be happy to help you create a project timeline for Q1. Based on your organization's documents, I can see several key initiatives. Let me break down a suggested timeline:\n\n**Week 1-2: Planning Phase**\n- Stakeholder alignment meetings\n- Resource allocation review\n\n**Week 3-6: Development Phase**\n- Core feature development\n- Regular sprint reviews\n\n**Week 7-8: Testing & Launch**\n- Quality assurance testing\n- Deployment preparation\n\nWould you like me to elaborate on any of these phases?",
        role: "assistant",
        timestamp: new Date("2024-01-15T10:01:00Z"),
        conversationId: "1",
      },
    ],
    collections: ["project-docs", "planning-templates"],
    personality: "professional",
    role: "project-manager",
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:01:00Z"),
  },
  {
    id: "2",
    title: "Document Analysis",
    messages: [
      {
        id: "3",
        content: "Please analyze the latest quarterly report and highlight key insights.",
        role: "user",
        timestamp: new Date("2024-01-14T14:30:00Z"),
        conversationId: "2",
      },
    ],
    collections: ["quarterly-reports"],
    createdAt: new Date("2024-01-14T14:30:00Z"),
    updatedAt: new Date("2024-01-14T14:30:00Z"),
  },
  {
    id: "3",
    title: "Team Collaboration Ideas",
    messages: [],
    collections: ["team-docs", "collaboration-tools"],
    createdAt: new Date("2024-01-13T09:15:00Z"),
    updatedAt: new Date("2024-01-13T09:15:00Z"),
  },
]

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [activeConversationId, setActiveConversationId] = React.useState<string>()
  const [conversations, setConversations] = React.useState<Conversation[]>(mockConversations)
  const [messageInput, setMessageInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [editingMessageId, setEditingMessageId] = React.useState<string>()
  const [editingContent, setEditingContent] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showNewConversationModal, setShowNewConversationModal] = React.useState(false)
  const [showUserSettingsModal, setShowUserSettingsModal] = React.useState(false)
  const [user, setUser] = React.useState<User>(mockUser)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const activeConversation = conversations.find((conv) => conv.id === activeConversationId)

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [activeConversation?.messages, isTyping])

  const handleNewConversation = () => {
    setShowNewConversationModal(true)
  }

  const handleCreateConversation = (data: ConversationData) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: data.title,
      messages: [],
      collections: data.collections,
      personality: data.personality,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setConversations([newConversation, ...conversations])
    setActiveConversationId(newConversation.id)
    setSidebarOpen(false)
    toast({
      title: "Conversation created",
      description: `Started new conversation: ${data.title}`,
    })
  }

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id)
    setSidebarOpen(false)
    setEditingMessageId(undefined) // Clear any editing state
  }

  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter((conv) => conv.id !== id))
    if (activeConversationId === id) {
      setActiveConversationId(undefined)
    }
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed.",
    })
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversationId || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageInput.trim(),
      role: "user",
      timestamp: new Date(),
      conversationId: activeConversationId,
    }

    // Optimistic update - add user message immediately
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              title: conv.messages.length === 0 ? messageInput.trim().slice(0, 50) + "..." : conv.title,
              updatedAt: new Date(),
            }
          : conv,
      ),
    )

    setMessageInput("")
    setIsTyping(true)

    try {
      // Simulate AI response with streaming effect
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${userMessage.content}". Based on your organization's documents, I can provide relevant insights. This is a simulated response for demonstration purposes.`,
        role: "assistant",
        timestamp: new Date(),
        conversationId: activeConversationId,
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, aiMessage],
                updatedAt: new Date(),
              }
            : conv,
        ),
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleEditMessage = (messageId: string) => {
    const message = activeConversation?.messages.find((m) => m.id === messageId)
    if (message) {
      setEditingMessageId(messageId)
      setEditingContent(message.content)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingContent.trim() || !activeConversationId) return

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === editingMessageId ? { ...msg, content: editingContent.trim() } : msg,
              ),
              updatedAt: new Date(),
            }
          : conv,
      ),
    )

    setEditingMessageId(undefined)
    setEditingContent("")
    toast({
      title: "Message updated",
      description: "Your message has been edited successfully.",
    })
  }

  const handleCancelEdit = () => {
    setEditingMessageId(undefined)
    setEditingContent("")
  }

  const handleRegenerateMessage = async (messageId: string) => {
    if (!activeConversationId) return

    const messageIndex = activeConversation?.messages.findIndex((m) => m.id === messageId)
    if (messageIndex === undefined || messageIndex === -1) return

    setIsTyping(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newContent = `This is a regenerated response. ${Math.random() > 0.5 ? "Here's an alternative perspective on your question." : "Let me provide a different approach to this topic."}`

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, content: newContent, timestamp: new Date() } : msg,
                ),
                updatedAt: new Date(),
              }
            : conv,
        ),
      )

      toast({
        title: "Response regenerated",
        description: "A new response has been generated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleStartConversation = (prompt: string) => {
    if (!activeConversationId) {
      handleNewConversation()
    }
    setMessageInput(prompt)
  }

  const handleLogout = () => {
    window.location.href = "/login"
  }

  const handleUpdateUser = (updates: Partial<User>) => {
    setUser({ ...user, ...updates })
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
  }

  if (isLoading) {
    return (
      <ChatLayout>
        <div className="flex h-screen bg-syntra-black">
          <div className="w-80 bg-syntra-dark-900 border-r border-syntra-dark-700 p-4">
            <Skeleton className="h-10 w-full mb-4 bg-syntra-dark-700" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-syntra-dark-700" />
              ))}
            </div>
          </div>
          <div className="flex-1 bg-syntra-dark-800" />
        </div>
      </ChatLayout>
    )
  }

  return (
    <ChatLayout>
      <div className="flex h-screen bg-syntra-black">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          user={user}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onLogout={handleLogout}
          onOpenSettings={() => setShowUserSettingsModal(true)}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-syntra-dark-800">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-syntra-dark-700 bg-syntra-dark-900">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-syntra-dark-700"
            >
              <Menu className="size-5" />
            </Button>
            <h1 className="font-heading font-semibold text-syntra-text-primary text-balance">
              {activeConversation?.title || "Syntra Chat"}
            </h1>
            <div className="w-10" />
          </div>

          {/* Chat Content */}
          {!activeConversation ? (
            <WelcomeScreen onStartConversation={() => setShowNewConversationModal(true)} />
          ) : (
            <>
              {/* Messages Area */}
              <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="space-y-0">
                  {activeConversation.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isEditing={editingMessageId === message.id}
                      editingContent={editingContent}
                      onEditingContentChange={setEditingContent}
                      onEdit={handleEditMessage}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      onRegenerate={handleRegenerateMessage}
                      onCopy={handleCopyMessage}
                    />
                  ))}
                  {isTyping && <TypingIndicator className="px-4 py-2" />}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <MessageInput
                value={messageInput}
                onChange={setMessageInput}
                onSend={handleSendMessage}
                isLoading={isTyping}
                placeholder="Type your message..."
              />
            </>
          )}
        </div>
      </div>

      <NewConversationModal
        open={showNewConversationModal}
        onOpenChange={setShowNewConversationModal}
        onCreateConversation={handleCreateConversation}
        collections={mockCollections}
        personalityTypes={mockPersonalityTypes}
        roleTypes={mockRoleTypes}
      />

      <UserSettingsModal
        open={showUserSettingsModal}
        onOpenChange={setShowUserSettingsModal}
        user={user}
        onUpdateUser={handleUpdateUser}
      />
    </ChatLayout>
  )
}
