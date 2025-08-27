// lib/api/client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// Define your base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL
const accessToken = process.env.NEXT_PUBLIC_CHAT_API_KEY

if (!API_BASE_URL) {
  console.error('Environment variable NEXT_PUBLIC_MAIN_API_URL is not defined.')
  // In a production environment, you might want to crash the app or provide a fallback.
}



// Function to create an Axios instance with automatic token handling
export async function createApiClient(): Promise<AxiosInstance> {
  let token = accessToken

  const instance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `x-api-key ${token}` }),
    },
    timeout: 30000, // 30 seconds timeout
  })

  // Add a request interceptor for this specific instance
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Token is already set in default headers, but this allows for dynamic override
      if (accessToken && !config.headers.Authorization) {
        config.headers.Authorization = `x-api-key ${accessToken}`
      }
      return config
    },
    (error: any) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor with error handling
  instance.interceptors.response.use(
    (response: any) => response,
    async (error: AxiosError) => {
      
      
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

