"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Settings } from "lucide-react"
import type { Collection, PersonalityType, RoleType } from "@/types"

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateConversation: (data: ConversationData) => void
  collections: Collection[]
  personalityTypes: PersonalityType[]
  roleTypes: RoleType[]
}

export interface ConversationData {
  title: string
  collections: string[]
  personality?: string
  role?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export function NewConversationModal({
  open,
  onOpenChange,
  onCreateConversation,
  collections,
  personalityTypes,
  roleTypes,
}: NewConversationModalProps) {
  const [title, setTitle] = React.useState("")
  const [selectedCollections, setSelectedCollections] = React.useState<string[]>([])
  const [personality, setPersonality] = React.useState<string>()
  const [role, setRole] = React.useState<string>()
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [temperature, setTemperature] = React.useState(0.7)
  const [maxTokens, setMaxTokens] = React.useState(2048)
  const [systemPrompt, setSystemPrompt] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data: ConversationData = {
      title: title.trim() || "New Conversation",
      collections: selectedCollections,
      personality,
      role,
      ...(showAdvanced && {
        temperature,
        maxTokens,
        systemPrompt: systemPrompt.trim() || undefined,
      }),
    }

    onCreateConversation(data)
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setTitle("")
    setSelectedCollections([])
    setPersonality(undefined)
    setRole(undefined)
    setShowAdvanced(false)
    setTemperature(0.7)
    setMaxTokens(2048)
    setSystemPrompt("")
  }

  const collectionOptions = collections.map((collection) => ({
    value: collection.id,
    label: collection.name,
    description: collection.description,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-syntra-dark-800 border-syntra-dark-600 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-syntra-text-primary font-heading text-xl">Start New Conversation</DialogTitle>
          <DialogDescription className="text-syntra-text-secondary">
            Configure your AI assistant with the right knowledge base and personality for your needs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-syntra-text-primary font-medium">
              Conversation Title
            </Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-syntra-dark-700 border-syntra-dark-600 text-syntra-text-primary placeholder:text-syntra-text-muted focus:border-syntra-primary focus:ring-syntra-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-syntra-text-primary font-medium">Document Collections</Label>
            <MultiSelect
              options={collectionOptions}
              value={selectedCollections}
              onChange={setSelectedCollections}
              placeholder="Select document collections to include..."
            />
            <p className="text-xs text-syntra-text-muted">
              Choose which document collections the AI can reference for this conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-syntra-text-primary font-medium">Personality</Label>
              <Select value={personality} onValueChange={setPersonality}>
                <SelectTrigger className="bg-syntra-dark-700 border-syntra-dark-600 text-syntra-text-primary">
                  <SelectValue placeholder="Choose personality..." />
                </SelectTrigger>
                <SelectContent className="bg-syntra-dark-800 border-syntra-dark-600">
                  {personalityTypes.map((type) => (
                    <SelectItem
                      key={type.id}
                      value={type.id}
                      className="text-syntra-text-primary hover:bg-syntra-dark-700"
                    >
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-syntra-text-muted">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-syntra-text-primary font-medium">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-syntra-dark-700 border-syntra-dark-600 text-syntra-text-primary">
                  <SelectValue placeholder="Choose role..." />
                </SelectTrigger>
                <SelectContent className="bg-syntra-dark-800 border-syntra-dark-600">
                  {roleTypes.map((type) => (
                    <SelectItem
                      key={type.id}
                      value={type.id}
                      className="text-syntra-text-primary hover:bg-syntra-dark-700"
                    >
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-syntra-text-muted">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between hover:bg-syntra-dark-700 text-syntra-text-secondary"
              >
                <div className="flex items-center gap-2">
                  <Settings className="size-4" />
                  Advanced Settings
                </div>
                <ChevronDown className={`size-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-syntra-text-primary font-medium">Temperature: {temperature}</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
                    className="w-full h-2 bg-syntra-dark-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-syntra-text-muted">
                    Controls randomness. Lower = more focused, Higher = more creative
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens" className="text-syntra-text-primary font-medium">
                    Max Tokens
                  </Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number.parseInt(e.target.value))}
                    className="bg-syntra-dark-700 border-syntra-dark-600 text-syntra-text-primary"
                  />
                  <p className="text-xs text-syntra-text-muted">Maximum response length</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemPrompt" className="text-syntra-text-primary font-medium">
                  Custom System Prompt
                </Label>
                <textarea
                  id="systemPrompt"
                  placeholder="Enter custom instructions for the AI..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-syntra-dark-700 border border-syntra-dark-600 rounded-md text-syntra-text-primary placeholder:text-syntra-text-muted focus:border-syntra-primary focus:ring-syntra-primary/20 resize-none"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 hover:bg-syntra-dark-700"
            >
              Cancel
            </Button>
            <Button type="submit" variant="syntra" className="flex-1">
              Start Conversation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
