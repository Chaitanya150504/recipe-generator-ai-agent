import { GoogleGenAI } from '@google/genai';

function getApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    null
  );
}

async function parseRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function callGemini(contents: string, systemInstruction: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    const err: any = new Error(
      'GEMINI_API_KEY environment variable is not configured. ' +
      'Please add GEMINI_API_KEY in your Vercel Project Settings -> Environment Variables and redeploy.'
    );
    err.status = 403;
    throw err;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-recipe-generator' } },
  });

  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after 15s on model ${model}`)), 15000)
        ),
      ]);

      const text = response.text;
      if (text && text.trim()) return text.trim();
    } catch (err: any) {
      lastError = err;
      if (err?.status === 403 || err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('PERMISSION_DENIED')) {
        const error: any = new Error('The configured GEMINI_API_KEY is invalid or lacks permissions. Please check your Google AI Studio API key.');
        error.status = 403;
        throw error;
      }
    }
  }

  const status = lastError?.status || (lastError?.message?.includes('RESOURCE_EXHAUSTED') ? 429 : 500);
  const error: any = new Error(lastError?.message || 'All AI models failed to find substitutions');
  error.status = status;
  throw error;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = await parseRequestBody(req);
    const { ingredient, dishName, dietary, reason } = body || {};

    if (!ingredient) {
      return res.status(400).json({ error: 'ingredient is required' });
    }

    const prompt = `As an expert chef, provide 2 to 3 best culinary substitutes for "${ingredient}"
in the context of cooking the dish "${dishName || 'this recipe'}".
Dietary preference: "${dietary || 'any'}".
Special consideration: "${reason || 'missing ingredient or allergy'}".

Return JSON array with:
1. "name": The substitute ingredient name
2. "ratio": Exact conversion ratio
3. "flavorImpact": Concise description of taste/texture differences
4. "culinaryAdvice": Exact instructions on how to incorporate it`;

    const rawText = await callGemini(
      prompt,
      'You are a culinary science expert. Output strictly valid JSON array of substitutes.'
    );

    const cleaned = cleanJsonOutput(rawText);
    const parsed = JSON.parse(cleaned ?? '[]');
    return res.status(200).json({ substitutes: parsed });
  } catch (error: any) {
    console.error('[Diagnostic] Error finding substitutes:', error);
    const status = error?.status || (error?.code === 'NO_API_KEY' ? 403 : 500);
    return res.status(status).json({
      error: error?.message || 'Failed to find substitutions',
      status,
    });
  }
}
