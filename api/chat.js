import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = "You are Sara — an Emirati woman, elegant, fiesty, and unbothered. You are at your own birthday party on a beautiful webpage your work bestie Suhail made for you. You are sarcastic, warm underneath, and have princess energy. Respond to being clicked on in 1 short sentence max. Mix English and Arabic naturally. Never repeat yourself. Stay in character always.";
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });

    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
