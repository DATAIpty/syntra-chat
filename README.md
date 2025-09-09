# Syntra Chat

A modern, real-time chat application built with Next.js, React Query, and FastAPI. Features streaming responses, conversation management, and intelligent message handling with optimistic updates.

## Features

- **Real-time Streaming Chat** - Streaming responses with live typing indicators
- **Conversation Management** - Create, organize, and search conversations
- **Optimistic Updates** - Instant UI feedback with proper state synchronization
- **Independent Scrolling** - Sidebar and chat area scroll independently
- **Message Actions** - Copy, edit, and regenerate messages
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Theme Support** - Dark/light mode toggle
- **Authentication** - Secure user authentication and session management

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React Query (TanStack Query)** - Server state management
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Client state management
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend Integration
- **FastAPI** - Python REST API
- **Server-Sent Events** - Real-time streaming responses
- **RESTful API** - Standard HTTP methods for CRUD operations

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chat/              # Main chat interface
│   └── login/             # Authentication pages
├── components/            # Reusable UI components
│   ├── chat/              # Chat-specific components
│   ├── layout/            # Layout components
│   ├── modals/            # Modal dialogs
│   └── ui/                # Base UI components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication management
│   ├── useChat.ts         # Chat functionality
│   └── useAppState.ts     # Global app state
├── lib/                   # Utilities and configurations
│   └── api/               # API client and endpoints
├── types/                 # TypeScript type definitions
└── styles/                # Global styles and Tailwind config
```

## Key Components

### Chat Management
- **useChatSession** - Core chat functionality with streaming support
- **useConversationManager** - Conversation CRUD operations
- **MessageBubble** - Individual message rendering with actions
- **ChatSidebar** - Conversation list and navigation

### State Management
- **React Query** - Server state, caching, and synchronization
- **Zustand** - Client-side UI state (sidebar, modals, etc.)
- **Optimistic Updates** - Immediate UI feedback for better UX

### API Integration
- **chatApi** - RESTful endpoints for conversations and messages
- **Streaming Support** - Server-sent events for real-time responses
- **Error Handling** - Comprehensive error boundaries and retry logic

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd syntra-chat
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
MAIN_API_URL=https://syntra-main-api-production.up.railway.app/api
NEXT_PUBLIC_MAIN_API_URL=https://syntra-main-api-production.up.railway.app/api
CHAT_API_URL=http://127.0.0.1:8004/
NEXT_PUBLIC_CHAT_API_URL=http://127.0.0.1:8004/
NEXT_PUBLIC_CHAT_API_KEY=your_public_api_key_here
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

The application integrates with these key API endpoints:

### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/logout` - Session termination

### Conversations
- `GET /conversations` - List user conversations
- `POST /conversations` - Create new conversation
- `GET /conversations/{id}` - Get conversation details
- `GET /conversations/{id}/history` - Get conversation history
- `PUT /conversations/{id}` - Update conversation title
- `DELETE /conversations/{id}` - Delete conversation

### Chat
- `POST /chat` - Send message (supports streaming)
- `PUT /conversations/{id}/messages/{messageId}` - Edit message
- `POST /conversations/{id}/messages/{messageId}/regenerate` - Regenerate response

## Key Features Implementation

### Streaming Chat
```typescript
// Streaming is handled through Server-Sent Events
const streamChat = useCallback(async (request, onComplete) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: true })
  });
  
  const reader = response.body?.getReader();
  // Process streaming chunks...
});
```

### Optimistic Updates
```typescript
// Messages appear instantly, then sync with server
const sendMessage = useCallback(async (content) => {
  // 1. Show optimistic message immediately
  setOptimisticMessages([userMsg, aiMsg]);
  
  // 2. Stream actual response
  await streamMutation.streamChat(request);
  
  // 3. Replace with server data when complete
  queryClient.invalidateQueries({ queryKey: historyKeys });
});
```

### Independent Scrolling
```typescript
// Separate scroll containers for sidebar and chat
<div className="flex h-screen overflow-hidden">
  <div className="w-80 overflow-y-auto">
    {/* Sidebar with independent scroll */}
  </div>
  <div className="flex-1 overflow-y-auto">
    {/* Chat area with independent scroll */}
  </div>
</div>
```

## Configuration

### Conversation Settings
- **Personality Types** - Different AI personalities
- **Role Types** - Specialized assistant roles
- **Collections** - Document collections for RAG
- **Custom Instructions** - User-defined behavior
- **Response Tone** - Formal, casual, friendly, etc.

### Chat Behavior
- **Streaming** - Real-time response generation
- **Context Turns** - Number of previous messages to include
- **Auto-scroll** - Smart scrolling with user override detection
- **Message Actions** - Copy, edit, regenerate functionality

## Performance Optimizations

### React Query Caching
- **Stale Time** - 30 seconds for conversation history
- **Cache Time** - 5 minutes for inactive data
- **Background Refetch** - Disabled for better UX
- **Optimistic Updates** - Instant UI feedback

### State Management
- **Memoized Computations** - useMemo for expensive operations
- **Callback Optimization** - useCallback for event handlers
- **Selective Re-renders** - Targeted state updates

### UI Performance
- **Virtual Scrolling** - For large conversation lists
- **Debounced Search** - Prevent excessive API calls
- **Loading States** - Skeleton screens and indicators

## Troubleshooting

### Common Issues

**Messages disappearing after sending:**
- Check streaming endpoint returns proper completion signals
- Verify conversation turns are saved in database
- Ensure cache invalidation happens after turn saving

**Scroll behavior problems:**
- Verify scroll containers have proper overflow settings
- Check auto-scroll logic doesn't interfere with manual scrolling
- Ensure scroll anchors are properly positioned

**Authentication issues:**
- Verify API keys and endpoints are configured
- Check cookie settings for session persistence
- Confirm user permissions for conversation access

**State synchronization:**
- Check React Query cache keys are unique and consistent
- Verify optimistic updates are properly cleared
- Ensure error boundaries handle failed requests

### Debug Tools

**Development Logging:**
```typescript
// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Conversation changed:', { from, to });
}
```

**React Query Devtools:**
```typescript
// Add to your app for query inspection
import { ReactQueryDevtools } from '@tanstack/react-query-devtool