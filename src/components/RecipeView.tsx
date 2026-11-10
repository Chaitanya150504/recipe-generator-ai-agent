import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flame,
  Users,
  ChefHat,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Play,
  Pause,
  ArrowLeft,
  Sparkles,
  Layers,
  UtensilsCrossed,
  Wrench,
  MessageSquare,
  Globe2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RecipeData, RecipeIngredient } from '../types';
import { formatFraction, scaleQuantity, playTimerChime } from '../utils/math';
import { resolveExactFoodImage, NEUTRAL_FOOD_PLACEHOLDER } from '../utils/culinaryImages';

interface RecipeViewProps {
  recipe: RecipeData;
  onBack: () => void;
  onGenerateAnother: () => void;
  onOpenSubstitution: (ingredientName?: string) => void;
  onToggleBookmark?: (recipe: RecipeData) => void;
  isBookmarked?: boolean;
  isGeneratingAnother?: boolean;
  onOpenAssistantForRecipe?: (question?: string) => void;
}

export const RecipeView: React.FC<RecipeViewProps> = ({
  recipe,
  onBack,
  onGenerateAnother,
  onOpenSubstitution,
  isGeneratingAnother,
  onOpenAssistantForRecipe,
}) => {
  const recipeName = recipe.recipe_name || (recipe as any).dishName || 'Authentic Regional Recipe';
  const defaultServings = recipe.servings || (recipe as any).defaultServings || 4;
  const prepTime = recipe.preparation_time || (recipe as any).prepTimeMinutes || '20 mins';
  const cookTime = recipe.cooking_time || (recipe as any).cookTimeMinutes || '35 mins';
  const totalTime =
    recipe.total_time ||
    (typeof prepTime === 'number' && typeof cookTime === 'number'
      ? `${prepTime + cookTime} mins`
      : '55 mins');

  const initialImageUrl =
    recipe.image_url ||
    (recipe as any).imageUrl ||
    NEUTRAL_FOOD_PLACEHOLDER;

  const [heroImage, setHeroImage] = useState<string>(initialImageUrl);

  // Dynamically ensure the image matches the exact recipe dish whenever recipe changes
  useEffect(() => {
    let isCancelled = false;
    const dishQuery = recipe.requested_dish || recipe.recipe_name || (recipe as any).dishName || '';

    if (recipe.image_url && recipe.image_url !== NEUTRAL_FOOD_PLACEHOLDER) {
      setHeroImage(recipe.image_url);
    } else if (dishQuery) {
      resolveExactFoodImage(dishQuery, dishQuery).then((resolved) => {
        if (!isCancelled) {
          setHeroImage(resolved);
        }
      });
    } else {
      setHeroImage(NEUTRAL_FOOD_PLACEHOLDER);
    }

    return () => {
      isCancelled = true;
    };
  }, [recipe.recipe_name, recipe.requested_dish, recipe.image_url]);

  // Serving-size adjustment
  const [servings, setServings] = useState<number>(defaultServings);

  // Checked ingredients for prep checklist
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Active cooking timer state
  const [activeTimer, setActiveTimer] = useState<{
    stepIndex: number;
    remainingSeconds: number;
    totalSeconds: number;
    isRunning: boolean;
  } | null>(null);

  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Completed steps tracker
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Reset when recipe updates
  useEffect(() => {
    setServings(defaultServings);
    setCheckedIngredients({});
    setActiveTimer(null);
    setCompletedSteps({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [recipe]);

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (activeTimer && activeTimer.isRunning && activeTimer.remainingSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => {
          if (!prev) return null;
          if (prev.remainingSeconds <= 1) {
            playTimerChime();
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 },
            });
            return { ...prev, remainingSeconds: 0, isRunning: false };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const toggleIngredientCheck = (name: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleStepCompleted = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleStartTimer = (stepIndex: number, minutes: number) => {
    const totalSeconds = minutes * 60;
    setActiveTimer({
      stepIndex,
      remainingSeconds: totalSeconds,
      totalSeconds,
      isRunning: true,
    });
  };

  const handleCopyIngredients = () => {
    const lines = (recipe.ingredients || []).map((ing) => {
      const scaled = scaleQuantity(ing.quantity || 1, defaultServings, servings);
      return `- ${formatFraction(scaled)} ${ing.unit || ''} ${ing.name}${ing.notes ? ` (${ing.notes})` : ''}`;
    });
    const text = `Grocery List for ${recipeName} (${servings} Servings):\n\n${lines.join('\n')}\n\nGenerated via Global Recipe Generator AI Agent`;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Group ingredients by category
  const groupedIngredients = (recipe.ingredients || []).reduce<Record<string, RecipeIngredient[]>>(
    (acc, ing) => {
      const cat = ing.category || 'Essential Ingredients';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ing);
      return acc;
    },
    {}
  );

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return (
          <span className="bg-[#EBF3EF] text-[#2D5A43] border border-[#CDE0D5] text-xs font-bold px-3 py-1 rounded-full">
            Easy Prep
          </span>
        );
      case 'Medium':
        return (
          <span className="bg-[#F0F6F3] text-[#3D5B4B] border border-[#D1E7DD] text-xs font-bold px-3 py-1 rounded-full">
            Intermediate
          </span>
        );
      case 'Advanced':
        return (
          <span className="bg-[#E2EBE5] text-[#1E3A2F] border border-[#B8D4C4] text-xs font-bold px-3 py-1 rounded-full">
            Master Chef
          </span>
        );
      default:
        return null;
    }
  };

  const instructions = recipe.cooking_instructions || recipe.instructions || [];
  const equipment = recipe.equipment || [];
  const substitutions = recipe.substitutions || (recipe as any).commonSubstitutions || [];
  const servingSuggestions = recipe.serving_suggestions || (recipe as any).pairings || [];

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-[#1F2421]">
      {/* Top Navigation & Action Row */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1F2421] hover:text-[#1E3A2F] bg-white hover:bg-[#F3F7F5] px-3.5 py-2 rounded-xl border border-[#D9E2DC] shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#4E7A60]" />
          <span>Back to Search</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Ask AI Chef Question Button */}
          {onOpenAssistantForRecipe && (
            <button
              onClick={() => onOpenAssistantForRecipe()}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#EBF3EF] hover:bg-[#DCEAE3] text-[#1E3A2F] border border-[#CDE0D5] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 text-[#2D5A43]" />
              <span>Ask AI Cooking Assistant</span>
            </button>
          )}

          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white text-[#3D4741] border border-[#D9E2DC] hover:bg-[#F3F7F5] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Print recipe"
          >
            <Printer className="w-4 h-4 text-[#617067]" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Generate Another Recipe Button */}
          <button
            onClick={onGenerateAnother}
            disabled={isGeneratingAnother}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#1E3A2F] hover:bg-[#284E3F] text-white shadow-md shadow-[#1E3A2F]/15 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 text-[#D1E7DD] ${isGeneratingAnother ? 'animate-spin' : ''}`} />
            <span>Generate Another Recipe</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card with Food Image */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#D9E2DC] bg-white text-white mb-8">
        <div className="relative h-72 sm:h-96 w-full overflow-hidden">
          <img
            src={heroImage}
            alt={recipeName}
            onError={() => {
              if (heroImage !== NEUTRAL_FOOD_PLACEHOLDER) {
                setHeroImage(NEUTRAL_FOOD_PLACEHOLDER);
              }
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11241C] via-[#11241C]/65 to-black/20" />
        </div>

        {/* Hero Overlay Content */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {recipe.requested_dish && recipe.requested_dish.toLowerCase() !== recipeName.toLowerCase() && (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                Dish: {recipe.requested_dish}
              </span>
            )}
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#1E3A2F] text-[#D1E7DD] border border-[#3D5B4B] shadow-sm flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-[#A8C7B5]" />
              {recipe.region ? `${recipe.region}, ` : ''}{recipe.country || 'Authentic Origin'}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
              {recipe.cuisine} Cuisine
            </span>
            {getDifficultyBadge(recipe.difficulty)}
            {recipe.spice_level && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#284E3F]/80 text-[#D1E7DD] border border-[#4E7A60]/50">
                🌶️ {recipe.spice_level}
              </span>
            )}
            {recipe.dietary_tags?.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EBF3EF] text-[#1E3A2F] border border-[#CDE0D5]"
              >
                🌱 {tag}
              </span>
            ))}
          </div>

          {recipe.native_name && (
            <p className="text-sm sm:text-base font-medium text-[#CDE0D5] tracking-wide mb-1 font-sans">
              {recipe.native_name}
            </p>
          )}

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {recipeName}
          </h1>

          <p className="mt-3 text-[#E0EBE4] text-sm sm:text-base max-w-3xl leading-relaxed font-light">
            {recipe.description}
          </p>
        </div>
      </div>

      {/* Quick Metrics Bar in White Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-[#D9E2DC] shadow-xs mb-8 text-[#1F2421]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3EF] text-[#2D5A43] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#617067]">
              Prep Time
            </div>
            <div className="text-base font-bold text-[#1F2421]">{prepTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3EF] text-[#2D5A43] flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#617067]">
              Cooking Time
            </div>
            <div className="text-base font-bold text-[#1F2421]">{cookTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3EF] text-[#2D5A43] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#617067]">
              Total Time
            </div>
            <div className="text-base font-bold text-[#1F2421]">{totalTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3EF] text-[#2D5A43] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#617067]">
              Serving Size
            </div>
            <div className="text-base font-bold text-[#1F2421]">
              {servings} {servings === 1 ? 'person' : 'people'}
            </div>
          </div>
        </div>
      </div>

      {/* Equipment List (Cookware) */}
      {equipment.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#F4F9F6] border border-[#D1E7DD] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E3A2F]">
            <Wrench className="w-4 h-4 text-[#4E7A60]" />
            <span>Recommended Cookware & Equipment:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {equipment.map((eq, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-white text-[#1F2421] text-xs font-semibold border border-[#D1E7DD] shadow-2xs"
              >
                🍳 {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-Column Grid: Checklist & Numbered Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Ingredients Checklist (Requirement 6 & 7) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#D9E2DC] p-6 shadow-sm sticky top-24">
            {/* Header + Serving Size Adjustment Feature */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8ECE9]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1F2421]">
                  Ingredients Checklist
                </h2>
                <p className="text-xs text-[#617067]">Tick off ingredients while cooking</p>
              </div>

              {/* Serving Size Adjuster */}
              <div className="flex items-center gap-1 bg-[#F4F9F6] rounded-xl p-1 border border-[#D1E7DD]">
                <button
                  type="button"
                  onClick={() => setServings((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-[#EBF3EF] text-[#1E3A2F] font-bold flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Decrease servings"
                >
                  -
                </button>
                <div className="px-2 text-xs font-bold text-[#1E3A2F] whitespace-nowrap">
                  {servings} {servings === 1 ? 'serving' : 'servings'}
                </div>
                <button
                  type="button"
                  onClick={() => setServings((prev) => Math.min(24, prev + 1))}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-[#EBF3EF] text-[#1E3A2F] font-bold flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Increase servings"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Actions for ingredients */}
            <div className="flex items-center justify-between py-2.5 text-xs text-[#617067]">
              <button
                onClick={handleCopyIngredients}
                className="hover:text-[#1E3A2F] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2D5A43]" />
                    <span className="text-[#2D5A43] font-bold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#4E7A60]" />
                    <span>Copy Grocery List</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenSubstitution()}
                className="text-[#2D5A43] hover:text-[#1E3A2F] flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#4E7A60]" />
                <span>AI Substitutions</span>
              </button>
            </div>

            {/* Categorized Ingredients Checklist */}
            <div className="space-y-5 mt-4 divide-y divide-[#E8ECE9] max-h-[60vh] overflow-y-auto pr-1">
              {Object.entries(groupedIngredients).map(([category, items]) => (
                <div key={category} className="pt-3 first:pt-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D5A43] mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#4E7A60]" />
                    {category}
                  </h3>

                  <ul className="space-y-2.5">
                    {items.map((ing, i) => {
                      const scaledQty = scaleQuantity(ing.quantity || 1, defaultServings, servings);
                      const isChecked = !!checkedIngredients[ing.name];

                      return (
                        <li
                          key={`${ing.name}-${i}`}
                          className={`flex items-start justify-between gap-3 text-sm transition-all p-2 rounded-xl ${
                            isChecked
                              ? 'bg-[#F4F9F6] text-[#8A968F] line-through'
                              : 'text-[#1F2421] hover:bg-[#F4F9F6]'
                          }`}
                        >
                          <label className="flex items-start gap-3 flex-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleIngredientCheck(ing.name)}
                              className="mt-1 w-4 h-4 rounded text-[#1E3A2F] accent-[#1E3A2F] focus:ring-[#2D5A43] border-[#D9E2DC] cursor-pointer"
                            />
                            <div>
                              <span className="font-semibold text-[#1F2421]">
                                {formatFraction(scaledQty)} {ing.unit || ''}
                              </span>{' '}
                              <span>{ing.name}</span>
                              {ing.notes && (
                                <span className="block text-xs text-[#617067] not-italic">
                                  ({ing.notes})
                                </span>
                              )}
                            </div>
                          </label>

                          <button
                            type="button"
                            onClick={() => onOpenSubstitution(ing.name)}
                            className="text-[11px] text-[#2D5A43] hover:text-[#1E3A2F] font-semibold px-2 py-0.5 rounded-md bg-[#EBF3EF] hover:bg-[#DCEAE3] transition-colors whitespace-nowrap self-center cursor-pointer"
                            title={`Find substitute for ${ing.name}`}
                          >
                            Sub?
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Substitutions Table */}
            {substitutions.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#E8ECE9]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-[#4E7A60]" /> Common Substitutions
                </h4>
                <div className="space-y-2">
                  {substitutions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2.5 rounded-xl bg-[#F4F9F6] border border-[#D1E7DD] text-[#1F2421]"
                    >
                      <div className="font-semibold text-[#1E3A2F]">
                        {sub.original} ➔ {sub.substitute} {sub.ratio ? `(${sub.ratio})` : ''}
                      </div>
                      {sub.notes && (
                        <p className="text-[11px] text-[#617067] mt-0.5">{sub.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Clearly Numbered Step-by-Step Cooking Instructions (Requirement 6 & 8) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Timer Card */}
          {activeTimer && (
            <div className="bg-[#1E3A2F] text-white rounded-2xl p-4 shadow-lg border border-[#3D5B4B] flex items-center justify-between gap-4 animate-slideDown">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/15 text-[#D1E7DD] flex items-center justify-center font-bold">
                  <Clock className={`w-5 h-5 ${activeTimer.isRunning ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#D1E7DD] uppercase tracking-wider">
                    Step {instructions[activeTimer.stepIndex]?.step_number || ''} Timer Active
                  </div>
                  <div className="text-2xl font-mono font-bold">
                    {Math.floor(activeTimer.remainingSeconds / 60)
                      .toString()
                      .padStart(2, '0')}
                    :
                    {(activeTimer.remainingSeconds % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setActiveTimer((prev) =>
                      prev ? { ...prev, isRunning: !prev.isRunning } : null
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold text-white border border-white/20 flex items-center gap-1 cursor-pointer"
                >
                  {activeTimer.isRunning ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>{activeTimer.isRunning ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  onClick={() => setActiveTimer(null)}
                  className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900 text-xs font-semibold text-red-200 border border-red-700 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Numbered Instructions Container */}
          <div className="bg-white rounded-3xl border border-[#D9E2DC] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8ECE9] mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F2421]">
                  Step-by-Step Cooking Instructions
                </h2>
                <p className="text-xs text-[#617067] mt-0.5">
                  Follow each numbered stage for authentic restaurant-quality results.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EBF3EF] text-[#2D5A43] border border-[#CDE0D5]">
                {Object.keys(completedSteps).length} / {instructions.length} Complete
              </span>
            </div>

            {/* Steps List */}
            <div className="space-y-6">
              {instructions.map((step, idx) => {
                const stepNum = step.step_number || (step as any).stepNumber || idx + 1;
                const isDone = !!completedSteps[stepNum];
                const duration = step.duration_minutes || (step as any).durationMinutes;
                const isStepTimerActive = activeTimer && activeTimer.stepIndex === idx;
                const chefTip = step.chef_tip || (step as any).chefTip;

                return (
                  <div
                    key={stepNum}
                    className={`relative p-5 rounded-2xl border transition-all duration-200 ${
                      isDone
                        ? 'bg-[#F4F9F6]/80 border-[#D1E7DD] opacity-75'
                        : 'bg-white border-[#D9E2DC] hover:border-[#4E7A60] hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Number Badge */}
                      <button
                        type="button"
                        onClick={() => toggleStepCompleted(stepNum)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-[#2D5A43] text-white'
                            : 'bg-[#1E3A2F] text-white hover:bg-[#284E3F]'
                        }`}
                        title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                      >
                        {isDone ? <Check className="w-5 h-5 text-white" /> : stepNum}
                      </button>

                      {/* Step Body */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <h3
                            className={`font-serif text-base sm:text-lg font-bold text-[#1F2421] ${
                              isDone ? 'line-through text-[#8A968F]' : ''
                            }`}
                          >
                            {step.title}
                          </h3>

                          {duration && duration > 0 && (
                            <button
                              type="button"
                              onClick={() => handleStartTimer(idx, duration)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isStepTimerActive
                                  ? 'bg-[#1E3A2F] text-white font-bold'
                                  : 'bg-[#EBF3EF] hover:bg-[#DCEAE3] text-[#1E3A2F] border border-[#CDE0D5]'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5 text-[#4E7A60]" />
                              <span>
                                {isStepTimerActive ? 'Timer Running' : `Start ${duration}m Timer`}
                              </span>
                            </button>
                          )}
                        </div>

                        <p className="text-sm sm:text-base text-[#3D4741] leading-relaxed font-normal">
                          {step.description || (step as any).instruction}
                        </p>

                        {/* Chef Tip Callout */}
                        {chefTip && (
                          <div className="mt-3 p-3 rounded-xl bg-[#F4F9F6] border border-[#D1E7DD] text-xs text-[#1E3A2F] flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-[#4E7A60] flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-semibold text-[#1E3A2F]">Chef's Secret: </strong>
                              {chefTip}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Serving Suggestions & Authentic Pairings (Requirement) */}
          {servingSuggestions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-[#D9E2DC] shadow-sm">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#617067] mb-3 flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-[#4E7A60]" />
                Recommended Serving Suggestions & Pairings
              </h3>
              <div className="flex flex-wrap gap-2">
                {servingSuggestions.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-[#F4F9F6] hover:bg-[#EBF3EF] text-[#1E3A2F] text-xs font-semibold border border-[#D1E7DD] transition-colors"
                  >
                    🍽️ {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
