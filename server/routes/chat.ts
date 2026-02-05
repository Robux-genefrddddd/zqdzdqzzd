import { RequestHandler } from "express";

export const handleChat: RequestHandler = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OpenRouter API key not configured");
    res.status(500).json({ error: "OpenRouter API key not configured" });
    return;
  }

  // Set up streaming response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    console.log("Sending message to OpenRouter...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://chatapp.example.com",
        "X-Title": "ChatGPT-like",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        stream: true,
      }),
    });

    console.log("OpenRouter response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error response:", errorText);
      const errorData = { error: `API error: ${response.status}`, details: errorText };
      res.status(response.status).json(errorData);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      console.error("No response body from OpenRouter");
      res.status(500).json({ error: "No response body from OpenRouter" });
      return;
    }

    let buffer = "";

    const readChunk = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.write('data: [DONE]\n\n');
            res.end();
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
                res.write('data: [DONE]\n\n');
                res.end();
                return;
              }
              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content || "";
                if (content) {
                  res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
                }
              } catch (e) {
                console.error("Failed to parse OpenRouter response:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Stream reading error:", error);
        if (!res.writableEnded) {
          res.write('data: [ERROR]\n\n');
          res.end();
        }
      }
    };

    await readChunk();
  } catch (error) {
    console.error("Chat handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error", message: String(error) });
    } else {
      res.write('data: [ERROR]\n\n');
      res.end();
    }
  }
};
