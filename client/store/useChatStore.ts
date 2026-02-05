import { create } from "zustand";
import { Conversation, Message } from "@/types/index";
import { createMockChatProvider, createOpenRouterChatProvider } from "@/providers/chatProvider";

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

  // Chat actions
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  stopGenerating: () => void;
}

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

    // Actions
    createConversation: () => {
      const id = `conv-${Date.now()}`;
      const conversation: Conversation = {
        id,
        title: "New Conversation",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set((state) => ({
        conversations: [conversation, ...state.conversations],
        selectedConversationId: id,
        messages: new Map(state.messages).set(id, []),
      }));

      return id;
    },

    deleteConversation: (id: string) => {
      set((state) => {
        const newConversations = state.conversations.filter((c) => c.id !== id);
        const newMessages = new Map(state.messages);
        newMessages.delete(id);

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
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
        ),
      }));
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
        return { messages: newMessages, isGenerating: true };
      });

      // Create abort controller for this generation
      const controller = new AbortController();
      currentAbortSignal = controller.signal;

      try {
        // Stream response from provider
        const generator = chatProvider.sendMessage(conversationId, content);
        let isSearching = false;
        let assistantMessageCreated = false;
        let updateBuffer = "";
        let lastUpdateTime = Date.now();
        let totalContent = ""; // Track all content received

        for await (const chunk of generator) {
          if (currentAbortSignal?.aborted) {
            break;
          }

          // Buffer chunks for performance - batch updates
          updateBuffer += chunk.chunk;
          totalContent += chunk.chunk;
          const now = Date.now();
          const shouldUpdate = now - lastUpdateTime > 150 || chunk.isComplete; // Update every 150ms max to avoid crash

          if (!shouldUpdate && updateBuffer.length < 1000) {
            continue; // Skip update, buffer more chunks (up to 1000 chars)
          }

          const chunkToProcess = updateBuffer;
          updateBuffer = "";
          lastUpdateTime = now;

          // Detect if AI is searching on internet at the beginning
          const startsWithSearch = totalContent.toLowerCase().trim().startsWith("je vais chercher sur internet");

          // Stop showing search indicator once we have more content
          const hasMoreContent = totalContent.toLowerCase().length > "je vais chercher sur internet".length + 10;

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

              // Set searching if starts with search phrase
              if (startsWithSearch) {
                isSearching = true;
                return { messages: newMessages, isSearching: true };
              }
            } else {
              // Update existing assistant message
              const lastMsg = updatedMessages[updatedMessages.length - 1];
              if (lastMsg && lastMsg.role === "assistant") {
                const newContent = lastMsg.content + chunkToProcess;
                updatedMessages[updatedMessages.length - 1] = {
                  ...lastMsg,
                  content: newContent,
                };

                // If was searching and now has more content, stop showing search indicator
                if (isSearching && hasMoreContent) {
                  isSearching = false;
                  newMessages.set(conversationId, updatedMessages);
                  return { messages: newMessages, isSearching: false };
                }
              }
            }

            newMessages.set(conversationId, updatedMessages);
            return { messages: newMessages, isSearching };
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
            return { messages: newMessages };
          });
        }

        // Update conversation title if empty (first message)
        const conversations = get().conversations;
        const conversation = conversations.find((c) => c.id === conversationId);
        if (conversation && conversation.title === "New Conversation") {
          const titlePreview = content.substring(0, 30);
          get().renameConversation(conversationId, titlePreview);
        }
      } finally {
        set({ isGenerating: false, isSearching: false });
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
