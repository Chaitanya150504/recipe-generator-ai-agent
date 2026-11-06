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
  if (q.includes('potato') || q.includes('aloo') || q.includes('fry') || q.includes('vepudu')) {
    return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1000&q=80';
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
          setTimeout(() => reject(new Error(`Timeout after 25s on model ${model}`)), 25000)
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

      // If invalid API key / unauthorized (403 or 400 API_KEY_INVALID), immediately stop
      if (err?.status === 403 || err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('PERMISSION_DENIED')) {
        const error: any = new Error('The configured GEMINI_API_KEY is invalid or lacks permissions. Please check your Google AI Studio API key.');
        error.status = 403;
        error.code = 'AUTH_ERROR';
        throw error;
      }
    }
  }

  // Preserve upstream status or categorize
  const status = lastError?.status ||
    (lastError?.message?.includes('RESOURCE_EXHAUSTED') ? 429 :
    lastError?.message?.includes('UNAVAILABLE') ? 503 : 500);

  const error: any = new Error(lastError?.message || 'All AI models failed to generate content');
  error.status = status;
  error.code = lastError?.code || (status === 429 ? 'RATE_LIMIT' : status === 503 ? 'SERVICE_UNAVAILABLE' : 'AI_ERROR');
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
11. "cooking_tips": 2-4 dish-specific secrets.
12. "substitutions": Realistic alternatives for the ACTUAL ingredients in this dish.
13. "serving_suggestions": 2-3 traditional accompaniments, side dishes, or beverage pairings.
14. "cultural_background": An informative paragraph on the history, cultural origin, and folklore of this specific dish.

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
  "cooking_tips": ["Tip 1", "Tip 2"],
  "substitutions": [
    { "original": "Item", "substitute": "Alternative", "ratio": "1:1", "notes": "Notes" }
  ],
  "serving_suggestions": ["Pairing 1", "Pairing 2"],
  "cultural_background": "Authentic history and cultural context"
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
    parsed.image_url = getCulinaryImage(parsed.recipe_name, parsed.region || parsed.cuisine || cleanDish);

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
