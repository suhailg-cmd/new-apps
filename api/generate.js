import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { coffee, shopping, perfume } = req.body;

  if (!coffee || !shopping || !perfume) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // 1. Generate Image
    const imagePrompt = `A soft, ethereal, aesthetic flatlay or scene inspired by: ${coffee} coffee, shopping at ${shopping}, and ${perfume} perfume. Iridescent pastels, blush and lavender tones, dreamy, magical, luxurious, elegant. No text in image.`;
    
    const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
    });
    
    let imageUrl = '';
    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
        }
    }
    
    if (!imageUrl) throw new Error("No image generated");

    // 2. Generate Story
    const storyPrompt = `You are a warm, witty, slightly magical narrator. 
Sara is celebrating her birthday. She has chosen her holy trinity for the perfect day:
- Coffee: ${coffee}
- Shopping: ${shopping}
- Perfume: ${perfume}

Write a short, funny, ethereal, and luxurious paragraph (max 4 sentences) describing her perfect birthday vibe based on these choices. 
Tone: elegant, slightly sarcastic, princess energy, warm. 
End with a sweet "Happy Birthday Sara" from her work bestie Suhail.`;

    const storyResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: storyPrompt
    });

    let text = storyResponse.text?.trim() || '';
    const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');
    
    let formattedHtml = '';
    for (let i = 0; i < paragraphs.length; i++) {
        let p = paragraphs[i];
        if (i === paragraphs.length - 1 && p.toLowerCase().includes('suhail')) {
            formattedHtml += `<p style="font-style: italic; font-size: 1.2rem; color: #d4af37; text-align: center; margin-top: 1.5rem;">${p}</p>`;
        } else {
            formattedHtml += `<p style="margin-bottom: 1rem;">${p}</p>`;
        }
    }

    return res.status(200).json({ imageUrl, storyHtml: formattedHtml });
  } catch (error) {
    console.error("Server API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
