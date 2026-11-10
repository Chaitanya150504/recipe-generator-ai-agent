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

export const NEUTRAL_FOOD_PLACEHOLDER =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';

export const VERIFIED_DISH_IMAGES: Record<string, string> = {
  'bread pakoda':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Bread_Pakora_%28Stuffed_with_Mashed-Spicy_Potatoes%29.JPG/1280px-Bread_Pakora_%28Stuffed_with_Mashed-Spicy_Potatoes%29.JPG',
  'bread pakora':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Bread_Pakora_%28Stuffed_with_Mashed-Spicy_Potatoes%29.JPG/1280px-Bread_Pakora_%28Stuffed_with_Mashed-Spicy_Potatoes%29.JPG',
  'egg bhurji':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Spicy_egg_bhurji_%40_the_eggfactory.jpg/1280px-Spicy_egg_bhurji_%40_the_eggfactory.jpg',
  'anda bhurji':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Spicy_egg_bhurji_%40_the_eggfactory.jpg/1280px-Spicy_egg_bhurji_%40_the_eggfactory.jpg',
  'andhra chicken fry':
    'https://upload.wikimedia.org/wikipedia/commons/9/96/Andhra_Fried_Chicken.JPG',
  'kodi vepudu':
    'https://upload.wikimedia.org/wikipedia/commons/9/96/Andhra_Fried_Chicken.JPG',
  'chicken curry':
    'https://upload.wikimedia.org/wikipedia/commons/5/51/Chicken_curry_at_Divewalk_Cafe_-_Sarah_Stierch.jpg',
  'andhra chicken curry':
    'https://upload.wikimedia.org/wikipedia/commons/5/51/Chicken_curry_at_Divewalk_Cafe_-_Sarah_Stierch.jpg',
  'andhra kodi kura':
    'https://upload.wikimedia.org/wikipedia/commons/5/51/Chicken_curry_at_Divewalk_Cafe_-_Sarah_Stierch.jpg',
  'japanese ramen':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg/1280px-Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg',
  'shoyu ramen':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg/1280px-Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg',
  'ramen':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg/1280px-Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg',
  'masala dosa':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Masala_Dosa_2023.jpg/1280px-Masala_Dosa_2023.jpg',
  'dosa':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Masala_Dosa_2023.jpg/1280px-Masala_Dosa_2023.jpg',
  'aloo paratha':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Aloo_Paratha.jpg/1280px-Aloo_Paratha.jpg',
  'fried idli':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Fried_Idli-south_north_fusion.jpg/1280px-Fried_Idli-south_north_fusion.jpg',
  'arbi masala':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Arbi_fry.jpg/1280px-Arbi_fry.jpg',
  'sukhi arbi':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Arbi_fry.jpg/1280px-Arbi_fry.jpg',
  'arbi curry':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Arbi_fry.jpg/1280px-Arbi_fry.jpg',
  'chicken biryani':
    'https://upload.wikimedia.org/wikipedia/commons/b/b5/Chicken_biryani_02-06-2015_%28India%29.jpg',
  'chicken pachadi':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Andhra_Chicken_Pickle.jpg/1280px-Andhra_Chicken_Pickle.jpg',
  'andhra chicken pickle':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Andhra_Chicken_Pickle.jpg/1280px-Andhra_Chicken_Pickle.jpg',
  'chicken pickle':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Andhra_Chicken_Pickle.jpg/1280px-Andhra_Chicken_Pickle.jpg',
  'pesarattu':
    'https://upload.wikimedia.org/wikipedia/commons/d/d4/Pesarattu_with_ginger_chutney.jpg',
  'gongura pachadi':
    'https://upload.wikimedia.org/wikipedia/commons/9/99/Gongura_chutney.jpg',
  'gutti vankaya':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloo_Gobi_curry.jpg/1280px-Aloo_Gobi_curry.jpg',
  'idli':
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
  'spaghetti carbonara':
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80',
  'carbonara':
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80',
  'pizza margherita':
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1200&q=80',
  'tacos al pastor':
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80',
  'hyderabadi dum biryani':
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
  'biryani':
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
  'potato fry':
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
  'aloo fry':
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
  'aloo vepudu':
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
};

function normalizeQuery(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function resolveExactFoodImage(dishName: string, requestedDish = ''): Promise<string> {
  const primary = (requestedDish || dishName || '').trim();
  if (!primary) return NEUTRAL_FOOD_PLACEHOLDER;

  const norm = normalizeQuery(primary);
  if (VERIFIED_DISH_IMAGES[norm]) {
    return VERIFIED_DISH_IMAGES[norm];
  }
  for (const [key, url] of Object.entries(VERIFIED_DISH_IMAGES)) {
    if (norm === key || (key.length > 4 && (norm.includes(key) || key.includes(norm)))) {
      return url;
    }
  }

  try {
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      primary + ' food'
    )}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json&origin=*`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(commonsUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GlobalRecipeAgent/1.0 (https://ais-dev.run.app; recipeagent@aistudio.build)',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data: any = await res.json();
      const pages = data?.query?.pages;
      if (pages) {
        for (const pageId of Object.keys(pages)) {
          const page = pages[pageId];
          const title = (page.title || '').toLowerCase();
          if (
            title.includes('logo') ||
            title.includes('map') ||
            title.includes('flag') ||
            title.includes('building') ||
            title.includes('street') ||
            title.includes('diagram')
          ) {
            continue;
          }
          const imgInfo = page.imageinfo?.[0];
          const bestUrl = imgInfo?.thumburl || imgInfo?.url;
          if (bestUrl && (bestUrl.endsWith('.jpg') || bestUrl.endsWith('.jpeg') || bestUrl.endsWith('.png') || bestUrl.endsWith('.JPG'))) {
            return bestUrl;
          }
        }
      }
    }
  } catch {
    // Timeout or network failure on image search
  }

  return NEUTRAL_FOOD_PLACEHOLDER;
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

  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  const isTransient = (err: any) => {
    const status = err?.status;
    const msg = (err?.message || '').toUpperCase();
    return (
      status === 503 ||
      status === 502 ||
      status === 504 ||
      msg.includes('UNAVAILABLE') ||
      msg.includes('TIMEOUT') ||
      msg.includes('OVERLOADED') ||
      msg.includes('DEADLINE_EXCEEDED') ||
      msg.includes('ETIMEDOUT') ||
      msg.includes('ECONNRESET')
    );
  };

  const isQuotaExhausted = (err: any) => {
    const status = err?.status;
    const msg = (err?.message || '').toUpperCase();
    return status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('QUOTA');
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const model of candidateModels) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const startTime = Date.now();
      try {
        console.log(`[Diagnostic] (discover.ts) Attempting model "${model}" (Attempt ${attempt}/${maxAttempts})...`);
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
          console.log(`[Diagnostic] (discover.ts) Model "${model}" succeeded on attempt ${attempt} in ${Date.now() - startTime}ms`);
          return text.trim();
        }
      } catch (err: any) {
        const elapsed = Date.now() - startTime;
        console.error(`[Diagnostic] (discover.ts) Model "${model}" attempt ${attempt} failed after ${elapsed}ms:`, {
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

        if (isQuotaExhausted(err)) {
          console.warn(`[Diagnostic] (discover.ts) 429 Quota exhausted on model "${model}". Skipping retry for this model.`);
          break;
        }

        if (isTransient(err) && attempt < maxAttempts) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
          console.log(`[Diagnostic] (discover.ts) Transient error (${err?.status || '503'}). Backing off for ${backoffMs}ms before retry ${attempt + 1}...`);
          await sleep(backoffMs);
          continue;
        }

        break;
      }
    }
  }

  const status = lastError?.status ||
    (isQuotaExhausted(lastError) ? 429 :
    isTransient(lastError) ? 503 : 500);

  const friendlyMessage = status === 429
    ? 'Gemini API daily quota limit reached (HTTP 429). Please wait a moment or try again later.'
    : status === 503
    ? 'Gemini AI service is temporarily experiencing high traffic (HTTP 503). All retry attempts were exhausted. Please try again in a few moments.'
    : lastError?.message || 'All AI models failed to discover dishes';

  const error: any = new Error(friendlyMessage);
  error.status = status;
  error.code = isQuotaExhausted(lastError) ? 'RATE_LIMIT' : status === 503 ? 'SERVICE_UNAVAILABLE' : 'AI_ERROR';
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

    const enriched = await Promise.all(
      parsed.map(async (d: any) => ({
        ...d,
        imageUrl: await resolveExactFoodImage(d.name, d.name),
      }))
    );

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
