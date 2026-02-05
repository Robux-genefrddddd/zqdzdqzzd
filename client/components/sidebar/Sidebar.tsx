import { useChatStore } from "@/store/useChatStore";
import { ConversationList } from "./ConversationList";
import { Plus, LogOut, User, Settings } from "lucide-react";

export function Sidebar() {
  const createConversation = useChatStore((s) => s.createConversation);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/70">
        <h2 className="text-sm font-semibold text-zinc-100 mb-4">
          PinPinIA
        </h2>
        <button
          onClick={createConversation}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900/40 border border-zinc-800/70 text-zinc-200 rounded-xl hover:bg-zinc-900/60 active:scale-[0.98] transition-all font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
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
      <div className="border-t border-zinc-800/70 p-4 space-y-2">
        {/* Settings */}
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/40 active:scale-[0.98] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
          <span>Settings</span>
          <Settings className="w-4 h-4" />
        </button>

        {/* Account */}
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/40 active:scale-[0.98] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
          <span>Account</span>
          <User className="w-4 h-4" />
        </button>

        {/* Logout */}
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 active:scale-[0.98] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40">
          <span>Logout</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
