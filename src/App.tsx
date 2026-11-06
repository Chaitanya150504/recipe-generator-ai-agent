/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { DishGrid } from './components/DishGrid';
import { RecipeView } from './components/RecipeView';
import { AICookingAssistant } from './components/AICookingAssistant';
import { SubstitutionModal } from './components/SubstitutionModal';
import { DietaryPreference, DishPreview, RecipeData, ChatMessage } from './types';
import { ChefHat, Globe2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentDietary, setCurrentDietary] = useState<DietaryPreference>('all');
  const [activeFilterLabel, setActiveFilterLabel] = useState<string>('Andhra Pradesh');
  const [dishes, setDishes] = useState<DishPreview[]>([]);
  const [isDishesLoading, setIsDishesLoading] = useState<boolean>(false);

  // Selected recipe state
  const [currentRecipe, setCurrentRecipe] = useState<RecipeData | null>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState<boolean>(false);
  const [recipeLoadingDishName, setRecipeLoadingDishName] = useState<string>('');

  // Modals state
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState<boolean>(false);
  const [activeSubstitutionIng, setActiveSubstitutionIng] = useState<string>('');

  // Conversational Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I'm your Global Recipe AI Cooking Assistant.

You can ask me to:
• Generate authentic recipes from any region (e.g. *"Gongura Pachadi"*, *"Japanese Ramen"*, or *"Andhra Chicken Curry"*)
• Adjust portions for your group (e.g. *"Make this recipe for 5 people"*)
• Omit or substitute ingredients (e.g. *"Can I prepare this without onions?"* or *"What can I use instead of tamarind?"*)
• Clarify techniques (e.g. *"Explain step 3 in more detail"*)

What dish would you like to prepare today?`,
      timestamp: Date.now(),
    },
  ]);

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial load: Discover featured regional dishes for inspiration
  useEffect(() => {
    fetchDishes({ region: 'Andhra Pradesh', dietary: 'all' });
  }, []);

  // Fetch dishes from server
  const fetchDishes = async (params: {
    query?: string;
    region?: string;
    cuisine?: string;
    dietary?: DietaryPreference;
  }) => {
    setIsDishesLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/dishes/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to discover regional dishes');
      }

      const data = await response.json();
      setDishes(data.dishes || []);
      setActiveFilterLabel(params.region || params.cuisine || params.query || 'Global');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to fetch dishes. Please try again.');
    } finally {
      setIsDishesLoading(false);
    }
  };

  // Generate recipe when a dish is requested from Search or Cards
  const handleGenerateRecipe = async (dishName: string, regionOverride?: string) => {
    if (!dishName.trim()) return;

    // Clear previous recipe immediately (Requirement 8)
    setCurrentRecipe(null);
    setRecipeLoadingDishName(dishName.trim());
    setIsRecipeLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/recipe/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: dishName.trim(),
          region: regionOverride || undefined, // Pass only if explicitly provided by card; never force Andhra Pradesh
          dietary: currentDietary !== 'all' ? currentDietary : undefined,
          servings: 4,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let message = errData.error;
        if (!message) {
          if (response.status === 404) {
            message = `API route not found (HTTP 404). If running on Vercel, please verify that Vercel serverless functions and vercel.json are deployed.`;
          } else if (response.status === 429) {
            message = `Gemini API quota exceeded (HTTP 429: Resource Exhausted). The free tier daily limit has been reached. Please wait a moment or try again later.`;
          } else if (response.status === 403) {
            message = `Gemini API authorization error (HTTP 403). Please verify GEMINI_API_KEY is set in Vercel Project Settings -> Environment Variables.`;
          } else {
            message = `Failed to generate authentic recipe for "${dishName}" (HTTP ${response.status}).`;
          }
        }
        throw new Error(message);
      }

      const data = await response.json();
      if (!data.recipe) {
        throw new Error(`No recipe returned for "${dishName}".`);
      }

      const generatedRecipe: RecipeData = data.recipe;
      // Ensure the newly generated Gemini recipe completely replaces the view
      setCurrentRecipe(generatedRecipe);

      // Append assistant note to chat for seamless conversational follow-ups
      setChatMessages((prev) => [
        ...prev,
        {
          id: `recipe-${Date.now()}`,
          role: 'assistant',
          content: `Here is the authentic recipe for **${generatedRecipe.recipe_name || dishName}** from ${generatedRecipe.region ? `${generatedRecipe.region}, ${generatedRecipe.country || ''}` : generatedRecipe.country || 'its traditional origin'}.

Feel free to ask me follow-up questions such as:
- *"Make this recipe for 5 people"*
- *"Can I prepare this without onions?"*
- *"What can I use instead of tamarind?"*
- *"Explain step 3 in more detail"*`,
          timestamp: Date.now(),
          recipe: generatedRecipe,
        },
      ]);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error generating recipe. Please try again.');
    } finally {
      setIsRecipeLoading(false);
      setRecipeLoadingDishName('');
    }
  };

  // Conversational Assistant message handler
  const handleSendChatMessage = async (userText: string) => {
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          currentRecipe,
          activeLocation: activeFilterLabel,
          dietary: currentDietary,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat assistant error');
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Here is the culinary guidance you requested.',
        timestamp: Date.now(),
        intent: data.intent,
        recipe: data.recipe,
        dishes: data.dishes,
        clarification_options: data.clarification_options,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);

      // If a recipe was generated or modified, update active recipe view
      if (data.recipe) {
        setCurrentRecipe(data.recipe);
      }

      // If dishes were suggested, update dish grid
      if (data.dishes && data.dishes.length > 0) {
        setDishes(data.dishes);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            "I'm experiencing a brief pause in the kitchen. Could you please rephrase or try again?",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Generate Another Recipe
  const handleGenerateAnother = async () => {
    if (!currentRecipe) return;
    const currentName = currentRecipe.recipe_name || (currentRecipe as any).dishName;

    setIsRecipeLoading(true);
    setErrorMessage(null);

    try {
      const candidateDishes = dishes.filter(
        (d) => d.name.toLowerCase() !== currentName.toLowerCase()
      );

      if (candidateDishes.length > 0) {
        const nextDish = candidateDishes[Math.floor(Math.random() * candidateDishes.length)];
        await handleGenerateRecipe(nextDish.name, nextDish.region);
      } else {
        await handleGenerateRecipe(
          `Another traditional specialty from ${currentRecipe.region || 'the region'}`,
          currentRecipe.region
        );
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRecipeLoading(false);
    }
  };

  // Dietary filter changed
  const handleDietaryChange = (dietary: DietaryPreference) => {
    setCurrentDietary(dietary);
    if (!currentRecipe) {
      fetchDishes({
        region: activeFilterLabel,
        dietary,
      });
    }
  };

  const handleOpenSubstitution = (ingName?: string) => {
    setActiveSubstitutionIng(ingName || '');
    setIsSubstitutionModalOpen(true);
  };

  const currentRecipeName = currentRecipe
    ? currentRecipe.recipe_name || (currentRecipe as any).dishName
    : '';

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1F2421] flex flex-col font-sans">
      {/* Top Header with Brand & AI Cooking Assistant Toggle */}
      <Header
        onResetHome={() => {
          setCurrentRecipe(null);
          setActiveFilterLabel('Andhra Pradesh');
          fetchDishes({ region: 'Andhra Pradesh', dietary: currentDietary });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Main Recipe Search Interface (Requirements 2 & 3) */}
      <HeroSearch
        onSearch={(query) => handleGenerateRecipe(query)}
        currentDietary={currentDietary}
        onDietaryChange={handleDietaryChange}
        isLoading={isRecipeLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Loading Overlay for Recipe Generation */}
        {isRecipeLoading && (
          <div className="py-20 text-center max-w-lg mx-auto px-4 animate-fadeIn">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-[#CDE0D5] border-t-[#1E3A2F] animate-spin" />
              <div className="absolute inset-3 rounded-full bg-[#EBF3EF] flex items-center justify-center text-[#1E3A2F]">
                <ChefHat className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1F2421] mb-2">
              Generating Authentic Recipe...
            </h3>
            <p className="text-sm text-[#5C665F] leading-relaxed">
              Gemini AI is structuring exact measurements, regional spices, cookware, and step-by-step cooking instructions for{' '}
              <span className="font-bold text-[#1E3A2F]">
                "{recipeLoadingDishName || 'your requested dish'}"
              </span>
              .
            </p>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start justify-between gap-3 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-100 flex-shrink-0"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* View 1: Generated Recipe Detail View (Requirement 3 & 6) */}
        {!isRecipeLoading && currentRecipe && (
          <RecipeView
            recipe={currentRecipe}
            onBack={() => setCurrentRecipe(null)}
            onGenerateAnother={handleGenerateAnother}
            onOpenSubstitution={handleOpenSubstitution}
            isGeneratingAnother={isRecipeLoading}
            onOpenAssistantForRecipe={(q) => {
              setIsAssistantOpen(true);
              if (q) handleSendChatMessage(q);
            }}
          />
        )}

        {/* View 2: Popular Regional Inspiration Cards when no recipe is currently open */}
        {!isRecipeLoading && !currentRecipe && (
          <DishGrid
            dishes={dishes}
            isLoading={isDishesLoading}
            selectedLabel={activeFilterLabel}
            onSelectDish={(dish) => handleGenerateRecipe(dish.name, dish.region)}
            onCustomRecipeRequest={(dishName) => handleGenerateRecipe(dishName)}
          />
        )}
      </main>

      {/* Floating Conversational AI Cooking Assistant (Requirement 4) */}
      <AICookingAssistant
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        isLoading={isChatLoading}
        currentRecipe={currentRecipe}
        onSelectRecipe={(r) => {
          setCurrentRecipe(r);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectDish={(d) => handleGenerateRecipe(d.name, d.region)}
        isOpen={isAssistantOpen}
        onToggleOpen={() => setIsAssistantOpen(!isAssistantOpen)}
      />

      {/* AI Ingredient Substitution Modal */}
      <SubstitutionModal
        isOpen={isSubstitutionModalOpen}
        onClose={() => setIsSubstitutionModalOpen(false)}
        defaultIngredient={activeSubstitutionIng}
        dishName={currentRecipeName}
        dietary={currentDietary}
      />

      {/* Culinary Footer in Theme Styling */}
      <footer className="bg-white text-[#5C665F] py-12 border-t border-[#E8ECE9] text-xs sm:text-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E3A2F] flex items-center justify-center text-white shadow-xs">
              <ChefHat className="w-6 h-6 text-[#D1E7DD]" />
            </div>
            <div>
              <p className="font-serif text-base font-bold text-[#1F2421]">
                Global Recipe Generator AI Agent
              </p>
              <p className="text-[#617067] text-xs">
                Authentic global & regional gastronomies • Conversational cooking assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#617067]">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#2D5A43] font-medium">
              <Globe2 className="w-3.5 h-3.5" /> Preserving Regional Culinary Authenticity
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
