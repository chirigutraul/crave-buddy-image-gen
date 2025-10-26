import { GoogleGenAI } from "@google/genai";

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only accept POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed. Use POST request.", {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      // Get prompt from request body
      const body = await request.json();
      const prompt = body.prompt;

      if (!prompt) {
        return new Response("Missing 'prompt' in request body", {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Check for API key
      const apiKey = env.NANOBANANA_API_KEY;
      if (!apiKey) {
        return new Response("API key not configured", { status: 500 });
      }

      // Initialize Google GenAI with API key
      const ai = new GoogleGenAI({
        apiKey: apiKey,
      });

      // Generate image using Gemini
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
        config: {
          responseModalities: ["IMAGE"],
        },
      });

      // Extract image data from response
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            // Get base64 image data
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || "image/png";

            // Convert base64 to binary
            const binaryString = atob(imageData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            // Return image response
            return new Response(bytes, {
              headers: {
                "Content-Type": mimeType,
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=3600",
              },
            });
          }
        }
      }

      return new Response("No image generated", { status: 500 });
    } catch (error) {
      console.error("Error:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
