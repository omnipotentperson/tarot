// POST /api/ai-reading — OpenAI-backed interpretation expansion for The Veil.
// Runs as a Cloudflare Pages Function. The API key lives in the OPENAI_API_KEY
// environment variable (never in client code). Model via OPENAI_MODEL env var.
//
// Cost control (this is the whole point of this file):
// - Defaults to gpt-4.1-nano: $0.10 input / $0.40 output per 1M tokens (cheapest
//   capable OpenAI model). NOTE: OpenAI retires gpt-4.1-nano on 2026-10-23 —
//   when that happens, set OPENAI_MODEL to its successor in the Cloudflare
//   dashboard (Pages → Settings → Environment variables). No code change needed.
// - max_tokens is hard-capped server-side (client's value is ignored).
// - Input messages are length-capped; only user/system/assistant roles accepted.
// - Simple per-IP rate limit (in-memory per isolate; logins later can replace it).
// Rough cost: ~1000 input + ~450 output tokens ≈ $0.0003 per reading,
// i.e. about 3,300 readings per $1.

const MAX_TOKENS = 550;
const MAX_INPUT_CHARS = 4000;
const RATE_LIMIT = 20; // requests per IP per rolling hour
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  arr.push(now);
  hits.set(ip, arr);
  // avoid unbounded growth
  if (hits.size > 5000) hits.clear();
  return arr.length > RATE_LIMIT;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many requests — please slow down.' }, { status: 429 });
  }
  if (!env.OPENAI_API_KEY) {
    // Client already degrades gracefully when the AI text is missing.
    return Response.json({ error: 'AI readings are not configured yet.' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Bad request.' }, { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length || messages.length > 4) {
    return Response.json({ error: 'Bad request.' }, { status: 400 });
  }
  const clean = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'system' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: String(m.content || '').slice(0, MAX_INPUT_CHARS) }));
  if (!clean.length) {
    return Response.json({ error: 'Bad request.' }, { status: 400 });
  }

  const model = env.OPENAI_MODEL || 'gpt-5-nano';

  let apiRes;
  try {
    apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: clean,
        max_tokens: MAX_TOKENS,
        temperature: 0.9,
      }),
    });
  } catch {
    return Response.json({ error: 'AI service unreachable.' }, { status: 502 });
  }
  if (!apiRes.ok) {
    return Response.json({ error: 'AI service error.' }, { status: 502 });
  }
  const data = await apiRes.json();
  const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();

  // Shape matches what the client already expects (data.content[0].text).
  return Response.json({ content: [{ text }] });
}
