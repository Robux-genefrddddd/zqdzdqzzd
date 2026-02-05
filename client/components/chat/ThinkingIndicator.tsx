import { Zap, Globe } from "lucide-react";
import { memo } from "react";

function ThinkingIndicatorComponent() {
  return (
    <div className="flex mb-6 pr-4 animate-in fade-in duration-300">
      <div className="max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-5 py-4 rounded-2xl bg-gradient-to-br from-blue-600/40 via-blue-500/30 to-cyan-500/20 ring-1.5 ring-blue-500/50 text-zinc-100 shadow-lg">
        {/* Animated background accent */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 to-transparent pointer-events-none" />

        <div className="relative flex items-start gap-4">
          {/* Icons */}
          <div className="flex gap-2 pt-0.5">
            <Globe className="w-5 h-5 text-blue-300 animate-pulse" />
            <Zap className="w-5 h-5 text-cyan-300 animate-bounce" style={{ animationDelay: "100ms" }} />
          </div>

          {/* Text content */}
          <div className="flex-1">
            <div className="text-sm font-semibold text-blue-100 mb-2">Recherche sur internet...</div>
            <div className="text-xs text-blue-200 mb-3">L'IA analyse les informations et réfléchit à la meilleure réponse</div>

            {/* Loading dots */}
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ThinkingIndicator = memo(ThinkingIndicatorComponent);
