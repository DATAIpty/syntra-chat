// lib/api/users.ts
import { createApiClient, handleApiError } from './auth-api-client';
import { User, UserDetails, UserProfile, UserPasswordChange, TeamReference, SuccessResponse, Collection } from '@/types';

const usersService = {
  

  updateProfile: async (payload: UserProfile): Promise<User> => {
    const accessToken = undefined; 
    const apiClient = await createApiClient(accessToken);
    try {
      const response = await apiClient.put<User>('/users/me', payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update profile');
    }
  },

  getMyProfile: async (): Promise<UserDetails> => {
    const accessToken = undefined; 
    const apiClient = await createApiClient(accessToken);
    try {
      const response = await apiClient.get<UserDetails>('/users/me');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update user');
    }
  },

  getCollections: async (): Promise<Collection[]> => {
    const accessToken = undefined; 
    const apiClient = await createApiClient(accessToken);
    try {
      const response = await apiClient.get<Collection[]>('/collections/chat-accessible');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to get collections');
    }
  },


  /**
   * Change user password
   */
  changePassword: async (
    payload: UserPasswordChange
  ): Promise<SuccessResponse> => {
    const accessToken = undefined; 
    const apiClient = await createApiClient(accessToken);
    try {
      const response = await apiClient.post<SuccessResponse>('/users/me/change-password', payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to change password');
      throw error;
    }
  },

  /**
   * Get current user's teams
   */
  getMyTeams: async (): Promise<TeamReference[]> => {
    const accessToken = undefined; 
    const apiClient = await createApiClient(accessToken);
    try {
      const response = await apiClient.get<TeamReference[]>('/users/me/teams');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to get user teams');
      throw error;
    }
  },


  
};

export default usersService;