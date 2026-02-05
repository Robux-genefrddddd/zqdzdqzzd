import { useChatStore } from "@/store/useChatStore";
import { ConversationList } from "./ConversationList";
import { Plus, LogOut, User, Settings } from "lucide-react";

export function Sidebar() {
  const createConversation = useChatStore((s) => s.createConversation);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          ChatGPT-like
        </h2>
        <button
          onClick={createConversation}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition font-medium text-sm"
          aria-label="Create new conversation"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search and Conversations */}
      <div className="flex-1 overflow-y-auto">
        <ConversationList />
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200/60 dark:border-zinc-800 p-4 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          aria-label="Toggle dark mode"
        >
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Settings */}
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition">
          <span>Settings</span>
          <Settings className="w-4 h-4" />
        </button>

        {/* Account */}
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition">
          <span>Account</span>
          <User className="w-4 h-4" />
        </button>

        {/* Logout */}
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl transition">
          <span>Logout</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
