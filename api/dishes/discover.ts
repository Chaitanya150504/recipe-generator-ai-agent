import { GoogleGenAI } from '@google/genai';

/**
 * Resolves the Gemini API key from standard environment variable aliases.
 */
function getApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    null
  );
}

/**
 * Robust request body parser for Vercel serverless and Express runtimes.
 */
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

/**
 * Strips markdown code blocks (e.g. ```json ... ```) from Gemini responses.
 */
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

/**
 * Maps dish name / cuisine to high-quality culinary imagery.
 */
function getCulinaryImage(dishName: string, cuisineOrRegion = ''): string {
  const q = (dishName + ' ' + cuisineOrRegion).toLowerCase();
  if (q.includes('biryani') || q.includes('pulao') || q.includes('rice')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('pizza') || q.includes('focaccia')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('pasta') || q.includes('carbonara') || q.includes('ragu') || q.includes('spaghetti')) {
    return 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('ramen') || q.includes('noodle') || q.includes('pho') || q.includes('udon')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('sushi') || q.includes('sashimi')) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('taco') || q.includes('burrito') || q.includes('enchilada') || q.includes('mole')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('curry') || q.includes('paneer') || q.includes('masala') || q.includes('tikka') || q.includes('dal') || q.includes('gongura')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('dosa') || q.includes('idli') || q.includes('appam') || q.includes('pesarattu')) {
    return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80';
}

/**
 * Execute Gemini prompt across verified models:
 * 1. gemini-3.1-flash-lite (high availability, fast, generous free quota)
 * 2. gemini-3.8-flash (standard flash)
 * 3. gemini-flash-latest (fallback alias)
 */
async function callGemini(contents: string, systemInstruction: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    const err: any = new Error(
      'GEMINI_API_KEY environment variable is not configured. ' +
      'Please add GEMINI_API_KEY in your Vercel Project Settings -> Environment Variables and redeploy.'
    );
    err.status = 403;
    err.code = 'NO_API_KEY';
    throw err;
  }

  const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : '***';
  console.log(`[Diagnostic] Calling Gemini API (Key: ${maskedKey}, Length: ${apiKey.length})`);

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-recipe-generator',
      },
    },
  });

  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    const startTime = Date.now();
    try {
      console.log(`[Diagnostic] Attempting model "${model}"...`);
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
          setTimeout(() => reject(new Error(`Timeout after 20s on model ${model}`)), 20000)
        ),
      ]);

      const text = response.text;
      if (text && text.trim()) {
        console.log(`[Diagnostic] Model "${model}" succeeded in ${Date.now() - startTime}ms`);
        return text.trim();
      }
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      console.warn(`[Diagnostic] Model "${model}" failed after ${elapsed}ms:`, {
        status: err?.status,
        code: err?.code,
        message: err?.message,
      });
      lastError = err;

      if (err?.status === 403 || err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('PERMISSION_DENIED')) {
        const error: any = new Error('The configured GEMINI_API_KEY is invalid or lacks permissions. Please check your Google AI Studio API key.');
        error.status = 403;
        error.code = 'AUTH_ERROR';
        throw error;
      }
    }
  }

  const status = lastError?.status ||
    (lastError?.message?.includes('RESOURCE_EXHAUSTED') ? 429 :
    lastError?.message?.includes('UNAVAILABLE') ? 503 : 500);

  const error: any = new Error(lastError?.message || 'All AI models failed to discover dishes');
  error.status = status;
  error.code = lastError?.code || (status === 429 ? 'RATE_LIMIT' : status === 503 ? 'SERVICE_UNAVAILABLE' : 'AI_ERROR');
  throw error;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  console.log('[Diagnostic] Incoming POST /api/dishes/discover');

  try {
    const body = await parseRequestBody(req);
    const { query, region, cuisine, dietary } = body || {};
    const target = (region || cuisine || query || 'Andhra Pradesh').trim();
    const dietaryFilter = dietary && dietary !== 'all' ? `Strictly filter for ${dietary} options only.` : '';

    console.log(`[Diagnostic] Discovering dishes for: "${target}" (Dietary: ${dietary || 'all'})`);

    const prompt = `You are an expert culinary anthropologist and master chef specializing in authentic world gastronomies.
Recommend 6 iconic, authentic, and culturally distinct traditional dishes specifically from "${target}".
${dietaryFilter}
For each dish provide:
1. "name": The widely recognized English/Culinary name
2. "nativeName": Native script or dialect name (e.g. Telugu, Italian, Japanese, Tamil, Thai, French, etc.)
3. "region": Specific state or sub-region (e.g. Andhra Pradesh, Telangana, Kerala, Tuscany, Oaxaca)
4. "cuisine": Main cuisine family
5. "description": 2 vivid sentences explaining taste profile, texture, cultural significance, and key cooking method.
6. "prepTime": e.g. "20 mins"
7. "cookTime": e.g. "35 mins"
8. "dietary": Array of tags like ["Vegetarian"], ["Vegan"], or ["Non-Vegetarian"], ["Gluten-Free"]
9. "spiceLevel": One of "Mild", "Medium", "Hot", "Extra Hot"
10. "keyIngredients": Array of 4 to 6 hallmark ingredients that define this dish
11. "searchKeyword": 1-2 words best describing food photography for this dish

Output strictly valid JSON array of dish objects matching these keys.`;

    const rawText = await callGemini(
      prompt,
      'You are an authentic world culinary anthropologist. Output strictly valid JSON array of regional dishes matching the schema. Never wrap in markdown backticks.'
    );

    const cleaned = cleanJsonOutput(rawText);
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error(`AI returned an empty or invalid dishes list for "${target}".`);
    }

    const enriched = parsed.map((d: any) => ({
      ...d,
      imageUrl: getCulinaryImage(d.name + ' ' + (d.searchKeyword || ''), d.cuisine || target),
    }));

    console.log(`[Diagnostic] Successfully discovered ${enriched.length} dishes for "${target}"`);
    return res.status(200).json({ dishes: enriched, source: 'ai' });
  } catch (error: any) {
    console.error('[Diagnostic] Error in /api/dishes/discover:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });

    const status = error?.status || (error?.code === 'NO_API_KEY' ? 403 : 500);
    return res.status(status).json({
      error: error?.message || 'Failed to discover regional dishes.',
      code: error?.code || 'DISH_DISCOVERY_ERROR',
      status,
    });
  }
}
