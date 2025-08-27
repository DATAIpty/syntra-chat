export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  organization: string
}

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  conversationId: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  collections: string[]
  personality?: string
  role?: string
  createdAt: Date
  updatedAt: Date
}

export interface Collection {
  id: string
  name: string
  description?: string
  documentCount: number
}

export interface PersonalityType {
  id: string
  name: string
  description: string
}

export interface RoleType {
  id: string
  name: string
  description: string
}
