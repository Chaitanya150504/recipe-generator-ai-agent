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
  // If req is a stream or raw body
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

/**
 * Resolves an authentic food image for any dish entered by the user.
 * Prioritizes exact user dish name, searches Wikimedia Commons and Wikipedia,
 * and falls back to a neutral culinary kitchen prep placeholder.
 */
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

  const headers = {
    'User-Agent': 'GlobalRecipeAgent/1.0 (https://ais-dev.run.app; recipeagent@aistudio.build)',
  };

  // Dynamic search on Wikimedia Commons
  const candidates = [`${primary} food`, primary];
  for (const q of candidates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2200);
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
        q
      )}&gsrlimit=4&prop=imageinfo&iiprop=url|mime&format=json`;

      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const pages = Object.values(data.query?.pages || {});
        for (const page of pages as any[]) {
          const info = page.imageinfo?.[0];
          const title = (page.title || '').toLowerCase();
          const isInvalid = [
            'building',
            'shop',
            'restaurant',
            'store',
            'map',
            'flag',
            'logo',
            'facade',
            'street',
            'sign',
            'station',
          ].some((w) => title.includes(w));

          if (!isInvalid && info && info.url) {
            if (info.mime === 'image/jpeg' || info.mime === 'image/png' || info.mime === 'image/webp') {
              return info.url;
            }
          }
        }
      }
    } catch {
      // Proceed to next candidate
    }
  }

  // Dynamic Wikipedia lead image
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      primary
    )}&gsrlimit=1&prop=pageimages&pithumbsize=1200&format=json`;

    const res = await fetch(wikiUrl, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const page = Object.values(data.query?.pages || {})[0] as any;
      if (page?.thumbnail?.source) {
        return page.thumbnail.source;
      }
    }
  } catch {
    // Return neutral placeholder
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
        console.log(`[Diagnostic] (generate.ts) Attempting model "${model}" (Attempt ${attempt}/${maxAttempts})...`);
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
            setTimeout(() => reject(new Error(`Timeout after 25s on model ${model}`)), 25000)
          ),
        ]);

        const text = response.text;
        if (text && text.trim()) {
          console.log(`[Diagnostic] (generate.ts) Model "${model}" succeeded on attempt ${attempt} in ${Date.now() - startTime}ms`);
          return text.trim();
        }
      } catch (err: any) {
        const elapsed = Date.now() - startTime;
        console.error(`[Diagnostic] (generate.ts) Model "${model}" attempt ${attempt} failed after ${elapsed}ms:`, {
          status: err?.status,
          code: err?.code,
          message: err?.message,
        });
        lastError = err;

        // 1. If invalid API key / unauthorized (403 or 400 API_KEY_INVALID), immediately stop
        if (err?.status === 403 || err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('PERMISSION_DENIED')) {
          const error: any = new Error('The configured GEMINI_API_KEY is invalid or lacks permissions. Please check your Google AI Studio API key.');
          error.status = 403;
          error.code = 'AUTH_ERROR';
          throw error;
        }

        // 2. Handle 429 quota errors separately. Do NOT retry when daily quota is exhausted.
        if (isQuotaExhausted(err)) {
          console.warn(`[Diagnostic] (generate.ts) 429 Quota exhausted on model "${model}". Skipping retry for this model.`);
          break; // Switch to next candidate model with available quota
        }

        // 3. Retry on temporary 503, 502, 504 errors using exponential backoff (e.g. 1000ms, 2000ms)
        if (isTransient(err) && attempt < maxAttempts) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
          console.log(`[Diagnostic] (generate.ts) Transient error (${err?.status || '503'}). Backing off for ${backoffMs}ms before retry ${attempt + 1}...`);
          await sleep(backoffMs);
          continue;
        }

        // If not transient or reached maxAttempts, proceed to next candidate model
        break;
      }
    }
  }

  // Preserve upstream status or categorize with friendly messages
  const status = lastError?.status ||
    (isQuotaExhausted(lastError) ? 429 :
    isTransient(lastError) ? 503 : 500);

  const friendlyMessage = status === 429
    ? 'Gemini API daily quota limit reached (HTTP 429). Please wait a moment or try again later.'
    : status === 503
    ? 'Gemini AI service is temporarily experiencing high traffic (HTTP 503). All retry attempts were exhausted. Please try again in a few moments.'
    : lastError?.message || 'All AI models failed to generate content';

  const error: any = new Error(friendlyMessage);
  error.status = status;
  error.code = isQuotaExhausted(lastError) ? 'RATE_LIMIT' : status === 503 ? 'SERVICE_UNAVAILABLE' : 'AI_ERROR';
  throw error;
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
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

  console.log('[Diagnostic] Incoming POST /api/recipe/generate');

  try {
    const body = await parseRequestBody(req);
    const { dishName, region, cuisine, dietary, servings = 4, customNote } = body || {};

    if (!dishName || !String(dishName).trim()) {
      console.warn('[Diagnostic] /api/recipe/generate: dishName missing');
      return res.status(400).json({ error: 'dishName is required' });
    }

    const cleanDish = String(dishName).trim();
    const cleanServings = Math.max(1, Math.min(24, parseInt(String(servings)) || 4));

    console.log(`[Diagnostic] Generating recipe for: "${cleanDish}" (Servings: ${cleanServings}, Region: "${region || 'auto'}")`);

    const prompt = `You are a world-renowned master chef, culinary anthropologist, and food scientist.
Generate a completely authentic, highly specific, and distinct recipe for the dish: "${cleanDish}".

${region ? `Note: User suggested region/context: "${region}". Use this if appropriate for "${cleanDish}", but verify true historical origin.` : 'Identify the genuine, historical country, region/state, and cuisine of this dish. DO NOT assign every dish to Andhra Pradesh or India unless it actually originates there (e.g., Japanese Ramen -> Japan; Italian Carbonara -> Lazio, Italy; Mexican Tacos -> Mexico; Pesarattu -> Andhra Pradesh, India; Hyderabadi Dum Biryani -> Telangana/Hyderabad, India).'}
${cuisine ? `User indicated cuisine family: "${cuisine}".` : ''}
${dietary && dietary !== 'all' ? `Strict dietary requirement: ${dietary}. Adapt ingredients accordingly.` : ''}
${customNote ? `Custom user preference: "${customNote}".` : ''}
Target Servings: ${cleanServings}.

CRITICAL REQUIREMENTS:
1. "recipe_name": The authentic culinary name (e.g. "Spaghetti alla Carbonara", "Andhra Aloo Vepudu", "Tokyo Shoyu Ramen", "Tacos al Pastor", "Andhra Kodi Kura", "Hyderabadi Dum Biryani").
2. "requested_dish": "${cleanDish}".
3. "country", "region", "cuisine": Accurate culinary classification of where this dish originated or belongs.
4. "description": Appetizing, 2-3 sentence description detailing distinct flavor profile, textures, and traditional significance.
5. "ingredients": Completely specific to "${cleanDish}" with realistic numeric quantities and standard culinary units (e.g., g, ml, tbsp, tsp, cloves, cup, pieces).
   Each item MUST have: "name" (string), "quantity" (number), "unit" (string), "category" (string), "notes" (optional string).
6. "preparation_time", "cooking_time", "total_time": Realistic, dish-specific timings. Do NOT use generic 20m/35m for everything.
7. "difficulty": "Easy" | "Medium" | "Advanced" reflecting true complexity.
8. "spice_level": "Mild" | "Medium" | "Hot" | "Extra Hot".
9. "equipment": Specific cookware needed.
10. "cooking_instructions": Step-by-step instructions specific to "${cleanDish}".
    - Explain actual procedures: washing, peeling, cutting, marinating, tempering, boiling, searing, frying, simmering, emulsifying, or assembling.
    - NEVER use generic template step titles unless they are the actual, natural steps for this dish.
    - Each step must have: "step_number" (number), "title" (string), "description" (detailed action steps), "duration_minutes" (number, timer duration), "chef_tip" (expert advice).
11. "substitutions": Realistic alternatives for the ACTUAL ingredients in this dish.
12. "serving_suggestions": 2-3 traditional accompaniments, side dishes, or beverage pairings.

Return pure JSON matching this exact structure:
{
  "recipe_name": "Specific dish name",
  "requested_dish": "${cleanDish}",
  "country": "Origin Country",
  "region": "Origin State / Region",
  "cuisine": "Cuisine",
  "description": "Appetizing description",
  "ingredients": [
    { "name": "Exact ingredient", "quantity": 100, "unit": "g", "category": "Base", "notes": "Prep notes" }
  ],
  "preparation_time": "Real prep time",
  "cooking_time": "Real cook time",
  "total_time": "Real total time",
  "servings": ${cleanServings},
  "difficulty": "Easy" | "Medium" | "Advanced",
  "spice_level": "Mild" | "Medium" | "Hot" | "Extra Hot",
  "equipment": ["Cookware 1", "Cookware 2"],
  "cooking_instructions": [
    { "step_number": 1, "title": "Specific Step Title", "description": "Clear step instructions", "duration_minutes": 5, "chef_tip": "Specific chef tip" }
  ],
  "substitutions": [
    { "original": "Item", "substitute": "Alternative", "ratio": "1:1", "notes": "Notes" }
  ],
  "serving_suggestions": ["Pairing 1", "Pairing 2"]
}`;

    const rawText = await callGemini(
      prompt,
      'You are an authentic world culinary scholar and master chef. You MUST output strictly valid JSON conforming to the recipe schema. Never use generic or identical templates.'
    );

    const cleaned = cleanJsonOutput(rawText);
    const parsed = JSON.parse(cleaned);

    if (!parsed.recipe_name || !Array.isArray(parsed.ingredients)) {
      throw new Error('Received incomplete recipe structure from AI model.');
    }

    // Normalize instructions
    const instructionsList = Array.isArray(parsed.cooking_instructions) && parsed.cooking_instructions.length > 0
      ? parsed.cooking_instructions
      : Array.isArray(parsed.instructions) && parsed.instructions.length > 0
      ? parsed.instructions
      : [];

    parsed.cooking_instructions = instructionsList;
    parsed.instructions = instructionsList;
    parsed.requested_dish = cleanDish;
    parsed.image_url = await resolveExactFoodImage(parsed.recipe_name, cleanDish);

    console.log(`[Diagnostic] Successfully generated recipe: "${parsed.recipe_name}" (${parsed.ingredients.length} ingredients)`);
    return res.status(200).json({ recipe: parsed, source: 'ai' });
  } catch (error: any) {
    console.error('[Diagnostic] Error in /api/recipe/generate:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });

    const status = error?.status || (error?.code === 'NO_API_KEY' ? 403 : 500);
    return res.status(status).json({
      error: error?.message || 'Failed to generate authentic recipe.',
      code: error?.code || 'RECIPE_GEN_ERROR',
      status,
    });
  }
}
