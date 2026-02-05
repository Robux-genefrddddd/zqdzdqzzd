import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { Send, Square } from "lucide-react";

interface ComposerProps {
  conversationId: string | null;
}

export function Composer({ conversationId }: ComposerProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isGenerating = useChatStore((s) => s.isGenerating);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const stopGenerating = useChatStore((s) => s.stopGenerating);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        150
      ) + "px";
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!conversationId || !input.trim() || isGenerating) {
      return;
    }

    await sendMessage(conversationId, input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const quickPrompts = [
    "Explain quantum computing",
    "Write a short story",
    "How do I learn TypeScript?",
    "What's the weather like?",
  ];

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 md:px-6 lg:px-8 py-6 space-y-4">
      {/* Empty state with quick prompts */}
      {(conversationId && useChatStore((s) => s.messages.get(conversationId))?.length === 0) && (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
            Quick prompts
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setInput(prompt)}
                className="p-3 text-left text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              disabled={isGenerating || !conversationId}
              rows={1}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed max-h-36"
            />
          </div>

          {isGenerating ? (
            <button
              type="button"
              onClick={stopGenerating}
              className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
              aria-label="Stop generating"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || !conversationId}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Status */}
      {isGenerating && (
        <div className="max-w-3xl mx-auto flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Assistant is typing...
        </div>
      )}
    </div>
  );
}
