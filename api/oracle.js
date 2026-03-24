import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are a mystical, ethereal oracle reading the stars for Sara on her birthday. 
She asks the universe: "${question}". 
Provide a deep, thoughtful, and magical reading for her year ahead. 
Tone: luxurious, poetic, otherworldly, warm. Use beautiful imagery (stars, silk, light, gold).`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
    });

    let text = response.text?.trim() || '';
    const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');
    
    let formattedHtml = '';
    for (let p of paragraphs) {
        formattedHtml += `<p style="margin-bottom: 1rem;">${p}</p>`;
    }

    return res.status(200).json({ html: formattedHtml });
  } catch (error) {
    console.error("Oracle API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
