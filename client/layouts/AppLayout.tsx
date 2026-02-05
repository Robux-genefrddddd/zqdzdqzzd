import { useChatStore } from "@/store/useChatStore";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Menu, X } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const showMobileSidebar = useChatStore((s) => s.showMobileSidebar);
  const setShowMobileSidebar = useChatStore((s) => s.setShowMobileSidebar);

  return (
    <div className="h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Desktop Layout */}
      <div className="hidden md:grid h-full grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="border-r border-zinc-200/60 dark:border-zinc-800 bg-white/90 backdrop-blur dark:bg-zinc-900/80">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex flex-col overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-50 dark:from-zinc-950 dark:to-zinc-950">
          {children}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Header with Menu Button */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800 bg-white/90 backdrop-blur dark:bg-zinc-900/80">
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            aria-label="Toggle sidebar"
          >
            {showMobileSidebar ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <h1 className="font-semibold">Chat</h1>
        </div>

        {/* Sidebar Drawer */}
        {showMobileSidebar && (
          <div
            className="absolute inset-0 bg-black/50 z-40"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}
        {showMobileSidebar && (
          <div className="absolute top-14 left-0 right-0 bottom-0 bg-white/90 backdrop-blur dark:bg-zinc-900/80 z-50 border-r border-zinc-200/60 dark:border-zinc-800 overflow-y-auto">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-50 dark:from-zinc-950 dark:to-zinc-950">
          {children}
        </div>
      </div>
    </div>
  );
}
