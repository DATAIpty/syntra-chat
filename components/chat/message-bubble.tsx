"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { 
  Copy, 
  Edit2, 
  RefreshCw, 
  Check, 
  X, 
  User, 
  Bot,
  Loader2 
} from "lucide-react"
import { ChatMessage } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"

// You'll need to install these packages:
// npm install react-markdown remark-gfm rehype-highlight rehype-raw
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'

interface MessageBubbleProps {
  message: ChatMessage
  isEditing?: boolean
  isStreaming?: boolean
  isRegenerating?: boolean
  onEdit?: (messageId: string, newContent: string) => void | Promise<void>
  onRegenerate?: (messageId: string) => void | Promise<void>
  onCopy?: (content: string) => void | Promise<void>
  className?: string
}

// Enhanced content parser to detect JSON responses and extract content
const parseMessageContent = (content: string) => {
  // Try to detect embedded JSON in the content
  const jsonMatch = content.match(/\{[\s\S]*"response"[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      const jsonData = JSON.parse(jsonMatch[0]);
      
      if (jsonData.response) {
        // Clean up the response content for better markdown parsing
        let cleanContent = jsonData.response;
        
        // Fix table formatting issues - ensure proper spacing around table syntax
        cleanContent = cleanContent.replace(/\|\s*([^|]+)\s*\|/g, '| $1 |');
        
        // Ensure proper line breaks before and after tables
        cleanContent = cleanContent.replace(/(\|[^|\n]+\|)\n([^|\n])/g, '$1\n\n$2');
        cleanContent = cleanContent.replace(/([^|\n])\n(\|[^|\n]+\|)/g, '$1\n\n$2');
        
        return {
          type: 'structured',
          content: cleanContent,
          sources: jsonData.key_sources || [],
          confidence: jsonData.confidence,
          responseType: jsonData.response_type,
          hasTable: jsonData.has_table,
          tokenUsage: jsonData.token_usage,
          limitations: jsonData.limitations,
          prefix: content.substring(0, jsonMatch.index).trim()
        };
      }
    } catch (error) {
      console.log('Failed to parse JSON from content:', error);
    }
  }
  
  // Fallback to basic content enhancement
  const hasMarkdownHeaders = /^#{1,6}\s+/m.test(content)
  const hasTableSyntax = /\|.*\|/m.test(content)
  const hasCodeBlocks = /```[\s\S]*```/m.test(content)
  
  if (!hasMarkdownHeaders && !hasTableSyntax && !hasCodeBlocks) {
    const keyValuePattern = /([A-Z][A-Za-z\s]+):\s*([^\n\r]+)/g
    const matches = content.match(keyValuePattern)
    
    if (matches && matches.length > 3) {
      return {
        type: 'enhanced',
        content: content.replace(keyValuePattern, '**$1:** $2\n'),
        sources: [],
        prefix: ''
      };
    }
    
    if (content.includes('###')) {
      return {
        type: 'enhanced',
        content: content.replace(/###\s*([^\n]+)/g, '## $1'),
        sources: [],
        prefix: ''
      };
    }
  }
  
  return {
    type: 'plain',
    content: content,
    sources: [],
    prefix: ''
  };
}

// Helper function to extract document name from source path
const extractDocumentName = (sourcePath: string) => {
  if (!sourcePath) return sourcePath;
  
  // Remove chunk information and just get the document name
  const docMatch = sourcePath.match(/^([^#]+)/);
  if (docMatch) {
    const docName = docMatch[1];
    // Remove .pdf extension if present and clean up the name
    return docName.replace(/\.pdf$/, '').replace(/_/g, ' ');
  }
  
  return sourcePath;
}

// Sources component
const SourcesDisplay = ({ sources, confidence }: { sources: string[], confidence?: number }) => {
  if (!sources || sources.length === 0) return null;
  
  // Get unique document names
  const uniqueDocs = Array.from(new Set(sources.map(extractDocumentName)));
  
  return (
    <div className="mt-4 pt-3 border-t border-current/10">
      <div className="flex flex-col gap-2 text-xs">
        {confidence && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">Confidence:</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-1">
          <span className="font-medium text-muted-foreground">Sources:</span>
          <div className="flex flex-wrap gap-1">
            {uniqueDocs.map((doc, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 bg-muted/60 px-2 py-1 rounded text-xs font-medium"
                title={sources.find(s => extractDocumentName(s) === doc) || doc}
              >
                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
                {doc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom markdown components for better styling
const MarkdownComponents = {
  // Enhanced table styling
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-border rounded-md" {...props}>
        {children}
      </table>
    </div>
  ),
  
  thead: ({ children, ...props }: any) => (
    <thead className="bg-muted/50" {...props}>{children}</thead>
  ),
  
  th: ({ children, ...props }: any) => (
    <th className="border border-border px-3 py-2 text-left font-medium text-sm" {...props}>
      {children}
    </th>
  ),
  
  td: ({ children, ...props }: any) => (
    <td className="border border-border px-3 py-2 text-sm" {...props}>
      {children}
    </td>
  ),
  
  // Enhanced code blocks
  pre: ({ children, ...props }: any) => (
    <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto my-3 text-sm border" {...props}>
      {children}
    </pre>
  ),
  
  code: ({ children, className, ...props }: any) => {
    const isInline = !className
    return isInline ? (
      <code className="bg-muted/60 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    ) : (
      <code className={className} {...props}>{children}</code>
    )
  },
  
  // Better list styling
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside space-y-1 my-3 pl-4" {...props}>
      {children}
    </ul>
  ),
  
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside space-y-1 my-3 pl-4" {...props}>
      {children}
    </ol>
  ),
  
  li: ({ children, ...props }: any) => (
    <li className="text-sm leading-relaxed" {...props}>{children}</li>
  ),
  
  // Enhanced headers
  h1: ({ children, ...props }: any) => (
    <h1 className="text-xl font-semibold mt-6 mb-3 text-foreground border-b border-border pb-2" {...props}>
      {children}
    </h1>
  ),
  
  h2: ({ children, ...props }: any) => (
    <h2 className="text-lg font-semibold mt-5 mb-3 text-foreground" {...props}>
      {children}
    </h2>
  ),
  
  h3: ({ children, ...props }: any) => (
    <h3 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props}>
      {children}
    </h3>
  ),
  
  // Enhanced paragraphs
  p: ({ children, ...props }: any) => (
    <p className="text-sm leading-relaxed mb-3 last:mb-0" {...props}>
      {children}
    </p>
  ),
  
  // Enhanced blockquotes
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 my-3 italic text-muted-foreground bg-muted/30 py-2 rounded-r" {...props}>
      {children}
    </blockquote>
  ),
  
  // Enhanced links
  a: ({ children, ...props }: any) => (
    <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
  
  // Enhanced horizontal rule
  hr: ({ ...props }: any) => (
    <hr className="my-6 border-border" {...props} />
  ),
  
  // Enhanced strong/bold
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  
  // Enhanced emphasis/italic
  em: ({ children, ...props }: any) => (
    <em className="italic text-muted-foreground" {...props}>
      {children}
    </em>
  ),
}

export function MessageBubble({
  message,
  isEditing = false,
  isStreaming = false,
  isRegenerating = false,
  onEdit,
  onRegenerate,
  onCopy,
  className,
}: MessageBubbleProps) {
  const [editContent, setEditContent] = useState(message.content)
  const [showActions, setShowActions] = useState(false)
  const [isEditingLocal, setIsEditingLocal] = useState(false)
  
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  // Reset edit content when message content changes
  React.useEffect(() => {
    setEditContent(message.content)
  }, [message.content])

  const handleStartEdit = () => {
    setEditContent(message.content)
    setIsEditingLocal(true)
  }

  const handleSaveEdit = async () => {
    if (editContent.trim() !== message.content && onEdit) {
      try {
        await onEdit(message.id, editContent.trim())
        setIsEditingLocal(false)
      } catch (error) {
        console.error('Failed to edit message:', error)
      }
    } else {
      setIsEditingLocal(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditingLocal(false)
  }

  const handleRegenerate = async () => {
    if (onRegenerate) {
      try {
        await onRegenerate(message.id)
      } catch (error) {
        console.error('Failed to regenerate message:', error)
      }
    }
  }

  const handleCopy = async () => {
    if (onCopy) {
      try {
        await onCopy(message.content)
      } catch (error) {
        console.error('Failed to copy message:', error)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  const currentlyEditing = isEditing || isEditingLocal

  // Parse content to extract JSON or enhance markdown
  const parsedContent = parseMessageContent(message.content || '')

  return (
    <div
      className={cn(
        "group relative py-4 hover:bg-muted/30 transition-colors",
        className,
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn(
        "flex gap-4 max-w-5xl mx-auto",
        isUser && "flex-row-reverse"
      )}>
        {/* Avatar */}
        <Avatar className="size-8 shrink-0 mt-1">
          <div className={cn(
            "size-full rounded-full flex items-center justify-center text-sm font-medium",
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
          </div>
        </Avatar>

        {/* Message Content */}
        <div className={cn(
          "flex-1 min-w-0",
          isUser && "text-right"
        )}>
          {/* Message Header */}
          <div className={cn(
            "flex items-center gap-2 mb-2",
            isUser && "justify-end"
          )}>
            <span className="text-sm font-medium text-foreground">
              {isUser ? "You" : "Assistant"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            {message.metadata?.edited && (
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            )}
          </div>

          {/* Message Body */}
          {currentlyEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[80px] bg-input border-border text-foreground resize-none font-mono text-sm"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  <X className="size-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Check className="size-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "relative rounded-lg max-w-full",
              isUser 
                ? "bg-primary text-primary-foreground ml-auto px-4 py-3" 
                : "bg-card border border-border text-card-foreground p-4"
            )}>
              {/* Enhanced content rendering */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {isUser ? (
                  // User messages: simple text rendering
                  <div className="whitespace-pre-wrap break-words text-sm">
                    {message.content || (isStreaming ? '' : 'Message content not available')}
                    {isStreaming && (
                      <span className="animate-pulse ml-1">▊</span>
                    )}
                  </div>
                ) : (
                  // Assistant messages: enhanced rendering with JSON parsing
                  <div className="markdown-content">
                    {/* Prefix text (if any) */}
                    {parsedContent.prefix && (
                      <div className="mb-4 text-sm text-muted-foreground italic">
                        {parsedContent.prefix}
                      </div>
                    )}
                    
                    {/* Main content */}
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                      components={MarkdownComponents}
                    >
                      {parsedContent.content || (isStreaming ? '*Thinking...*' : 'No content available')}
                    </ReactMarkdown>
                    
                    {isStreaming && (
                      <span className="animate-pulse ml-1 text-primary">▊</span>
                    )}
                    
                    {/* Sources and metadata for structured responses */}
                    {parsedContent.type === 'structured' && (
                      <SourcesDisplay 
                        sources={parsedContent.sources} 
                        confidence={parsedContent.confidence}
                      />
                    )}
                    
                    {/* Limitations notice for structured responses */}
                    {parsedContent.type === 'structured' && parsedContent.limitations && (
                      <div className="mt-3 p-2 bg-muted/30 border border-muted rounded text-xs text-muted-foreground">
                        <span className="font-medium">Note:</span> {parsedContent.limitations}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Standard metadata */}
              {message.metadata?.tokens_used && (
                <div className="mt-4 pt-3 border-t border-current/10 text-xs opacity-70 flex gap-4">
                  <span>{message.metadata.tokens_used} tokens</span>
                  {message.metadata.processing_time && (
                    <span>{Math.round(message.metadata.processing_time)}ms</span>
                  )}
                  {message.metadata.sources && (
                    <span>{message.metadata.sources.join(', ')}</span>
                  )}
                </div>
              )}
              
              {/* Enhanced metadata for structured responses */}
              {parsedContent.type === 'structured' && parsedContent.tokenUsage && (
                <div className="mt-4 pt-3 border-t border-current/10 flex gap-4 text-xs opacity-70">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-current rounded-full opacity-50" />
                    {parsedContent.tokenUsage.input + parsedContent.tokenUsage.output} tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-current rounded-full opacity-50" />
                    {parsedContent.responseType}
                  </span>
                  {parsedContent.hasTable && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-current rounded-full opacity-50" />
                      Contains table
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {!currentlyEditing && (showActions || isRegenerating) && (
            <div className={cn(
              "flex items-center gap-1 mt-3 transition-opacity",
              isUser ? "justify-end" : "justify-start"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted"
                onClick={handleCopy}
                title="Copy message"
              >
                <Copy className="size-3" />
              </Button>
              
              {isUser && onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-muted"
                  onClick={handleStartEdit}
                  title="Edit message"
                >
                  <Edit2 className="size-3" />
                </Button>
              )}
              
              {isAssistant && onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-muted"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  title="Regenerate response"
                >
                  {isRegenerating ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RefreshCw className="size-3" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}