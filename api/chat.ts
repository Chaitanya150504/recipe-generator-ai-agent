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
          setTimeout(() => reject(new Error(`Timeout after 25s on model ${model}`)), 25000)
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
  const error: any = new Error(lastError?.message || 'All AI models failed to process chat');
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

  console.log('[Diagnostic] Incoming POST /api/chat');

  try {
    const body = await parseRequestBody(req);
    const { messages = [], currentRecipe = null, activeLocation = 'Global', dietary = 'all' } = body || {};
    const latestUserMessage = messages[messages.length - 1]?.content || '';

    if (!latestUserMessage.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const conversationHistoryStr = messages
      .slice(-6)
      .map((m: any) => `${(m.role || 'USER').toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `You are a world-renowned Michelin-starred master chef, culinary anthropologist, and conversational kitchen assistant.
Context:
- Current Location/Region explored: "${activeLocation}"
- Current Dietary Preference: "${dietary}"
- Currently Loaded Recipe (if any): ${currentRecipe ? JSON.stringify({ name: currentRecipe.recipe_name, region: currentRecipe.region, servings: currentRecipe.servings }) : 'None'}

CONVERSATION HISTORY:
${conversationHistoryStr}

Analyze the user's latest message and determine their primary intent among:
1. "cuisine_recommendation": User asks for dishes from a location. Provide 5-8 traditional authentic dishes with short descriptions and native names.
2. "recipe_generation": User wants to cook a specific dish. Generate the complete structured recipe JSON.
3. "recipe_customization": User wants to customize the current recipe. Output updated recipe JSON with modified ingredients/steps.
4. "serving_adjustment": User asks to scale servings. Recalculate all ingredient quantities mathematically and output updated recipe JSON.
5. "ingredient_substitution": User asks what to replace an ingredient with. Provide culinary alternatives.
6. "cooking_guidance": User asks step-by-step or troubleshooting questions.
7. "clarification": If the request is ambiguous, ask a polite clarification question with 2-3 quick choices.
8. "general_chat": Friendly culinary advice.

Return pure JSON matching this exact structure:
{
  "intent": "cuisine_recommendation" | "recipe_generation" | "recipe_customization" | "serving_adjustment" | "ingredient_substitution" | "cooking_guidance" | "clarification" | "general_chat",
  "reply": "Friendly, expert conversational reply in markdown format",
  "clarification_options": ["Option 1", "Option 2"],
  "dishes": [
    {
      "name": "English name",
      "nativeName": "Native script name",
      "region": "State / Region",
      "cuisine": "Cuisine",
      "description": "Short vivid description",
      "prepTime": "20 mins",
      "cookTime": "30 mins",
      "dietary": ["Vegetarian"],
      "spiceLevel": "Medium",
      "keyIngredients": ["Ingredient 1", "Ingredient 2"],
      "searchKeyword": "keyword"
    }
  ],
  "recipe": {
    "recipe_name": "Full Recipe Name",
    "cuisine": "Cuisine",
    "country": "Country",
    "region": "Region",
    "description": "2-3 sentences description",
    "ingredients": [
      { "name": "Item name", "quantity": 100, "unit": "g", "category": "Base / Spices", "notes": "optional" }
    ],
    "preparation_time": "20 mins",
    "cooking_time": "30 mins",
    "total_time": "50 mins",
    "servings": 4,
    "difficulty": "Easy",
    "equipment": ["Cast Iron Pan"],
    "instructions": [
      { "step_number": 1, "title": "Stage Title", "description": "Step detail", "duration_minutes": 5, "chef_tip": "Pro tip" }
    ],
    "substitutions": [
      { "original": "Item", "substitute": "Replacement", "ratio": "1:1", "notes": "flavor impact" }
    ],
    "serving_suggestions": ["Pairing 1"],
    "native_name": "Native name",
    "spice_level": "Medium",
    "dietary_tags": ["Vegetarian"]
  }
}`;

    const rawText = await callGemini(
      prompt,
      'You are an intelligent culinary assistant. Output strictly valid JSON conforming to the schema. Never wrap in markdown backticks.'
    );

    const cleaned = cleanJsonOutput(rawText);
    const parsed = JSON.parse(cleaned);

    if (parsed.recipe) {
      parsed.recipe.image_url = await resolveExactFoodImage(parsed.recipe.recipe_name, parsed.recipe.recipe_name);
      if (parsed.recipe.cooking_instructions && !parsed.recipe.instructions) {
        parsed.recipe.instructions = parsed.recipe.cooking_instructions;
      } else if (parsed.recipe.instructions && !parsed.recipe.cooking_instructions) {
        parsed.recipe.cooking_instructions = parsed.recipe.instructions;
      }
    }
    if (Array.isArray(parsed.dishes)) {
      parsed.dishes = await Promise.all(
        parsed.dishes.map(async (d: any) => ({
          ...d,
          imageUrl: await resolveExactFoodImage(d.name, d.name),
        }))
      );
    }

    console.log(`[Diagnostic] Chat response completed for intent: ${parsed.intent}`);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('[Diagnostic] Error in /api/chat:', error?.message || error);
    const status = error?.status || (error?.code === 'NO_API_KEY' ? 403 : 500);
    return res.status(status).json({
      error: error?.message || 'Failed to process chat with AI.',
      status,
    });
  }
}
