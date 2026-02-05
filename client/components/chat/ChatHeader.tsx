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
      <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
    <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6">
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
            className="flex-1 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleRename}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-lg font-semibold">{conversation.title}</h1>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setNewTitle(conversation.title);
                    setIsRenaming(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition text-left"
                >
                  <Edit2 className="w-4 h-4" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.href}`
                    );
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition text-left"
                >
                  <Copy className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
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
