/**
 * adapted-ng API Worker
 *
 * Streams Claude completions back to the browser.
 * The Anthropic API key lives only in this Worker as an encrypted secret.
 *
 * Endpoint: POST /api/generate
 * Body:    { prompt: string, model?: string, system?: string, maxTokens?: number }
 * Returns: text/event-stream (SSE) — raw Anthropic stream, forwarded as-is.
 */

const ALLOWED_MODELS = new Set([
  'claude-haiku-4-5',
  'claude-sonnet-4-5',
  'claude-sonnet-4-6',
])

const DEFAULT_MODEL = 'claude-haiku-4-5'
const DEFAULT_MAX_TOKENS = 4096

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('origin') || '*'

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return json({ ok: true, service: 'adapted-ng-api' }, { headers: corsHeaders(origin) })
    }

    if (url.pathname !== '/api/generate') {
      return json({ error: 'not_found' }, { status: 404, headers: corsHeaders(origin) })
    }

    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, { status: 405, headers: corsHeaders(origin) })
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'missing_api_key_secret' }, { status: 500, headers: corsHeaders(origin) })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'invalid_json' }, { status: 400, headers: corsHeaders(origin) })
    }

    const { prompt, system, model, maxTokens } = body || {}
    if (typeof prompt !== 'string' || prompt.length < 1) {
      return json({ error: 'prompt_required' }, { status: 400, headers: corsHeaders(origin) })
    }
    if (prompt.length > 50_000) {
      return json({ error: 'prompt_too_large' }, { status: 413, headers: corsHeaders(origin) })
    }

    const chosenModel = ALLOWED_MODELS.has(model) ? model : DEFAULT_MODEL
    const tokens = Math.min(Math.max(parseInt(maxTokens, 10) || DEFAULT_MAX_TOKENS, 256), 8192)

    // System prompt is sent as a cache-eligible block so repeat calls are ~90% cheaper.
    const messages = [{ role: 'user', content: prompt }]
    const payload = {
      model: chosenModel,
      max_tokens: tokens,
      stream: true,
      messages,
    }
    if (system && typeof system === 'string' && system.length > 0) {
      payload.system = [
        {
          type: 'text',
          text: system,
          cache_control: { type: 'ephemeral' },
        },
      ]
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => '')
      return json(
        { error: 'upstream_error', status: upstream.status, detail: errText.slice(0, 500) },
        { status: 502, headers: corsHeaders(origin) },
      )
    }

    // Forward the SSE stream straight through.
    return new Response(upstream.body, {
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        ...corsHeaders(origin),
      },
    })
  },
}
