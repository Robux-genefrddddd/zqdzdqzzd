import { useChatStore } from "@/store/useChatStore";
import { ConversationItem } from "./ConversationItem";
import { Search } from "lucide-react";

export function ConversationList() {
  const conversations = useChatStore((s) => s.conversations);
  const searchQuery = useChatStore((s) => s.searchQuery);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group conversations by date
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;

  const today = filteredConversations.filter(
    (c) => now - c.updatedAt < oneDayMs,
  );
  const yesterday = filteredConversations.filter(
    (c) => now - c.updatedAt >= oneDayMs && now - c.updatedAt < 2 * oneDayMs,
  );
  const sevenDays = filteredConversations.filter(
    (c) => now - c.updatedAt >= 2 * oneDayMs && now - c.updatedAt < sevenDaysMs,
  );
  const older = filteredConversations.filter(
    (c) => now - c.updatedAt >= sevenDaysMs,
  );

  const groups = [
    { label: "Today", items: today },
    { label: "Yesterday", items: yesterday },
    { label: "Previous 7 days", items: sevenDays },
    { label: "Older", items: older },
  ];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 rounded-xl text-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Conversations grouped by date */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No conversations yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Create one with the button above
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) =>
            group.items.length > 0 ? (
              <div key={group.label}>
                <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-2 mb-2">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                    />
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
