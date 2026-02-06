import { useChatStore } from "@/store/useChatStore";
import { AppLayout } from "@/layouts/AppLayout";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { useEffect, useRef } from "react";

export default function Index() {
  const selectedConversationId = useChatStore((s) => s.selectedConversationId);
  const conversations = useChatStore((s) => s.conversations);
  const createConversation = useChatStore((s) => s.createConversation);
  const darkMode = useChatStore((s) => s.darkMode);
  const isLoadingFromFirebase = useChatStore((s) => s.isLoadingFromFirebase);

  const hasInitialized = useRef(false);

  // Initialize app theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Create first conversation on mount if none exist (only after Firebase loads)
  useEffect(() => {
    if (
      !hasInitialized.current &&
      !isLoadingFromFirebase &&
      conversations.length === 0
    ) {
      hasInitialized.current = true;
      createConversation();
    }
  }, [isLoadingFromFirebase, conversations.length, createConversation]);

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <ChatHeader conversationId={selectedConversationId} />
        <MessageList conversationId={selectedConversationId} />
        <Composer conversationId={selectedConversationId} />
      </div>
    </AppLayout>
  );
}
