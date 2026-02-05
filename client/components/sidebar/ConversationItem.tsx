import { useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { Conversation } from "@/types/index";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);

  const selectedConversationId = useChatStore((s) => s.selectedConversationId);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);

  const isSelected = selectedConversationId === conversation.id;

  const handleRename = () => {
    if (newTitle.trim()) {
      renameConversation(conversation.id, newTitle.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    deleteConversation(conversation.id);
    setShowMenu(false);
  };

  if (isRenaming) {
    return (
      <div className="px-2 py-2 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") {
              setIsRenaming(false);
              setNewTitle(conversation.title);
            }
          }}
          autoFocus
          className="flex-1 px-2 py-1 bg-zinc-900/40 border border-zinc-800/70 text-zinc-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button
          onClick={handleRename}
          className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 active:scale-[0.95] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group relative px-3 py-2 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
        isSelected
          ? "bg-zinc-900/30 text-zinc-100 ring-1 ring-blue-500/20 hover:bg-zinc-900/50"
          : "text-zinc-300 hover:bg-zinc-800/40 ring-1 ring-transparent hover:ring-zinc-800/70"
      }`}
      onClick={() => selectConversation(conversation.id)}
    >
      <div className="flex items-start gap-3 justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{conversation.title}</p>
          <p className={`text-xs ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}>
            {new Date(conversation.updatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-zinc-700/60 active:scale-[0.95] rounded transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-zinc-900/80 border border-zinc-800/70 rounded-xl shadow-lg z-10 min-w-max overflow-hidden backdrop-blur ring-1 ring-zinc-700/30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 active:scale-[0.98] transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 active:scale-[0.98] transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
