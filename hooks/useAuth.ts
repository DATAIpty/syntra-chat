// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mainApi } from '@/lib/api';
import { useCollections, useCreateConversation, useConversations, useDeleteConversation } from './useChat';
import { User, UserLogin } from '@/types';
import { CreateConversationRequest } from '@/types/chat';
import React from 'react';

// ================================
// AUTH CONTEXT
// ================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ================================
// AUTH PROVIDER
// ================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Get user from cookie on mount
  useEffect(() => {
    const getUserFromCookie = () => {
      try {
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('syntra_chat_user='));
        
        if (userCookie) {
          const userJson = decodeURIComponent(userCookie.split('=')[1]);
          const userData = JSON.parse(userJson);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to parse user cookie:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUserFromCookie();
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: UserLogin) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();
      setUser(result.user);
      return result;
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
      
      // Clear local state
      setUser(null);
      queryClient.clear();
      
      // Redirect to login
      window.location.href = '/login';
    },
  });

  const refreshUser = () => {
    // Re-read user from cookie
    try {
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('syntra_chat_user='));
      
      if (userCookie) {
        const userJson = decodeURIComponent(userCookie.split('=')[1]);
        const userData = JSON.parse(userJson);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshUser,
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

// ================================
// AUTH HOOK
// ================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ================================
// ADDITIONAL AUTH UTILITIES
// ================================

/**
 * Hook to check if user has specific permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.is_admin || false,
    canCreateConversations: true, // All authenticated users can create conversations
    canDeleteConversations: true, // All users can delete their own conversations
    canManageTeams: user?.is_admin || false,
  };
};

/**
 * Hook for protected routes (can be used in components)
 */
export const useProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
};

/**
 * User profile management hook
 */
export const useUserProfile = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: mainApi.users.updateProfile,
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  return {
    user,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
  };
};