import { useChatStore } from "@/store/useChatStore";
import { AppLayout } from "@/layouts/AppLayout";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { useEffect } from "react";

export default function Index() {
  const selectedConversationId = useChatStore((s) => s.selectedConversationId);
  const conversations = useChatStore((s) => s.conversations);
  const createConversation = useChatStore((s) => s.createConversation);
  const darkMode = useChatStore((s) => s.darkMode);

  // Initialize app theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, [darkMode]);

  // Create first conversation on mount if none exist
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    }
  }, [conversations.length, createConversation]);

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
