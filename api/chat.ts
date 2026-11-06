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
  if (q.includes('curry') || q.includes('paneer') || q.includes('masala') || q.includes('tikka') || q.includes('dal')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80';
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
    "cooking_tips": ["Tip 1"],
    "substitutions": [
      { "original": "Item", "substitute": "Replacement", "ratio": "1:1", "notes": "flavor impact" }
    ],
    "serving_suggestions": ["Pairing 1"],
    "native_name": "Native name",
    "cultural_background": "Heritage story",
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
      parsed.recipe.image_url = getCulinaryImage(parsed.recipe.recipe_name, parsed.recipe.region || parsed.recipe.cuisine);
      if (parsed.recipe.cooking_instructions && !parsed.recipe.instructions) {
        parsed.recipe.instructions = parsed.recipe.cooking_instructions;
      } else if (parsed.recipe.instructions && !parsed.recipe.cooking_instructions) {
        parsed.recipe.cooking_instructions = parsed.recipe.instructions;
      }
    }
    if (Array.isArray(parsed.dishes)) {
      parsed.dishes = parsed.dishes.map((d: any) => ({
        ...d,
        imageUrl: getCulinaryImage(d.name + ' ' + (d.searchKeyword || ''), d.cuisine || activeLocation),
      }));
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
