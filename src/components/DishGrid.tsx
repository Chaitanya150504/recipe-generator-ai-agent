import React from 'react';
import { Clock, Utensils, ChefHat, Sparkles, ArrowRight } from 'lucide-react';
import { DishPreview } from '../types';

interface DishGridProps {
  dishes: DishPreview[];
  isLoading: boolean;
  selectedLabel: string;
  onSelectDish: (dish: DishPreview) => void;
}

export const DishGrid: React.FC<DishGridProps> = ({
  dishes,
  isLoading,
  selectedLabel,
  onSelectDish,
}) => {
  const getSpiceBadge = (level: string) => {
    switch (level) {
      case 'Mild':
        return (
          <span className="text-[#2D5A43] bg-[#EBF3EF] text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#CDE0D5]">
            🌿 Mild
          </span>
        );
      case 'Medium':
        return (
          <span className="text-[#1E3A2F] bg-[#F4F9F6] text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#D1E7DD]">
            🌶️ Medium
          </span>
        );
      case 'Hot':
        return (
          <span className="text-[#87321F] bg-[#FCEEEA] text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#F5C7BC]">
            🌶️🌶️ Hot
          </span>
        );
      case 'Extra Hot':
        return (
          <span className="text-[#991B1B] bg-[#FEE2E2] text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#FECACA]">
            🔥 Extra Hot
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#1F2421]">
      {/* Section Header */}
      <div className="pb-6 border-b border-[#E8ECE9]">
        <div className="flex items-center gap-2 text-[#2D5A43] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#4E7A60]" />
          Regional Culinary Spotlight
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2421] mt-1">
          {selectedLabel ? `Iconic Dishes from ${selectedLabel}` : 'Popular Regional Specialties'}
        </h2>
        <p className="text-sm text-[#5C665F] mt-1">
          Select any dish below to generate its authentic, step-by-step master recipe with exact measurements.
        </p>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#D9E2DC] p-4 shadow-sm animate-pulse space-y-4"
            >
              <div className="h-48 bg-[#EBF3EF] rounded-xl w-full" />
              <div className="h-6 bg-[#EBF3EF] rounded w-3/4" />
              <div className="h-4 bg-[#EBF3EF] rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-[#EBF3EF] rounded w-full" />
                <div className="h-3 bg-[#EBF3EF] rounded w-5/6" />
              </div>
              <div className="h-10 bg-[#EBF3EF] rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && dishes.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#D9E2DC] shadow-sm mt-8 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF3EF] text-[#2D5A43] flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1F2421]">No dishes found</h3>
          <p className="text-[#5C665F] text-sm mt-2">
            Try adjusting your search terms or dietary filters, or enter a dish name in the search box above.
          </p>
        </div>
      )}

      {/* Dish Grid */}
      {!isLoading && dishes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mt-8">
          {dishes.map((dish, i) => (
            <article
              key={`${dish.name}-${i}`}
              className="group bg-white rounded-2xl border border-[#D9E2DC] shadow-sm hover:shadow-xl hover:border-[#4E7A60] transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Dish Image */}
              <div className="relative h-52 w-full overflow-hidden bg-[#F3F7F5]">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11241C]/85 via-transparent to-black/20" />

                {/* Region & Spice Top Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="bg-[#1E3A2F]/90 backdrop-blur-md text-[#D1E7DD] text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#3D5B4B]">
                    📍 {dish.region}
                  </span>
                </div>

                <div className="absolute top-3 right-3">{getSpiceBadge(dish.spiceLevel)}</div>

                {/* Dish Name overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif text-lg font-bold leading-tight drop-shadow-sm group-hover:text-[#D1E7DD] transition-colors">
                    {dish.name}
                  </h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta timings & dietary */}
                  <div className="flex items-center gap-3 text-xs text-[#617067] font-medium mb-3 pb-3 border-b border-[#E8ECE9]">
                    <div className="flex items-center gap-1 text-[#3D4741]">
                      <Clock className="w-3.5 h-3.5 text-[#4E7A60]" />
                      <span>Prep {dish.prepTime} • Cook {dish.cookTime}</span>
                    </div>
                    {dish.dietary && dish.dietary.length > 0 && (
                      <span className="text-[#2D5A43] font-medium ml-auto">
                        {dish.dietary.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#5C665F] line-clamp-3 leading-relaxed mb-4">
                    {dish.description}
                  </p>

                  {/* Key Ingredients */}
                  {dish.keyIngredients && dish.keyIngredients.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-[#617067] mb-1.5 flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-[#4E7A60]" /> Key Ingredients:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dish.keyIngredients.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-[#F4F9F6] text-[#1E3A2F] border border-[#D1E7DD] text-[11px] font-medium px-2 py-0.5 rounded-md"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cook Action Button */}
                <button
                  onClick={() => onSelectDish(dish)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-[#1E3A2F] hover:bg-[#284E3F] text-white shadow-sm transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <ChefHat className="w-4 h-4 text-[#D1E7DD]" />
                  <span>Generate Full Recipe</span>
                  <ArrowRight className="w-4 h-4 text-[#D1E7DD]" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
