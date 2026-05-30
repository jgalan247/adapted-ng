/**
 * Streaming client for the adapted-ng Worker.
 *
 * Usage:
 *   for await (const chunk of generateStream({ prompt, system })) {
 *     setOutput(prev => prev + chunk)
 *   }
 */

const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function generateStream({ prompt, system, model, maxTokens, signal } = {}) {
  if (!API_BASE) {
    throw new Error(
      'VITE_API_BASE is not set. Add it to .env.local (e.g. VITE_API_BASE=https://adapted-ng-api.<you>.workers.dev)',
    )
  }

  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, system, model, maxTokens }),
    signal,
  })

  if (!res.ok) {
    let detail = ''
    try {
      const data = await res.json()
      detail = data?.error || data?.detail || ''
    } catch {
      /* ignore */
    }
    throw new Error(`Worker error ${res.status}: ${detail}`)
  }
  if (!res.body) throw new Error('No response body from Worker')

  return parseAnthropicSSE(res.body, signal)
}

/**
 * Parse the Anthropic streaming format and yield text deltas as plain strings.
 * Anthropic SSE events look like:
 *   event: content_block_delta
 *   data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}
 */
async function* parseAnthropicSSE(stream, signal) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) break
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Process complete events (delimited by \n\n)
      let sepIdx
      while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, sepIdx)
        buffer = buffer.slice(sepIdx + 2)

        // Each event has one or more "field: value" lines. We only care about `data:`.
        const dataLines = rawEvent
          .split('\n')
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trim())
        if (dataLines.length === 0) continue
        const dataStr = dataLines.join('\n')

        if (dataStr === '[DONE]') return

        let parsed
        try {
          parsed = JSON.parse(dataStr)
        } catch {
          continue
        }

        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          yield parsed.delta.text
        } else if (parsed.type === 'message_stop') {
          return
        } else if (parsed.type === 'error') {
          throw new Error(parsed.error?.message || 'Anthropic stream error')
        }
      }
    }
  } finally {
    reader.releaseLock?.()
  }
}
