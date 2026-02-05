import { ChatStreamChunk } from "@/types/index";

/**
 * Mock responses for simulated AI streaming.
 * Replace this with real API calls in production.
 */
const mockResponses = [
  "That's an interesting question! Let me think about that...\n\nHere's what I think:\n\n1. **First point**: This is a key aspect\n2. **Second point**: This is also important\n\n```javascript\n// Example code\nconst example = () => {\n  return 'Hello, World!';\n};\n```\n\nThe important thing to remember is that context matters. Feel free to ask follow-up questions!",
  "Great question! I'd be happy to help.\n\n**Summary:**\n- Point A: Details here\n- Point B: More details\n\nLet me explain further with an example:\n\n```python\ndef example():\n    return \"This is a Python example\"\n```\n\nDoes this make sense? Would you like me to elaborate?",
  "I see what you're asking. Here's my perspective:\n\nThe answer depends on several factors:\n\n1. Context and situation\n2. Your specific needs\n3. Available resources\n\n```typescript\ninterface Example {\n  id: string;\n  title: string;\n}\n```\n\nFeel free to ask if you need clarification!",
];

/**
 * Simulates an AI provider interface.
 * In production, replace with real OpenAI, Anthropic, etc.
 */
export interface ChatProvider {
  sendMessage(
    conversationId: string,
    userMessage: string
  ): AsyncGenerator<ChatStreamChunk>;
}

/**
 * Mock provider: simulates streaming response with delays.
 * Yields text chunks as if from a real streaming API.
 */
export const createMockChatProvider = (): ChatProvider => {
  return {
    async *sendMessage(
      conversationId: string,
      userMessage: string
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

/**
 * Example: How to use a real OpenAI provider
 *
 * export const createOpenAIChatProvider = (apiKey: string): ChatProvider => {
 *   return {
 *     async *sendMessage(conversationId, userMessage) {
 *       const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *         method: 'POST',
 *         headers: {
 *           'Authorization': `Bearer ${apiKey}`,
 *           'Content-Type': 'application/json',
 *         },
 *         body: JSON.stringify({
 *           model: 'gpt-4',
 *           messages: [{ role: 'user', content: userMessage }],
 *           stream: true,
 *         }),
 *       });
 *
 *       const reader = response.body?.getReader();
 *       if (!reader) throw new Error('No response body');
 *
 *       let buffer = '';
 *       while (true) {
 *         const { done, value } = await reader.read();
 *         if (done) {
 *           yield { chunk: '', isComplete: true };
 *           break;
 *         }
 *
 *         buffer += new TextDecoder().decode(value);
 *         const lines = buffer.split('\n');
 *         buffer = lines[lines.length - 1];
 *
 *         for (let i = 0; i < lines.length - 1; i++) {
 *           const line = lines[i];
 *           if (line.startsWith('data: ')) {
 *             const json = JSON.parse(line.slice(6));
 *             const content = json.choices[0].delta.content || '';
 *             if (content) {
 *               yield { chunk: content, isComplete: false };
 *             }
 *           }
 *         }
 *       }
 *     },
 *   };
 * };
 */
