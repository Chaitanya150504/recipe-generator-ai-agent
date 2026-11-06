import React, { useState, useEffect } from 'react';
import { X, Sparkles, ChefHat, CheckCircle2, AlertCircle } from 'lucide-react';
import { AISubstituteResult } from '../types';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIngredient?: string;
  dishName?: string;
  dietary?: string;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  isOpen,
  onClose,
  defaultIngredient = '',
  dishName = '',
  dietary = 'all',
}) => {
  const [ingredient, setIngredient] = useState(defaultIngredient);
  const [reason, setReason] = useState('Missing from pantry');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AISubstituteResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultIngredient) {
      setIngredient(defaultIngredient);
      fetchSubstitutes(defaultIngredient);
    } else {
      setIngredient('');
      setResults([]);
    }
  }, [defaultIngredient, isOpen]);

  const fetchSubstitutes = async (ingToSearch: string) => {
    if (!ingToSearch.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recipe/substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient: ingToSearch,
          dishName,
          dietary,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch substitutions');
      }

      const data = await response.json();
      setResults(data.substitutes || []);
    } catch (err: any) {
      console.error(err);
      setError('Could not generate substitutions. Please try another ingredient.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubstitutes(ingredient);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11241C]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#D9E2DC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-[#1E3A2F] text-white flex items-center justify-between border-b border-[#284E3F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-[#D1E7DD]">
              <Sparkles className="w-5 h-5 text-[#D1E7DD]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">AI Ingredient Substitutions</h3>
              <p className="text-xs text-[#CDE0D5]">
                {dishName ? `Context: ${dishName}` : 'Pantry & dietary swaps with culinary ratios'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#CDE0D5] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Query Bar */}
        <div className="p-6 border-b border-[#E8ECE9] bg-[#F4F9F6]">
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#617067] mb-1">
                Ingredient to Replace
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => setIngredient(e.target.value)}
                  placeholder="e.g. Tamarind, Gongura, Onions, Fish Sauce, Paneer..."
                  className="flex-1 bg-white border border-[#D9E2DC] rounded-xl px-4 py-2.5 text-sm text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !ingredient.trim()}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#1E3A2F] hover:bg-[#284E3F] text-white disabled:opacity-50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
                >
                  {isLoading ? 'Consulting...' : 'Find Swap'}
                </button>
              </div>
            </div>

            {/* Quick Reason pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#617067] font-medium">Reason:</span>
              {[
                'Missing from pantry',
                'Make it Vegan',
                'Make it Dairy-Free',
                'Nut Allergy',
                'Milder spice',
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    reason === r
                      ? 'bg-[#1E3A2F] text-white font-medium'
                      : 'bg-white text-[#4A554E] border border-[#D9E2DC] hover:bg-[#EBF3EF]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Results Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#FBF9F4]">
          {isLoading && (
            <div className="text-center py-10 space-y-3">
              <div className="w-10 h-10 border-3 border-[#2D5A43] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-[#617067]">
                AI Chef analyzing flavor chemistry and ratios for "{ingredient}"...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#617067]">
                Recommended Substitutes for "{ingredient}":
              </div>

              {results.map((sub, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white border border-[#D9E2DC] shadow-xs hover:border-[#4E7A60] transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-[#1F2421] text-base flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                      {sub.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EBF3EF] text-[#2D5A43] text-xs font-bold border border-[#CDE0D5]">
                      Ratio: {sub.ratio}
                    </span>
                  </div>

                  <p className="text-xs text-[#5C665F]">
                    <strong className="text-[#1F2421]">Flavor & Texture Impact: </strong>
                    {sub.flavorImpact}
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#F4F9F6] text-xs text-[#3D4741] border border-[#D1E7DD]">
                    <strong className="text-[#1E3A2F]">Chef's Advice: </strong>
                    {sub.culinaryAdvice}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && results.length === 0 && !error && (
            <div className="text-center py-8 text-[#617067] text-sm">
              <ChefHat className="w-8 h-8 text-[#8A968F] mx-auto mb-2" />
              Type any ingredient above to find authentic culinary swaps and ratio conversions!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E8ECE9] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#1E3A2F] text-white hover:bg-[#284E3F] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
