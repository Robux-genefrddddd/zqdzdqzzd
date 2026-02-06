import { create } from "zustand";
import { Conversation, Message } from "@/types/index";
import {
  createMockChatProvider,
  createOpenRouterChatProvider,
} from "@/providers/chatProvider";

interface ChatState {
  // Data
  conversations: Conversation[];
  messages: Map<string, Message[]>;
  selectedConversationId: string | null;

  // UI State
  isGenerating: boolean;
  isSearching: boolean;
  searchQuery: string;
  darkMode: boolean;
  showMobileSidebar: boolean;

  // Actions
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  selectConversation: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleDarkMode: () => void;
  setShowMobileSidebar: (show: boolean) => void;
  setIsSearching: (searching: boolean) => void;
  loadFromStorage: () => void;

  // Chat actions
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  stopGenerating: () => void;
}

// Storage keys
const STORAGE_KEY_CONVERSATIONS = "pinpin_conversations";
const STORAGE_KEY_MESSAGES = "pinpin_messages";
const STORAGE_KEY_DARK_MODE = "pinpin_dark_mode";

// Utility functions for localStorage
const saveConversations = (conversations: Conversation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.warn("Failed to save conversations to localStorage", e);
  }
};

const saveMessages = (messages: Map<string, Message[]>) => {
  try {
    const messagesObj = Object.fromEntries(messages);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messagesObj));
  } catch (e) {
    console.warn("Failed to save messages to localStorage", e);
  }
};

const loadConversations = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn("Failed to load conversations from localStorage", e);
    return [];
  }
};

const loadMessages = (): Map<string, Message[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const messagesObj = stored ? JSON.parse(stored) : {};
    return new Map(Object.entries(messagesObj));
  } catch (e) {
    console.warn("Failed to load messages from localStorage", e);
    return new Map();
  }
};

const loadDarkMode = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DARK_MODE);
    return stored ? JSON.parse(stored) : true;
  } catch {
    return true;
  }
};

// Use OpenRouter if configured on server, otherwise use mock
const chatProvider = createOpenRouterChatProvider();

let currentAbortSignal: AbortSignal | null = null;

export const useChatStore = create<ChatState>((set, get) => {
  return {
    // Initial state
    conversations: [],
    messages: new Map(),
    selectedConversationId: null,
    isGenerating: false,
    isSearching: false,
    searchQuery: "",
    darkMode: true,
    showMobileSidebar: false,

    // Load data from storage on init
    loadFromStorage: () => {
      const conversations = loadConversations();
      const messages = loadMessages();
      const darkMode = loadDarkMode();

      set({
        conversations,
        messages,
        darkMode,
      });

      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },

    // Actions
    createConversation: () => {
      const id = `conv-${Date.now()}`;
      const conversation: Conversation = {
        id,
        title: "New Conversation",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set((state) => {
        const newConversations = [conversation, ...state.conversations];
        const newMessages = new Map(state.messages).set(id, []);

        // Save to localStorage
        saveConversations(newConversations);
        saveMessages(newMessages);

        return {
          conversations: newConversations,
          selectedConversationId: id,
          messages: newMessages,
        };
      });

      return id;
    },

    deleteConversation: (id: string) => {
      set((state) => {
        const newConversations = state.conversations.filter((c) => c.id !== id);
        const newMessages = new Map(state.messages);
        newMessages.delete(id);

        // Save to localStorage
        saveConversations(newConversations);
        saveMessages(newMessages);

        return {
          conversations: newConversations,
          messages: newMessages,
          selectedConversationId:
            state.selectedConversationId === id
              ? null
              : state.selectedConversationId,
        };
      });
    },

    renameConversation: (id: string, title: string) => {
      set((state) => {
        const newConversations = state.conversations.map((c) =>
          c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
        );

        // Save to localStorage
        saveConversations(newConversations);

        return {
          conversations: newConversations,
        };
      });
    },

    selectConversation: (id: string) => {
      set((state) => ({
        selectedConversationId: id,
        showMobileSidebar: false, // Hide sidebar on mobile when selecting
      }));
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    toggleDarkMode: () => {
      set((state) => {
        const newDarkMode = !state.darkMode;
        // Update DOM
        if (newDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }

        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY_DARK_MODE, JSON.stringify(newDarkMode));
        } catch (e) {
          console.warn("Failed to save dark mode preference", e);
        }

        return { darkMode: newDarkMode };
      });
    },

    setShowMobileSidebar: (show: boolean) => {
      set({ showMobileSidebar: show });
    },

    setIsSearching: (searching: boolean) => {
      set({ isSearching: searching });
    },

    sendMessage: async (conversationId: string, content: string) => {
      // Validate message size (limit to 10MB to prevent crashes)
      const maxMessageSize = 10 * 1024 * 1024; // 10MB
      if (new Blob([content]).size > maxMessageSize) {
        alert("Message trop volumineux. Limite: 10MB");
        return;
      }

      const state = get();
      if (!state.messages.has(conversationId)) {
        state.messages.set(conversationId, []);
      }

      // Add user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        role: "user",
        content,
        createdAt: Date.now(),
      };

      set((state) => {
        const newMessages = new Map(state.messages);
        newMessages.set(conversationId, [
          ...((newMessages.get(conversationId) as Message[]) || []),
          userMessage,
        ]);

        // Save to localStorage
        saveMessages(newMessages);

        return { messages: newMessages, isGenerating: true };
      });

      // Create abort controller for this generation
      const controller = new AbortController();
      currentAbortSignal = controller.signal;

      try {
        // Stream response from provider
        const generator = chatProvider.sendMessage(conversationId, content);
        let assistantMessageCreated = false;
        let updateBuffer = "";
        let lastUpdateTime = Date.now();
        let totalCharsStreamed = 0;

        for await (const chunk of generator) {
          if (currentAbortSignal?.aborted) {
            break;
          }

          // Limit total message size to prevent browser crashes
          totalCharsStreamed += chunk.chunk.length;
          if (totalCharsStreamed > 100000) {
            console.warn("Message exceeds maximum size limit");
            break;
          }

          // Buffer chunks for performance - batch updates with larger buffer
          updateBuffer += chunk.chunk;
          const now = Date.now();
          // Update every 200ms or when buffer reaches 2000 chars or on completion
          const shouldUpdate = now - lastUpdateTime > 200 || chunk.isComplete || updateBuffer.length >= 2000;

          if (!shouldUpdate) {
            continue; // Skip update, buffer more chunks
          }

          const chunkToProcess = updateBuffer;
          updateBuffer = "";
          lastUpdateTime = now;

          set((state) => {
            const newMessages = new Map(state.messages);
            const convMessages = newMessages.get(conversationId) || [];
            const updatedMessages = [...convMessages];

            // Create assistant message on first chunk
            if (!assistantMessageCreated && chunkToProcess) {
              assistantMessageCreated = true;
              const assistantMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                conversationId,
                role: "assistant",
                content: chunkToProcess,
                createdAt: Date.now(),
              };
              updatedMessages.push(assistantMessage);
            } else {
              // Update existing assistant message
              const lastMsg = updatedMessages[updatedMessages.length - 1];
              if (lastMsg && lastMsg.role === "assistant") {
                const newContent = lastMsg.content + chunkToProcess;
                updatedMessages[updatedMessages.length - 1] = {
                  ...lastMsg,
                  content: newContent,
                };
              }
            }

            newMessages.set(conversationId, updatedMessages);
            return { messages: newMessages };
          });
        }

        // Flush remaining buffer if any
        if (updateBuffer.length > 0) {
          set((state) => {
            const newMessages = new Map(state.messages);
            const convMessages = newMessages.get(conversationId) || [];
            const updatedMessages = [...convMessages];
            const lastMsg = updatedMessages[updatedMessages.length - 1];

            if (lastMsg && lastMsg.role === "assistant") {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMsg,
                content: lastMsg.content + updateBuffer,
              };
            }

            newMessages.set(conversationId, updatedMessages);

            // Save final message to localStorage
            saveMessages(newMessages);

            return { messages: newMessages };
          });
        }

        // Save to localStorage after streaming completes
        const finalState = get();
        saveMessages(finalState.messages);

        // Update conversation title if empty (first message)
        const conversations = get().conversations;
        const conversation = conversations.find((c) => c.id === conversationId);
        if (conversation && conversation.title === "New Conversation") {
          const titlePreview = content.substring(0, 30);
          get().renameConversation(conversationId, titlePreview);
        }
      } finally {
        set({ isGenerating: false });
      }
    },

    stopGenerating: () => {
      if (currentAbortSignal) {
        // Abort the current generation by preventing further updates
        // The async generator will check for abort and stop
        set({ isGenerating: false });
      }
    },
  };
});
