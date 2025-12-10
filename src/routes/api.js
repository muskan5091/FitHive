// routes/api.js
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_KEY = process.env.OPENAI_API_KEY;
let openai;
if (OPENAI_KEY) {
  const cfg = new Configuration({ apiKey: OPENAI_KEY });
  openai = new OpenAIApi(cfg);
}

// basic simple in-memory conversation (optional)
const convHistory = {}; // { sessionId: [{role, content}, ...] }

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  // If no OpenAI key provided -> fallback to canned response
  if (!openai) {
    const fallback = cannedReply(message);
    return res.json({ reply: fallback });
  }

  try {
    // For a short demo we use single-message completion (change to chat completion if desired)
    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini', // choose model you have access to (or 'gpt-4o'/'gpt-4'/'gpt-3.5-turbo')
      messages: [
        { role: 'system', content: 'You are a helpful assistant for an e-commerce store. Keep answers short and helpful.' },
        { role: 'user', content: message }
      ],
      max_tokens: 250,
      temperature: 0.2,
    });

    const reply = response.data.choices?.[0]?.message?.content?.trim();
    res.json({ reply: reply || 'Sorry, no answer.' });
  } catch (err) {
    console.error('OpenAI error', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Chat service error' });
  }
});

function cannedReply(text) {
  const t = text.toLowerCase();
  if (t.includes('size') || t.includes('sizing')) return 'Our size chart is on the product page — click "Size Chart" for measurements.';
  if (t.includes('shipping')) return 'We deliver in 3–7 business days across India. Free shipping over ₹999.';
  if (t.includes('return') || t.includes('refund')) return 'You can return within 7 days of delivery. See our Returns page for details.';
  return 'Hey — I can help with orders, sizes and product info. Try asking "What are returns?"';
}

module.exports = router;
