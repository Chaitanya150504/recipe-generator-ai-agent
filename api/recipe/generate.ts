import { generateAIContent, getCulinaryImage } from '../_lib/gemini';

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

    const { dishName, region, cuisine, dietary, servings = 4, customNote } = body;
    if (!dishName || !dishName.trim()) {
      return res.status(400).json({ error: 'dishName is required' });
    }

    const cleanDish = dishName.trim();
    const cleanServings = Math.max(1, Math.min(24, parseInt(servings) || 4));

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
   - If Potato Fry: Potatoes, mustard seeds, cumin, green chillies, curry leaves, turmeric, red chilli powder, oil, salt.
   - If Chicken Curry: Chicken, onions, tomatoes, ginger-garlic paste, green chillies, chilli powder, coriander powder, garam masala, curry leaves, oil, salt.
   - If Carbonara: Guanciale, Pecorino Romano, egg yolks, black pepper, spaghetti.
   - If Ramen: Fresh ramen noodles, broth, shoyu tare, ajitsuke tamago, chashu/tofu, scallions, nori, menma.
   - If Tacos: Tortillas, seasoned protein/filling, onions, cilantro, lime, salsa.
   Each item MUST have: "name" (string), "quantity" (number), "unit" (string), "category" (string), "notes" (optional string).
6. "preparation_time", "cooking_time", "total_time": Realistic, dish-specific timings (e.g., Carbonara takes 10m prep, 15m cook; Biryani takes 60m prep, 60m cook; Potato Fry takes 10m prep, 20m cook). Do NOT use generic 20m/35m for everything.
7. "difficulty": "Easy" | "Medium" | "Advanced" reflecting true complexity.
8. "spice_level": "Mild" | "Medium" | "Hot" | "Extra Hot".
9. "equipment": Specific cookware needed (e.g., "Cast-Iron Skillet", "Pasta Pot & Tongs", "Deep Donburi Bowls", "Heavy Handi with Dough Seal").
10. "cooking_instructions": Step-by-step instructions specific to "${cleanDish}".
    - Explain actual procedures: washing, peeling, cutting, marinating, tempering, boiling, searing, frying, simmering, emulsifying, or assembling.
    - NEVER use generic template step titles like "Temper whole spices and aromatics", "Slow onion caramelization", "Bloom spices and simmer main elements", "Rest and harmonize" unless they are the actual, natural steps for this dish.
    - Each step must have: "step_number" (number), "title" (string), "description" (detailed action steps), "duration_minutes" (number, timer duration), "chef_tip" (expert advice).
11. "cooking_tips": 2-4 dish-specific secrets (e.g. how to get crispy potatoes without burning, how to prevent eggs from curdling in carbonara, how to get clarity in ramen broth).
12. "substitutions": Realistic alternatives for the ACTUAL ingredients in this dish (e.g. Pancetta for Guanciale in Carbonara; Cumin for Mustard Seeds in Potato Fry; Tofu for Chashu in Ramen). DO NOT suggest ghee for non-Indian dishes.
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

    const text = await generateAIContent({
      contents: prompt,
      systemInstruction: 'You are an authentic world culinary scholar and master chef. You MUST output strictly valid JSON conforming to the recipe schema. Never use generic or identical templates.',
      responseMimeType: 'application/json',
      timeoutMs: 25000,
    });

    const parsed = JSON.parse(text);
    if (!parsed.recipe_name || !Array.isArray(parsed.ingredients)) {
      throw new Error('Received incomplete recipe structure from AI model.');
    }

    // Normalize instructions so both cooking_instructions and instructions are populated
    const instructionsList = Array.isArray(parsed.cooking_instructions) && parsed.cooking_instructions.length > 0
      ? parsed.cooking_instructions
      : Array.isArray(parsed.instructions) && parsed.instructions.length > 0
      ? parsed.instructions
      : [];

    parsed.cooking_instructions = instructionsList;
    parsed.instructions = instructionsList;
    parsed.requested_dish = cleanDish;
    parsed.image_url = getCulinaryImage(parsed.recipe_name, parsed.region || parsed.cuisine || cleanDish);

    return res.status(200).json({ recipe: parsed, source: 'ai' });
  } catch (error: any) {
    console.error('Error generating recipe via AI:', error?.message || error);
    const status = error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED')
      ? 429
      : error?.status === 403 || error?.code === 'NO_API_KEY'
      ? 403
      : 500;

    return res.status(status).json({
      error: error?.message || `Failed to generate authentic recipe for "${req.body?.dishName || 'your dish'}".`
    });
  }
}
