import { useChatStore } from "@/store/useChatStore";
import { MoreVertical, Copy, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";

interface ChatHeaderProps {
  conversationId: string | null;
}

export function ChatHeader({ conversationId }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const conversations = useChatStore((s) => s.conversations);
  const renameConversation = useChatStore((s) => s.renameConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);

  const conversation = conversations.find((c) => c.id === conversationId);

  if (!conversationId || !conversation) {
    return (
      <div className="h-16 border-b border-zinc-800/70 flex items-center justify-center">
        <p className="text-sm text-zinc-400">
          Select or create a conversation
        </p>
      </div>
    );
  }

  const handleRename = () => {
    if (newTitle.trim()) {
      renameConversation(conversationId, newTitle.trim());
      setIsRenaming(false);
      setShowMenu(false);
    }
  };

  const handleDelete = () => {
    deleteConversation(conversationId);
    setShowMenu(false);
  };

  return (
    <div className="h-16 border-b border-zinc-800/70 flex items-center justify-between px-6">
      {isRenaming ? (
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            autoFocus
            className="flex-1 px-3 py-1 bg-zinc-900/40 border border-zinc-800/70 text-zinc-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleRename}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-lg font-semibold text-zinc-100">{conversation.title}</h1>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-zinc-800/40 active:scale-[0.98] rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-zinc-900/80 border border-zinc-800/70 rounded-xl shadow-lg z-10 overflow-hidden backdrop-blur ring-1 ring-zinc-700/30">
                <button
                  onClick={() => {
                    setNewTitle(conversation.title);
                    setIsRenaming(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 active:scale-[0.98] transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                >
                  <Edit2 className="w-4 h-4" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.href}`);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 active:scale-[0.98] transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                >
                  <Copy className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 active:scale-[0.98] transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
