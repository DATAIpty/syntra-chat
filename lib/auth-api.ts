// Placeholder auth API functions
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  organization: string
  avatar?: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

// Mock auth functions - replace with actual API calls
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock validation
  if (credentials.email === "demo@syntra.com" && credentials.password === "demo123") {
    return {
      user: {
        id: "1",
        name: "Demo User",
        email: "demo@syntra.com",
        organization: "Syntra Demo Corp",
        avatar: undefined,
      },
      token: "mock-jwt-token",
    }
  }

  throw new Error("Invalid credentials")
}

export async function logout(): Promise<void> {
  // Clear auth state
  localStorage.removeItem("syntra-auth-token")
  localStorage.removeItem("syntra-user")
}

export function getStoredAuth(): { user: AuthUser; token: string } | null {
  try {
    const token = localStorage.getItem("syntra-auth-token")
    const userStr = localStorage.getItem("syntra-user")

    if (token && userStr) {
      return {
        token,
        user: JSON.parse(userStr),
      }
    }
  } catch (error) {
    console.error("Error reading stored auth:", error)
  }

  return null
}

export function storeAuth(auth: AuthResponse): void {
  localStorage.setItem("syntra-auth-token", auth.token)
  localStorage.setItem("syntra-user", JSON.stringify(auth.user))
}
