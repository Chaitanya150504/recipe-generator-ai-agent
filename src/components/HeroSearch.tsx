import React, { useState } from 'react';
import { Search, X, Sparkles, ChefHat, Utensils } from 'lucide-react';
import { DietaryPreference } from '../types';

interface HeroSearchProps {
  onSearch: (query: string, dietary: DietaryPreference) => void;
  currentDietary: DietaryPreference;
  onDietaryChange: (dietary: DietaryPreference) => void;
  isLoading?: boolean;
}

const POPULAR_DISH_SUGGESTIONS = [
  'Andhra Chicken Curry',
  'Gongura Pachadi',
  'Japanese Ramen',
  'Pesarattu Upma',
  'Italian Carbonara',
  'Hyderabadi Dum Biryani',
  'Thai Green Curry',
  'Mexican Birria Tacos',
  'Classic Margherita Pizza',
];

const DIETARY_OPTIONS = [
  { id: 'all', label: 'All Diets' },
  { id: 'Vegetarian', label: 'Vegetarian' },
  { id: 'Vegan', label: 'Vegan' },
  { id: 'Non-Vegetarian', label: 'Non-Vegetarian' },
  { id: 'Gluten-Free', label: 'Gluten-Free' },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  currentDietary,
  onDietaryChange,
  isLoading,
}) => {
  const [dishInput, setDishInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dishInput.trim()) {
      onSearch(dishInput.trim(), currentDietary);
    }
  };

  const handleSelectSuggestion = (dish: string) => {
    setDishInput(dish);
    onSearch(dish, currentDietary);
  };

  return (
    <div className="relative bg-[#FBF9F4] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E8ECE9]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Mint Accent Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3EF] border border-[#CDE0D5] text-[#2D5A43] text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#4E7A60]" />
          <span>AI-Powered Global Recipe Generator</span>
        </div>

        {/* Required Heading (Requirement 2) */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F2421] leading-tight">
          What Would You Like to Cook Today?
        </h1>

        {/* Required Subtitle (Requirement 2) */}
        <p className="mt-4 text-base sm:text-xl text-[#5C665F] max-w-2xl mx-auto font-normal leading-relaxed">
          Enter any dish from anywhere in the world and discover how to prepare it.
        </p>

        {/* Dietary Preference Filter Bar */}
        <div className="mt-8 flex items-center justify-center flex-wrap gap-2">
          <span className="text-xs uppercase tracking-wider text-[#6A7870] font-bold mr-1 flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5 text-[#4E7A60]" /> Dietary:
          </span>
          {DIETARY_OPTIONS.map((opt) => {
            const isSelected = currentDietary === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onDietaryChange(opt.id as DietaryPreference)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#1E3A2F] text-white shadow-xs font-bold'
                    : 'bg-white hover:bg-[#F3F7F5] text-[#4A554E] border border-[#D9E2DC]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Required Large Input Field & Prominent "Generate Recipe" Button (Requirement 2) */}
        <form onSubmit={handleSubmit} className="mt-7 max-w-3xl mx-auto">
          <div className="relative flex flex-col sm:flex-row items-stretch rounded-3xl bg-white border-2 border-[#D9E2DC] p-2 shadow-lg shadow-[#1E3A2F]/5 focus-within:border-[#2D5A43] focus-within:ring-4 focus-within:ring-[#D1E7DD]/50 transition-all gap-2">
            <div className="flex-1 flex items-center pl-4">
              <Search className="w-5 h-5 text-[#6A7870] flex-shrink-0" />
              <input
                type="text"
                value={dishInput}
                onChange={(e) => setDishInput(e.target.value)}
                placeholder="Enter a dish name, e.g. Andhra Chicken Curry, Sushi, Pizza..."
                className="w-full bg-transparent px-3.5 py-3.5 text-base sm:text-lg text-[#1F2421] placeholder-[#8A968F] focus:outline-none"
              />
              {dishInput && (
                <button
                  type="button"
                  onClick={() => setDishInput('')}
                  className="p-1.5 rounded-full text-[#8A968F] hover:text-[#1F2421] hover:bg-[#F3F7F5] transition-colors mr-2"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !dishInput.trim()}
              className="px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-[#1E3A2F] hover:bg-[#284E3F] text-white shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing Recipe...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5 text-[#D1E7DD]" />
                  <span>Generate Recipe</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-6 flex items-center justify-center flex-wrap gap-2 text-xs text-[#5C665F]">
          <span className="font-semibold text-[#3D4741]">Popular ideas:</span>
          {POPULAR_DISH_SUGGESTIONS.map((dish) => (
            <button
              key={dish}
              type="button"
              onClick={() => handleSelectSuggestion(dish)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EBF3EF] hover:text-[#1E3A2F] hover:border-[#A8C7B5] text-[#4A554E] border border-[#E0E7E2] transition-colors font-medium shadow-2xs cursor-pointer"
            >
              {dish}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
