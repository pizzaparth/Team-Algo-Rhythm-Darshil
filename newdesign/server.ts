import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for generating reasoning decision graph using Gemini API
  app.post("/api/reason", async (req, res) => {
    try {
      const { prompt, topic, domain } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({
          status: "mock",
          message: "Gemini API key missing or unconfigured. Returning fallback tree.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Deconstruct the following goal/problem into a structured decision graph JSON for StateGraph.
Goal: "${prompt || topic}"
Domain: "${domain || "Strategic Planning"}"

Generate a valid JSON object matching this schema:
{
  "topic": string,
  "domain": string,
  "rootNode": {
    "title": string,
    "summary": string,
    "detail": string
  },
  "strategies": [
    {
      "id": string,
      "title": string,
      "summary": string,
      "detail": string,
      "confidenceScore": number (0-100),
      "status": "recommended" | "evaluating" | "archived",
      "pros": string[],
      "cons": string[],
      "sources": string[],
      "children": [
        {
          "id": string,
          "category": "risk" | "action" | "tradeoff",
          "title": string,
          "summary": string
        }
      ]
    }
  ]
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              domain: { type: Type.STRING },
              rootNode: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  detail: { type: Type.STRING },
                },
                required: ["title", "summary"],
              },
              strategies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    detail: { type: Type.STRING },
                    confidenceScore: { type: Type.NUMBER },
                    status: { type: Type.STRING },
                    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                    cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                    sources: { type: Type.ARRAY, items: { type: Type.STRING } },
                    children: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          category: { type: Type.STRING },
                          title: { type: Type.STRING },
                          summary: { type: Type.STRING },
                        },
                      },
                    },
                  },
                  required: ["id", "title", "summary", "confidenceScore"],
                },
              },
            },
            required: ["topic", "rootNode", "strategies"],
          },
        },
      });

      const jsonStr = response.text || "{}";
      const data = JSON.parse(jsonStr);
      return res.json({ status: "success", data });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      return res.status(500).json({ error: err.message || "Failed to generate reasoning graph" });
    }
  });

  // Vite middleware for dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
