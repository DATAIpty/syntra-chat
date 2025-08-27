import { createApiClient, handleApiError } from './auth-api-client';
import { UserLogin, LoginResponse } from '@/types';

const authService = {

    login: async (payload: UserLogin, accessToken?: string): Promise<LoginResponse> => {
        const apiClient = await createApiClient(accessToken);
        try {
            const response = await apiClient.post<LoginResponse>('/auth/login', payload);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Failed to login');
            throw error;
        }
    },

    logout: async (accessToken?: string): Promise<void> => {
        const apiClient = await createApiClient(accessToken);
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            handleApiError(error, 'Failed to logout');
            throw error;
        }
    },

    

}

export default authService;
