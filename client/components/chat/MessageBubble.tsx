import { Message } from "@/types/index";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-lg ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
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
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg my-2"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
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
              : "text-zinc-500 dark:text-zinc-400"
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
