import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ChefHat,
  Bot,
  User,
  ArrowRight,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { ChatMessage, RecipeData, DishPreview } from '../types';

interface AICookingAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  currentRecipe: RecipeData | null;
  onSelectRecipe: (recipe: RecipeData) => void;
  onSelectDish: (dish: DishPreview) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const AICookingAssistant: React.FC<AICookingAssistantProps> = ({
  messages,
  onSendMessage,
  isLoading,
  currentRecipe,
  onSelectRecipe,
  onSelectDish,
  isOpen,
  onToggleOpen,
}) => {
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const text = input.trim();
      setInput('');
      onSendMessage(text);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    if (!isLoading) {
      onSendMessage(promptText);
    }
  };

  // Explicitly include required follow-up prompts from user instructions
  const quickSuggestions = currentRecipe
    ? [
        'Make this recipe for 5 people',
        'Can I prepare this without onions?',
        'What can I use instead of tamarind?',
        'Explain step 3 in more detail',
        'What side dishes pair best with this?',
      ]
    : [
        'Show me Andhra recipes',
        'Gongura Pachadi recipe',
        'Authentic Japanese Ramen',
        'Traditional dishes from Telangana',
        'Pesarattu recipe',
      ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed bottom-6 right-6 z-40 bg-[#1E3A2F] hover:bg-[#284E3F] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-sm tracking-wide transition-all transform hover:scale-105 active:scale-95 border-2 border-white/60 ring-4 ring-[#D1E7DD]/50 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 text-[#D1E7DD] flex items-center justify-center">
          <ChefHat className="w-4 h-4" />
        </div>
        <span>AI Cooking Assistant</span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#A8C7B5] animate-pulse" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-white border-2 border-[#D9E2DC] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isMinimized
          ? 'w-80 h-16'
          : 'w-[95vw] sm:w-[440px] md:w-[480px] h-[85vh] max-h-[680px]'
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-[#1E3A2F] text-white flex items-center justify-between border-b border-[#284E3F]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 text-[#D1E7DD] flex items-center justify-center font-bold shadow-xs">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                AI Cooking Assistant
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-[#D1E7DD] border border-white/30">
                Interactive
              </span>
            </div>
            <p className="text-[11px] text-[#CDE0D5] flex items-center gap-1">
              {currentRecipe ? (
                <>
                  Focus:{' '}
                  <span className="text-white font-semibold truncate max-w-[170px]">
                    {currentRecipe.recipe_name}
                  </span>
                </>
              ) : (
                'Ask about dishes, portions, or substitutions'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-[#CDE0D5] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-[#CDE0D5] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Container in Warm Cream */}
          <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FBF9F4] scrollbar-thin"
          >
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-[#1E3A2F] text-white'
                        : 'bg-[#EBF3EF] text-[#2D5A43] border border-[#CDE0D5]'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#1E3A2F] text-white font-medium rounded-tr-xs'
                        : 'bg-white text-[#1F2421] border border-[#D9E2DC] rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Clarification Options */}
                    {m.clarification_options && m.clarification_options.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#E8ECE9] flex flex-wrap gap-1.5">
                        {m.clarification_options.map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleQuickPrompt(opt)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-[#EBF3EF] hover:bg-[#DCEAE3] text-[#1E3A2F] border border-[#CDE0D5] transition-colors text-left cursor-pointer"
                          >
                            👉 {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Embedded Recipe Suggestion Card */}
                    {m.recipe && (
                      <div className="mt-3.5 pt-3 border-t border-[#E8ECE9] bg-[#F4F9F6] rounded-xl p-3 border border-[#D1E7DD]">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#2D5A43] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#4E7A60]" /> Updated Recipe
                          </span>
                          <span className="text-[11px] text-[#617067] font-semibold">
                            {m.recipe.servings} Servings
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-[#1F2421] text-sm">
                          {m.recipe.recipe_name}
                        </h4>
                        <p className="text-[11px] text-[#5C665F] line-clamp-2 mt-0.5">
                          {m.recipe.description}
                        </p>
                        <button
                          type="button"
                          onClick={() => onSelectRecipe(m.recipe!)}
                          className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-[#1E3A2F] hover:bg-[#284E3F] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Open Full Recipe</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Embedded Dish List Suggestions */}
                    {m.dishes && m.dishes.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-[#E8ECE9] space-y-2">
                        <div className="text-[11px] uppercase font-bold tracking-wider text-[#2D5A43]">
                          Recommended Dishes:
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {m.dishes.map((dish, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => onSelectDish(dish)}
                              className="text-left p-2.5 rounded-xl bg-white hover:bg-[#EBF3EF] border border-[#D9E2DC] hover:border-[#4E7A60] transition-all flex items-center justify-between gap-2 group cursor-pointer"
                            >
                              <div>
                                <div className="font-bold text-[#1F2421] text-xs group-hover:text-[#1E3A2F]">
                                  {dish.name}
                                </div>
                                <div className="text-[10px] text-[#617067]">
                                  {dish.region} • {dish.spiceLevel}
                                </div>
                              </div>
                              <span className="text-[11px] text-[#2D5A43] font-semibold flex items-center gap-1">
                                Cook <ArrowRight className="w-3 h-3" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-[#617067] text-xs">
                <div className="w-7 h-7 rounded-lg bg-[#EBF3EF] text-[#2D5A43] border border-[#CDE0D5] flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white rounded-2xl p-3 text-[#1F2421] border border-[#D9E2DC] flex items-center gap-2 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#4E7A60] animate-ping" />
                  <span>Chef is preparing guidance for your recipe...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-white border-t border-[#E8ECE9] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickSuggestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(q)}
                className="flex-shrink-0 text-[11px] px-3 py-1 rounded-full bg-[#EBF3EF] hover:bg-[#DCEAE3] text-[#1E3A2F] border border-[#CDE0D5] transition-colors whitespace-nowrap cursor-pointer font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-[#E8ECE9] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                currentRecipe
                  ? `Ask about ${currentRecipe.recipe_name} (e.g. "make for 5", "without onions")...`
                  : 'Ask for recipes, substitutions, or cooking tips...'
              }
              className="flex-1 bg-[#FBF9F4] border border-[#D9E2DC] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1F2421] placeholder-[#8A968F] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#1E3A2F] hover:bg-[#284E3F] text-white disabled:opacity-50 transition-colors font-bold shadow-sm cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
