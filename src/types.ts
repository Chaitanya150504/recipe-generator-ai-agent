export type DietaryPreference = 'all' | 'Vegetarian' | 'Vegan' | 'Non-Vegetarian' | 'Gluten-Free' | 'Halal';

export type SpiceLevel = 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';

export type Difficulty = 'Easy' | 'Medium' | 'Advanced';

export interface DishPreview {
  name: string;
  nativeName?: string;
  region: string;
  cuisine: string;
  description: string;
  prepTime: string;
  cookTime: string;
  dietary: string[];
  spiceLevel: SpiceLevel;
  keyIngredients: string[];
  imageUrl: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  notes?: string;
  defaultSubstitute?: string;
}

export interface RecipeInstruction {
  step_number: number;
  title: string;
  description: string;
  duration_minutes?: number;
  chef_tip?: string;
}

export interface RecipeSubstitution {
  original: string;
  substitute: string;
  ratio?: string;
  notes?: string;
}

export interface RecipeData {
  recipe_name: string;
  requested_dish?: string;
  cuisine: string;
  country: string;
  region: string;
  description: string;
  ingredients: RecipeIngredient[];
  preparation_time: string | number;
  cooking_time: string | number;
  total_time?: string | number;
  servings: number;
  difficulty: Difficulty;
  equipment: string[];
  cooking_instructions?: RecipeInstruction[];
  instructions?: RecipeInstruction[];
  cooking_tips?: string[];
  substitutions: RecipeSubstitution[];
  serving_suggestions: string[];
  native_name?: string;
  cultural_background?: string;
  spice_level?: SpiceLevel;
  dietary_tags?: string[];
  calories_per_serving?: number;
  macros?: {
    protein: string;
    carbs: string;
    fat: string;
  };
  image_url: string;
}

export interface AISubstituteResult {
  name: string;
  ratio: string;
  flavorImpact: string;
  culinaryAdvice: string;
}

export type AssistantIntent =
  | 'cuisine_recommendation'
  | 'recipe_generation'
  | 'recipe_customization'
  | 'ingredient_substitution'
  | 'serving_adjustment'
  | 'alternative_dishes'
  | 'cooking_guidance'
  | 'clarification'
  | 'general_chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  intent?: AssistantIntent;
  recipe?: RecipeData;
  dishes?: DishPreview[];
  clarification_options?: string[];
}

export interface PantryRecipeSuggestion {
  dish_name: string;
  region_and_cuisine: string;
  description: string;
  matched_ingredients: string[];
  missing_ingredients: string[];
  difficulty: Difficulty;
  estimated_time: string;
  recipe: RecipeData;
  image_url: string;
}

export interface RegionalVariation {
  variation_name: string;
  region: string;
  country: string;
  signature_ingredients: string[];
  cooking_technique: string;
  taste_profile: string;
  cultural_story: string;
  key_differences: string;
  recipe_preview?: RecipeData;
  image_url: string;
}

export interface RegionalComparisonResult {
  dish_concept: string;
  cultural_origin: string;
  variations: RegionalVariation[];
  comparison_summary: {
    spices_contrast: string;
    cooking_vessel_contrast: string;
    taste_contrast: string;
  };
}
