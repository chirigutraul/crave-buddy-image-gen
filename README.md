# Crave Buddy Image Generator

A Cloudflare Workers serverless function that generates images using Google's Gemini AI API.

## Features

- ✨ Generate images using Gemini AI
- 🚀 Deploy as a serverless function on Cloudflare Workers
- 🔒 Secure API key management
- 🌐 CORS enabled for web applications
- ⚡ Fast and scalable

## Prerequisites

- Node.js and npm installed
- A Cloudflare account
- A Google Gemini API key (stored in `NANOBANANA_API_KEY`)

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Make sure your `.env` file has the API key:**

Your `.env` file should contain:

```
NANOBANANA_API_KEY=your_gemini_api_key_here
```

3. **Test locally:**

```bash
npm run dev
```

This will start a local development server, typically at `http://localhost:8787`

## Usage

The function only accepts **POST requests** with a JSON body containing a `prompt` field.

### Example Request

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A futuristic cityscape at night"}'
```

### Request Body

```json
{
  "prompt": "Your image generation prompt here"
}
```

The `prompt` field is **required**. If missing, the function will return a 400 error.

## Deployment

1. **Login to Cloudflare:**

```bash
npx wrangler login
```

2. **Add your API key as a secret:**

```bash
npx wrangler secret put NANOBANANA_API_KEY
```

When prompted, paste your Gemini API key.

3. **Deploy to Cloudflare Workers:**

```bash
npm run deploy
```

Your function will be deployed and you'll receive a URL like: `https://crave-buddy-image-gen.your-subdomain.workers.dev`

## Response

The function returns the generated image directly as a binary response with the appropriate `Content-Type` header (usually `image/png` or `image/jpeg`).

### Example: Using in a Web Application

```javascript
async function generateImage(prompt) {
  const response = await fetch("https://your-worker-url.workers.dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);

  // Use the image URL
  document.getElementById("myImage").src = imageUrl;
}

generateImage("A cute puppy");
```

## Configuration

Edit `wrangler.toml` to customize your deployment settings:

- `name`: The name of your worker
- `compatibility_date`: The Cloudflare Workers compatibility date

## API Reference

### Gemini Model

Currently using: `gemini-2.5-flash-image`

You can modify the model in `index.js` if needed.

## Error Handling

The function includes error handling for:

- Missing API key
- API request failures
- Image generation failures

Errors are returned with appropriate HTTP status codes and messages.

## License

ISC
