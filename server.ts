import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn('GEMINI_API_KEY is not defined. AI endpoints will provide curated regional fallbacks.');
}

async function generateAIContent(options: {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  timeoutMs?: number;
}): Promise<string> {
  if (!ai) {
    throw new Error('Gemini AI client is not initialized. Please ensure GEMINI_API_KEY is configured.');
  }

  const timeoutMs = options.timeoutMs || 25000;
  // Models to attempt: 'gemini-3.1-flash-lite' first (high performance & active free-tier quota), then 'gemini-3.8-flash'
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction,
            responseMimeType: options.responseMimeType || 'application/json',
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`AI generation timed out after ${timeoutMs}ms on model ${model}`)), timeoutMs)
        ),
      ]);

      const text = response.text;
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models failed to generate content');
}

function withTimeout<T>(promise: Promise<T>, ms = 20000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// Map cuisine / dish to realistic culinary imagery
function getCulinaryImage(dishName: string, cuisineOrRegion = ''): string {
  const q = (dishName + ' ' + cuisineOrRegion).toLowerCase();
  if (q.includes('biryani') || q.includes('pulao') || q.includes('rice')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('pizza') || q.includes('focaccia')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('pasta') || q.includes('carbonara') || q.includes('ragu') || q.includes('spaghetti') || q.includes('orecchiette')) {
    return 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('ramen') || q.includes('noodle') || q.includes('pho') || q.includes('udon')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('sushi') || q.includes('sashimi')) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('taco') || q.includes('burrito') || q.includes('enchilada') || q.includes('mole') || q.includes('mexican')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('pad thai') || q.includes('thai') || q.includes('tom yum')) {
    return 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('dosa') || q.includes('idli') || q.includes('appam') || q.includes('pesarattu') || q.includes('pongal')) {
    return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('curry') || q.includes('paneer') || q.includes('masala') || q.includes('tikka') || q.includes('dal') || q.includes('pappu') || q.includes('gongura')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('croissant') || q.includes('pastry') || q.includes('dessert') || q.includes('cake') || q.includes('tart')) {
    return 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('soup') || q.includes('stew') || q.includes('bouillabaisse') || q.includes('pulusu')) {
    return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('dim sum') || q.includes('dumpling') || q.includes('bao') || q.includes('gyoza') || q.includes('momos')) {
    return 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('salad') || q.includes('bowl')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('fish') || q.includes('seafood') || q.includes('prawn') || q.includes('karimeen') || q.includes('royyala')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80';
  }
  if (q.includes('bread') || q.includes('kulcha') || q.includes('naan') || q.includes('roti') || q.includes('parotta')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80';
}

// Curated regional dishes fallback database
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
      description: 'Traditional earthen-pot fish curry stewed in a rich tamarind gravy with fenugreek and mustard seeds, tasting even better the next morning.',
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
      description: 'The world-famous royal dish: aged basmati rice and marinated meat slow-cooked together in a dough-sealed handi with saffron milk and crispy birista onions.',
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
      description: 'Traditional Telangana crispy skillet bread made with rice flour, chana dal, peanuts, sesame seeds, curry leaves, and green chilies, pressed into a copper skillet.',
      prepTime: '15 mins',
      cookTime: '20 mins',
      dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      spiceLevel: 'Medium',
      keyIngredients: ['Rice Flour', 'Chana Dal (soaked)', 'Roasted Peanuts', 'White Sesame', 'Curry Leaves'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Bagara Baingan',
      nativeName: 'బగారా బైంగన్',
      region: 'Telangana',
      cuisine: 'Hyderabadi',
      description: 'Baby eggplants slit and simmered in a velvety roasted peanut, sesame, coconut, and tamarind salan.',
      prepTime: '20 mins',
      cookTime: '30 mins',
      dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      spiceLevel: 'Medium',
      keyIngredients: ['Baby Eggplants', 'Roasted Sesame', 'Peanuts', 'Tamarind Pulp', 'Nigella Seeds (Kalonji)'],
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Sakinalu',
      nativeName: 'సకినాలు',
      region: 'Telangana',
      cuisine: 'Telangana',
      description: 'Concentric spiral fritters crafted from freshly ground new harvest rice and white sesame seeds, prepared during Sankranti festival.',
      prepTime: '30 mins',
      cookTime: '25 mins',
      dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      spiceLevel: 'Mild',
      keyIngredients: ['Raw Rice Flour', 'Sesame Seeds', 'Ajwain (Carom seeds)', 'Sea Salt', 'Peanut Oil'],
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
    },
    {
      name: 'Karimeen Pollichathu',
      nativeName: 'കരിമീൻ പൊള്ളിച്ചത്',
      region: 'Kerala',
      cuisine: 'Kerala / South Indian',
      description: 'Backwater Pearl Spot fish slathered in spicy shallot-kudampuli masala, wrapped in smoked banana leaf, and pan-grilled to smoky perfection.',
      prepTime: '25 mins',
      cookTime: '20 mins',
      dietary: ['Non-Vegetarian', 'Gluten-Free'],
      spiceLevel: 'Hot',
      keyIngredients: ['Karimeen (Pearl Spot) / Seabass', 'Shallots', 'Kudampuli (Malabar Tamarind)', 'Banana Leaf', 'Pure Coconut Oil'],
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Malabar Parotta with Beef Roast',
      nativeName: 'മലബാർ പൊറോട്ട',
      region: 'Kerala',
      cuisine: 'Malabar',
      description: 'Flaky, spiral-layered unleavened flatbread served with slow-roasted caramelized spiced meat infused with toasted coconut slices.',
      prepTime: '45 mins',
      cookTime: '35 mins',
      dietary: ['Non-Vegetarian'],
      spiceLevel: 'Hot',
      keyIngredients: ['Layered Dough with Ghee', 'Fresh Fennel Seeds', 'Coconut Chunks', 'Black Pepper', 'Curry Leaves'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    }
  ],
  'punjab': [
    {
      name: 'Sarson Ka Saag & Makki Di Roti',
      nativeName: 'ਸਰ੍ਹੋਂ ਦਾ ਸਾਗ ਤੇ ਮੱਕੀ ਦੀ ਰੋਟੀ',
      region: 'Punjab',
      cuisine: 'Punjabi / North Indian',
      description: 'Slow-simmered winter mustard greens, bathua, and spinach mashed in earthen handi with cornmeal, crowned with homemade white butter (makhan) and jaggery.',
      prepTime: '30 mins',
      cookTime: '60 mins',
      dietary: ['Vegetarian', 'Gluten-Free'],
      spiceLevel: 'Medium',
      keyIngredients: ['Fresh Mustard Greens', 'Makki Atta (Cornmeal)', 'Fresh Ginger & Garlic', 'Desi Ghee', 'White Makhan'],
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Amritsari Kulcha with Pindi Chole',
      nativeName: 'ਅੰਮ੍ਰਿਤਸਰੀ ਕੁਲਚਾ',
      region: 'Punjab',
      cuisine: 'Punjabi / North Indian',
      description: 'Flaky, multilayered tandoor bread stuffed with spiced mashed potatoes, ajwain, and pomegranate seeds, paired with dark, tangy chickpeas simmered in tea decoction.',
      prepTime: '40 mins',
      cookTime: '30 mins',
      dietary: ['Vegetarian'],
      spiceLevel: 'Medium',
      keyIngredients: ['Maida & Ghee Layers', 'Kabuli Chana', 'Anardana (Dried Pomegranate)', 'Ajwain', 'Kasuri Methi'],
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    }
  ],
  'tamil nadu': [
    {
      name: 'Chettinad Kozhi Curry (Chicken Chettinad)',
      nativeName: 'செட்டிநாடு கோழி வறுவல்',
      region: 'Tamil Nadu',
      cuisine: 'Chettinad / South Indian',
      description: 'Legendary Karaikudi spiced chicken cooked in freshly roasted stone-ground spices: star anise, kalpasi (black stone flower), peppercorn, and coconut paste.',
      prepTime: '25 mins',
      cookTime: '35 mins',
      dietary: ['Non-Vegetarian', 'Gluten-Free'],
      spiceLevel: 'Hot',
      keyIngredients: ['Country Chicken', 'Kalpasi (Stone Flower)', 'Black Peppercorns', 'Fennel Seeds', 'Gingelly (Sesame) Oil'],
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Ven Pongal & Medu Vada',
      nativeName: 'வெண் பொங்கல்',
      region: 'Tamil Nadu',
      cuisine: 'Tamil / South Indian',
      description: 'Creamy porridge of short-grain rice and split yellow moong dal tempered in pure ghee with crushed black pepper, cumin seeds, ginger, and golden cashews.',
      prepTime: '15 mins',
      cookTime: '20 mins',
      dietary: ['Vegetarian', 'Gluten-Free'],
      spiceLevel: 'Mild',
      keyIngredients: ['Raw Rice', 'Yellow Moong Dal', 'Whole Black Pepper', 'Cashew Nuts', 'Curry Leaves & Pure Desi Ghee'],
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    }
  ]
};

// Builder for authentic structured recipe object adhering strictly to the user schema
function buildStructuredRecipeFallback(dishName: string, region = 'Authentic Origin', cuisine = 'Traditional Gastronomy', servings = 4, customDietary = ''): any {
  const isRice = dishName.toLowerCase().includes('biryani') || dishName.toLowerCase().includes('pulao') || dishName.toLowerCase().includes('rice');
  const isPesarattu = dishName.toLowerCase().includes('pesarattu');
  const isAndhra = region.toLowerCase().includes('andhra') || dishName.toLowerCase().includes('gongura');

  if (isPesarattu) {
    return {
      recipe_name: 'Authentic Andhra Pesarattu Upma',
      cuisine: 'Telugu / Andhra',
      country: 'India',
      region: 'Andhra Pradesh',
      description: 'Classic high-protein Andhra green gram crepe made from stone-ground whole moong, studded with minced ginger and cumin, stuffed with warm savory semolina upma, and served with tangy allam (ginger) pachadi.',
      ingredients: [
        { name: 'Whole Green Moong Dal (Green Gram)', quantity: 250 * (servings / 4), unit: 'g', notes: 'soaked for 4-6 hours', category: 'Batter' },
        { name: 'Raw Rice (Sona Masoori)', quantity: 2 * (servings / 4), unit: 'tbsp', notes: 'for crispness', category: 'Batter' },
        { name: 'Fresh Ginger Root', quantity: 2 * (servings / 4), unit: 'inch piece', notes: 'peeled and finely minced', category: 'Aromatics' },
        { name: 'Guntur Green Chilies', quantity: 4 * (servings / 4), unit: 'pieces', notes: 'slit lengthwise', category: 'Spices' },
        { name: 'Cumin Seeds (Jeera)', quantity: 1.5 * (servings / 4), unit: 'tsp', notes: 'whole', category: 'Tempering' },
        { name: 'Finely Chopped Red Onions', quantity: 1 * (servings / 4), unit: 'cup', notes: 'for topping', category: 'Topping' },
        { name: 'Upma Rava (Bombay Semolina)', quantity: 1 * (servings / 4), unit: 'cup', notes: 'roasted in ghee for filling', category: 'Upma Filling' },
        { name: 'Cold-Pressed Peanut Oil or Desi Ghee', quantity: 3 * (servings / 4), unit: 'tbsp', notes: 'for crisping on tawa', category: 'Cooking Fat' },
        { name: 'Rock Salt', quantity: 1.5 * (servings / 4), unit: 'tsp', notes: 'to taste', category: 'Seasoning' },
      ],
      preparation_time: '20 mins (plus soaking)',
      cooking_time: '20 mins',
      total_time: '40 mins',
      servings,
      difficulty: 'Medium',
      equipment: ['Heavy Cast-Iron Tawa (Dosa Pan)', 'High-Speed Grinder / Blender', 'Flat Dosa Spatula', 'Medium Saucepan for Upma'],
      instructions: [
        {
          step_number: 1,
          title: 'Grind the Green Gram Batter',
          description: 'Drain the soaked whole moong dal and rice. Transfer to a blender with half the fresh ginger, green chilies, cumin seeds, and salt. Grind with minimum water into a smooth, slightly coarse pourable batter (similar to pancake batter).',
          duration_minutes: 5,
          chef_tip: 'Do not ferment this batter! Pesarattu is ground fresh and cooked immediately to preserve the vibrant green chlorophyll and earthy nuttiness.',
        },
        {
          step_number: 2,
          title: 'Prepare the Soft Upma Filling',
          description: 'In a saucepan, heat 1 tbsp ghee. Splutter mustard seeds, curry leaves, and a pinch of asafoetida. Add 2.5 cups water and salt. Once boiling, slowly drizzle in roasted rava while whisking continuously to prevent lumps. Cook covered on low for 4 minutes until velvety and soft.',
          duration_minutes: 8,
          chef_tip: 'The upma should remain moist and creamy so it spreads easily inside the hot crepe.',
        },
        {
          step_number: 3,
          title: 'Spread and Roast the Crepe',
          description: 'Heat your cast-iron tawa until smoking hot, then reduce to medium. Lightly grease with peanut oil. Pour a generous ladleful of batter in the center and spread outward in concentric circles into a thin crepe. Immediately sprinkle chopped onions, minced ginger, and cumin seeds on top.',
          duration_minutes: 3,
          chef_tip: 'Press the onions and ginger into the wet batter with the back of your ladle so they stick and caramelize against the griddle.',
        },
        {
          step_number: 4,
          title: 'Stuff with Upma & Fold',
          description: 'Drizzle 1 tsp peanut oil or ghee around the perimeter. Cook on medium-high until the base turns deeply golden and edges lift effortlessly. Spoon a line of hot upma along the center, fold over like an envelope, and slide onto a warm plate.',
          duration_minutes: 3,
          chef_tip: 'Cook on medium flame; patience on the cast-iron griddle yields an extraordinarily crisp exterior with a melting interior.',
        },
      ],
      cooking_tips: [
        'Always use whole green gram with skin intact rather than split yellow moong for authentic Andhra flavor and nutrients.',
        'Rubbing half a cut onion on the hot cast-iron pan before each crepe prevents sticking without excessive oil.',
        'Pair strictly with Andhra Allam Pachadi (ginger-jaggery chutney) to cut through the rich starches.',
      ],
      substitutions: [
        { original: 'Whole Green Moong', substitute: 'Split Yellow Moong Dal', ratio: '1:1', notes: 'Milder flavor and yellow color; soak for only 1 hour.' },
        { original: 'Ghee', substitute: 'Cold-Pressed Sesame or Peanut Oil', ratio: '1:1', notes: 'Authentic vegan option with rich nutty finish.' },
        { original: 'Fresh Ginger', substitute: 'Dry Ginger Powder (Sonth)', ratio: '1/3 tsp per inch', notes: 'Use if fresh ginger is missing from pantry.' },
      ],
      serving_suggestions: [
        'Allam Pachadi (Spicy Sweet Ginger Tamarind Chutney)',
        'Creamy Coconut Chutney with Mustard Curry Leaf Tadka',
        'Hot Filter Coffee in brass dabarah and tumbler',
      ],
      native_name: 'పెసరట్టు ఉప్మా',
      cultural_background: 'Pesarattu is indigenous to coastal Andhra Pradesh, tracing back centuries as a nutritious breakfast favored for its sustained energy and cooling Ayurvedic qualities.',
      spice_level: 'Medium',
      dietary_tags: ['Vegetarian', 'Vegan Option'],
      calories_per_serving: 320,
      macros: { protein: '12g', carbs: '46g', fat: '9g' },
      image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=80',
    };
  }

  const isGongura = dishName.toLowerCase().includes('gongura');
  if (isGongura) {
    return {
      recipe_name: 'Authentic Andhra Gongura Pachadi',
      cuisine: 'Telugu / Andhra',
      country: 'India',
      region: 'Andhra Pradesh',
      description: 'The undisputed crown jewel of Andhra cuisine: tart red-stem sorrel leaves (Gongura) wilted in peanut oil, stone-ground with roasted coriander seeds, fenugreek, garlic cloves, and fiery Guntur red chillies, and finished with a sizzling mustard-curry leaf tempering.',
      ingredients: [
        { name: 'Fresh Red-Stem Gongura Leaves (Sorrel Leaves)', quantity: 300 * (servings / 4), unit: 'g', notes: 'washed thoroughly and completely dried with towel', category: 'Key Greens' },
        { name: 'Guntur Green Chillies', quantity: 8 * (servings / 4), unit: 'pieces', notes: 'slit lengthwise', category: 'Spices' },
        { name: 'Dried Guntur Red Chillies', quantity: 6 * (servings / 4), unit: 'pieces', notes: 'stalks removed', category: 'Spices' },
        { name: 'Fresh Garlic Cloves', quantity: 12 * (servings / 4), unit: 'cloves', notes: 'peeled and lightly bruised', category: 'Aromatics' },
        { name: 'Tamarind Pulp', quantity: 1.5 * (servings / 4), unit: 'tbsp', notes: 'warm water soaked (balances tartness)', category: 'Tang' },
        { name: 'Fenugreek Seeds (Menthulu)', quantity: 0.5 * (servings / 4), unit: 'tsp', notes: 'dry roasted to golden brown', category: 'Spices' },
        { name: 'Coriander Seeds (Dhaniyalu)', quantity: 1.5 * (servings / 4), unit: 'tbsp', notes: 'whole', category: 'Spices' },
        { name: 'Cumin Seeds (Jeera)', quantity: 1.5 * (servings / 4), unit: 'tsp', notes: 'whole', category: 'Spices' },
        { name: 'Mustard Seeds (Avalu)', quantity: 1 * (servings / 4), unit: 'tsp', notes: 'for tadka', category: 'Tempering' },
        { name: 'Cold-Pressed Peanut Oil (Verusenaga Nune)', quantity: 4 * (servings / 4), unit: 'tbsp', notes: 'divided (for sautéing and tempering)', category: 'Cooking Fat' },
        { name: 'Fresh Curry Leaves (Karivepaku)', quantity: 2 * (servings / 4), unit: 'sprigs', notes: 'crisped in tadka', category: 'Tempering' },
        { name: 'Asafoetida (Inguva / Hing)', quantity: 0.25 * (servings / 4), unit: 'tsp', notes: 'roasted in oil', category: 'Tempering' },
        { name: 'Rock Salt (Kallu Uppu)', quantity: 1.5 * (servings / 4), unit: 'tsp', notes: 'to taste', category: 'Seasoning' },
      ],
      preparation_time: '15 mins',
      cooking_time: '20 mins',
      total_time: '35 mins',
      servings,
      difficulty: 'Easy',
      equipment: ['Heavy Cast-Iron Kadai / Pan', 'Stone Mortar & Pestle (Rolu) or Mixer Grinder', 'Small Tadka Pan'],
      instructions: [
        {
          step_number: 1,
          title: 'Dry Roast Whole Spices',
          description: 'Heat a dry pan on low flame. Add coriander seeds, cumin seeds, fenugreek seeds, and 3 dried red chillies. Roast stirring continuously for 2-3 minutes until fragrant and fenugreek turns golden brown (do not burn). Transfer to a plate to cool, then grind into a coarse aromatic powder.',
          duration_minutes: 4,
          chef_tip: 'Never overheat fenugreek seeds; over-roasting turns them unpleasantly bitter.',
        },
        {
          step_number: 2,
          title: 'Wilt Gongura Leaves with Green Chillies',
          description: 'In the same pan, heat 1.5 tbsp peanut oil. Add slit green chillies and sauté for 1 minute. Add the completely dry gongura leaves and a pinch of turmeric. Cook over medium-low heat stirring occasionally for 5-7 minutes. The leaves will collapse, soften, and turn into a glossy dark olive-green paste. Remove from heat and allow to cool completely.',
          duration_minutes: 7,
          chef_tip: 'Ensure the gongura leaves are 100% dry before adding to oil. Any moisture drastically reduces the pickle’s shelf life.',
        },
        {
          step_number: 3,
          title: 'Stone-Pound or Pulse Coarsely',
          description: 'In a stone mortar or food processor, crush 6 garlic cloves, tamarind pulp, and rock salt with the roasted spice powder. Add the cooled gongura-chilli mixture and pulse briefly 2-3 times. Keep the pachadi rustic and textured—never puree it into a fine baby-food paste.',
          duration_minutes: 4,
          chef_tip: 'Traditional Andhra cooks crush gongura in a stone "rolu" (mortar) to release the natural pectin while maintaining body.',
        },
        {
          step_number: 4,
          title: 'Sizzling Andhra Popu (Tempering)',
          description: 'Heat remaining 2.5 tbsp peanut oil in a small tadka pan. Add mustard seeds and allow them to crackle vigorously. Add remaining crushed garlic, broken dried red chillies, curry leaves, and asafoetida. Fry until garlic edges turn golden brown, then pour the sizzling hot oil immediately over the gongura pachadi. Mix thoroughly.',
          duration_minutes: 5,
          chef_tip: 'The sizzling garlic-mustard oil seals the pachadi and enhances its tangy, smoky flavors as it rests.',
        },
      ],
      cooking_tips: [
        'Peanut oil is the soul of authentic Andhra gongura pachadi; avoid neutral refined seed oils.',
        'Always let the pachadi rest for at least 30 minutes before serving so the sourness, garlic, and spice harmonize.',
        'This pachadi keeps at room temperature for up to 10 days if kept dry and clean.',
      ],
      substitutions: [
        { original: 'Gongura (Sorrel leaves)', substitute: 'Baby Spinach + Sorrel / Lemon Juice', ratio: '1:1 with 2 tbsp lemon juice', notes: 'If fresh gongura is unavailable, blend spinach with tart sorrel.' },
        { original: 'Tamarind', substitute: 'Amchur (Dry Mango Powder)', ratio: '1/2 tsp amchur per tbsp tamarind', notes: 'Gives sharp fruit acidity without extra liquid.' },
        { original: 'Peanut Oil', substitute: 'Gingelly (Sesame) Oil', ratio: '1:1', notes: 'Traditional South Indian alternative with rich nutty aroma.' },
      ],
      serving_suggestions: [
        'Steaming hot Sona Masoori or Ponni rice with a generous dollop of pure Desi Ghee',
        'Raw cut shallots (chinna ulli) dipped into the pachadi with each rice mouthful',
        'Crispy Andhra pappadums (appadalu) or onion majjiga pulusu',
      ],
      native_name: 'ఆంధ్ర గోంగూర పచ్చడి',
      cultural_background: 'Gongura is famously known as the "Andhra Shakambhari" (patron leafy vegetable of Telugu cuisine) and has been celebrated for over a millennium in Telugu literature for its digestive acidity and mineral richness.',
      spice_level: 'Hot',
      dietary_tags: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      calories_per_serving: 165,
      macros: { protein: '3g', carbs: '11g', fat: '13g' },
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80',
    };
  }

  const isRamen = dishName.toLowerCase().includes('ramen');
  if (isRamen) {
    return {
      recipe_name: 'Authentic Japanese Tokyo Shoyu Ramen',
      cuisine: 'Japanese',
      country: 'Japan',
      region: 'Tokyo / Kanto',
      description: 'Iconic Tokyo-style ramen featuring springy handcrafted wheat noodles bathed in a crystal-clear, deep umami broth made from dashi and roasted chicken stock, seasoned with complex aged shoyu tare and crowned with melt-in-the-mouth chashu pork, jammy ajitsuke tamago, menma bamboo shoots, and crisp nori.',
      ingredients: [
        { name: 'Fresh Japanese Ramen Noodles', quantity: 480 * (servings / 4), unit: 'g', notes: 'chuka-men with kansui (alkaline)', category: 'Noodles' },
        { name: 'Double Dashi & Chicken Bone Broth', quantity: 1500 * (servings / 4), unit: 'ml', notes: 'simmered with kombu, katsuobushi, and aromatics', category: 'Broth' },
        { name: 'Aged Shoyu Ramen Tare', quantity: 6 * (servings / 4), unit: 'tbsp', notes: 'soy sauce, mirin, sake, and dried shiitake reduction', category: 'Tare Seasoning' },
        { name: 'Tender Chashu Pork Belly Slices (or Glazed Tofu)', quantity: 8 * (servings / 4), unit: 'slices', notes: 'braised in sweet soy broth and torched', category: 'Protein' },
        { name: 'Ajitsuke Tamago (Ramen Eggs)', quantity: 2 * (servings / 4), unit: 'eggs', notes: 'soft-boiled 6m 30s with custardy jammy yolks, halved', category: 'Topping' },
        { name: 'Menma (Fermented Bamboo Shoots)', quantity: 0.5 * (servings / 4), unit: 'cup', notes: 'seasoned in sesame oil', category: 'Topping' },
        { name: 'Tokyo Negi / Scallions', quantity: 1 * (servings / 4), unit: 'cup', notes: 'julienned into fine white threads (shiraga negi)', category: 'Garnish' },
        { name: 'Toasted Nori Seaweed', quantity: 4 * (servings / 4), unit: 'sheets', notes: 'crisp rectangles', category: 'Garnish' },
        { name: 'Aromatic Scallion & Garlic Oil (Mayu / Chiyu)', quantity: 2 * (servings / 4), unit: 'tbsp', notes: 'for floating aroma layer', category: 'Aromatic Oil' },
      ],
      preparation_time: '25 mins',
      cooking_time: '35 mins',
      total_time: '60 mins',
      servings,
      difficulty: 'Medium',
      equipment: ['Deep Ramen Bowls (Donburi)', 'Large Stockpot for Broth', 'Rapid Noodle Boiling Pot', 'Mesh Noodle Strainer Basket (Tebo)'],
      instructions: [
        {
          step_number: 1,
          title: 'Prepare Shoyu Tare & Warm Broth',
          description: 'In a small saucepan, bring Japanese soy sauce, mirin, sake, kombu, and dried shiitake to a gentle simmer for 5 minutes, then strain to create the concentrated shoyu tare. In your main stockpot, heat the clarified chicken and dashi broth until steaming hot (around 90°C / 195°F). Keep covered on low.',
          duration_minutes: 10,
          chef_tip: 'Never boil ramen broth aggressively once clarified; keeping it just below boiling preserves crystalline clarity.',
        },
        {
          step_number: 2,
          title: 'Warm Bowls & Set Soup Base',
          description: 'Fill each ceramic ramen bowl with boiling water for 60 seconds to preheat, then discard the water. Into each dry warmed bowl, measure 1.5 tbsp shoyu tare and 1 tsp fragrant scallion oil. When the noodles are almost ready, ladle 350ml of piping hot broth into each bowl and whisk briefly.',
          duration_minutes: 5,
          chef_tip: 'Preheating the bowl is an absolute requirement in ramen shops; cold ceramic instantly saps broth temperature.',
        },
        {
          step_number: 3,
          title: 'Boil Fresh Ramen Noodles',
          description: 'Bring a large volume of unsalted water to a rolling furious boil. Drop the loosened fresh ramen noodles into the water. Stir immediately with chopsticks. Cook for exactly 75 to 90 seconds for a firm "katame" al-dente chew. Lift noodle basket and shake up and down 5 times vigorously to flick away all residual boiling water.',
          duration_minutes: 3,
          chef_tip: 'Draining noodle water thoroughly is critical so starch water does not dilute the seasoned tare broth.',
        },
        {
          step_number: 4,
          title: 'Fold Noodles & Arrange Authentic Toppings',
          description: 'Gently slide the drained noodles into the soup bowl. Fold them neatly into an attractive "S" curve with chopsticks. Artfully arrange two slices of chashu, half an ajitsuke egg, a bundle of menma bamboo shoots, shredded negi, and tuck a sheet of nori upright against the rim. Serve immediately piping hot.',
          duration_minutes: 3,
          chef_tip: 'Eat within 7 minutes! Authentic ramen noodles continue absorbing broth and softening rapidly.',
        },
      ],
      cooking_tips: [
        'Ajitsuke eggs require soft-boiling large eggs for exactly 6 minutes and 30 seconds, shocking in ice water, and marinating in soy-mirin for at least 4 hours.',
        'Use fresh alkaline noodles (containing kansui) rather than dried instant ramen cakes for authentic springiness and yellow hue.',
      ],
      substitutions: [
        { original: 'Chashu Pork Belly', substitute: 'Pan-Seared Teriyaki Tofu or Shiitake Caps', ratio: '1:1', notes: 'Delicious plant-based alternative with savory depth.' },
        { original: 'Shoyu Tare', substitute: 'Dark Soy Sauce + Dash of Mirin & Rice Vinegar', ratio: '1:1', notes: 'Quick pantry shortcut if artisanal tare is not on hand.' },
        { original: 'Menma', substitute: 'Sautéed King Oyster Mushrooms', ratio: '1:1', notes: 'Provides similar earthy crunch and savory chew.' },
      ],
      serving_suggestions: [
        'Crispy pan-fried pork or vegetable Gyoza with chili-soy dipping sauce',
        'Ice-cold Japanese Green Tea (Ryokucha) or crisp lager',
        'Side of Steamed Edamame with flaky sea salt',
      ],
      native_name: '東京醤油ラーメン',
      cultural_background: 'Originating in Tokyo’s historic Asakusa district in 1910, Shoyu ramen is the prototypical style that defined modern ramen culture, balancing clean maritime dashi with rich bone stock and aged soy sauce.',
      spice_level: 'Mild',
      dietary_tags: ['Non-Vegetarian', 'Pescatarian / Vegetarian Adaptable'],
      calories_per_serving: 540,
      macros: { protein: '28g', carbs: '65g', fat: '18g' },
      image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80',
    };
  }

  return {
    recipe_name: `Authentic ${dishName}`,
    cuisine: cuisine || 'Regional Specialty',
    country: region.includes('India') || isAndhra ? 'India' : 'International',
    region: region || 'Heritage Region',
    description: `A celebrated, time-tested recipe for ${dishName}, highlighting traditional stone-ground spices, patient temperature control, and authentic cultural flavor equilibrium.`,
    ingredients: [
      { name: `Fresh Primary Base / Protein for ${dishName}`, quantity: 500 * (servings / 4), unit: 'g', notes: 'fresh, cleaned and trimmed', category: 'Main' },
      { name: 'Red Onions', quantity: 2 * (servings / 4), unit: 'medium', notes: 'finely sliced for slow caramelization', category: 'Aromatics' },
      { name: 'Fresh Ginger-Garlic Paste', quantity: 1.5 * (servings / 4), unit: 'tbsp', notes: 'freshly stone-pounded', category: 'Aromatics' },
      { name: 'Heritage Whole Spices (Cardamom, Clove, Cinnamon)', quantity: 1 * (servings / 4), unit: 'tbsp', notes: 'lightly bruised', category: 'Spices' },
      { name: 'Custom Regional Ground Spice Blend', quantity: 2.5 * (servings / 4), unit: 'tsp', notes: 'slowly roasted', category: 'Spices' },
      { name: 'Cold-Pressed Cooking Oil or Desi Ghee', quantity: 3 * (servings / 4), unit: 'tbsp', notes: 'for authentic aroma', category: 'Cooking Fat' },
      { name: 'Fresh Herb Garnish (Cilantro/Mint/Basil)', quantity: 0.5 * (servings / 4), unit: 'cup', notes: 'finely chopped', category: 'Garnish' },
      { name: 'Sea Salt', quantity: 1.5 * (servings / 4), unit: 'tsp', notes: 'to taste', category: 'Seasoning' },
    ],
    preparation_time: isRice ? '30 mins' : '20 mins',
    cooking_time: isRice ? '45 mins' : '30 mins',
    total_time: isRice ? '75 mins' : '50 mins',
    servings,
    difficulty: isRice ? 'Advanced' : 'Medium',
    equipment: ['Heavy-Bottomed Handi / Dutch Oven', 'Wooden Sauté Spoon', 'Chef Knife & Prep Board', 'Tight Fitting Lid'],
    instructions: [
      {
        step_number: 1,
        title: 'Temper Whole Spices & Aromatics',
        description: 'Heat cooking fat in a heavy vessel over medium flame. Add bruised whole spices and allow them to sizzle and release their essential oils for 60 seconds.',
        duration_minutes: 2,
        chef_tip: 'Never overheat oil before adding spices to avoid scorching the delicate volatile terpenes.',
      },
      {
        step_number: 2,
        title: 'Slow Onion Caramelization',
        description: 'Add sliced onions and a pinch of salt. Sauté slowly until they collapse and turn a rich, translucent golden amber. Stir in ginger-garlic paste and cook until fragrant.',
        duration_minutes: 8,
        chef_tip: 'The deep foundation color and umami depth of authentic gravies stems solely from caramelized onions.',
      },
      {
        step_number: 3,
        title: 'Bloom Spices & Simmer Main Elements',
        description: 'Lower heat, sprinkle the ground spice blend with 2 tbsp of warm water. Add main ingredients, coat thoroughly in the masala, add warm broth/water, seal with lid, and simmer gently.',
        duration_minutes: 25,
        chef_tip: 'Simmer on the lowest flame so internal moisture circulates without boiling the sauce dry.',
      },
      {
        step_number: 4,
        title: 'Rest, Harmonize & Garnish',
        description: 'Turn off the heat. Let the dish rest covered undisturbed for 5-8 minutes so essential oils rise and settle. Garnish generously with fresh herbs and a squeeze of citrus.',
        duration_minutes: 5,
        chef_tip: 'Resting is non-negotiable; it lets the muscle fibers or starches relax and absorb the seasoned emulsion.',
      },
    ],
    cooking_tips: [
      'Use freshly toasted and pounded spices rather than stale pre-packaged powders for 10x richer bouquet.',
      'Always taste at the final simmer before garnishing to balance salt and natural acidity.',
    ],
    substitutions: [
      { original: 'Desi Ghee', substitute: 'Virgin Coconut Oil or Avocado Oil', ratio: '1:1', notes: 'Plant-based with identical richness' },
      { original: 'Fresh Chilies', substitute: 'Kashmiri Chili Powder or Paprika', ratio: '1 tsp per chili', notes: 'Delivers vivid color with milder heat' },
    ],
    serving_suggestions: [
      'Warm Aged Basmati Rice or Artisan Flatbread',
      'Cooling Cucumber & Mint Raita',
      'Tangy Seasonal Pickle (Achar / Pachadi)',
    ],
    native_name: dishName,
    cultural_background: `${dishName} is a traditional cornerstone in ${region}, celebrated for bringing families together over slow-crafted, deeply nourishing homestyle meals.`,
    spice_level: 'Medium',
    dietary_tags: [customDietary || 'Regional Classic'],
    calories_per_serving: 380,
    macros: { protein: '16g', carbs: '44g', fat: '14g' },
    image_url: getCulinaryImage(dishName, region || cuisine),
  };
}

// 1. API: Conversational Recipe Assistant (Multi-Turn Chat with Intent Recognition)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [], currentRecipe = null, activeLocation = 'Global', dietary = 'all' } = req.body;
    const latestUserMessage = messages[messages.length - 1]?.content || '';

    if (!latestUserMessage.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!ai) {
      // Curated conversational fallback
      const lower = latestUserMessage.toLowerCase();
      if (lower.includes('andhra') || lower.includes('telangana') || lower.includes('kerala') || lower.includes('punjab') || lower.includes('recipe')) {
        const fallbackDishes = REGIONAL_DISH_FALLBACKS['andhra pradesh'];
        return res.json({
          reply: `Here are traditional dishes from Andhra Pradesh, celebrated for their fiery Guntur chilies, tangy Gongura, and aromatic mustard tempering! Which one would you like me to guide you through?`,
          intent: 'cuisine_recommendation',
          dishes: fallbackDishes,
        });
      }

      if (currentRecipe) {
        if (lower.includes('people') || lower.includes('serving') || lower.includes('for 5') || lower.includes('for 4') || lower.includes('for 2') || lower.includes('for 6') || lower.includes('for 8')) {
          const match = lower.match(/\d+/);
          const newServings = match ? parseInt(match[0]) : 5;
          const updatedRecipe = buildStructuredRecipeFallback(currentRecipe.recipe_name, currentRecipe.region, currentRecipe.cuisine, newServings);
          return res.json({
            reply: `I have adjusted the recipe for **${currentRecipe.recipe_name}** to serve **${newServings} people**. All ingredient quantities have been recalculated!`,
            intent: 'serving_adjustment',
            recipe: updatedRecipe,
          });
        }

        if (lower.includes('without onion') || lower.includes('no onion') || lower.includes('omit onion')) {
          const updatedIngredients = (currentRecipe.ingredients || [])
            .filter((ing: any) => !ing.name.toLowerCase().includes('onion'))
            .concat([
              { name: 'Asafoetida (Hing) & Minced Celery / Cabbage', quantity: 0.5, unit: 'tsp', notes: 'imparts savory allium depth and umami without onions', category: 'Aromatics' }
            ]);
          return res.json({
            reply: `Yes, you can easily prepare **${currentRecipe.recipe_name}** without onions! In traditional Sattvic and Jain cooking styles, onions are omitted by adding a pinch of roasted **Asafoetida (Hing)** to the hot oil, which provides the savory sulfur aroma of caramelized alliums. I have updated your ingredients checklist!`,
            intent: 'recipe_customization',
            recipe: { ...currentRecipe, ingredients: updatedIngredients },
          });
        }

        if (lower.includes('instead of tamarind') || lower.includes('substitute for tamarind') || lower.includes('replace tamarind') || lower.includes('without tamarind')) {
          return res.json({
            intent: 'ingredient_substitution',
            reply: `Here are the 3 best authentic culinary substitutes for **Tamarind**:
1. **Amchur (Dry Mango Powder)**: Use **1/2 tsp of amchur for every 1 tbsp of tamarind pulp**. It provides a clean, sharp fruit tartness without adding extra liquid.
2. **Fresh Lime / Lemon Juice + Jaggery**: Mix **1 tbsp fresh lime juice with 1/4 tsp crushed jaggery or brown sugar**. This mimics both the tart malic acid and subtle sweet undertones of ripe tamarind.
3. **Dried Kokum Rinds**: Soak **2-3 kokum rinds in warm water** for 10 minutes and use the ruby-red extract for deep coastal sourness.`,
          });
        }

        const stepMatch = lower.match(/step\s*(\d+)/);
        if (stepMatch) {
          const stepNum = parseInt(stepMatch[1]);
          const targetStep = (currentRecipe.instructions || []).find(
            (s: any, idx: number) => (s.step_number || s.stepNumber || idx + 1) === stepNum
          ) || (currentRecipe.instructions || [])[stepNum - 1];

          if (targetStep) {
            return res.json({
              intent: 'cooking_guidance',
              reply: `### Detailed Master Chef Breakdown: Step ${stepNum} — ${targetStep.title}

**Instruction Summary:** ${targetStep.description || targetStep.instruction}

**Key Technique & Sensory Markers:**
- **Heat Regulation:** Maintain medium-low heat. Spices and aromatics should sizzle gently rather than burn or smoke violently.
- **Visual Cues:** Watch for the oil separating around the perimeter of the pan and the color shifting from raw to a deep, glossy sheen.
- **Aroma:** You will know it is done when the pungent raw edge transitions into a rich, rounded roasted fragrance.
- **Pro Tip:** ${targetStep.chef_tip || targetStep.chefTip || 'Keep a ladle of warm water nearby to deglaze the bottom of the pan if any spices begin to stick.'}`,
            });
          }
        }

        if (lower.includes('without') || lower.includes('substitute') || lower.includes('replace') || lower.includes('ginger')) {
          return res.json({
            reply: `You can easily prepare **${currentRecipe.recipe_name}** without ginger! Simply omit the minced ginger from the batter and double the cumin seeds (jeera) or add a pinch of asafoetida (hing) to maintain digestive warmth and fragrance.`,
            intent: 'ingredient_substitution',
          });
        }
      }

      const generated = buildStructuredRecipeFallback(latestUserMessage, activeLocation);
      return res.json({
        reply: `Here is the complete, authentic recipe for **${generated.recipe_name}** from ${generated.region}! Let me know if you want to adjust the servings or customize any ingredients.`,
        intent: 'recipe_generation',
        recipe: generated,
      });
    }

    const conversationHistoryStr = messages
      .slice(-6)
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
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
  "clarification_options": ["Option 1", "Option 2"] (only if intent is clarification, else empty array),
  "dishes": [ (only if intent is cuisine_recommendation)
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
  "recipe": { (only if intent is recipe_generation, recipe_customization, or serving_adjustment)
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
    "difficulty": "Easy" | "Medium" | "Advanced",
    "equipment": ["Cast Iron Pan", "Grinder"],
    "instructions": [
      { "step_number": 1, "title": "Stage Title", "description": "Step detail", "duration_minutes": 5, "chef_tip": "Pro tip" }
    ],
    "cooking_tips": ["Tip 1", "Tip 2"],
    "substitutions": [
      { "original": "Item", "substitute": "Replacement", "ratio": "1:1", "notes": "flavor impact" }
    ],
    "serving_suggestions": ["Pairing 1", "Pairing 2"],
    "native_name": "Native name",
    "cultural_background": "Heritage story",
    "spice_level": "Medium",
    "dietary_tags": ["Vegetarian"],
    "calories_per_serving": 380,
    "macros": { "protein": "14g", "carbs": "42g", "fat: "12g" }
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
    }
    if (Array.isArray(parsed.dishes)) {
      parsed.dishes = parsed.dishes.map((d: any) => ({
        ...d,
        imageUrl: getCulinaryImage(d.name + ' ' + (d.searchKeyword || ''), d.cuisine || activeLocation),
      }));
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/chat (using smart intent-aware culinary fallback):', error.message || error);
    const latestUserMessage = req.body?.messages?.[req.body.messages.length - 1]?.content || '';
    const currentRecipe = req.body?.currentRecipe;
    const lower = latestUserMessage.toLowerCase();

    // 1. Check if user asked for regional cuisine/dishes
    if (lower.includes('andhra') || lower.includes('telangana') || lower.includes('kerala') || lower.includes('punjab') || lower.includes('tamil') || lower.includes('dishes') || lower.includes('recipes') || lower.includes('suggest') || lower.includes('show me')) {
      let matchedDishes = REGIONAL_DISH_FALLBACKS['andhra pradesh'];
      for (const [key, list] of Object.entries(REGIONAL_DISH_FALLBACKS)) {
        if (lower.includes(key)) {
          matchedDishes = list;
          break;
        }
      }
      return res.json({
        intent: 'cuisine_recommendation',
        reply: `Here are traditional authentic dishes celebrated for their regional spices, time-honored cooking vessels, and distinctive flavors! Which one would you like me to guide you through?`,
        dishes: matchedDishes,
      });
    }

    // 2. Check if user asked for serving adjustment on current recipe
    if (currentRecipe && (lower.includes('people') || lower.includes('serving') || lower.includes('make it for') || lower.includes('scale') || lower.includes('for 5') || lower.includes('for 4') || lower.includes('for 6') || lower.includes('for 2') || lower.includes('for 8'))) {
      const match = lower.match(/\d+/);
      const newServings = match ? parseInt(match[0]) : 5;
      const updated = buildStructuredRecipeFallback(currentRecipe.recipe_name, currentRecipe.region, currentRecipe.cuisine, newServings);
      return res.json({
        intent: 'serving_adjustment',
        reply: `I have adjusted the recipe for **${currentRecipe.recipe_name}** to serve **${newServings} people**. All ingredient quantities and cooking timings have been recalculated!`,
        recipe: updated,
      });
    }

    // 3. Check if user asked to prepare without onions
    if (currentRecipe && (lower.includes('without onion') || lower.includes('no onion') || lower.includes('omit onion'))) {
      const updatedIngredients = (currentRecipe.ingredients || [])
        .filter((ing: any) => !ing.name.toLowerCase().includes('onion'))
        .concat([
          { name: 'Asafoetida (Hing) & Minced Celery / Cabbage', quantity: 0.5, unit: 'tsp', notes: 'imparts savory allium depth and umami without onions', category: 'Aromatics' }
        ]);

      const updated = {
        ...currentRecipe,
        ingredients: updatedIngredients,
      };

      return res.json({
        intent: 'recipe_customization',
        reply: `Yes, you can easily prepare **${currentRecipe.recipe_name}** without onions! 
In traditional Sattvic and Jain cooking styles, onions are omitted by adding a pinch of roasted **Asafoetida (Hing)** to the hot oil, which provides the savory sulfur aroma of caramelized alliums. You can also add finely minced cabbage or celery for body. I have updated your ingredients checklist!`,
        recipe: updated,
      });
    }

    // 4. Check if user asked what to use instead of tamarind
    if (lower.includes('instead of tamarind') || lower.includes('substitute for tamarind') || lower.includes('replace tamarind') || lower.includes('without tamarind')) {
      return res.json({
        intent: 'ingredient_substitution',
        reply: `Here are the 3 best authentic culinary substitutes for **Tamarind**:

1. **Amchur (Dry Mango Powder)**: Use **1/2 tsp of amchur for every 1 tbsp of tamarind pulp**. It provides a clean, sharp fruit tartness without adding extra liquid.
2. **Fresh Lime / Lemon Juice + Jaggery**: Mix **1 tbsp fresh lime juice with 1/4 tsp crushed jaggery or brown sugar**. This mimics both the tart malic acid and subtle sweet undertones of ripe tamarind.
3. **Dried Kokum Rinds**: Soak **2-3 kokum rinds in warm water** for 10 minutes and use the ruby-red extract for deep coastal sourness.`,
      });
    }

    // 5. Check if user asked to explain a specific step in more detail
    const stepMatch = lower.match(/step\s*(\d+)/);
    if (currentRecipe && stepMatch) {
      const stepNum = parseInt(stepMatch[1]);
      const targetStep = (currentRecipe.instructions || []).find(
        (s: any, idx: number) => (s.step_number || s.stepNumber || idx + 1) === stepNum
      ) || (currentRecipe.instructions || [])[stepNum - 1];

      if (targetStep) {
        return res.json({
          intent: 'cooking_guidance',
          reply: `### Detailed Master Chef Breakdown: Step ${stepNum} — ${targetStep.title}

**Instruction Summary:** ${targetStep.description || targetStep.instruction}

**Key Technique & Sensory Markers:**
- **Heat Regulation:** Maintain medium-low heat. Spices and aromatics should sizzle gently rather than burn or smoke violently.
- **Visual Cues:** Watch for the oil separating around the perimeter of the pan and the color shifting from raw to a deep, glossy sheen.
- **Aroma:** You will know it is done when the pungent raw edge transitions into a rich, rounded roasted fragrance.
- **Pro Tip:** ${targetStep.chef_tip || targetStep.chefTip || 'Keep a ladle of warm water nearby to deglaze the bottom of the pan if any spices begin to stick.'}`,
        });
      }
    }

    // 6. Generic ingredient substitution
    if (currentRecipe && (lower.includes('without') || lower.includes('substitute') || lower.includes('replace') || lower.includes('instead') || lower.includes('ginger'))) {
      const isGinger = lower.includes('ginger');
      return res.json({
        intent: 'ingredient_substitution',
        reply: isGinger
          ? `You can easily prepare **${currentRecipe.recipe_name}** without ginger! Simply omit the fresh ginger and double the cumin seeds (jeera) or add a pinch of roasted asafoetida (hing) to preserve digestive warmth and aroma.`
          : `For **${currentRecipe.recipe_name}**, you can substitute that ingredient with a pantry equivalent at a 1:1 ratio. Adjust acidity and salt to balance the flavor profile.`,
      });
    }

    // 7. Default: Recipe generation
    const fallbackRecipe = buildStructuredRecipeFallback(latestUserMessage, req.body?.activeLocation || 'Global');
    return res.json({
      intent: 'recipe_generation',
      reply: `Here is the authentic recipe for **${fallbackRecipe.recipe_name}** from ${fallbackRecipe.region}! You can ask me follow-up questions to customize ingredients, change servings, or ask for cooking tips.`,
      recipe: fallbackRecipe,
    });
  }
});

// 2. API: Discover Dishes by Region / Country / State
app.post('/api/dishes/discover', async (req, res) => {
  try {
    const { region, cuisine, query, dietary } = req.body;
    const target = (region || cuisine || query || 'Global').trim();
    const dietaryFilter = dietary && dietary !== 'all' ? `Dietary requirement: strictly ${dietary}.` : '';

    if (!ai) {
      const lower = target.toLowerCase();
      for (const [key, list] of Object.entries(REGIONAL_DISH_FALLBACKS)) {
        if (lower.includes(key) || key.includes(lower)) {
          return res.json({ dishes: list, source: 'curated' });
        }
      }
      return res.json({
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
    }

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

    let enriched: any[] = [];
    try {
      const text = await generateAIContent({
        contents: prompt,
        systemInstruction: 'You are an authentic world culinary anthropologist. Output strictly valid JSON array of regional dishes matching the schema.',
        responseMimeType: 'application/json',
        timeoutMs: 20000,
      });

      const parsed = JSON.parse(text ?? '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        enriched = parsed.map((d: any) => ({
          ...d,
          imageUrl: getCulinaryImage(d.name + ' ' + (d.searchKeyword || ''), d.cuisine || target),
        }));
        return res.json({ dishes: enriched, source: 'ai' });
      }
    } catch (err: any) {
      console.warn('Gemini discover error or timeout, using curated fallback:', err.message);
    }

    const lower = target.toLowerCase();
    for (const [key, list] of Object.entries(REGIONAL_DISH_FALLBACKS)) {
      if (lower.includes(key) || key.includes(lower)) {
        return res.json({ dishes: list, source: 'curated' });
      }
    }

    return res.json({
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
    return res.status(500).json({ error: error.message || 'Failed to discover dishes' });
  }
});

// 3. API: Generate Complete Structured Recipe
app.post('/api/recipe/generate', async (req, res) => {
  try {
    const { dishName, region, cuisine, dietary, servings = 4, customNote } = req.body;
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

    return res.json({ recipe: parsed, source: 'ai' });
  } catch (error: any) {
    console.error('Error generating recipe via AI:', error?.message || error);
    // Properly report error to frontend instead of silently returning canned data (Requirement 8)
    return res.status(500).json({
      error: `Failed to generate authentic recipe for "${req.body?.dishName || 'your dish'}": ${error?.message || 'AI service error'}. Please try again.`
    });
  }
});

// 4. API: Ingredient-Based Recipe Finder ("Pantry Chef")
app.post('/api/recipes/by-ingredients', async (req, res) => {
  try {
    const { ingredients = [], dietary = 'all' } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one ingredient' });
    }

    const ingredientsStr = ingredients.join(', ');

    if (!ai) {
      // Fallback pantry suggestions
      const isVeg = dietary === 'Vegetarian' || dietary === 'Vegan';
      const sampleRecipe = buildStructuredRecipeFallback(
        isVeg ? 'Homestyle Vegetable & Herb Curry' : 'Fragrant Pan-Seared Protein with Herb Reduction',
        'Traditional Homestyle',
        'Homestyle Heritage'
      );

      return res.json({
        suggestions: [
          {
            dish_name: sampleRecipe.recipe_name,
            region_and_cuisine: `${sampleRecipe.region} • ${sampleRecipe.cuisine}`,
            description: `A versatile traditional feast crafted using your on-hand ingredients (${ingredientsStr}).`,
            matched_ingredients: ingredients.slice(0, 3),
            missing_ingredients: ['Cooking Oil', 'Salt', 'Spices'],
            difficulty: 'Easy',
            estimated_time: '30 mins',
            recipe: sampleRecipe,
            image_url: getCulinaryImage(sampleRecipe.recipe_name, sampleRecipe.region),
          }
        ]
      });
    }

    const prompt = `You are a creative Michelin-star zero-waste pantry chef.
The user has the following ingredients available at home:
[${ingredientsStr}]
Dietary restriction: "${dietary}"

Suggest 3 distinct authentic regional world dishes that creatively utilize these ingredients.
Identify which user ingredients are matched, what common pantry essentials are missing, and provide the complete recipe for each.

Return JSON in this format:
{
  "suggestions": [
    {
      "dish_name": "Dish Name",
      "region_and_cuisine": "Region, Country • Cuisine",
      "description": "2 sentences describing why this recipe is delicious and how it uses the ingredients",
      "matched_ingredients": ["matched 1", "matched 2"],
      "missing_ingredients": ["extra 1", "extra 2"],
      "difficulty": "Easy" | "Medium" | "Advanced",
      "estimated_time": "30 mins",
      "recipe": {
        "recipe_name": "Dish Name",
        "cuisine": "Cuisine",
        "country": "Country",
        "region": "Region",
        "description": "Description",
        "ingredients": [
          { "name": "Item", "quantity": 1, "unit": "cup", "category": "Base", "notes": "prepped" }
        ],
        "preparation_time": "15 mins",
        "cooking_time": "20 mins",
        "total_time": "35 mins",
        "servings": 4,
        "difficulty": "Easy",
        "equipment": ["Skillet"],
        "instructions": [
          { "step_number": 1, "title": "Title", "description": "Instruction", "duration_minutes": 5, "chef_tip": "Tip" }
        ],
        "cooking_tips": ["Tip 1"],
        "substitutions": [
          { "original": "Item", "substitute": "Alt", "ratio": "1:1", "notes": "note" }
        ],
        "serving_suggestions": ["Suggestion 1"]
      }
    }
  ]
}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      8500
    );

    const parsed = JSON.parse(response.text ?? '{"suggestions":[]}');
    if (Array.isArray(parsed.suggestions)) {
      parsed.suggestions = parsed.suggestions.map((s: any) => ({
        ...s,
        image_url: getCulinaryImage(s.dish_name, s.region_and_cuisine),
        recipe: {
          ...s.recipe,
          image_url: getCulinaryImage(s.dish_name, s.region_and_cuisine),
        }
      }));
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in pantry recipe finder:', error);
    // Graceful fallback
    const firstIng = req.body?.ingredients?.[0] || 'Seasonal Vegetable';
    const fallback = buildStructuredRecipeFallback(`${firstIng} Rustic Sauté`, 'Heritage Kitchen', 'Comfort Food');
    return res.json({
      suggestions: [
        {
          dish_name: fallback.recipe_name,
          region_and_cuisine: `${fallback.region} • ${fallback.cuisine}`,
          description: `A hearty, rustic homestyle dish highlighting ${firstIng} and aromatic pantry seasonings.`,
          matched_ingredients: req.body?.ingredients || [firstIng],
          missing_ingredients: ['Cooking Oil', 'Salt', 'Spices'],
          difficulty: 'Easy',
          estimated_time: '30 mins',
          recipe: fallback,
          image_url: getCulinaryImage(fallback.recipe_name, fallback.region),
        }
      ]
    });
  }
});

// 5. API: Regional Recipe Comparison Feature
app.post('/api/recipes/compare-variations', async (req, res) => {
  try {
    const { dishName } = req.body;
    if (!dishName) {
      return res.status(400).json({ error: 'dishName is required' });
    }

    if (!ai) {
      // Curated comparison for common dishes like Biryani / Curry / Pizza
      return res.json({
        dish_concept: `${dishName} is a celebrated culinary archetype with stark regional evolution across different geographies and cultures.`,
        cultural_origin: `Originating as a heritage staple, regional microclimates and local spices transformed ${dishName} into distinct expressions.`,
        variations: [
          {
            variation_name: `Hyderabadi Dum ${dishName}`,
            region: 'Telangana',
            country: 'India',
            signature_ingredients: ['Shahi Jeera', 'Kashmiri Saffron Milk', 'Guntur Chilies', 'Crispy Birista Onions', 'Dough-sealed Handi'],
            cooking_technique: 'Kacchi Dum: Raw marinated elements and parboiled grain are layered and slow-cooked in a dough-sealed heavy copper handi over coal embers.',
            taste_profile: 'Intensely aromatic, bold heat, royal saffron notes with tender juicy textures.',
            cultural_story: 'Perfected in the royal kitchens of the Nizams of Hyderabad, blending Mughal techniques with fiery Telugu spice palettes.',
            key_differences: 'Cooked raw (Kacchi) with high saffron and mint; much spicier than northern counterparts.',
            image_url: getCulinaryImage(`Hyderabadi ${dishName}`, 'Telangana'),
          },
          {
            variation_name: `Kolkata ${dishName}`,
            region: 'West Bengal',
            country: 'India',
            signature_ingredients: ['Mewar Potatoes (Alu)', 'Boiled Eggs', 'Meetha Ittar (Mughlai Floral Perfume)', 'Kewra Water', 'Gentle Nutmeg & Mace'],
            cooking_technique: 'Pakki Dum: Meat and potatoes are slow-braised separately in aromatic broth before gentle layering with fragrant rice.',
            taste_profile: 'Subtle, delicate, lightly sweet and floral with meltingly tender potatoes that soak up all juices.',
            cultural_story: 'Created by the exiled Nawab Wajid Ali Shah in Metiabruz, Kolkata, who introduced slow-cooked potatoes as a royal luxury.',
            key_differences: 'Features soft whole potatoes and delicate Mughlai perfume instead of intense chili paste.',
            image_url: getCulinaryImage(`Kolkata ${dishName}`, 'Bengal'),
          },
          {
            variation_name: `Malabar / Thalassery ${dishName}`,
            region: 'Kerala',
            country: 'India',
            signature_ingredients: ['Khyma / Jeerakasala Rice', 'Malabar Garam Masala', 'Green Chili Paste', 'Cashews & Sultanas', 'Coconut Ghee'],
            cooking_technique: 'Ghee Rice Layering: Small-grain fragrant rice is sautéed in ghee with whole spices, then layered over a thick spicy masala base.',
            taste_profile: 'Mellow, sweet-savory, buttery mouthfeel with distinct fennel and cardamom notes.',
            cultural_story: 'Born along the historic Arabian Sea spice trade route of the Malabar coast, uniting Arab maritime merchants and Mappila culinary traditions.',
            key_differences: 'Uses tiny fragrant Jeerakasala rice instead of long-grain basmati, with fennel and fried dry fruits.',
            image_url: getCulinaryImage(`Thalassery ${dishName}`, 'Kerala'),
          }
        ],
        comparison_summary: {
          spices_contrast: 'Telangana emphasizes fiery dried chilies & saffron; Bengal relies on floral kewra & nutmeg; Kerala champions fennel & roasted nuts.',
          cooking_vessel_contrast: 'Sealed dough handi (Kacchi) vs. separate braising pots vs. flat-bottomed copper deg.',
          taste_contrast: 'Fiery & regal vs. subtly fragrant & gentle vs. rich, buttery & sweet-savory.',
        }
      });
    }

    const prompt = `You are a world-class culinary historian and comparative gastronomy scholar.
The user wants to compare regional variations of the dish: "${dishName}".

Identify 3 to 4 iconic, geographically and culturally distinct regional variations of "${dishName}" across different states, countries, or regions.
(For example: if Biryani -> Hyderabadi [Telangana] vs. Kolkata [Bengal] vs. Thalassery [Kerala] vs. Awadhi [Lucknow];
if Pizza -> Neapolitan vs. Roman Tonda/Pala vs. Sicilian Sfincione;
if Ramen -> Sapporo Miso vs. Tokyo Shoyu vs. Hakata Tonkotsu;
if Fish Curry -> Andhra Chepala Pulusu vs. Kerala Meen Curry vs. Goan Fish Curry vs. Bengali Macher Jhol).

Explain in depth:
1. Signature regional ingredients and key spices
2. Traditional cooking vessel and preparation method
3. Distinct flavor profile and texture
4. Cultural heritage story
5. Key differences from other styles

Return JSON adhering to this schema:
{
  "dish_concept": "Broad culinary concept of the dish",
  "cultural_origin": "Historical roots and spread",
  "variations": [
    {
      "variation_name": "Specific regional name",
      "region": "State / Region",
      "country": "Country",
      "signature_ingredients": ["Ing 1", "Ing 2", "Ing 3", "Ing 4"],
      "cooking_technique": "Detailed explanation of traditional cooking vessel and technique",
      "taste_profile": "Flavor, spice, texture description",
      "cultural_story": "The history and tradition of this specific version",
      "key_differences": "How this variation stands out compared to others"
    }
  ],
  "comparison_summary": {
    "spices_contrast": "Direct comparison of spice palettes",
    "cooking_vessel_contrast": "Direct comparison of cooking methods & cookware",
    "taste_contrast": "Direct contrast of flavor dynamics"
  }
}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      8500
    );

    const parsed = JSON.parse(response.text ?? '{}');
    if (Array.isArray(parsed.variations)) {
      parsed.variations = parsed.variations.map((v: any) => ({
        ...v,
        image_url: getCulinaryImage(v.variation_name, v.region || v.country),
      }));
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in recipe comparison (using curated comparison fallback):', error.message || error);
    const dish = req.body?.dishName || 'Dish';
    return res.json({
      dish_concept: `${dish} is a celebrated culinary archetype with stark regional evolution across different geographies and cultures.`,
      cultural_origin: `Originating as a heritage staple, regional microclimates and local spices transformed ${dish} into distinct expressions.`,
      variations: [
        {
          variation_name: `Hyderabadi Dum ${dish}`,
          region: 'Telangana',
          country: 'India',
          signature_ingredients: ['Shahi Jeera', 'Kashmiri Saffron Milk', 'Guntur Chilies', 'Crispy Birista Onions', 'Dough-sealed Handi'],
          cooking_technique: 'Kacchi Dum: Raw marinated elements and parboiled grain are layered and slow-cooked in a dough-sealed heavy copper handi over coal embers.',
          taste_profile: 'Intensely aromatic, bold heat, royal saffron notes with tender juicy textures.',
          cultural_story: 'Perfected in the royal kitchens of the Nizams of Hyderabad, blending Mughal techniques with fiery Telugu spice palettes.',
          key_differences: 'Cooked raw (Kacchi) with high saffron and mint; much spicier than northern counterparts.',
          image_url: getCulinaryImage(`Hyderabadi ${dish}`, 'Telangana'),
        },
        {
          variation_name: `Kolkata ${dish}`,
          region: 'West Bengal',
          country: 'India',
          signature_ingredients: ['Mewar Potatoes (Alu)', 'Boiled Eggs', 'Meetha Ittar (Mughlai Floral Perfume)', 'Kewra Water', 'Gentle Nutmeg & Mace'],
          cooking_technique: 'Pakki Dum: Meat and potatoes are slow-braised separately in aromatic broth before gentle layering with fragrant rice.',
          taste_profile: 'Subtle, delicate, lightly sweet and floral with meltingly tender potatoes that soak up all juices.',
          cultural_story: 'Created by the exiled Nawab Wajid Ali Shah in Metiabruz, Kolkata, who introduced slow-cooked potatoes as a royal luxury.',
          key_differences: 'Features soft whole potatoes and delicate Mughlai perfume instead of intense chili paste.',
          image_url: getCulinaryImage(`Kolkata ${dish}`, 'Bengal'),
        },
        {
          variation_name: `Malabar / Thalassery ${dish}`,
          region: 'Kerala',
          country: 'India',
          signature_ingredients: ['Khyma / Jeerakasala Rice', 'Malabar Garam Masala', 'Green Chili Paste', 'Cashews & Sultanas', 'Coconut Ghee'],
          cooking_technique: 'Ghee Rice Layering: Small-grain fragrant rice is sautéed in ghee with whole spices, then layered over a thick spicy masala base.',
          taste_profile: 'Mellow, sweet-savory, buttery mouthfeel with distinct fennel and cardamom notes.',
          cultural_story: 'Born along the historic Arabian Sea spice trade route of the Malabar coast, uniting Arab maritime merchants and Mappila culinary traditions.',
          key_differences: 'Uses tiny fragrant Jeerakasala rice instead of long-grain basmati, with fennel and fried dry fruits.',
          image_url: getCulinaryImage(`Thalassery ${dish}`, 'Kerala'),
        }
      ],
      comparison_summary: {
        spices_contrast: 'Telangana emphasizes fiery dried chilies & saffron; Bengal relies on floral kewra & nutmeg; Kerala champions fennel & roasted nuts.',
        cooking_vessel_contrast: 'Sealed dough handi (Kacchi) vs. separate braising pots vs. flat-bottomed copper deg.',
        taste_contrast: 'Fiery & regal vs. subtly fragrant & gentle vs. rich, buttery & sweet-savory.',
      }
    });
  }
});

// 6. API: Dynamic Ingredient Substitution
app.post('/api/recipe/substitute', async (req, res) => {
  try {
    const { ingredient, dishName, dietary, reason } = req.body;
    if (!ingredient) {
      return res.status(400).json({ error: 'ingredient is required' });
    }

    if (!ai) {
      return res.json({
        substitutes: [
          {
            name: `Pantry alternative for ${ingredient}`,
            ratio: '1:1 ratio',
            flavorImpact: 'Slightly milder aroma with identical moisture balance.',
            culinaryAdvice: `Incorporate during the same cooking phase as ${ingredient}. Add a pinch of lemon juice or salt if acidity/seasoning needs adjustment.`
          }
        ]
      });
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
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        }),
        6000
      );

      const parsed = JSON.parse(response.text ?? '[]');
      return res.json({ substitutes: parsed });
    } catch (err: any) {
      console.warn('Gemini substitute error:', err.message);
    }

    return res.json({
      substitutes: [
        {
          name: `Culinary Alternative for ${ingredient}`,
          ratio: '1:1 ratio',
          flavorImpact: 'Maintains similar texture and moisture balance.',
          culinaryAdvice: `Incorporate at the same cooking stage as ${ingredient}. Adjust seasoning to taste.`
        }
      ]
    });
  } catch (error: any) {
    console.error('Error finding substitutes:', error);
    return res.status(500).json({ error: error.message || 'Failed to find substitutions' });
  }
});

// 7. API: Surprise Me
app.post('/api/recipe/surprise', async (_req, res) => {
  try {
    const surprises = [
      { name: 'Andhra Gongura Mutton', region: 'Andhra Pradesh', country: 'India', cuisine: 'Telugu / Andhra' },
      { name: 'Hyderabadi Dum Biryani', region: 'Telangana', country: 'India', cuisine: 'Hyderabadi' },
      { name: 'Kerala Appam with Vegetable Stew', region: 'Kerala', country: 'India', cuisine: 'South Indian' },
      { name: 'Sarson Ka Saag & Makki Di Roti', region: 'Punjab', country: 'India', cuisine: 'Punjabi' },
      { name: 'Chettinad Kozhi Curry', region: 'Tamil Nadu', country: 'India', cuisine: 'Chettinad' },
      { name: 'Oaxacan Mole Negro', region: 'Oaxaca', country: 'Mexico', cuisine: 'Mexican' },
      { name: 'Tuscan Truffle Pappardelle', region: 'Tuscany', country: 'Italy', cuisine: 'Italian' },
      { name: 'Hokkaido Miso Butter Corn Ramen', region: 'Hokkaido', country: 'Japan', cuisine: 'Japanese' },
      { name: 'Sichuan Mapo Tofu', region: 'Sichuan', country: 'China', cuisine: 'Chinese' },
      { name: 'Valencia Paella de Marisco', region: 'Valencia', country: 'Spain', cuisine: 'Spanish' },
    ];
    const picked = surprises[Math.floor(Math.random() * surprises.length)];
    return res.json(picked);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Global Recipe Generator AI Agent running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
