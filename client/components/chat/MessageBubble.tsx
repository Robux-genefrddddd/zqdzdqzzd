import { Message } from "@/types/index";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 pr-4 ${!isUser ? "pl-0" : ""}`}
    >
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl leading-relaxed transition-all ${
          isUser
            ? "bg-blue-600 text-white shadow-lg"
            : "bg-zinc-900/40 ring-1 ring-zinc-800/70 text-zinc-100 shadow-sm"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeContent = String(children).replace(/\n$/, "");
                  
                  return !inline && match ? (
                    <div className="relative rounded-lg my-2 group">
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                        {...props}
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                      <button
                        onClick={() => handleCopyCode(codeContent)}
                        className="absolute top-2 right-2 p-2 bg-zinc-800/70 hover:bg-zinc-700 active:scale-[0.95] transition-all rounded-lg opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                        aria-label="Copy code"
                        title="Copy code"
                      >
                        {copiedCode === codeContent ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-zinc-300" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <code
                      className={`${className} bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                a({ node, ...props }: any) {
                  return (
                    <a
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-xs mt-2 ${
            isUser
              ? "text-blue-100"
              : "text-zinc-400"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
