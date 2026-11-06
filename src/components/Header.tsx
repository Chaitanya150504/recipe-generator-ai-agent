import React from 'react';
import { ChefHat, Sparkles, MessageSquare, Utensils } from 'lucide-react';

interface HeaderProps {
  onResetHome: () => void;
  onOpenAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetHome,
  onOpenAssistant,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8ECE9] text-[#1F2421] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onResetHome}
          className="flex items-center gap-3 text-left group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1E3A2F] flex items-center justify-center text-white shadow-sm group-hover:bg-[#284E3F] transition-colors">
            <ChefHat className="w-5 h-5 text-[#D1E7DD]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1F2421] group-hover:text-[#2D5A43] transition-colors">
                Global Recipe AI
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#2D5A43] border border-[#CDE0D5]">
                <Sparkles className="w-2.5 h-2.5 text-[#4E7A60]" /> Agent
              </span>
            </div>
            <p className="text-xs text-[#5C665F] flex items-center gap-1 font-medium">
              <Utensils className="w-3 h-3 text-[#4E7A60]" /> Authentic World Recipes
            </p>
          </div>
        </button>

        {/* Action Controls - No Surprise Me, No Cookbook */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#EBF3EF] hover:bg-[#DCEAE3] text-[#1E3A2F] border border-[#CDE0D5] transition-all active:scale-95 shadow-2xs"
          >
            <MessageSquare className="w-4 h-4 text-[#2D5A43]" />
            <span>AI Cooking Assistant</span>
          </button>
        </div>
      </div>
    </header>
  );
};
