import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

export async function getModel() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const llm = new GoogleGenerativeAI(geminiApiKey);
  const model = llm.getGenerativeModel({ model: 'gemini-2.5-flash' });

  return model;
}
