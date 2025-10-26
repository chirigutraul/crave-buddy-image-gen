# Crave Buddy Image Generator

A Cloudflare Workers serverless function that generates images using Google's Gemini AI API.

## Features

- ✨ Generate images using Gemini AI
- 🚀 Deploy as a serverless function on Cloudflare Workers
- 📦 Automatic storage in Cloudflare R2
- 🔗 Returns public URLs to generated images
- 🔒 Secure API key management
- 🌐 CORS enabled for web applications
- ⚡ Fast and scalable

## Prerequisites

- Node.js and npm installed
- A Cloudflare account
- A Google Gemini API key (stored in `NANOBANANA_API_KEY`)
- A Cloudflare R2 bucket (name: `crave-buddy-images`)

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

### 1. Create R2 Bucket

First, create an R2 bucket named `crave-buddy-images`:

```bash
npx wrangler r2 bucket create crave-buddy-images
```

### 2. Enable Public Access on R2 Bucket

Go to your Cloudflare Dashboard:

1. Navigate to **R2** → **crave-buddy-images**
2. Go to **Settings** → **Public Access**
3. Click **Allow Access** and confirm
4. Copy the **Public R2.dev Bucket URL** (e.g., `https://pub-abc123def456.r2.dev`)

### 3. Update wrangler.toml

Edit `wrangler.toml` and set the `R2_PUBLIC_URL` variable:

```toml
[vars]
R2_PUBLIC_URL = "abc123def456"  # The part between 'pub-' and '.r2.dev'
```

### 4. Login to Cloudflare

```bash
npx wrangler login
```

### 5. Add your API key as a secret

```bash
npx wrangler secret put NANOBANANA_API_KEY
```

When prompted, paste your Gemini API key.

### 6. Deploy to Cloudflare Workers

```bash
npm run deploy
```

Your function will be deployed and you'll receive a URL like: `https://crave-buddy-image-gen.your-subdomain.workers.dev`

## Response

The function returns a JSON response with the URL to the generated image stored in R2.

### Response Format

```json
{
  "success": true,
  "url": "https://pub-abc123def456.r2.dev/pesto-pasta-1730000000000.png",
  "filename": "pesto-pasta-1730000000000.png",
  "prompt": "Pesto pasta",
  "timestamp": 1730000000000,
  "mimeType": "image/png"
}
```

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

  const data = await response.json();

  if (data.success) {
    // Use the image URL directly
    document.getElementById("myImage").src = data.url;
    console.log("Image URL:", data.url);
  } else {
    console.error("Error:", data.error);
  }
}

generateImage("A cute puppy");
```

## Configuration

Edit `wrangler.toml` to customize your deployment settings:

- `name`: The name of your worker
- `compatibility_date`: The Cloudflare Workers compatibility date
- `R2_PUBLIC_URL`: Your R2 bucket's public URL subdomain
- `IMAGE_BUCKET`: The R2 bucket binding (default: `crave-buddy-images`)

## API Reference

### Gemini Model

Currently using: `gemini-2.5-flash-image`

You can modify the model in `index.js` if needed.

## Storage

Generated images are stored in Cloudflare R2 with the following naming convention:

```
{sanitized-prompt}-{timestamp}.{extension}
```

Example: `pesto-pasta-1730000000000.png`

Images are stored with metadata including:

- Original prompt
- Generation timestamp
- Content type

## Error Handling

The function includes error handling for:

- Missing API key
- API request failures
- Image generation failures
- R2 upload failures

Errors are returned with appropriate HTTP status codes and messages in JSON format.

## License

ISC
