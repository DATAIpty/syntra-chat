"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Settings, Loader2 } from "lucide-react"
import { Collection } from "@/types"
import { PersonalityOption, RoleOption, CreateConversationRequest } from "@/types/chat"

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateConversation: (data: CreateConversationRequest) => Promise<void>
  collections: Collection[]
  personalityTypes: PersonalityOption[]
  roleTypes: RoleOption[]
  isCreating?: boolean
}

export function NewConversationModal({
  open,
  onOpenChange,
  onCreateConversation,
  collections,
  personalityTypes,
  roleTypes,
  isCreating = false,
}: NewConversationModalProps) {
  const [formData, setFormData] = useState<CreateConversationRequest>({
    title: "",
    collection_names: [],
    personality_type: "professional",
    role_type: "general_assistant",
    communication_style: "balanced",
    expertise_areas: [],
    response_tone: "informative",
    use_tools: true,
    max_context_turns: 10,
    temperature: 0.7,
    max_tokens: 2000,
  })
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expertiseInput, setExpertiseInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || formData.collection_names.length === 0) {
      return
    }

    try {
      await onCreateConversation({
        ...formData,
        title: formData.title.trim(),
        expertise_areas: expertiseInput ? 
          expertiseInput.split(',').map(area => area.trim()).filter(Boolean) : 
          [],
      })
      handleReset()
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const handleReset = () => {
    setFormData({
      title: "",
      collection_names: [],
      personality_type: "professional",
      role_type: "general_assistant", 
      communication_style: "balanced",
      expertise_areas: [],
      response_tone: "informative",
      use_tools: true,
      max_context_turns: 10,
      temperature: 0.7,
      max_tokens: 2000,
    })
    setExpertiseInput("")
    setShowAdvanced(false)
  }

  const handleCollectionToggle = (collectionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      collection_names: checked
        ? [...prev.collection_names, collectionId]
        : prev.collection_names.filter(id => id !== collectionId)
    }))
  }

  const selectedPersonality = personalityTypes.find(p => p.id === formData.personality_type)
  const selectedRole = roleTypes.find(r => r.id === formData.role_type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] min-w-[800px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground font-heading text-xl">
            Start New Conversation
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your AI assistant with the right knowledge base and personality for your needs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-card-foreground font-medium">
                Conversation Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                disabled={isCreating}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground font-medium">
                Document Collections * 
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-3 bg-input">
                {collections.map((collection) => (
                  <div key={collection.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={collection.id}
                      checked={formData.collection_names.includes(collection.id)}
                      onCheckedChange={(checked) => 
                        handleCollectionToggle(collection.id, checked as boolean)
                      }
                      disabled={isCreating}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={collection.id}
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {collection.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {collection.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Choose which document collections the AI can reference for this conversation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Personality</Label>
                <Select 
                  value={formData.personality_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, personality_type: value }))}
                  disabled={isCreating}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose personality..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {personalityTypes.map((type) => (
                      <SelectItem
                        key={type.id}
                        value={type.id}
                        className="text-popover-foreground hover:bg-accent"
                      >
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPersonality && (
                  <p className="text-xs text-muted-foreground">
                    {selectedPersonality.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Role</Label>
                <Select 
                  value={formData.role_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role_type: value }))}
                  disabled={isCreating}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose role..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {roleTypes.map((type) => (
                      <SelectItem
                        key={type.id}
                        value={type.id}
                        className="text-popover-foreground hover:bg-accent"
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {type.id.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {type.domain}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRole && (
                  <p className="text-xs text-muted-foreground">
                    Expertise: {selectedRole.expertise.slice(0, 3).join(', ')}
                    {selectedRole.expertise.length > 3 && '...'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between hover:bg-accent text-muted-foreground"
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
                  <Label className="text-card-foreground font-medium">
                    Communication Style
                  </Label>
                  <Select 
                    value={formData.communication_style} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, communication_style: value }))}
                    disabled={isCreating}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                      <SelectItem value="explanatory">Explanatory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">
                  Areas of Expertise
                </Label>
                <Input
                  placeholder="e.g., Finance, Data Analysis, Market Research (comma-separated)"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  disabled={isCreating}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">
                  Custom Instructions
                </Label>
                <Textarea
                  placeholder="Any specific instructions for how the AI should behave or respond..."
                  value={formData.custom_instructions || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_instructions: e.target.value }))}
                  rows={3}
                  disabled={isCreating}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use_tools"
                    checked={formData.use_tools}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, use_tools: checked as boolean }))
                    }
                    disabled={isCreating}
                  />
                  <Label htmlFor="use_tools" className="text-sm font-medium text-card-foreground">
                    Enable Tools
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium text-sm">
                    Memory Turns
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_context_turns}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      max_context_turns: parseInt(e.target.value) || 10 
                    }))}
                    disabled={isCreating}
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium text-sm">
                    Max Tokens
                  </Label>
                  <Input
                    type="number"
                    min="100"
                    max="4000"
                    value={formData.max_tokens}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      max_tokens: parseInt(e.target.value) || 2000 
                    }))}
                    disabled={isCreating}
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">
                  Creativity (Temperature: {formData.temperature})
                </Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    temperature: parseFloat(e.target.value) 
                  }))}
                  disabled={isCreating}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative (0.0)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !formData.title.trim() || formData.collection_names.length === 0}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Conversation"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}