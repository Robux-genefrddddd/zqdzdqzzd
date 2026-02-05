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
        <div className="relative flex flex-col overflow-hidden bg-zinc-950">
          {/* Background with radial highlight */}
          <div className="pointer-events-none absolute inset-0">
            {/* Radial gradient highlight */}
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_-20%,rgba(255,255,255,0.08),transparent_60%)]" />
            {/* Micro noise overlay */}
            <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
          </div>
          {/* Content */}
          <div className="relative flex flex-col h-full overflow-hidden">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full relative">
        {/* Background with radial highlight */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Radial gradient highlight */}
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_-20%,rgba(255,255,255,0.08),transparent_60%)]" />
          {/* Micro noise overlay */}
          <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
        </div>

        {/* Header with Menu Button */}
        <div className="relative z-10 flex items-center gap-3 px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800 bg-white/90 backdrop-blur dark:bg-zinc-900/80">
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors active:scale-[0.99]"
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
        <div className="relative z-0 flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
