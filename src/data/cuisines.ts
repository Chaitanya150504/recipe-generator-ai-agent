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
    famousFor: 'Gongura, Guntur Chilies, Royyala Iguru',
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
  'Andhra Gongura Mutton',
  'Hyderabadi Dum Biryani',
  'Kerala Appam Stew',
  'Amritsari Chole Kulcha',
  'Tuscan Truffle Pappardelle',
  'Tokyo Tonkotsu Ramen',
  'Oaxacan Chicken Mole',
  'Thai Green Curry',
  'Classic French Bouillabaisse',
];
