// types/chat.ts

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tokens_used?: number;
    processing_time?: number;
    edited?: boolean;
    regenerated?: boolean;
    tools_used?: string[];
    sources?: string[];
  };
}

export interface CreateConversationRequest {
  title: string;
  collection_names: string[];
  user_id: string;
  personality_type?: string;
  role_type?: string;
  custom_role?: string;
  communication_style?: string;
  expertise_areas?: string[];
  response_tone?: string;
  custom_instructions?: string;
  use_tools?: boolean;
  max_context_turns?: number;
  temperature?: number;
  max_tokens?: number;
}

export interface CreateConversationResponse {
  conversation_id: string;
  title: string;
  status: string;
  created_at: string;
  configuration: {
    collection_names: string[];
    personality_type: string;
    role_type: string;
    custom_role?: string;
    communication_style: string;
    expertise_areas: string[];
    response_tone: string;
    custom_instructions?: string;
    use_tools: boolean;
    max_context_turns: number;
    temperature: number;
    max_tokens: number;
  };
}

export interface ChatRequest {
  conversation_id: string;
  message: string;
  stream?: boolean;
  context?: {
    previous_messages?: number;
    include_system_context?: boolean;
  };
}

export interface ChatResponse {
  message_id: string;
  content: string;
  role: 'assistant';
  timestamp: string;
  metadata?: {
    model: string;
    tokens_used: number;
    processing_time: number;
    sources?: string[];
  };
}

export interface ConversationListItem {
  conversation_id: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  last_activity: string;
  total_turns: number;
  created_at: string;
  collection_names: string[];
  personality_type: string;
  role_type: string;
  topic_summary?: string;
}

export interface ConversationListResponse {
  conversations: ConversationListItem[];
  total_count: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface History {
  turn_id: string;
  user_message: string;
  assistant_response: string;
  timestamp: string;
  response_time_ms: number;
  sources_count: number;
  tools_used: string[];
}

export interface ConversationHistory {
  history: History[];
  total_shown: number;
  page: number;
  limit: number;
  has_more: boolean;
  conversation_id: string;
}

export interface ConversationDetails {
  id: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
  configuration: {
    collection_names: string[];
    personality_type: string;
    role_type: string;
    custom_role?: string;
    communication_style: string;
    expertise_areas: string[];
    response_tone: string;
    custom_instructions?: string;
    use_tools: boolean;
    max_context_turns: number;
    temperature: number;
    max_tokens: number;
  };
  message_count: number;
  last_message_at?: string;
}

export interface ConversationStatusUpdate {
  status: 'active' | 'archived' | 'deleted';
}

export interface StreamChunk {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  error?: string;
  metadata?: {
    tokens_used?: number;
    processing_time?: number;
  };
}

// Personality and Role options (might come from main API)
export interface PersonalityOption {
  id: string;
  name: string;
  description: string;
}

export interface RoleOption {
  id: string;
  expertise: string[];
  domain: string;
}

export interface PersonalitiesResponse {
  personalities: PersonalityOption[];
  total_count: number;
  description?: string;
  usage?: string;
}

export interface RolesResponse {
  roles: RoleOption[];
  total_count: number;
  description?: string;
  usage?: string;
}