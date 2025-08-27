import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-4", className)}>
      <div className="size-8 bg-syntra-dark-700 rounded-full flex items-center justify-center border-2 border-syntra-dark-600">
        <span className="text-xs font-medium text-syntra-text-secondary">AI</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="size-2 bg-syntra-electric rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="size-2 bg-syntra-electric rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="size-2 bg-syntra-electric rounded-full animate-bounce" />
        </div>
        <span className="text-sm text-syntra-text-secondary ml-2">AI is typing...</span>
      </div>
    </div>
  )
}
