// fileConvert AI summary API
// This endpoint is designed to use Google's Gemini free tier.
// Keep GEMINI_API_KEY in Vercel Environment Variables; never expose it to customers.
const requestTimes = [];
const MAX_REQUESTS_PER_INSTANCE = 8;
const WINDOW_MS = 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'AI summary is not configured. Add a free Gemini API key to Vercel as GEMINI_API_KEY.' });

  const now = Date.now();
  while (requestTimes.length && now - requestTimes[0] > WINDOW_MS) requestTimes.shift();
  if (requestTimes.length >= MAX_REQUESTS_PER_INSTANCE) {
    return res.status(429).json({ error: 'Free AI limit reached for this server instance. Please try again later.' });
  }

  try {
    const { text } = req.body || {};
    if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'No document text was provided.' });

    const safeText = text.slice(0, 30000);
    requestTimes.push(now);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
        contents: [{ parts: [{ text: `Summarize this document clearly and concisely. Use these sections: Executive Summary, Key Points, Important Facts/Numbers, and Action Items (only if present). Do not invent information.\n\nDOCUMENT:\n${safeText}` }] }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'AI request failed. The free Gemini limit may have been reached.' });
    }

    const summary = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || 'No summary returned.';
    return res.status(200).json({ summary });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to generate the summary right now.' });
  }
}
