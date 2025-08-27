export interface UserLogin {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Tokens {
  accessToken: string;
  expires_in: number;
}

/// User Profile Updates
export interface UserProfile {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'member' | 'super_admin';
  avatar_url?: string;
  last_login_at?: string;
  email_verified_at?: string;
  is_active: boolean;
  full_name: string;
  initials: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserDetails extends User {
  organization?: OrganizationReference | null;
  teams?: TeamReference[];
  team_count: number;
}

export interface UserReference {
  id: string;
  name: string;
  email: string;
}

export interface TeamReference {
  id: string;
  name: string;
}

export interface UserPasswordChange {
  current_password: string;
  new_password: string;
}

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  conversationId: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  collections: string[]
  personality?: string
  role?: string
  createdAt: Date
  updatedAt: Date
}

export interface Collection {
  id: string
  name: string
  description?: string
  documentCount: number
}

export interface PersonalityType {
  id: string
  name: string
  description: string
}

export interface RoleType {
  id: string
  name: string
  description: string
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  account_type: 'individual' | 'organization';
  billing_email?: string;
  storage_limit_gb: number;
  user_limit: number;
  is_active: boolean;
  subscription_tier: string;
  user_count: number;
  team_count: number;
  collection_count: number;
  storage_used_gb: number;
  storage_used_mb: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationReference {
  id: string;
  name: string;
  slug: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  document_count: number;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  user_permission: 'read' | 'write' | 'admin';
  is_ready: boolean;
}

export interface SuccessResponse {
  message: string;
}
