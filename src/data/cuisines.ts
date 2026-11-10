export interface CuisineOption {
  id: string;
  name: string;
  country: string;
  flag: string;
  tagline: string;
  heroImage: string;
}

export interface RegionOption {
  id: string;
  name: string;
  stateOrCountry: string;
  accent: string;
  famousFor: string;
  icon: string;
}

export const MAIN_CUISINES: CuisineOption[] = [
  {
    id: 'indian',
    name: 'Indian',
    country: 'India',
    flag: '🇮🇳',
    tagline: 'Vibrant spices, slow-cooked gravies & regional tandoor feasts',
    heroImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'italian',
    name: 'Italian',
    country: 'Italy',
    flag: '🇮🇹',
    tagline: 'Handmade pastas, wood-fired crusts & sun-ripened herbs',
    heroImage: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'japanese',
    name: 'Japanese',
    country: 'Japan',
    flag: '🇯🇵',
    tagline: 'Artful umami balance, silky broths & precision sushi',
    heroImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'chinese',
    name: 'Chinese',
    country: 'China',
    flag: '🇨🇳',
    tagline: 'Wok-hei stir-fries, delicate dim sum & Sichuan peppercorns',
    heroImage: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mexican',
    name: 'Mexican',
    country: 'Mexico',
    flag: '🇲🇽',
    tagline: 'Rich complex moles, charred chiles & fresh masa tortillas',
    heroImage: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'thai',
    name: 'Thai',
    country: 'Thailand',
    flag: '🇹🇭',
    tagline: 'Harmonious symphony of sweet, sour, salty, and spicy',
    heroImage: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'french',
    name: 'French',
    country: 'France',
    flag: '🇫🇷',
    tagline: 'Cultured butter, velvety reductions & classic bistro elegance',
    heroImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean & Greek',
    country: 'Greece / Levant',
    flag: '🇬🇷',
    tagline: 'Cold-pressed olive oils, fresh seafood, herbs & crisp feta',
    heroImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  },
];

export const POPULAR_REGIONS: RegionOption[] = [
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    stateOrCountry: 'India',
    accent: 'Fiery & Tangy',
    famousFor: 'Chicken Pachadi, Dosa, Pesarattu',
    icon: '🌶️',
  },
  {
    id: 'telangana',
    name: 'Telangana',
    stateOrCountry: 'India',
    accent: 'Aromatic & Hearty',
    famousFor: 'Hyderabadi Dum Biryani, Sarva Pindi, Bagara Baingan',
    icon: '👑',
  },
  {
    id: 'kerala',
    name: 'Kerala',
    stateOrCountry: 'India',
    accent: 'Coconut & Spices',
    famousFor: 'Appam & Stew, Karimeen Pollichathu, Malabar Parotta',
    icon: '🥥',
  },
  {
    id: 'punjab',
    name: 'Punjab',
    stateOrCountry: 'India',
    accent: 'Rich & Butter-Laced',
    famousFor: 'Sarson Ka Saag, Makki Di Roti, Amritsari Kulcha',
    icon: '🌾',
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    stateOrCountry: 'India',
    accent: 'Stone-Ground & Fragrant',
    famousFor: 'Chettinad Kozhi, Ven Pongal, Kothu Parotta',
    icon: '🍲',
  },
  {
    id: 'tuscany',
    name: 'Tuscany',
    stateOrCountry: 'Italy',
    accent: 'Rustic & Wood-Roasted',
    famousFor: 'Bistecca Fiorentina, Ribollita, Pappardelle al Cinghiale',
    icon: '🍷',
  },
  {
    id: 'oaxaca',
    name: 'Oaxaca',
    stateOrCountry: 'Mexico',
    accent: 'Smoky & Layered',
    famousFor: 'Mole Negro, Tlayudas, Quesillo Fondue',
    icon: '🥑',
  },
  {
    id: 'sichuan',
    name: 'Sichuan',
    stateOrCountry: 'China',
    accent: 'Mala Numbing Heat',
    famousFor: 'Mapo Tofu, Dan Dan Noodles, Kung Pao',
    icon: '🥢',
  },
  {
    id: 'hokkaido',
    name: 'Hokkaido',
    stateOrCountry: 'Japan',
    accent: 'Coastal & Rich Umami',
    famousFor: 'Miso Butter Corn Ramen, Soup Curry, Uni Don',
    icon: '🍜',
  },
];

export const DIETARY_OPTIONS = [
  { id: 'all', label: 'All Diets', icon: '🍽️' },
  { id: 'Vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'Vegan', label: 'Vegan', icon: '🌱' },
  { id: 'Non-Vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
  { id: 'Gluten-Free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'Halal', label: 'Halal', icon: '✨' },
];

export const POPULAR_SEARCH_IDEAS = [
  'Aloo Paratha',
  'Fried Idli',
  'Dosa',
  'Arbi Masala',
  'Chicken Biryani',
  'Chicken Pachadi',
  'Japanese Ramen',
  'Italian Carbonara',
  'Thai Green Curry',
];

export const SPOTLIGHT_DISHES = [
  {
    name: 'Aloo Paratha',
    nativeName: 'ఆలూ పరాటా / आलू पराठा',
    region: 'North India / Punjab',
    cuisine: 'North Indian',
    description: 'Golden whole wheat flatbread stuffed with spiced mashed potatoes, fragrant green chilies, cilantro, and roasted cumin, shallow-fried with desi ghee.',
    prepTime: '20 mins',
    cookTime: '15 mins',
    dietary: ['Vegetarian'],
    spiceLevel: 'Medium' as const,
    keyIngredients: ['Whole Wheat Atta', 'Boiled Potatoes', 'Roasted Cumin & Coriander', 'Desi Ghee', 'Fresh Cilantro'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Aloo_Paratha.jpg/1280px-Aloo_Paratha.jpg',
  },
  {
    name: 'Fried Idli',
    nativeName: 'ఫ్రైడ్ ఇడ్లీ / फ्राइड इडली',
    region: 'South India',
    cuisine: 'South Indian Fusion',
    description: 'Steamed rice and lentil cakes cut into batons and shallow-fried till crisp, tossed in aromatic mustard seeds, curry leaves, and spicy gun powder (karam podi).',
    prepTime: '10 mins',
    cookTime: '15 mins',
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    spiceLevel: 'Medium' as const,
    keyIngredients: ['Steamed Idlis', 'Mustard Seeds', 'Curry Leaves', 'Idli Podi (Gunpowder)', 'Cold-Pressed Sesame Oil'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Fried_Idli-south_north_fusion.jpg/1280px-Fried_Idli-south_north_fusion.jpg',
  },
  {
    name: 'Dosa',
    nativeName: 'దోశ / தோசை',
    region: 'South India',
    cuisine: 'South Indian',
    description: 'Crisp, golden fermented crepe crafted from stone-ground rice and urad dal, served piping hot with spiced potato filling, coconut chutney, and sambar.',
    prepTime: '15 mins',
    cookTime: '15 mins',
    dietary: ['Vegetarian', 'Gluten-Free'],
    spiceLevel: 'Medium' as const,
    keyIngredients: ['Fermented Rice & Urad Dal Batter', 'Boiled Potatoes', 'Mustard & Curry Leaves Tadka', 'Desi Ghee', 'Fresh Coconut Chutney'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Masala_Dosa_2023.jpg/1280px-Masala_Dosa_2023.jpg',
  },
  {
    name: 'Arbi Masala',
    nativeName: 'అర్బీ మసాలా / अरबी मसाला',
    region: 'North & Central India',
    cuisine: 'Indian Homestyle',
    description: 'Tender taro roots (colocasia) boiled, lightly crisped, and pan-roasted in a fragrant blend of ajwain, coriander, amchur (dry mango powder), and Kashmiri red chili.',
    prepTime: '20 mins',
    cookTime: '25 mins',
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    spiceLevel: 'Medium' as const,
    keyIngredients: ['Arbi (Colocasia / Taro root)', 'Ajwain (Carom seeds)', 'Amchur Powder', 'Coriander Powder', 'Mustard Oil'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Arbi_fry.jpg/1280px-Arbi_fry.jpg',
  },
  {
    name: 'Chicken Biryani',
    nativeName: 'చికెన్ బిర్యానీ / چکن بریانی',
    region: 'Hyderabad / Telangana',
    cuisine: 'Hyderabadi / Indian',
    description: 'World-renowned dum biryani layered with long-grain aged basmati rice and marinated chicken slow-cooked with saffron, caramelized onions, mint, and whole shahi spices.',
    prepTime: '40 mins',
    cookTime: '45 mins',
    dietary: ['Non-Vegetarian', 'Halal', 'Gluten-Free'],
    spiceLevel: 'Hot' as const,
    keyIngredients: ['Aged Basmati Rice', 'Bone-in Chicken', 'Birista (Fried Onions)', 'Saffron Milk', 'Fresh Mint & Yogurt'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Chicken_biryani_02-06-2015_%28India%29.jpg',
  },
  {
    name: 'Chicken Pachadi',
    nativeName: 'చికెన్ పచ్చడి',
    region: 'Andhra Pradesh',
    cuisine: 'Telugu / Andhra',
    description: 'Iconic Andhra chicken pickle made with tender bone-in chicken bites fried until crisp-succulent, infused with stone-ground ginger-garlic, Guntur red chilies, fenugreek, and fresh lemon juice.',
    prepTime: '30 mins',
    cookTime: '35 mins',
    dietary: ['Non-Vegetarian', 'Gluten-Free'],
    spiceLevel: 'Extra Hot' as const,
    keyIngredients: ['Tender Chicken Bites', 'Ground Guntur Red Chilies', 'Roasted Fenugreek & Mustard Powder', 'Fresh Lemon Juice', 'Cold-Pressed Groundnut Oil'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Andhra_Chicken_Pickle.jpg/1280px-Andhra_Chicken_Pickle.jpg',
  },
];
