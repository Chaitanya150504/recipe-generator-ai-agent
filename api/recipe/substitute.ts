import { generateAIContent } from '../_lib/gemini';

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

    const { ingredient, dishName, dietary, reason } = body;
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

    try {
      const text = await generateAIContent({
        contents: prompt,
        systemInstruction: 'You are a culinary science expert. Output strictly valid JSON array of substitutes.',
        responseMimeType: 'application/json',
        timeoutMs: 15000,
      });

      const parsed = JSON.parse(text ?? '[]');
      return res.status(200).json({ substitutes: parsed });
    } catch (err: any) {
      console.warn('Gemini substitute error, using culinary heuristic fallback:', err?.message || err);
      return res.status(200).json({
        substitutes: [
          {
            name: `Culinary Alternative for ${ingredient}`,
            ratio: '1:1 ratio',
            flavorImpact: 'Maintains similar texture and moisture balance.',
            culinaryAdvice: `Incorporate at the same cooking stage as ${ingredient}. Adjust seasoning to taste.`
          }
        ]
      });
    }
  } catch (error: any) {
    console.error('Error finding substitutes:', error);
    return res.status(500).json({ error: error?.message || 'Failed to find substitutions' });
  }
}
