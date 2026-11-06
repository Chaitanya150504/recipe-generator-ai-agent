import { generateAIContent, getCulinaryImage } from './_lib/gemini';

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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON request body' });
      }
    }
    body = body || {};

    const { messages = [], currentRecipe = null, activeLocation = 'Global', dietary = 'all' } = body;
    const latestUserMessage = messages[messages.length - 1]?.content || '';

    if (!latestUserMessage.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const conversationHistoryStr = messages
      .slice(-6)
      .map((m: any) => `${(m.role || 'USER').toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `You are a world-renowned Michelin-starred master chef, culinary anthropologist, and conversational kitchen assistant.
You maintain conversation context and understand regional authentic cooking with extreme depth.
Context:
- Current Location/Region explored: "${activeLocation}"
- Current Dietary Preference: "${dietary}"
- Currently Loaded Recipe (if any): ${currentRecipe ? JSON.stringify({ name: currentRecipe.recipe_name, region: currentRecipe.region, servings: currentRecipe.servings }) : 'None'}

CONVERSATION HISTORY:
${conversationHistoryStr}

Analyze the user's latest message and determine their primary intent among:
1. "cuisine_recommendation": User asks for dishes from a country, state, or region (e.g., "Show me Andhra recipes", "What do they eat in Sicily?", "Telangana food"). Provide 5-8 traditional authentic dishes with short vivid descriptions and native names.
2. "recipe_generation": User wants to cook a specific dish (e.g., "Pesarattu", "Make Gongura Mutton", "How do I make Carbonara?"). Generate the complete structured recipe JSON adhering to the recipe schema.
3. "recipe_customization": User wants to customize the current recipe (e.g., "Can I make it without ginger?", "Make it spicy", "Can I bake it instead of fry?"). Explain the technique clearly and output the updated recipe JSON with modified ingredients/steps.
4. "serving_adjustment": User asks to scale servings (e.g., "Make it for 4 people", "Scale to 8"). Recalculate all ingredient quantities mathematically and output the updated recipe JSON.
5. "ingredient_substitution": User asks what to replace an ingredient with. Provide culinary alternatives with exact ratios and advice.
6. "cooking_guidance": User asks a step-by-step or troubleshooting question (e.g., "Why is it sticking?", "How hot should the tawa be?"). Give precise cooking science tips.
7. "clarification": If the request is truly ambiguous, ask a polite, helpful clarification question with 2-3 quick choices.
8. "general_chat": Friendly culinary banter or kitchen guidance.

CRITICAL FORMATTING INSTRUCTIONS:
Always respond with valid pure JSON matching this exact structure:
{
  "intent": "cuisine_recommendation" | "recipe_generation" | "recipe_customization" | "serving_adjustment" | "ingredient_substitution" | "cooking_guidance" | "clarification" | "general_chat",
  "reply": "Friendly, expert conversational reply explaining your recommendations or instructions clearly in markdown format",
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

    const text = await generateAIContent({
      contents: prompt,
      systemInstruction: 'You are an intelligent culinary assistant. Always output pure, strictly valid JSON conforming to the schema. Do not output markdown backticks around the json.',
      responseMimeType: 'application/json',
      timeoutMs: 25000,
    });

    const parsed = JSON.parse(text);

    // Enrich recipe or dishes with images
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

    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message || error);
    const status = error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED')
      ? 429
      : error?.status === 403 || error?.code === 'NO_API_KEY'
      ? 403
      : 500;

    return res.status(status).json({
      error: error?.message || 'Failed to process chat message with AI.'
    });
  }
}
