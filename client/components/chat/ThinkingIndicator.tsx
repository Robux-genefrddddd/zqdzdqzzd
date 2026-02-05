import { Sparkles } from "lucide-react";
import { memo } from "react";

function ThinkingIndicatorComponent() {
  return (
    <div className="flex mb-6 pr-4">
      <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl bg-blue-600/20 ring-1 ring-blue-500/30 text-zinc-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-200">Recherche sur internet et réflexion...</span>
        </div>
      </div>
    </div>
  );
}

export const ThinkingIndicator = memo(ThinkingIndicatorComponent);
