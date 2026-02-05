import { RequestHandler } from "express";
import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

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
    console.log("Sending message to OpenRouter with model: liquid/lfm-2.5-1.2b-thinking:free");

    const stream = await openrouter.chat.send({
      model: "liquid/lfm-2.5-1.2b-thinking:free",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      stream: true,
    });

    console.log("OpenRouter stream started successfully");

    for await (const chunk of stream) {
      try {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
        }
      } catch (e) {
        console.error("Failed to process chunk:", e);
      }
    }

    // Signal completion
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Chat handler error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to get response from OpenRouter", 
        message: errorMessage 
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
};
