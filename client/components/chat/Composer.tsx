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
  const messagesMap = useChatStore((s) => s.messages);
  const messages = conversationId ? messagesMap.get(conversationId) : undefined;

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
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

  // Listen for suggestion button clicks
  useEffect(() => {
    const handleSetInput = (e: any) => {
      setInput(e.detail);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    };

    window.addEventListener('setComposerInput', handleSetInput);
    return () => window.removeEventListener('setComposerInput', handleSetInput);
  }, []);

  return (
    <div className="sticky bottom-0 z-10">
      {/* Gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-zinc-950 to-transparent" />

      {/* Composer Container */}
      <div className="relative mx-auto w-full max-w-3xl px-4 md:px-6 lg:px-8 pb-6 pt-4">
        <div className="rounded-2xl bg-zinc-900/50 ring-1 ring-zinc-800/70 shadow-lg backdrop-blur p-4 space-y-4">
          {/* Message Input */}
          <form onSubmit={handleSubmit}>
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
                  className="w-full resize-none rounded-2xl bg-zinc-950/40 px-4 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-500 ring-1 ring-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed max-h-36 transition-all"
                />
              </div>

              {isGenerating ? (
                <button
                  type="button"
                  onClick={stopGenerating}
                  className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 active:scale-[0.99] transition-all flex items-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                  aria-label="Stop generating"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || !conversationId}
                  className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Status */}
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-zinc-400 px-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Assistant is typing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
