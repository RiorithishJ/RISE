export type Role = "user" | "rise"

export interface ChatMessage {
  id: string
  role: Role
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
}

export interface UserFacts {
  name: string
  location: string
  goal: string
  weakness: string
  year: string
  role: string
}
