import { Message } from "@/types/index";
import { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isComposing?: boolean;
}

function MessageBubbleComponent({
  message,
  isComposing = false,
}: MessageBubbleProps) {
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
          <>
            {message.content && (
              <div className="text-sm prose dark:prose-invert prose-sm max-w-none [&_p]:mb-3 [&_p]:leading-relaxed [&_pre]:my-4 [&_ul]:my-3 [&_ol]:my-3 [&_li]:my-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      // Extract language from className (e.g., "language-lua" or "lang-lua" -> "lua")
                      let language = "lua"; // Default to Lua for Roblox
                      if (className) {
                        const langMatch = className.match(
                          /(?:language|lang)-(\w+)/,
                        );
                        if (langMatch) {
                          language = langMatch[1];
                        }
                      }
                      const codeContent = String(children).replace(/\n$/, "");

                      // For inline code, return simple code element
                      if (inline) {
                        return (
                          <code
                            className={`${className} bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      // For code blocks, return empty - let pre component handle it
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre({ node, children, ...props }: any) {
                      // Extract language from the code child
                      const codeChild =
                        children && Array.isArray(children)
                          ? children[0]
                          : children;
                      const codeProps = codeChild?.props || {};
                      const className = codeProps.className || "";

                      let language = "lua";
                      if (className) {
                        const langMatch = className.match(
                          /(?:language|lang)-(\w+)/,
                        );
                        if (langMatch) {
                          language = langMatch[1];
                        }
                      }

                      const codeContent = String(
                        codeChild?.props?.children || "",
                      ).replace(/\n$/, "");

                      return (
                        <div
                          className="relative rounded-lg my-2 group max-h-96 overflow-hidden"
                          {...props}
                        >
                          <SyntaxHighlighter
                            style={oneDark}
                            language={language}
                            PreTag="div"
                            className="rounded-lg !p-3 !m-0"
                            customStyle={{
                              fontSize: "13px",
                              lineHeight: "1.4",
                            }}
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

            {/* Show composing indicator while streaming */}
            {isComposing && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}
          </>
        )}

        {/* Timestamp */}
        <p
          className={`text-xs mt-2 ${
            isUser ? "text-blue-100" : "text-zinc-400"
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

// Memoize to prevent unnecessary re-renders - only update if content changes
export const MessageBubble = memo(MessageBubbleComponent, (prev, next) => {
  // Only re-render if content actually changed or composing status changed
  const contentChanged = prev.message.content !== next.message.content;
  const composingChanged = prev.isComposing !== next.isComposing;

  // Return true if props are SAME (skip render)
  return !contentChanged && !composingChanged;
});
