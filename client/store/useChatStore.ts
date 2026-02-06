import { create } from "zustand";
import { Conversation, Message } from "@/types/index";
import {
  createMockChatProvider,
  createOpenRouterChatProvider,
} from "@/providers/chatProvider";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  isLoadingFromFirebase: boolean;

  // Actions
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  selectConversation: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleDarkMode: () => void;
  setShowMobileSidebar: (show: boolean) => void;
  setIsSearching: (searching: boolean) => void;
  loadFromFirebase: () => Promise<void>;

  // Chat actions
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  stopGenerating: () => void;
}

// Utility functions for Firestore persistence
const saveConversationsToFirebase = async (conversations: Conversation[]) => {
  try {
    for (const conv of conversations) {
      await setDoc(doc(db, "conversations", conv.id), {
        ...conv,
        updatedAt: new Date(conv.updatedAt),
        createdAt: new Date(conv.createdAt),
      });
    }
  } catch (e) {
    console.warn("Failed to save conversations to Firebase", e);
  }
};

const saveMessagesToFirebase = async (messages: Map<string, Message[]>) => {
  try {
    for (const [conversationId, msgs] of messages) {
      for (const msg of msgs) {
        await setDoc(doc(db, `conversations/${conversationId}/messages`, msg.id), {
          ...msg,
          createdAt: new Date(msg.createdAt),
        });
      }
    }
  } catch (e) {
    console.warn("Failed to save messages to Firebase", e);
  }
};

const loadConversationsFromFirebase = async (): Promise<Conversation[]> => {
  try {
    const q = query(collection(db, "conversations"), orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis?.() || Date.now(),
    })) as Conversation[];
  } catch (e) {
    console.warn("Failed to load conversations from Firebase", e);
    return [];
  }
};

const loadMessagesFromFirebase = async (
  conversationId: string
): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy("createdAt", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
    })) as Message[];
  } catch (e) {
    console.warn("Failed to load messages from Firebase", e);
    return [];
  }
};

const loadAllMessagesFromFirebase = async (
  conversations: Conversation[]
): Promise<Map<string, Message[]>> => {
  const messagesMap = new Map<string, Message[]>();
  try {
    for (const conv of conversations) {
      const messages = await loadMessagesFromFirebase(conv.id);
      messagesMap.set(conv.id, messages);
    }
  } catch (e) {
    console.warn("Failed to load all messages from Firebase", e);
  }
  return messagesMap;
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
    isLoadingFromFirebase: false,

    // Load data from Firebase (manual call, not automatic)
    loadFromFirebase: async () => {
      try {
        set({ isLoadingFromFirebase: true });

        // Load conversations
        const conversations = await loadConversationsFromFirebase();

        // Load all messages for all conversations
        const messages = await loadAllMessagesFromFirebase(conversations);

        // Load dark mode from localStorage (local preference)
        const darkMode = (() => {
          try {
            const stored = localStorage.getItem("pinpin_dark_mode");
            return stored ? JSON.parse(stored) : true;
          } catch {
            return true;
          }
        })();

        set({
          conversations,
          messages,
          darkMode,
          isLoadingFromFirebase: false,
        });

        if (darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {
        console.error("Failed to load from Firebase", e);
        set({ isLoadingFromFirebase: false });
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

        // Save to Firebase (async, don't wait)
        saveConversationsToFirebase(newConversations);

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

        // Delete from Firebase (async)
        (async () => {
          try {
            await deleteDoc(doc(db, "conversations", id));
          } catch (e) {
            console.warn("Failed to delete conversation from Firebase", e);
          }
        })();

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

        // Update in Firebase (async)
        (async () => {
          try {
            const convRef = doc(db, "conversations", id);
            await updateDoc(convRef, { title, updatedAt: new Date() });
          } catch (e) {
            console.warn("Failed to rename conversation in Firebase", e);
          }
        })();

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

        // Save dark mode preference to localStorage (client-side only)
        try {
          localStorage.setItem("pinpin_dark_mode", JSON.stringify(newDarkMode));
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

        // Save to Firebase (async)
        (async () => {
          try {
            await setDoc(
              doc(db, `conversations/${conversationId}/messages`, userMessage.id),
              {
                ...userMessage,
                createdAt: new Date(userMessage.createdAt),
              }
            );
          } catch (e) {
            console.warn("Failed to save user message to Firebase", e);
          }
        })();

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

            // Save to Firebase (async)
            if (assistantMessageCreated) {
              const assistantMsg = updatedMessages[updatedMessages.length - 1];
              if (assistantMsg) {
                (async () => {
                  try {
                    await setDoc(
                      doc(db, `conversations/${conversationId}/messages`, assistantMsg.id),
                      {
                        ...assistantMsg,
                        createdAt: new Date(assistantMsg.createdAt),
                      }
                    );
                  } catch (e) {
                    console.warn("Failed to save assistant message to Firebase", e);
                  }
                })();
              }
            }

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

              // Save final message to Firebase
              (async () => {
                try {
                  await setDoc(
                    doc(db, `conversations/${conversationId}/messages`, lastMsg.id),
                    {
                      ...updatedMessages[updatedMessages.length - 1],
                      createdAt: new Date(lastMsg.createdAt),
                    }
                  );
                } catch (e) {
                  console.warn("Failed to save final message to Firebase", e);
                }
              })();
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
