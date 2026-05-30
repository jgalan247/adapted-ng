# adapted-ng API Worker

A tiny Cloudflare Worker that proxies streaming Claude completions to the frontend.
The Anthropic API key lives here as an encrypted secret — never in the browser.

## One-time setup

```bash
npm install -g wrangler
wrangler login                          # opens browser to authorise
cd worker
wrangler secret put ANTHROPIC_API_KEY   # paste your key (from console.anthropic.com)
```

## Deploy

```bash
cd worker
wrangler deploy
```

You'll get a URL like `https://adapted-ng-api.<your-subdomain>.workers.dev`.
Put that into the frontend as `VITE_API_BASE` (see top-level README).

## Local dev

```bash
cd worker
wrangler dev                            # http://localhost:8787
```

## Endpoint

`POST /api/generate`

```json
{
  "prompt": "...user request...",
  "system": "...optional cached system prompt...",
  "model": "claude-haiku-4-5",
  "maxTokens": 4096
}
```

Returns `text/event-stream` — the raw Anthropic SSE stream, forwarded as-is.
