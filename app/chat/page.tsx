import type { Metadata } from "next"
import ChatPage from "./content"

export const metadata: Metadata = {
  title: "Syntra - Chat with AI",
  description:
    "Engage in intelligent conversations with Syntra's AI-powered chatbot. Experience seamless interactions and get instant responses to your queries.",
}

export default function Chat() {
  return <ChatPage  />
}