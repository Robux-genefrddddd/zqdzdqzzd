import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { ChevronDown } from "lucide-react";

interface MessageListProps {
  conversationId: string | null;
}

export function MessageList({ conversationId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Use a selector that returns stable value (just count)
  const messageCount = useChatStore(
    (s) => (conversationId ? s.messages.get(conversationId)?.length ?? 0 : 0),
    (a, b) => a === b // Compare previous and current, only trigger if count actually changed
  );

  const isGenerating = useChatStore((s) => s.isGenerating);

  // Get the actual messages array
  const messages = useChatStore((s) =>
    conversationId ? s.messages.get(conversationId) || [] : []
  );

  // Smooth auto-scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const targetScroll = scrollContainer.scrollHeight;

      // Smooth scroll instead of instant
      scrollContainer.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
      setShowScrollButton(false);
    }
  };

  // Auto-scroll when messages change or AI is generating
  useEffect(() => {
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (messageCount > 0 || isGenerating) {
      // Delay scroll to ensure DOM has updated
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom();
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messageCount, isGenerating]);

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
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="mx-auto rounded-2xl bg-zinc-900/40 p-8 ring-1 ring-zinc-800/70 backdrop-blur text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2 text-zinc-100">Start a conversation</h2>
          <p className="text-sm text-zinc-400">
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
            <div className="mx-auto mt-24 max-w-md rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800/70 backdrop-blur">
              <div className="text-base font-semibold text-zinc-100">Start chatting</div>
              <div className="mt-1 text-sm text-zinc-400">
                Send your first message below to begin
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Explain quantum computing", "Write a short story", "How do I learn TypeScript?", "What's the weather like?"]
                  .map(t => (
                    <button key={t}
                      onClick={() => {
                        // Trigger composer focus and set input
                        const event = new CustomEvent('setComposerInput', { detail: t });
                        window.dispatchEvent(event);
                      }}
                      className="rounded-xl bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 ring-1 ring-zinc-800/70 hover:bg-zinc-900/50 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    >
                      {t}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
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
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 rounded-full shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition text-sm font-medium"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-4 h-4" />
            <span>New messages</span>
          </button>
        </div>
      )}
    </div>
  );
}
