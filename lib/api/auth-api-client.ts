// lib/api/auth-api-client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// Define your base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_API_URL

if (!API_BASE_URL) {
  console.error('Environment variable NEXT_PUBLIC_MAIN_API_URL is not defined.')
  // In a production environment, you might want to crash the app or provide a fallback.
}

// Client-side token retrieval utility
export const getClientAccessToken = async (): Promise<string | null> => {
  // Only run on client side
  if (typeof window === 'undefined') return null

  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include', // Important: include cookies
    })

    if (!response.ok) {
      // Token not found or expired
      if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/login'
      }
      return null
    }

    const data = await response.json()
    return data.access_token || null
  } catch (error) {
    console.error('Failed to get access token:', error)
    return null
  }
}

// Function to create an Axios instance with automatic token handling
export async function createApiClient(accessToken?: string): Promise<AxiosInstance> {
  let token = accessToken

  // If no token provided and we're on the client side, try to get it
  if (!token && typeof window !== 'undefined') {
    const clientToken = await getClientAccessToken()
    token = clientToken ?? undefined
  }

  const instance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    timeout: 30000, // 30 seconds timeout
  })

  // Add a request interceptor for this specific instance
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Token is already set in default headers, but this allows for dynamic override
      if (accessToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
    },
    (error: any) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor with auth error handling
  instance.interceptors.response.use(
    (response: any) => response,
    async (error: AxiosError) => {
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.warn('Authentication failed - redirecting to login')
        
        // Only redirect on client side
        if (typeof window !== 'undefined') {
          // Optional: Try to refresh token one more time before redirecting
          const freshToken = await getClientAccessToken()
          if (!freshToken) {
            window.location.href = '/login'
          }
        }
      }
      
      return Promise.reject(error)
    }
  )

  return instance
}

// Synchronous version for cases where you already have a token
export function createApiClientSync(accessToken?: string): AxiosInstance {
  const instance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    timeout: 10000,
  })

  // Add request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
    },
    (error: any) => Promise.reject(error)
  )

  // Add response interceptor
  instance.interceptors.response.use(
    (response: any) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

/**
 * Handles Axios errors gracefully, logs them, and re-throws with a more user-friendly message.
 * @param error The AxiosError or any other error object.
 * @param defaultMessage A default message if the error is not from Axios or has no specific response.
 */
export function handleApiError(error: unknown, defaultMessage: string = 'An unexpected error occurred.'): never {
  if (axios.isAxiosError(error)) {
    const axiosError: AxiosError = error
    console.error(`API Error: ${defaultMessage}`)
    console.error('Error Details:', axiosError.response?.data || axiosError.message)

    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', axiosError.response.status)
      console.error('Data:', axiosError.response.data)
      console.error('Headers:', axiosError.response.headers)
      
      // Extract error message from response
      const responseData = axiosError.response.data as any
      const errorMessage = responseData?.detail || responseData?.message || responseData?.error || defaultMessage
      
      throw new Error(`${errorMessage}`)
    } else if (axiosError.request) {
      // The request was made but no response was received
      console.error('Network Error: No response from server. Please check your internet connection or API_BASE_URL.', axiosError.request)
      throw new Error('Network Error: No response from server. Please check your internet connection.')
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', axiosError.message)
      throw new Error(`Request Error: ${axiosError.message}`)
    }
  } else {
    console.error('Unknown error:', error)
    throw new Error(defaultMessage)
  }
}

// Utility function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getClientAccessToken()
    return !!token
  } catch {
    return false
  }
}

// Utility function to handle logout
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to clear server-side cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  } catch (error) {
    console.error('Error during logout:', error)
  } finally {
    // Redirect to login regardless
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}