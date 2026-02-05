import { Sparkles, Search } from "lucide-react";
import { memo } from "react";

function ThinkingIndicatorComponent() {
  return (
    <div className="flex mb-6 pr-4">
      <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-blue-500/20 ring-1 ring-blue-500/40 text-zinc-100 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold text-blue-200">Recherche sur internet...</div>
            <div className="flex gap-1 mt-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ThinkingIndicator = memo(ThinkingIndicatorComponent);
