import { Sparkles } from "lucide-react";

export function ThinkingIndicator() {
  return (
    <div className="flex mb-6">
      <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl bg-zinc-900/40 ring-1 ring-zinc-800/70 text-zinc-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm text-zinc-300 ml-1">Recherche et réflexion en cours...</span>
        </div>
      </div>
    </div>
  );
}
