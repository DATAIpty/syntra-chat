// hooks/useAppState.ts
import { CreateConversationRequest } from '@/types/chat';
import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuth } from './useAuth';
import { useConversations, useCreateConversation, useDeleteConversation, useUpdateConversationTitle, useCollections } from './useChat';

// ================================
// APP UI STATE STORE
// ================================

interface AppState {
  // UI State
  sidebarOpen: boolean;
  activeConversationId: string | null;
  isNewConversationModalOpen: boolean;
  isUserSettingsModalOpen: boolean;
  
  // Chat State
  messageInput: string;
  isComposing: boolean;
  editingMessageId: string | null;
  
  // Search State
  conversationSearch: string;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveConversation: (id: string | null) => void;
  setNewConversationModalOpen: (open: boolean) => void;
  setUserSettingsModalOpen: (open: boolean) => void;
  setMessageInput: (input: string) => void;
  setIsComposing: (composing: boolean) => void;
  setEditingMessageId: (id: string | null) => void;
  setConversationSearch: (search: string) => void;
  
  // Reset functions
  resetChatState: () => void;
  resetUIState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      activeConversationId: null,
      isNewConversationModalOpen: false,
      isUserSettingsModalOpen: false,
      messageInput: '',
      isComposing: false,
      editingMessageId: null,
      conversationSearch: '',
      
      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setActiveConversation: (id) => set({ 
        activeConversationId: id,
        messageInput: '', // Clear input when switching conversations
        editingMessageId: null,
      }),
      setNewConversationModalOpen: (open) => set({ isNewConversationModalOpen: open }),
      setUserSettingsModalOpen: (open) => set({ isUserSettingsModalOpen: open }),
      setMessageInput: (input) => set({ messageInput: input }),
      setIsComposing: (composing) => set({ isComposing: composing }),
      setEditingMessageId: (id) => set({ editingMessageId: id }),
      setConversationSearch: (search) => set({ conversationSearch: search }),
      
      // Reset functions
      resetChatState: () => set({
        messageInput: '',
        isComposing: false,
        editingMessageId: null,
      }),
      resetUIState: () => set({
        sidebarOpen: true,
        isNewConversationModalOpen: false,
        isUserSettingsModalOpen: false,
        conversationSearch: '',
      }),
    }),
    {
      name: 'syntra-chat-state',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);

// ================================
// CONVERSATION MANAGEMENT HOOK
// ================================

export const useConversationManager = () => {
  const { 
    activeConversationId, 
    setActiveConversation,
    setNewConversationModalOpen,
    conversationSearch 
  } = useAppStore();
  
  const { 
    data: conversations,
    isLoading: isLoadingConversations,
    refetch: refetchConversations 
  } = useConversations();

  const createConversationMutation = useCreateConversation();
  const deleteConversationMutation = useDeleteConversation();
  const updateTitleMutation = useUpdateConversationTitle();
  
  const createAndSelectConversation = async (request: CreateConversationRequest) => {
    try {
      const response = await createConversationMutation.mutateAsync(request);
      setActiveConversation(response.conversation_id);
      setNewConversationModalOpen(false);
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  const deleteConversation = async (conversationId: string) => {
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
      
      // If we're deleting the active conversation, clear the selection
      if (activeConversationId === conversationId) {
        setActiveConversation(null);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      await updateTitleMutation.mutateAsync({ conversationId, title });
    } catch (error) {
      throw error;
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations?.conversations.filter(conv =>
    conv.title.toLowerCase().includes(conversationSearch.toLowerCase()) ||
    (conv.preview && conv.preview.toLowerCase().includes(conversationSearch.toLowerCase()))
  ) || [];

  return {
    // Data
    conversations: filteredConversations,
    activeConversationId,
    isLoadingConversations,
    
    // Actions
    setActiveConversation,
    createAndSelectConversation,
    deleteConversation,
    updateConversationTitle,
    refetchConversations,
    
    // Loading states
    isCreating: createConversationMutation.isPending,
    isDeleting: deleteConversationMutation.isPending,
    isUpdatingTitle: updateTitleMutation.isPending,
    
    // Errors
    createError: createConversationMutation.error,
    deleteError: deleteConversationMutation.error,
    updateError: updateTitleMutation.error,
  };
};

// ================================
// MOBILE RESPONSIVE HOOK
// ================================

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};

// ================================
// SIDEBAR MANAGEMENT HOOK
// ================================

export const useSidebar = () => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useAppStore();
  const { isMobile } = useMobileDetection();
  
  // Auto-close sidebar on mobile when selecting conversation
  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  return {
    isOpen: sidebarOpen,
    setOpen: setSidebarOpen,
    toggle: toggleSidebar,
    closeSidebarOnMobile,
    shouldOverlay: isMobile, // Whether sidebar should overlay content
  };
};

// ================================
// KEYBOARD SHORTCUTS HOOK
// ================================

export const useKeyboardShortcuts = () => {
  const { toggleSidebar, setNewConversationModalOpen } = useAppStore();
  
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSidebar();
      }
      
      // Cmd/Ctrl + N: New conversation
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setNewConversationModalOpen(true);
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        setNewConversationModalOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [toggleSidebar, setNewConversationModalOpen]);
};

// ================================
// COMBINED APP HOOK
// ================================

/**
 * Master hook that provides all app state and functionality
 */
export const useApp = () => {
  const auth = useAuth();
  const appStore = useAppStore();
  const conversationManager = useConversationManager();
  const sidebar = useSidebar();
  const collectionsQuery = useCollections();
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  
  return {
    // Auth state
    auth,
    
    // UI state
    ui: {
      sidebar,
      newConversationModal: {
        isOpen: appStore.isNewConversationModalOpen,
        setOpen: appStore.setNewConversationModalOpen,
      },
      userSettingsModal: {
        isOpen: appStore.isUserSettingsModalOpen,
        setOpen: appStore.setUserSettingsModalOpen,
      },
    },
    
    // Chat state
    chat: {
      ...conversationManager,
      messageInput: appStore.messageInput,
      setMessageInput: appStore.setMessageInput,
      isComposing: appStore.isComposing,
      setIsComposing: appStore.setIsComposing,
      editingMessageId: appStore.editingMessageId,
      setEditingMessageId: appStore.setEditingMessageId,
    },
    
    // Data
    collections: collectionsQuery.data || [],
    isLoadingCollections: collectionsQuery.isLoading,
    collectionsError: collectionsQuery.error,
    
    // Search
    search: {
      query: appStore.conversationSearch,
      setQuery: appStore.setConversationSearch,
    },
  };
};