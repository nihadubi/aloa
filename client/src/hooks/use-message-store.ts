import { create } from "zustand";

export interface Message {
  id: string;
  content: string;
  fileUrl?: string | null;
  memberId: string;
  channelId: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    role: string;
    profile: {
      id: string;
      name: string;
      imageUrl: string;
      email: string;
    };
  };
}

interface MessageStore {
  messages: Record<string, Message[]>; // channelId -> messages
  setMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, message: Message) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  clearMessages: (channelId: string) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: {},
  setMessages: (channelId, messages) => set((state) => ({
    messages: { ...state.messages, [channelId]: messages }
  })),
  addMessage: (channelId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [channelId]: [...(state.messages[channelId] || []), message]
    }
  })),
  updateMessage: (channelId, messageId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [channelId]: (state.messages[channelId] || []).map((m) => m.id === messageId ? message : m)
    }
  })),
  deleteMessage: (channelId, messageId) => set((state) => ({
    messages: {
      ...state.messages,
      [channelId]: (state.messages[channelId] || []).filter((m) => m.id !== messageId)
    }
  })),
  clearMessages: (channelId) => set((state) => ({
    messages: { ...state.messages, [channelId]: [] }
  }))
}));
