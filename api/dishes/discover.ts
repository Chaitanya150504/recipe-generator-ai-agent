import { generateAIContent, getCulinaryImage } from '../_lib/gemini';

const REGIONAL_DISH_FALLBACKS: Record<string, any[]> = {
  'andhra pradesh': [
    {
      name: 'Andhra Gongura Mutton / Gongura Pappu',
      nativeName: 'గోంగూర పప్పు / మాంసం',
      region: 'Andhra Pradesh',
      cuisine: 'Telugu / Andhra',
      description: 'Signature Andhra delicacy infused with tangy sorrel leaves (Gongura), fiery Guntur red chilies, and garlic mustard tempering.',
      prepTime: '20 mins',
      cookTime: '35 mins',
      dietary: ['Non-Vegetarian', 'Vegetarian Option'],
      spiceLevel: 'Hot',
      keyIngredients: ['Gongura (Sorrel leaves)', 'Guntur Red Chilies', 'Toor Dal / Mutton', 'Mustard & Garlic Tadka'],
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Pesarattu Upma',
      nativeName: 'పెసరట్టు ఉప్మా',
      region: 'Andhra Pradesh',
      cuisine: 'Telugu / Andhra',
      description: 'Crisp green gram (whole moong) crepe topped with minced ginger and cumin, stuffed with piping hot semolina upma, and served with allam (ginger) pachadi.',
      prepTime: '15 mins',
      cookTime: '20 mins',
      dietary: ['Vegetarian', 'Vegan'],
      spiceLevel: 'Medium',
      keyIngredients: ['Whole Green Moong', 'Semolina (Upma Rava)', 'Fresh Ginger', 'Green Chilies', 'Cumin'],
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Royyala Iguru (Andhra Prawn Masala)',
      nativeName: 'రొయ్యల ఇగురు',
      region: 'Andhra Pradesh',
      cuisine: 'Telugu / Andhra',
      description: 'Succulent fresh prawns slow-cooked in a thick, spicy coastal Andhra reduction of caramelized shallots, poppy seeds paste, and fresh curry leaves.',
      prepTime: '15 mins',
      cookTime: '25 mins',
      dietary: ['Non-Vegetarian'],
      spiceLevel: 'Hot',
      keyIngredients: ['Coastal Prawns', 'Shallots', 'Guntur Chili Powder', 'Gasagasalu (Poppy Seeds)', 'Curry Leaves'],
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Andhra Natu Kodi Pulusu',
      nativeName: 'నాటుకోడి పులుసు',
      region: 'Andhra Pradesh',
      cuisine: 'Telugu / Andhra',
      description: 'Fiery country chicken stew cooked with stone-ground coriander, black pepper, roasted dry coconut, and tangy tamarind broth.',
      prepTime: '25 mins',
      cookTime: '45 mins',
      dietary: ['Non-Vegetarian'],
      spiceLevel: 'Extra Hot',
      keyIngredients: ['Country Chicken', 'Dry Coconut (Kobbari)', 'Coriander Seeds', 'Black Peppercorns', 'Tamarind'],
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Gutti Vankaya Kura',
      nativeName: 'గుత్తి వంకాయ కూర',
      region: 'Andhra Pradesh',
      cuisine: 'Telugu / Andhra',
      description: 'Baby purple eggplants slit into quarters and stuffed with a fragrant dry-roasted paste of peanuts, sesame seeds, coconut, and cumin.',
      prepTime: '20 mins',
      cookTime: '30 mins',
      dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      spiceLevel: 'Medium',
      keyIngredients: ['Small Purple Brinjals', 'Roasted Peanuts', 'White Sesame Seeds', 'Cumin & Coriander', 'Tamarind Pulp'],
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Chepala Pulusu',
      nativeName: 'చేపల పులుసు',
      region: 'Andhra Pradesh',
      cuisine: 'Telugu / Andhra',
      description: 'Traditional earthen-pot fish curry stewed in a rich tamarind gravy with fenugreek and mustard seeds.',
      prepTime: '20 mins',
      cookTime: '30 mins',
      dietary: ['Non-Vegetarian'],
      spiceLevel: 'Hot',
      keyIngredients: ['Freshwater Fish (Murrel/Rohu)', 'Tamarind Paste', 'Fenugreek Seeds', 'Guntur Chili', 'Shallots'],
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    }
  ],
  'telangana': [
    {
      name: 'Hyderabadi Dum Biryani',
      nativeName: 'حیدرآبادی دم بریانی',
      region: 'Telangana',
      cuisine: 'Hyderabadi / Telangana',
      description: 'The royal handi dish: aged basmati rice and marinated meat slow-cooked together with saffron milk and crispy birista onions.',
      prepTime: '45 mins',
      cookTime: '50 mins',
      dietary: ['Non-Vegetarian', 'Vegetarian Option'],
      spiceLevel: 'Medium',
      keyIngredients: ['Aged Basmati Rice', 'Kashmiri Saffron', 'Shahi Jeera & Cardamom', 'Yogurt Marination', 'Fried Onions'],
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Sarva Pindi',
      nativeName: 'సర్వపిండి',
      region: 'Telangana',
      cuisine: 'Telangana',
      description: 'Traditional Telangana crispy skillet bread made with rice flour, chana dal, peanuts, sesame seeds, curry leaves, and green chilies.',
      prepTime: '15 mins',
      cookTime: '20 mins',
      dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      spiceLevel: 'Medium',
      keyIngredients: ['Rice Flour', 'Chana Dal (soaked)', 'Roasted Peanuts', 'White Sesame', 'Curry Leaves'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    }
  ],
  'kerala': [
    {
      name: 'Kerala Appam with Vegetable / Chicken Stew',
      nativeName: 'അപ്പം ഇഷ്‍ടു',
      region: 'Kerala',
      cuisine: 'Kerala / South Indian',
      description: 'Lacy, bowl-shaped fermented rice hoppers with a pillowy soft center, served with fragrant coconut milk stew delicately flavored with cloves and cardamom.',
      prepTime: '30 mins',
      cookTime: '25 mins',
      dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      spiceLevel: 'Mild',
      keyIngredients: ['Raw Rice', 'Fresh Coconut Milk', 'Green Cardamom & Cloves', 'Potatoes & Carrots', 'Curry Leaves in Virgin Coconut Oil'],
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    }
  ],
  'punjab': [
    {
      name: 'Sarson Ka Saag & Makki Di Roti',
      nativeName: 'ਸਰ੍ਹੋਂ ਦਾ ਸਾਗ ਤੇ ਮੱਕੀ ਦੀ ਰੋਟੀ',
      region: 'Punjab',
      cuisine: 'Punjabi / North Indian',
      description: 'Slow-simmered winter mustard greens mashed in earthen handi with cornmeal, crowned with white butter (makhan).',
      prepTime: '30 mins',
      cookTime: '60 mins',
      dietary: ['Vegetarian', 'Gluten-Free'],
      spiceLevel: 'Medium',
      keyIngredients: ['Fresh Mustard Greens', 'Makki Atta (Cornmeal)', 'Fresh Ginger & Garlic', 'Desi Ghee', 'White Makhan'],
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    }
  ],
  'tamil nadu': [
    {
      name: 'Chettinad Kozhi Curry (Chicken Chettinad)',
      nativeName: 'செட்டிநாடு கோழி வறுவல்',
      region: 'Tamil Nadu',
      cuisine: 'Chettinad / South Indian',
      description: 'Spiced chicken cooked in freshly roasted stone-ground spices: star anise, kalpasi (black stone flower), peppercorn, and coconut paste.',
      prepTime: '25 mins',
      cookTime: '35 mins',
      dietary: ['Non-Vegetarian', 'Gluten-Free'],
      spiceLevel: 'Hot',
      keyIngredients: ['Country Chicken', 'Kalpasi (Stone Flower)', 'Black Peppercorns', 'Fennel Seeds', 'Gingelly Oil'],
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    }
  ]
};

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
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }
    body = body || {};

    const { query, region, cuisine, dietary } = body;
    const target = (region || cuisine || query || 'Andhra Pradesh').trim();
    const dietaryFilter = dietary && dietary !== 'all' ? `Strictly filter for ${dietary} options only.` : '';

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
11. "searchKeyword": 1-2 words best describing food photography for this dish`;

    try {
      const text = await generateAIContent({
        contents: prompt,
        systemInstruction: 'You are an authentic world culinary anthropologist. Output strictly valid JSON array of regional dishes matching the schema.',
        responseMimeType: 'application/json',
        timeoutMs: 20000,
      });

      const parsed = JSON.parse(text ?? '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        const enriched = parsed.map((d: any) => ({
          ...d,
          imageUrl: getCulinaryImage(d.name + ' ' + (d.searchKeyword || ''), d.cuisine || target),
        }));
        return res.status(200).json({ dishes: enriched, source: 'ai' });
      }
    } catch (err: any) {
      console.warn('Gemini discover error or timeout, checking curated fallback:', err?.message || err);
    }

    const lower = target.toLowerCase();
    for (const [key, list] of Object.entries(REGIONAL_DISH_FALLBACKS)) {
      if (lower.includes(key) || key.includes(lower)) {
        return res.status(200).json({ dishes: list, source: 'curated' });
      }
    }

    return res.status(200).json({
      dishes: [
        {
          name: `${target} Traditional Heritage Plate`,
          nativeName: target,
          region: target,
          cuisine: cuisine || 'Regional',
          description: `Celebrated regional preparation from ${target} showcasing customary stone-ground spices, ancestral cooking vessels, and authentic flavor equilibrium.`,
          prepTime: '20 mins',
          cookTime: '30 mins',
          dietary: [dietary || 'Vegetarian'],
          spiceLevel: 'Medium',
          keyIngredients: ['Heritage Spices', 'Cold-Pressed Oil', 'Aromatics', 'Fresh Seasonal Produce'],
          imageUrl: getCulinaryImage(target, target),
        }
      ],
      source: 'curated'
    });
  } catch (error: any) {
    console.error('Error discovering dishes:', error);
    return res.status(500).json({ error: error?.message || 'Failed to discover dishes' });
  }
}
