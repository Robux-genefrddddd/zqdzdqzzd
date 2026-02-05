import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { MessageBubble } from "./MessageBubble";
import { ChevronDown } from "lucide-react";

interface MessageListProps {
  conversationId: string | null;
}

export function MessageList({ conversationId }: MessageListProps) {
  const messagesMap = useChatStore((s) => s.messages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messages = conversationId ? messagesMap.get(conversationId) || [] : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setShowScrollButton(false);
    }
  }, [messages]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setShowScrollButton(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Select a conversation from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden">
      {/* Messages Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Start chatting
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Send your first message below to begin
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <button
            onClick={scrollToBottom}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="text-sm">New messages</span>
          </button>
        </div>
      )}
    </div>
  );
}
