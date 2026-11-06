import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Resolves the Gemini API key from common environment variable names.
 * Supports GEMINI_API_KEY, API_KEY, GOOGLE_API_KEY, and VITE_GEMINI_API_KEY.
 */
export function getApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    null
  );
}

/**
 * Creates and returns an authenticated GoogleGenAI client instance.
 * Throws a descriptive error if no API key is configured.
 */
export function getAIClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    const error: any = new Error(
      'GEMINI_API_KEY is not configured in environment variables. ' +
      'If deployed on Vercel, please navigate to your Vercel Project Settings -> Environment Variables, ' +
      'add GEMINI_API_KEY with your Google AI Studio API key, and redeploy.'
    );
    error.status = 403;
    error.code = 'NO_API_KEY';
    throw error;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-recipe-generator',
      },
    },
  });
}

/**
 * Helper to call Gemini AI with multi-model fallback.
 * Tries 'gemini-3.1-flash-lite' first (high performance & generous free-tier quota),
 * then falls back to 'gemini-3.8-flash', then 'gemini-2.5-flash'.
 */
export async function generateAIContent(options: {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  timeoutMs?: number;
}): Promise<string> {
  const ai = getAIClient();
  const timeoutMs = options.timeoutMs || 25000;
  
  // High-availability model order:
  // 1. gemini-3.1-flash-lite (fast, economical, active free quota)
  // 2. gemini-3.8-flash (standard multimodal flash)
  // 3. gemini-2.5-flash (reliable high-volume fallback)
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction,
            responseMimeType: options.responseMimeType || 'application/json',
          },
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`AI generation timed out after ${timeoutMs}ms on model ${model}`)), timeoutMs);
        }),
      ]);

      const text = response.text;
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (err: any) {
      console.warn(`[Gemini] Attempt with model "${model}" failed:`, err?.message || err);
      lastError = err;

      // If it's an explicit 403 (invalid key / permission denied), don't retry other models with same invalid key
      if (err?.status === 403 || err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('PERMISSION_DENIED')) {
        const error: any = new Error('The configured GEMINI_API_KEY is invalid or lacks permissions. Please verify your Google AI Studio API key.');
        error.status = 403;
        throw error;
      }

      // If 429 quota exhaustion, continue to next model in list
      if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        console.info(`[Gemini] Model "${model}" hit quota (429). Attempting fallback model...`);
      }
    }
  }

  // If all models failed
  const error: any = new Error(lastError?.message || 'All AI models failed to generate content');
  error.status = lastError?.status || (lastError?.message?.includes('RESOURCE_EXHAUSTED') ? 429 : 500);
  throw error;
}

/**
 * Map cuisine / dish to realistic culinary imagery
 */
export function getCulinaryImage(dishName: string, cuisineOrRegion = ''): string {
  const q = (dishName + ' ' + cuisineOrRegion).toLowerCase();
  if (q.includes('biryani') || q.includes('pulao') || q.includes('rice')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('pizza') || q.includes('focaccia')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('pasta') || q.includes('carbonara') || q.includes('ragu') || q.includes('spaghetti') || q.includes('orecchiette')) {
    return 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('ramen') || q.includes('noodle') || q.includes('pho') || q.includes('udon')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('sushi') || q.includes('sashimi')) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('taco') || q.includes('burrito') || q.includes('enchilada') || q.includes('mole') || q.includes('mexican')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('pad thai') || q.includes('thai') || q.includes('tom yum')) {
    return 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('dosa') || q.includes('idli') || q.includes('appam') || q.includes('pesarattu') || q.includes('pongal')) {
    return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('curry') || q.includes('paneer') || q.includes('masala') || q.includes('tikka') || q.includes('dal') || q.includes('pappu') || q.includes('gongura')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('croissant') || q.includes('pastry') || q.includes('dessert') || q.includes('cake') || q.includes('tart')) {
    return 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('soup') || q.includes('stew') || q.includes('bouillabaisse') || q.includes('pulusu')) {
    return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('dim sum') || q.includes('dumpling') || q.includes('bao') || q.includes('gyoza') || q.includes('momos')) {
    return 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('salad') || q.includes('bowl')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('fish') || q.includes('seafood') || q.includes('prawn') || q.includes('karimeen') || q.includes('royyala')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('bread') || q.includes('kulcha') || q.includes('naan') || q.includes('roti') || q.includes('parotta')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80';
}
