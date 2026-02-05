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
          className="flex-1 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleRename}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group relative px-3 py-2 rounded-lg cursor-pointer transition ${
        isSelected
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}
      onClick={() => selectConversation(conversation.id)}
    >
      <div className="flex items-start gap-3 justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{conversation.title}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-10 min-w-max">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition text-left"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
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
