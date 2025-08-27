"use client"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { MessageSquare, BookOpen, Zap, Users } from "lucide-react"
import Image from "next/image"

interface WelcomeScreenProps {
  onStartConversation?: (prompt: string) => void
  className?: string
}

const samplePrompts = [
  {
    icon: BookOpen,
    title: "Analyze Documents",
    description: "Help me understand key insights from our latest reports",
    prompt: "Can you analyze the key insights from our latest quarterly reports?",
  },
  {
    icon: Zap,
    title: "Quick Summary",
    description: "Summarize the main points from our meeting notes",
    prompt: "Please provide a summary of the main points from our recent meeting notes.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Help draft a project proposal for the team",
    prompt: "Help me draft a comprehensive project proposal for our upcoming initiative.",
  },
  {
    icon: MessageSquare,
    title: "General Chat",
    description: "Start a conversation about anything",
    prompt: "Hello! I'd like to start a conversation.",
  },
]

export function WelcomeScreen({ onStartConversation, className }: WelcomeScreenProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-full p-8 text-center", className)}>
      <div className="mb-8">
        <Image src="/syntra-logo.png" alt="Syntra" width={80} height={80} className="mx-auto mb-4" />
        <h1 className="text-3xl font-heading font-bold text-syntra-text-primary mb-2">Welcome to Syntra Chat</h1>
        <p className="text-syntra-text-secondary max-w-md">
          Your enterprise AI assistant powered by your organization's knowledge base. Start a conversation to get
          insights from your documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
        {samplePrompts.map((prompt, index) => {
          const Icon = prompt.icon
          return (
            <Card
              key={index}
              className="p-4 bg-syntra-dark-700 border-syntra-dark-600 hover:bg-syntra-dark-600 transition-colors cursor-pointer group"
              onClick={() => onStartConversation?.(prompt.prompt)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-syntra-primary/10 rounded-lg group-hover:bg-syntra-primary/20 transition-colors">
                  <Icon className="size-5 text-syntra-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-syntra-text-primary mb-1">{prompt.title}</h3>
                  <p className="text-sm text-syntra-text-secondary">{prompt.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="text-sm text-syntra-text-muted">
        <p>💡 Tip: Use specific questions to get the most relevant answers from your documents</p>
      </div>
    </div>
  )
}
