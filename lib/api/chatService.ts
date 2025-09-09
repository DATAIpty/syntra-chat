// lib/api/chatService.ts
import { createApiClient, handleApiError } from "./chat-api-client";
import {
  CreateConversationRequest,
  CreateConversationResponse,
  ChatRequest,
  ChatResponse,
  ConversationListResponse,
  ConversationHistory,
  ConversationStatusUpdate,
  StreamChunk,
  ConversationDetails,
} from "@/types/chat";

export interface ChatStreamOptions {
  onChunk: (chunk: StreamChunk) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

const chatService = {
  /**
   * Create a new conversation
   */
  createConversation: async (
    payload: CreateConversationRequest
  ): Promise<CreateConversationResponse> => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.post<CreateConversationResponse>(
        "/conversations",
        payload
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to create conversation");
    }
  },

  /**
   * Send a chat message (non-streaming)
   */
  chat: async (payload: ChatRequest): Promise<ChatResponse> => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.post<ChatResponse>("/chat", {
        ...payload,
        stream: false,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to send message");
    }
  },

  /**
   * Send a streaming chat message
   */
  chatStream: async (
    payload: ChatRequest,
    options: ChatStreamOptions
  ): Promise<void> => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL;
      const API_KEY = process.env.NEXT_PUBLIC_CHAT_API_KEY;

      const response = await fetch(`${API_BASE_URL}chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY && { "x-api-key": API_KEY }),
        },
        body: JSON.stringify({
          ...payload,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Stream request failed" }));
        options.onError(errorData.detail || "Stream request failed");
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        options.onError("Stream not available");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            options.onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                options.onComplete();
                return;
              }

              try {
                const chunk = JSON.parse(data);
                options.onChunk({ type: "chunk", content: chunk });
              } catch (e) {
                // Handle partial chunks
                if (data.trim()) {
                  options.onChunk({ type: "chunk", content: data });
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      options.onError((error as Error).message || "Streaming failed");
    }
  },

  /**
   * List conversations
   */
  listConversations: async (params?: {
    status?: string;
    user_id: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<ConversationListResponse> => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.get<ConversationListResponse>(
        "/conversations",
        { params }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to list conversations");
    }
  },

  /**
   * Get conversation details
   */
  getConversationDetails: async (
    conversationId: string,
    userId: string
  ): Promise<ConversationDetails> => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.get<ConversationDetails>(
        `/conversations/${conversationId}`,
      { params: { user_id: userId } }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to get conversation details");
    }
  },

  /**
   * Get conversation history
   */
  getConversationHistory: async (
    conversationId: string,
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<ConversationHistory> => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.get<ConversationHistory>(
        `/conversations/${conversationId}/history`,
        { params: { user_id: userId, limit, offset } }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to get conversation history");
    }
  },

  /**
   * Update conversation status
   */
  updateConversationStatus: async (
    conversationId: string,
    payload: ConversationStatusUpdate
  ): Promise<void> => {
    const apiClient = await createApiClient();
    try {
      await apiClient.put(`/conversations/${conversationId}/status`, payload);
    } catch (error) {
      handleApiError(error, "Failed to update conversation status");
    }
  },

  /**
   * Delete conversation
   */
  deleteConversation: async (conversationId: string): Promise<void> => {
    const apiClient = await createApiClient();
    try {
      await apiClient.delete(`/conversations/${conversationId}`);
    } catch (error) {
      handleApiError(error, "Failed to delete conversation");
    }
  },

  /**
   * Update conversation title
   */
  updateConversationTitle: async (
    conversationId: string,
    title: string
  ): Promise<void> => {
    const apiClient = await createApiClient();
    try {
      await apiClient.put(`/conversations/${conversationId}`, { title });
    } catch (error) {
      handleApiError(error, "Failed to update conversation title");
    }
  },

  /**
   * Regenerate last AI message
   */
  regenerateMessage: async (
    conversationId: string,
    messageId: string
  ): Promise<ChatResponse> => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.post<ChatResponse>(
        `/conversations/${conversationId}/messages/${messageId}/regenerate`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to regenerate message");
    }
  },

  /**
   * Edit a user message
   */
  editMessage: async (
    conversationId: string,
    messageId: string,
    newContent: string
  ): Promise<ChatResponse> => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.put<ChatResponse>(
        `/conversations/${conversationId}/messages/${messageId}`,
        { content: newContent }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to edit message");
    }
  },

  /**
   * Get personalities (if supported by chat API)
   */
  getPersonalities: async () => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.get("/personalities");
      return response.data.personalities;
    } catch (error) {
      console.warn("Personalities not available from chat API:", error);
      return [
        {
          id: "professional",
          name: "Professional Assistant",
          description: "formal, clear, and structured",
        },
        {
          id: "friendly",
          name: "Friendly Assistant",
          description: "warm, conversational, and encouraging",
        },
        {
          id: "analytical",
          name: "Analytical Expert",
          description: "logical, methodical, and evidence-based",
        },
        {
          id: "creative",
          name: "Creative Thinker",
          description: "imaginative, innovative, and inspiring",
        },
        {
          id: "concise",
          name: "Concise Communicator",
          description: "brief, direct, and efficient",
        },
        {
          id: "detailed",
          name: "Detailed Expert",
          description: "comprehensive, thorough, and explanatory",
        },
        {
          id: "casual",
          name: "Casual Helper",
          description: "relaxed, informal, and approachable",
        },
        {
          id: "formal",
          name: "Formal Advisor",
          description: "formal, respectful, and dignified",
        },
        {
          id: "expert",
          name: "Domain Expert",
          description: "authoritative, knowledgeable, and expert-level",
        },
        {
          id: "mentor",
          name: "Wise Mentor",
          description: "patient, guiding, and thoughtful",
        },
        {
          id: "helpful_guide",
          name: "Helpful Guide",
          description:
            "patient, clear, and supportive with step-by-step guidance",
        },
        {
          id: "university_expert",
          name: "University Information Expert",
          description: "knowledgeable, precise, and student-focused",
        },
      ];
    }
  },

  /**
   * Get roles (if supported by chat API)
   */
  getRoles: async () => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.get("/roles");
      return response.data.roles;
    } catch (error) {
      console.warn("Roles not available from chat API:", error);
      return [
        {
          id: "general_assistant",
          expertise: [
            "general knowledge",
            "problem solving",
            "information retrieval",
            "task assistance",
          ],
          domain: "Generalist with broad knowledge across multiple domains",
        },
        {
          id: "financial_analyst",
          expertise: [
            "financial analysis",
            "market trends",
            "investment strategies",
            "risk assessment",
            "financial modeling",
          ],
          domain:
            "Expert in finance, accounting, economics, market analysis, and investment strategies",
        },
        {
          id: "technical_consultant",
          expertise: [
            "software development",
            "system architecture",
            "technical documentation",
            "troubleshooting",
            "best practices",
          ],
          domain:
            "Expert in technology, software engineering, system design, and technical problem-solving",
        },
        {
          id: "data_scientist",
          expertise: [
            "data analysis",
            "machine learning",
            "statistical modeling",
            "data visualization",
            "predictive analytics",
          ],
          domain:
            "Expert in statistics, machine learning, data science, analytics, and quantitative methods",
        },
        {
          id: "business_advisor",
          expertise: [
            "strategy",
            "operations",
            "market analysis",
            "business development",
            "organizational management",
          ],
          domain:
            "Expert in business strategy, operations management, market analysis, and organizational development",
        },
        {
          id: "research_assistant",
          expertise: [
            "research methodology",
            "information synthesis",
            "academic writing",
            "literature review",
            "data collection",
          ],
          domain:
            "Expert in research methods, academic standards, information analysis, and knowledge synthesis",
        },
        {
          id: "marketing_specialist",
          expertise: [
            "brand strategy",
            "digital marketing",
            "customer engagement",
            "market research",
            "campaign development",
          ],
          domain:
            "Expert in marketing strategy, brand management, customer psychology, and digital marketing",
        },
        {
          id: "legal_advisor",
          expertise: [
            "legal analysis",
            "compliance",
            "risk assessment",
            "contract review",
            "regulatory guidance",
          ],
          domain:
            "Knowledgeable in legal principles, compliance frameworks, and regulatory requirements (not a substitute for qualified legal counsel)",
        },
        {
          id: "hr_consultant",
          expertise: [
            "human resources",
            "talent management",
            "organizational development",
            "employee relations",
            "policy development",
          ],
          domain:
            "Expert in human resources, organizational psychology, talent management, and workplace dynamics",
        },
        {
          id: "project_manager",
          expertise: [
            "project planning",
            "resource management",
            "risk management",
            "stakeholder communication",
            "process optimization",
          ],
          domain:
            "Expert in project management methodologies, resource planning, and organizational coordination",
        },
        {
          id: "sales_specialist",
          expertise: [
            "sales strategy",
            "customer relationship management",
            "lead generation",
            "negotiation",
            "revenue optimization",
          ],
          domain:
            "Expert in sales methodologies, customer psychology, revenue management, and business development",
        },
        {
          id: "customer_success",
          expertise: [
            "customer satisfaction",
            "user experience",
            "support processes",
            "retention strategies",
            "success metrics",
          ],
          domain:
            "Expert in customer success management, user experience design, and customer relationship optimization",
        },
        {
          id: "product_manager",
          expertise: [
            "product strategy",
            "user research",
            "feature prioritization",
            "market analysis",
            "product development",
          ],
          domain:
            "Expert in product management, user experience, market analysis, and product development lifecycle",
        },
        {
          id: "student_advisor",
          expertise: [
            "enrollment processes",
            "course registration",
            "academic requirements",
            "degree planning",
            "academic policies",
            "student support services",
            "financial aid",
            "scholarship information",
            "academic deadlines",
            "graduation requirements",
            "transfer credits",
            "academic appeals",
          ],
          domain:
            "Expert in academic advising, university policies, degree requirements, enrollment processes, and student support services",
        },
        {
          id: "university_info_desk",
          expertise: [
            "university policies",
            "enrollment procedures",
            "tuition and fees",
            "payment plans",
            "financial aid",
            "scholarships",
            "campus services",
            "housing information",
            "dining plans",
            "parking permits",
            "student ID cards",
            "library services",
            "campus facilities",
            "important dates and deadlines",
            "contact information",
          ],
          domain:
            "Comprehensive knowledge of university operations, student services, administrative procedures, costs, deadlines, and campus resources",
        },
      ];
    }
  },
};

export default chatService;
