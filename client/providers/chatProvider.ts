import { ChatStreamChunk } from "@/types/index";

/**
 * Simulates an AI provider interface.
 */
export interface ChatProvider {
  sendMessage(
    conversationId: string,
    userMessage: string,
  ): AsyncGenerator<ChatStreamChunk>;
}

/**
 * OpenRouter provider: sends messages to the backend which proxies to OpenRouter API.
 * Uses the Riverflow v2 Pro model.
 */
export const createOpenRouterChatProvider = (): ChatProvider => {
  return {
    async *sendMessage(
      conversationId: string,
      userMessage: string,
    ): AsyncGenerator<ChatStreamChunk> {
      try {
        console.log("Sending message to API...");

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        });

        console.log("API response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || errorData.message || `API error: ${response.status}`;
          console.error("OpenRouter API error:", errorMsg, errorData);
          throw new Error(errorMsg);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body from API");
        }

        console.log("Starting to read stream...");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Stream completed");
            yield {
              chunk: "",
              isComplete: true,
            };
            break;
          }

          buffer += new TextDecoder().decode(value);
          const lines = buffer.split("\n");
          buffer = lines[lines.length - 1];

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              console.log("Client received SSE line:", data);

              if (data === "[DONE]") {
                console.log("Received DONE signal");
                yield {
                  chunk: "",
                  isComplete: true,
                };
                return;
              }

              try {
                const json = JSON.parse(data);
                console.log("Parsed JSON:", json);

                // Check for error in stream
                if (json.error) {
                  console.error("Stream error:", json.error);
                  throw new Error(json.error);
                }

                // Handle usage/token information
                if (json.usage) {
                  console.log("Usage info:", json.usage);
                  if ((json.usage as any).reasoningTokens) {
                    console.log("Reasoning tokens:", (json.usage as any).reasoningTokens);
                  }
                }

                const chunk = json.chunk || "";
                console.log("Extracted chunk:", chunk);
                if (chunk) {
                  console.log("Yielding chunk to store");
                  yield {
                    chunk,
                    isComplete: false,
                  };
                }
              } catch (e) {
                console.error("Failed to parse stream data:", e, data);
              }
            }
          }
        }
      } catch (error) {
        console.error("Chat provider error:", error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        // Yield error message to user
        yield {
          chunk: `\n\n[Error: ${errorMsg}]`,
          isComplete: true,
        };
      }
    },
  };
};

/**
 * Create mock provider for development without API key.
 * Replace with createOpenRouterChatProvider() in production.
 */
const mockResponses = [
  "That's an interesting question! Let me think about that...\n\nHere's what I think:\n\n1. **First point**: This is a key aspect\n2. **Second point**: This is also important\n\n```javascript\n// Example code\nconst example = () => {\n  return 'Hello, World!';\n};\n```\n\nThe important thing to remember is that context matters. Feel free to ask follow-up questions!",
  'Great question! I\'d be happy to help.\n\n**Summary:**\n- Point A: Details here\n- Point B: More details\n\nLet me explain further with an example:\n\n```python\ndef example():\n    return "This is a Python example"\n```\n\nDoes this make sense? Would you like me to elaborate?',
  "I see what you're asking. Here's my perspective:\n\nThe answer depends on several factors:\n\n1. Context and situation\n2. Your specific needs\n3. Available resources\n\n```typescript\ninterface Example {\n  id: string;\n  title: string;\n}\n```\n\nFeel free to ask if you need clarification!",
];

export const createMockChatProvider = (): ChatProvider => {
  return {
    async *sendMessage(
      conversationId: string,
      userMessage: string,
    ): AsyncGenerator<ChatStreamChunk> {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Pick random response
      const response =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];

      // Stream character by character with variable delays
      for (let i = 0; i < response.length; i++) {
        const chunk = response[i];
        const delay = Math.random() * 30 + 10; // 10-40ms per char
        await new Promise((resolve) => setTimeout(resolve, delay));

        yield {
          chunk,
          isComplete: i === response.length - 1,
        };
      }
    },
  };
};
