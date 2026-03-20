import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function* streamChat(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  message: string
) {
  const chat = ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction:
        'You are Sansnsi, a highly capable, 24/7 AI assistant. You are concise, professional, and helpful. You communicate clearly and effectively.',
    },
  });

  const contents = history.map((msg) => ({
    role: msg.role,
    parts: msg.parts,
  }));

  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3.1-pro-preview',
    contents,
    config: {
      systemInstruction:
        'You are Sansnsi, a highly capable, 24/7 AI assistant. You are concise, professional, and helpful. You communicate clearly and effectively.',
    },
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
