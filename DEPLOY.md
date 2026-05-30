# Deploying adapted-ng

Two deployment shapes:

1. **School deploy (default, recommended)** — frontend only, on Cloudflare Pages or any static host. **No AI calls from the app.** Teachers copy the generated prompt into Microsoft Copilot (the school-approved tool). Free. Compliant with school AUPs.
2. **Home / personal deploy (optional)** — frontend + Cloudflare Worker. Enables the in-app "Generate with AI" panel. Costs ~$0.01 per worksheet (your Anthropic API). **Do not enable on a school-facing URL.**

The flag that switches between them is `VITE_ENABLE_AI` (default `false`).

---

## Path 1 — School deploy (frontend only)

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name=adapted-ng
```

No env vars needed. No Worker needed. No API key needed.

Or via Cloudflare dashboard: Pages → Connect to Git → build command `npm run build`, output `dist`. Done.

---

## Path 2 — Home deploy (with in-app AI)

End-to-end deploy: free Cloudflare Pages (frontend) + free Cloudflare Worker (API proxy). You only pay for Anthropic API usage (~$0.01 per worksheet on Haiku).

## Prerequisites

- A **Cloudflare account** — free, no card needed: https://dash.cloudflare.com/sign-up
- An **Anthropic API key** with a small credit balance: https://console.anthropic.com
- **Node 20+** and **npm** locally
- The **wrangler CLI**: `npm install -g wrangler`

## 1. Deploy the Worker (the API)

```bash
cd worker
wrangler login                          # opens browser, authorise once
wrangler secret put ANTHROPIC_API_KEY   # paste your key when prompted
wrangler deploy
```

The output prints your Worker URL, e.g.:

```
https://adapted-ng-api.<your-subdomain>.workers.dev
```

Copy that URL — you'll need it next.

**Test it:**
```bash
curl https://adapted-ng-api.<your-subdomain>.workers.dev/health
# → {"ok":true,"service":"adapted-ng-api"}
```

## 2. Point the frontend at the Worker

In the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```
VITE_ENABLE_AI=true
VITE_API_BASE=https://adapted-ng-api.<your-subdomain>.workers.dev
```

Both vars are required to expose the AI panel. If either is missing, the app behaves exactly like the school deploy.

## 3. Local test

```bash
npm install
npm run dev
```

Open http://localhost:5173, go to the **Create** tab, complete the wizard, and click **✨ Generate** in the AI panel on step 3. You should see streaming Markdown.

## 4. Deploy the frontend to Cloudflare Pages

### Option A — via dashboard (easiest)

1. Push the repo to GitHub.
2. In Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick the repo, then set:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variable**: `VITE_API_BASE` = your Worker URL
4. Save & deploy. Every push to `main` auto-deploys.

You'll get a URL like `https://adapted-ng.pages.dev`.

### Option B — via CLI

```bash
npm run build
npx wrangler pages deploy dist --project-name=adapted-ng
```

(You'll still need to set `VITE_API_BASE` as a Pages env var in the dashboard, or pass it inline at build time: `VITE_API_BASE=... npm run build`.)

## 5. (Optional) Lock down CORS

By default the Worker accepts requests from any origin. Once your Pages URL is stable, tighten this — edit `worker/worker.js`, replace `corsHeaders(origin)` to only allow your Pages domain, then `wrangler deploy` again.

## Costs

- **Cloudflare Pages**: free, unlimited bandwidth
- **Cloudflare Worker**: free up to 100k requests/day
- **Anthropic API**:
  - Haiku 4.5: ~$0.005 per worksheet (with prompt caching)
  - Sonnet 4.6: ~$0.03 per worksheet
  - Start with $5 of credit, that's hundreds of generations

## Troubleshooting

| Symptom | Fix |
|---|---|
| "VITE_API_BASE is not set" | Add it to `.env.local` (dev) or Pages env vars (prod), rebuild |
| 502 `upstream_error` from Worker | Check `wrangler tail` — usually a missing/invalid API key |
| CORS error in browser | Confirm Worker deployed; check the Pages URL matches the allowed origin |
| Streaming output is blank | Open DevTools → Network → response should be `text/event-stream` |

## Updating

- Frontend: `git push` → Pages auto-deploys
- Worker: `cd worker && wrangler deploy`
