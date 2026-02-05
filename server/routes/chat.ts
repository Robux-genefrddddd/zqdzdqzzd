import { RequestHandler } from "express";

export const handleChat: RequestHandler = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OpenRouter API key not configured" });
    return;
  }

  // Set up streaming response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.HTTP_REFERER || "https://localhost",
        "X-Title": "ChatGPT-like",
      },
      body: JSON.stringify({
        model: "sourceful/riverflow-v2-pro",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        stream: true,
        modalities: ["text"],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", error);
      res.status(response.status).json({ error: "Failed to get response from OpenRouter" });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      res.status(500).json({ error: "No response body from OpenRouter" });
      return;
    }

    let buffer = "";

    const readChunk = async () => {
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
    };

    await readChunk();
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
