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

            // Generate filename from prompt and timestamp
            const timestamp = Date.now();
            const fileExtension = mimeType.split("/")[1] || "png";
            // Sanitize prompt for filename (remove special chars, limit length)
            const sanitizedPrompt = prompt
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
              .substring(0, 50);
            const filename = `${sanitizedPrompt}-${timestamp}.${fileExtension}`;

            // Upload to R2
            await env.IMAGE_BUCKET.put(filename, bytes.buffer, {
              httpMetadata: {
                contentType: mimeType,
              },
              customMetadata: {
                prompt: prompt,
                timestamp: timestamp.toString(),
              },
            });

            // Generate public URL
            // Note: You need to enable public access on your R2 bucket
            // Format: https://pub-{account_hash}.r2.dev/{filename}
            // Or use your custom domain if configured
            const bucketUrl = `https://pub-${
              env.R2_PUBLIC_URL || "YOUR_R2_PUBLIC_URL"
            }.r2.dev`;
            const imageUrl = `${bucketUrl}/${filename}`;

            // Return JSON response with URL
            return new Response(
              JSON.stringify({
                success: true,
                url: imageUrl,
                filename: filename,
                prompt: prompt,
                timestamp: timestamp,
                mimeType: mimeType,
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              }
            );
          }
        }
      }

      return new Response(
        JSON.stringify({ success: false, error: "No image generated" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      console.error("Error:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
