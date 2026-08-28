export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'AI service is not configured yet.' });
  try {
    const { text } = req.body || {};
    if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'No document text was provided.' });
    const safeText = text.slice(0, 50000);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Summarize this document clearly. Give: 1) Executive summary, 2) Key points, 3) Important facts and numbers, 4) Action items if present.\n\nDOCUMENT:\n${safeText}` }] }] })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'AI request failed.' });
    const summary = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || 'No summary returned.';
    return res.status(200).json({ summary });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to generate the summary.' });
  }
}
