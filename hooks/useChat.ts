// hooks/useChat.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef } from 'react';
import { mainApi, chatApi } from '@/lib/api';
import {
  CreateConversationRequest,
  ChatRequest,
  ConversationStatusUpdate,
  StreamChunk,
  ChatMessage,
} from '@/types/chat';
import { Collection } from '@/types';

// ================================
// QUERY KEYS
// ================================
export const queryKeys = {
  // Main API queries
  collections: ['collections'] as const,
  userProfile: ['userProfile'] as const,
  userTeams: ['userTeams'] as const,
  
  // Chat API queries
  conversations: ['conversations'] as const,
  conversationDetails: (id: string) => ['conversations', id] as const,
  conversationHistory: (id: string, limit?: number, offset?: number) => 
    ['conversations', id, 'history', { limit, offset }] as const,
};

// ================================
// MAIN API HOOKS (Collections, User Data)
// ================================

/**
 * Get available collections for chat
 */
export const useCollections = () => {
  return useQuery({
    queryKey: queryKeys.collections,
    queryFn: mainApi.users.getCollections,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

/**
 * Get current user profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: mainApi.users.getMyProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Update user profile
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mainApi.users.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
    },
  });
};

// ================================
// CONVERSATION MANAGEMENT HOOKS
// ================================

/**
 * Create new conversation
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatApi.chat.createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
};

/**
 * List conversations
 */
export const useConversations = (params?: {
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.conversations, params],
    queryFn: () => chatApi.chat.listConversations(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get conversation details
 */
export const useConversationDetails = (conversationId: string | null) => {
  return useQuery({
    queryKey: queryKeys.conversationDetails(conversationId || ''),
    queryFn: () => chatApi.chat.getConversationDetails(conversationId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get conversation history
 */
export const useConversationHistory = (
  conversationId: string | null,
  limit = 50,
  offset = 0
) => {
  return useQuery({
    queryKey: queryKeys.conversationHistory(conversationId || '', limit, offset),
    queryFn: () => chatApi.chat.getConversationHistory(conversationId!, limit, offset),
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Update conversation status
 */
export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, request }: {
      conversationId: string;
      request: ConversationStatusUpdate;
    }) => chatApi.chat.updateConversationStatus(conversationId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversationDetails(variables.conversationId) 
      });
    },
  });
};

/**
 * Delete conversation
 */
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatApi.chat.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
};

/**
 * Update conversation title
 */
export const useUpdateConversationTitle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, title }: { conversationId: string; title: string }) =>
      chatApi.chat.updateConversationTitle(conversationId, title),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversationDetails(variables.conversationId) 
      });
    },
  });
};

// ================================
// CHAT MESSAGING HOOKS
// ================================

/**
 * Send regular chat message (non-streaming)
 */
export const useChatMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatApi.chat.chat,
    onSuccess: (_, variables) => {
      // Invalidate conversation history and list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversationHistory(variables.conversation_id) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
};

/**
 * Streaming chat hook with advanced state management
 */
export const useChatStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamChat = useCallback(async (
    request: ChatRequest,
    onComplete?: (messageId: string, fullMessage: string) => void
  ) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setIsStreaming(true);
    setStreamingMessage('');
    setError(null);
    setCurrentMessageId(null);

    const options = {
      onChunk: (chunk: StreamChunk) => {
        if (chunk.type === 'chunk' && chunk.content) {
          setStreamingMessage(prev => prev + chunk.content);
        }
      },
      onComplete: () => {
        setIsStreaming(false);
        // Invalidate related queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.conversationHistory(request.conversation_id) 
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
        
        if (onComplete) {
          onComplete(currentMessageId || '', streamingMessage);
        }
      },
      onError: (errorMessage: string) => {
        setError(errorMessage);
        setIsStreaming(false);
      }
    };

    try {
      await chatApi.chat.chatStream(request, options);
    } catch (error) {
      setError((error as Error).message || 'Failed to start stream');
      setIsStreaming(false);
    }
  }, [queryClient, currentMessageId, streamingMessage]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearMessage = useCallback(() => setStreamingMessage(''), []);

  return {
    streamChat,
    stopStream,
    isStreaming,
    streamingMessage,
    error,
    clearError,
    clearMessage,
  };
};

/**
 * Edit message hook
 */
export const useEditMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, messageId, newContent }: {
      conversationId: string;
      messageId: string;
      newContent: string;
    }) => chatApi.chat.editMessage(conversationId, messageId, newContent),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversationHistory(variables.conversationId) 
      });
    },
  });
};

/**
 * Regenerate message hook
 */
export const useRegenerateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, messageId }: {
      conversationId: string;
      messageId: string;
    }) => chatApi.chat.regenerateMessage(conversationId, messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversationHistory(variables.conversationId) 
      });
    },
  });
};

// ================================
// COMBINED CHAT INTERFACE HOOK
// ================================

/**
 * Combined hook for managing an active chat session
 */
export const useChatSession = (conversationId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  
  // Core queries
  const conversationQuery = useConversationDetails(conversationId);
  const historyQuery = useConversationHistory(conversationId);
  
  // Mutations
  const streamMutation = useChatStream();
  const editMutation = useEditMessage();
  const regenerateMutation = useRegenerateMessage();

  // Send message with optimistic update
  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;

    // Add optimistic user message
    const optimisticUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticUserMessage]);
    setOptimisticMessage('');

    // Start streaming AI response
    await streamMutation.streamChat(
      { conversation_id: conversationId, message: content },
      (messageId, fullMessage) => {
        // Replace optimistic message with actual response
        setOptimisticMessage(null);
        setMessages(prev => [
          ...prev,
          {
            id: messageId,
            conversation_id: conversationId,
            role: 'assistant',
            content: fullMessage,
            timestamp: new Date().toISOString(),
          }
        ]);
      }
    );
  }, [conversationId, streamMutation]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!conversationId) return;
    await editMutation.mutateAsync({ conversationId, messageId, newContent });
  }, [conversationId, editMutation]);

  // Regenerate message
  const regenerateMessage = useCallback(async (messageId: string) => {
    if (!conversationId) return;
    await regenerateMutation.mutateAsync({ conversationId, messageId });
  }, [conversationId, regenerateMutation]);

  // Update messages when history query changes
  const historyMessages = historyQuery.data?.messages || [];
  
  return {
    // Data
    conversation: conversationQuery.data,
    messages: [...historyMessages, ...messages],
    optimisticMessage,
    
    // Loading states
    isLoadingConversation: conversationQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    isStreaming: streamMutation.isStreaming,
    isEditing: editMutation.isPending,
    isRegenerating: regenerateMutation.isPending,
    
    // Actions
    sendMessage,
    editMessage,
    regenerateMessage,
    
    // Stream controls
    streamingMessage: streamMutation.streamingMessage,
    stopStream: streamMutation.stopStream,
    
    // Error handling
    error: streamMutation.error || editMutation.error || regenerateMutation.error,
    clearError: () => {
      streamMutation.clearError();
    },
    
    // Refetch functions
    refetchHistory: historyQuery.refetch,
    refetchConversation: conversationQuery.refetch,
  };
};

// ================================
// AUTH & USER HOOKS
// ================================

/**
 * Logout hook
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      // Call logout API
      await mainApi.auth.logout();
      
      // Clear client-side cache
      const queryClient = useQueryClient();
      queryClient.clear();
      
      // Redirect to login
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Force redirect even if API call fails
      window.location.href = '/login';
    },
  });
};

/**
 * Password change hook
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: mainApi.users.changePassword,
  });
};

// ================================
// UTILITY HOOKS
// ================================

/**
 * Message search hook (for searching within conversation history)
 */
export const useMessageSearch = (conversationId: string | null) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  
  const { data: historyData } = useConversationHistory(conversationId);
  
  const searchMessages = useCallback((query: string) => {
    if (!historyData?.messages || !query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = historyData.messages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  }, [historyData]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchMessages,
    clearSearch: () => {
      setSearchQuery('');
      setSearchResults([]);
    },
  };
};

/**
 * Typing indicator hook (for future real-time features)
 */
export const useTypingIndicator = (conversationId: string | null) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  return {
    isTyping,
    typingUsers,
    setIsTyping,
    setTypingUsers,
  };
};

/**
 * Message actions hook (copy, edit, regenerate)
 */
export const useMessageActions = () => {
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  return {
    copyToClipboard,
  };
};