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
 * Uses the Trinity Large model.
 */
export const createOpenRouterChatProvider = (): ChatProvider => {
  return {
    async *sendMessage(
      conversationId: string,
      userMessage: string,
    ): AsyncGenerator<ChatStreamChunk> {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg =
            errorData.error ||
            errorData.message ||
            `API error: ${response.status}`;
          console.error("OpenRouter API error:", errorMsg, errorData);
          throw new Error(errorMsg);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body from API");
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
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

              if (data === "[DONE]") {
                yield {
                  chunk: "",
                  isComplete: true,
                };
                return;
              }

              try {
                const json = JSON.parse(data);

                // Check for error in stream
                if (json.error) {
                  console.error("Stream error:", json.error);
                  throw new Error(json.error);
                }

                // Handle usage/token information
                if (json.usage) {
                  console.log("Usage info:", json.usage);
                  if ((json.usage as any).reasoningTokens) {
                    console.log(
                      "Reasoning tokens:",
                      (json.usage as any).reasoningTokens,
                    );
                  }
                }

                const chunk = json.chunk || "";
                if (chunk) {
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
          chunk: `\n\n[Erreur: ${errorMsg}]`,
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
  "Ceci est une réponse de test en français! Voici un exemple de code Roblox:\n\n```lua\nlocal part = Instance.new('Part')\npart.Parent = workspace\npart.BrickColor = BrickColor.new('Bright red')\n```",
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
