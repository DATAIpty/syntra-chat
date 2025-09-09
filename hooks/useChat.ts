// hooks/useChat.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { mainApi, chatApi } from '@/lib/api';
import {
  CreateConversationRequest,
  ChatRequest,
  ConversationStatusUpdate,
  StreamChunk,
  ChatMessage,
  History,
} from '@/types/chat';
import { Collection } from '@/types';
import { useAuth } from './useAuth';

export const convertHistoryToChatMessages = (history: History[], conversationId: string): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  
  history.forEach((turn) => {
    // Add user message
    messages.push({
      id: `${turn.turn_id}-user`,
      conversation_id: conversationId,
      role: 'user',
      content: turn.user_message,
      timestamp: turn.timestamp,
      metadata: {
        processing_time: turn.response_time_ms,
      }
    });
    
    // Add assistant message
    messages.push({
      id: `${turn.turn_id}-assistant`,
      conversation_id: conversationId,
      role: 'assistant',
      content: turn.assistant_response,
      timestamp: turn.timestamp,
      metadata: {
        processing_time: turn.response_time_ms,
        sources: turn.sources_count > 0 ? [`${turn.sources_count} sources`] : undefined,
        tools_used: turn.tools_used.length > 0 ? turn.tools_used : undefined,
      }
    });
  });
  
  return messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

// ================================
// QUERY KEYS
// ================================
export const queryKeys = {
  collections: ['collections'] as const,
  userProfile: ['userProfile'] as const,
  userTeams: ['userTeams'] as const,
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
  user_id: string;
  limit?: number;
  offset?: number;
  search?: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [...queryKeys.conversations, params],
    queryFn: () => chatApi.chat.listConversations(params),
    enabled: params?.enabled !== false && !!params?.user_id, // Only run if enabled and user_id exists
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get conversation details
 */
export const useConversationDetails = (conversationId: string | null, userId: string | null) => {
  return useQuery({
    queryKey: queryKeys.conversationDetails(conversationId || ''),
    queryFn: () => chatApi.chat.getConversationDetails(conversationId!, userId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get conversation history
 */
export const useConversationHistory = (
  conversationId: string | null,
  userId: string | null,
  limit = 50,
  offset = 0
) => {
  return useQuery({
    queryKey: queryKeys.conversationHistory(conversationId || '', limit, offset),
    queryFn: async () => {
      if (!conversationId || !userId) {
        throw new Error('ConversationId and userId are required');
      }
      
      console.log(`Fetching history for conversation: ${conversationId}`);
      return await chatApi.chat.getConversationHistory(conversationId, userId, limit, offset);
    },
    enabled: !!conversationId && !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch on mount
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      console.error(`History fetch failed (attempt ${failureCount}):`, error);
      return failureCount < 3;
    },
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
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStreamingMessage('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const streamChat = useCallback(async (
    request: ChatRequest,
    onComplete?: (messageId: string, fullMessage: string) => void
  ) => {
    // Cancel any existing stream
    cleanup();

    abortControllerRef.current = new AbortController();
    
    setIsStreaming(true);
    setStreamingMessage('');
    setError(null);

    let accumulatedMessage = '';

    const options = {
      onChunk: (chunk: StreamChunk) => {
        if (chunk.type === 'chunk' && chunk.content) {
          accumulatedMessage += chunk.content;
          setStreamingMessage(accumulatedMessage);
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
          // Use accumulated message instead of state to avoid stale closure
          onComplete('generated-message-id', accumulatedMessage);
        }
        
        // Clear streaming message after completion
        setTimeout(() => {
          setStreamingMessage('');
        }, 100);
      },
      onError: (errorMessage: string) => {
        setError(errorMessage);
        setIsStreaming(false);
        setStreamingMessage('');
      }
    };

    try {
      await chatApi.chat.chatStream(request, options);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to start stream';
      setError(errorMessage);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  }, [queryClient, cleanup]);

  const stopStream = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const clearError = useCallback(() => setError(null), []);

  return {
    streamChat,
    stopStream,
    isStreaming,
    streamingMessage,
    error,
    clearError,
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
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const auth = useAuth();
  const queryClient = useQueryClient();
  
  // Track the current conversation ID to detect changes
  const prevConversationId = useRef<string | null>(null);
  
  // Core queries
  const conversationQuery = useConversationDetails(conversationId, auth.user?.id || null);
  const historyQuery = useConversationHistory(conversationId, auth.user?.id || null);
  
  // Mutations
  const streamMutation = useChatStream();
  const editMutation = useEditMessage();
  const regenerateMutation = useRegenerateMessage();

  // Clear optimistic messages when conversation changes
  useEffect(() => {
    if (conversationId !== prevConversationId.current) {
      console.log(`Conversation changed from ${prevConversationId.current} to ${conversationId}`);
      
      // Clear optimistic state
      setOptimisticMessages([]);
      setIsStreaming(false);
      
      // Force refetch history for the new conversation
      if (conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.conversationHistory(conversationId) 
        });
      }
      
      prevConversationId.current = conversationId;
    }
  }, [conversationId, queryClient]);

  // Clear optimistic messages when fresh data arrives from server
  useEffect(() => {
    if (historyQuery.data?.history && optimisticMessages.length > 0 && !isStreaming) {
      console.log('Fresh history data received, checking if we can clear optimistic messages');
      
      // Convert server history to check if our optimistic messages are now in the server data
      const serverMessages = convertHistoryToChatMessages(historyQuery.data.history, conversationId || '');
      
      // Check if we have any optimistic user messages that might now be in server data
      const optimisticUserMessages = optimisticMessages.filter(msg => msg.role === 'user');
      
      if (optimisticUserMessages.length > 0) {
        // Check if ALL optimistic user messages are now in server data
        const allOptimisticInServer = optimisticUserMessages.every(optimisticMsg => 
          serverMessages.some(serverMsg => 
            serverMsg.role === 'user' && 
            serverMsg.content.trim() === optimisticMsg.content.trim()
          )
        );
        
        if (allOptimisticInServer) {
          console.log('All optimistic messages found in server data, clearing optimistic state');
          setOptimisticMessages([]);
        }
      }
    }
  }, [historyQuery.data, optimisticMessages, isStreaming, conversationId]);

  // Monitor streaming state changes
  useEffect(() => {
    setIsStreaming(streamMutation.isStreaming);
    
    // When streaming stops, trigger a refresh after a short delay
    if (!streamMutation.isStreaming && isStreaming) {
      console.log('Streaming stopped, scheduling history refresh');
      setTimeout(() => {
        if (conversationId) {
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.conversationHistory(conversationId) 
          });
        }
      }, 500); // Wait 500ms for the server to process
    }
  }, [streamMutation.isStreaming, isStreaming, conversationId, queryClient]);

  // Send message with simpler optimistic update
  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return;

    const trimmedContent = content.trim();
    const timestamp = new Date().toISOString();
    
    // Create optimistic messages
    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: trimmedContent,
      timestamp: timestamp,
    };

    const aiMessage: ChatMessage = {
      id: `temp-ai-${Date.now()}`,
      conversation_id: conversationId,
      role: 'assistant',
      content: '',
      timestamp: timestamp,
    };

    // Add optimistic messages
    setOptimisticMessages([userMessage, aiMessage]);
    setIsStreaming(true);

    try {
      await streamMutation.streamChat(
        { 
          conversation_id: conversationId, 
          message: trimmedContent 
        }
        // Remove the onComplete callback - let useEffect handle cache management
      );
    } catch (error) {
      console.error('Stream error:', error);
      // Clear optimistic state on error
      setOptimisticMessages([]);
      setIsStreaming(false);
      throw error;
    }
  }, [conversationId, streamMutation]);

  // Update optimistic AI message content during streaming
  useEffect(() => {
    if (streamMutation.streamingMessage && optimisticMessages.length > 0) {
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.role === 'assistant' ? { ...msg, content: streamMutation.streamingMessage } : msg
        )
      );
    }
  }, [streamMutation.streamingMessage, optimisticMessages.length]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!conversationId) return;
    
    try {
      await editMutation.mutateAsync({ conversationId, messageId, newContent });
      
      // Force refetch history after edit
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversationHistory(conversationId) 
      });
    } catch (error) {
      console.error('Edit message failed:', error);
      throw error;
    }
  }, [conversationId, editMutation, queryClient]);

  // Regenerate message
  const regenerateMessage = useCallback(async (messageId: string) => {
    if (!conversationId) return;
    
    try {
      await regenerateMutation.mutateAsync({ conversationId, messageId });
      
      // Force refetch history after regenerate
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversationHistory(conversationId) 
      });
    } catch (error) {
      console.error('Regenerate message failed:', error);
      throw error;
    }
  }, [conversationId, regenerateMutation, queryClient]);

  // Combine server messages with optimistic messages - FIXED LOGIC
  const allMessages = useMemo(() => {
    // Convert History objects to ChatMessage format
    const serverMessages = historyQuery.data?.history 
      ? convertHistoryToChatMessages(historyQuery.data.history, conversationId || '') 
      : [];
    
    // Always start with server messages
    let messagesToShow = [...serverMessages];
    
    // Add optimistic messages only if:
    // 1. We have optimistic messages
    // 2. AND we're still streaming OR the optimistic messages aren't in server data yet
    if (optimisticMessages.length > 0) {
      if (isStreaming) {
        // If streaming, always show optimistic messages
        messagesToShow = [...serverMessages, ...optimisticMessages];
      } else {
        // If not streaming, only show optimistic messages that aren't in server data
        const optimisticNotInServer = optimisticMessages.filter(optimisticMsg => 
          !serverMessages.some(serverMsg => 
            serverMsg.role === optimisticMsg.role && 
            serverMsg.content.trim() === optimisticMsg.content.trim()
          )
        );
        
        if (optimisticNotInServer.length > 0) {
          messagesToShow = [...serverMessages, ...optimisticNotInServer];
        }
      }
    }
    
    // Sort by timestamp to ensure proper order
    return messagesToShow.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [historyQuery.data?.history, optimisticMessages, conversationId, isStreaming]);

  // Force refresh function
  const forceRefreshHistory = useCallback(async () => {
    if (conversationId) {
      console.log('Force refreshing history...');
      setOptimisticMessages([]); // Clear optimistic state
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversationHistory(conversationId) 
      });
      await queryClient.refetchQueries({ 
        queryKey: queryKeys.conversationHistory(conversationId) 
      });
      console.log('Force refresh completed');
    }
  }, [conversationId, queryClient]);
  
  return {
    // Data
    conversation: conversationQuery.data,
    messages: allMessages,
    
    // Loading states
    isLoadingConversation: conversationQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    isStreaming: isStreaming,
    isEditing: editMutation.isPending,
    isRegenerating: regenerateMutation.isPending,
    
    // Actions
    sendMessage,
    editMessage,
    regenerateMessage,
    forceRefreshHistory,
    
    // Stream controls
    streamingMessage: streamMutation.streamingMessage,
    stopStream: () => {
      streamMutation.stopStream();
      setOptimisticMessages([]);
      setIsStreaming(false);
    },
    
    // Error handling
    error: streamMutation.error || editMutation.error || regenerateMutation.error || historyQuery.error,
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
  const auth = useAuth();
  
  const { data: historyData } = useConversationHistory(conversationId, auth.user?.id || null);
  
  const searchMessages = useCallback((query: string) => {
    if (!historyData?.history || !query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Convert history to chat messages and then search
    const chatMessages = convertHistoryToChatMessages(historyData.history, conversationId || '');
    const results = chatMessages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  }, [historyData?.history, conversationId]);

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