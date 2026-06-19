import React, { useState, useEffect } from 'react';
import { CategoryInfo, GameMode, Difficulty } from '../types';
import { categories } from '../categoriesData';
import { LucideIcon } from './LucideIcon';
import { subscribeToGlobalStats } from '../dbService';
import { audio } from '../utils/audio';

interface CategoryBoardProps {
  onSelectCategory: (categoryName: string, isCustom: boolean) => void;
  selectedCategoryName: string | null;
  gameMode: GameMode;
  onChangeGameMode: (mode: GameMode) => void;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
}

export const CategoryBoard: React.FC<CategoryBoardProps> = ({
  onSelectCategory,
  selectedCategoryName,
  gameMode,
  onChangeGameMode,
  difficulty,
  onChangeDifficulty,
}) => {
  const [customKeyword, setCustomKeyword] = useState('');
  const [dbStats, setDbStats] = useState({ questionsGeneratedCount: 105634, gamesPlayedCount: 3421 });

  // Stream in live global stats from firestore
  useEffect(() => {
    const unsubscribe = subscribeToGlobalStats((stats) => {
      setDbStats(stats);
    });
    return () => unsubscribe();
  }, []);

  const handleCustomCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customKeyword.trim();
    if (cleaned) {
      audio.playCorrect();
      onSelectCategory(cleaned, true);
    }
  };

  const handleSelectPredefined = (name: string) => {
    audio.playClick();
    onSelectCategory(name, false);
  };

  const handleSelectMode = (mode: GameMode) => {
    audio.playClick();
    onChangeGameMode(mode);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Dynamic Global Milestone Ticker */}
      <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-[6px_6px_0px_rgba(30,27,75,1)]">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-pink-500/10 rounded-full filter blur-xl pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-500/10 rounded-full filter blur-xl pointer-events-none" />
        
        <div>
          <h4 className="text-md font-display font-black tracking-wide text-cyan-300 uppercase flex items-center justify-center md:justify-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse inline-block border border-black" />
            LIVE DATABANK STATS
          </h4>
          <p className="text-xs text-indigo-100 font-semibold mt-1">
            Questions are generated in real-time using Google Gemini AI.
          </p>
        </div>
        
        <div className="flex gap-6">
          <div className="text-center md:text-right">
            <div className="text-[10px] text-indigo-200 font-mono font-black tracking-wider">QUESTIONS SYNCED</div>
            <div className="text-2xl font-display font-black text-yellow-300 font-mono tracking-wide mt-1">
              {dbStats.questionsGeneratedCount.toLocaleString()}
            </div>
          </div>
          <div className="text-center md:text-right border-l-3 border-indigo-950 pl-6">
            <div className="text-[10px] text-indigo-200 font-mono font-black tracking-wider">CHALLENGES PLAYED</div>
            <div className="text-2xl font-display font-black text-pink-500 font-mono tracking-wide mt-1">
              {dbStats.gamesPlayedCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-6 shadow-[6px_6px_0px_rgba(30,27,75,1)]">
        <h3 className="text-lg font-display font-black text-white tracking-wide uppercase mb-5 flex items-center gap-2.5">
          <LucideIcon name="Shield" className="text-yellow-400 stroke-[3]" size={20} />
          SELECT PLAY STYLE
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Sprint */}
          <button
            onClick={() => handleSelectMode('sprint')}
            className={`text-left p-5 rounded-2xl border-4 transform transition-all duration-200 relative overflow-hidden group cursor-pointer ${
              gameMode === 'sprint'
                ? 'bg-indigo-950 border-emerald-400 scale-[1.02] shadow-[4px_4px_0px_rgba(16,185,129,0.3)]'
                : 'bg-indigo-950/40 border-indigo-950 hover:bg-indigo-950/80 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl border-2 border-indigo-950 font-bold ${gameMode === 'sprint' ? 'bg-emerald-400 text-black' : 'bg-indigo-900 text-indigo-200'}`}>
                <LucideIcon name="Compass" size={20} />
              </div>
              {gameMode === 'sprint' && (
                <span className="text-[9px] font-mono font-black bg-emerald-400 text-black px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-widest uppercase">Select</span>
              )}
            </div>
            <h4 className={`text-md font-display font-black mt-4 transition-colors ${gameMode === 'sprint' ? 'text-emerald-400' : 'text-white'}`}>Sprint 10-Wave</h4>
            <p className="text-xs text-indigo-100/90 mt-1 leading-relaxed font-sans font-semibold">
              Methodical 10-query classic blitz. Speed adds micro-multipliers.
            </p>
          </button>

          {/* Survival */}
          <button
            onClick={() => handleSelectMode('survival')}
            className={`text-left p-5 rounded-2xl border-4 transform transition-all duration-200 relative overflow-hidden group cursor-pointer ${
              gameMode === 'survival'
                ? 'bg-indigo-950 border-yellow-400 scale-[1.02] shadow-[4px_4px_0px_rgba(234,179,8,0.3)]'
                : 'bg-indigo-950/40 border-indigo-950 hover:bg-indigo-950/80 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl border-2 border-indigo-950 font-bold ${gameMode === 'survival' ? 'bg-yellow-400 text-black' : 'bg-indigo-900 text-indigo-200'}`}>
                <LucideIcon name="Heart" size={20} />
              </div>
              {gameMode === 'survival' && (
                <span className="text-[9px] font-mono font-black bg-yellow-400 text-black px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-widest uppercase">Select</span>
              )}
            </div>
            <h4 className={`text-md font-display font-black mt-4 transition-colors ${gameMode === 'survival' ? 'text-yellow-400' : 'text-white'}`}>Sudden Survival</h4>
            <p className="text-xs text-indigo-100/90 mt-1 leading-relaxed font-sans font-semibold">
              Infinite gauntlet. You have 3 lives. Missing a question deducts a shield. Go long!
            </p>
          </button>

          {/* Time Attack */}
          <button
            onClick={() => handleSelectMode('time_attack')}
            className={`text-left p-5 rounded-2xl border-4 transform transition-all duration-200 relative overflow-hidden group cursor-pointer ${
              gameMode === 'time_attack'
                ? 'bg-indigo-950 border-pink-500 scale-[1.02] shadow-[4px_4px_0px_rgba(236,72,153,0.3)]'
                : 'bg-indigo-950/40 border-indigo-950 hover:bg-indigo-950/80 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl border-2 border-indigo-950 font-bold ${gameMode === 'time_attack' ? 'bg-pink-500 text-white' : 'bg-indigo-900 text-indigo-200'}`}>
                <LucideIcon name="Clock" size={20} />
              </div>
              {gameMode === 'time_attack' && (
                <span className="text-[9px] font-mono font-black bg-pink-500 text-white px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-widest uppercase">Select</span>
              )}
            </div>
            <h4 className={`text-md font-display font-black mt-4 transition-colors ${gameMode === 'time_attack' ? 'text-pink-400' : 'text-white'}`}>Time Frenzy</h4>
            <p className="text-xs text-indigo-100/90 mt-1 leading-relaxed font-sans font-semibold">
              60s clock. Rapid-fire accuracy! Each correct hit adds +3s, misses subtract -5s.
            </p>
          </button>

        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-6 shadow-[6px_6px_0px_rgba(30,27,75,1)] animate-fadeIn">
        <h3 className="text-lg font-display font-black text-white tracking-wide uppercase mb-5 flex items-center gap-2.5">
          <LucideIcon name="ShieldAlert" className="text-pink-500 stroke-[3]" size={20} />
          SELECT CHRONIC DIFFICULTY
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Easy */}
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onChangeDifficulty('easy');
            }}
            className={`text-left p-4 rounded-2xl border-4 transform transition-all duration-150 relative overflow-hidden group cursor-pointer ${
              difficulty === 'easy'
                ? 'bg-indigo-950 border-emerald-400 scale-[1.02] shadow-[3px_3px_0px_rgba(16,185,129,0.3)]'
                : 'bg-indigo-950/40 border-indigo-950 hover:bg-indigo-950/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-widest uppercase ${
                difficulty === 'easy' ? 'bg-emerald-400 text-black border-indigo-950' : 'bg-indigo-900 text-emerald-400 border-indigo-950'
              }`}>
                0.6x XP
              </span>
            </div>
            <h4 className={`text-sm font-display font-black mt-3 transition-colors ${difficulty === 'easy' ? 'text-emerald-400' : 'text-white'}`}>EASY</h4>
            <p className="text-[10px] text-indigo-100 mt-1 leading-snug font-semibold">
              More time, basic topics. Perfect for relaxed training.
            </p>
          </button>

          {/* Normal */}
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onChangeDifficulty('normal');
            }}
            className={`text-left p-4 rounded-2xl border-4 transform transition-all duration-150 relative overflow-hidden group cursor-pointer ${
              difficulty === 'normal'
                ? 'bg-indigo-950 border-yellow-400 scale-[1.02] shadow-[3px_3px_0px_rgba(234,179,8,0.3)]'
                : 'bg-indigo-950/40 border-indigo-950 hover:bg-indigo-950/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-widest uppercase ${
                difficulty === 'normal' ? 'bg-yellow-400 text-black border-indigo-950' : 'bg-indigo-900 text-yellow-400 border-indigo-950'
              }`}>
                1.0x XP
              </span>
            </div>
            <h4 className={`text-sm font-display font-black mt-3 transition-colors ${difficulty === 'normal' ? 'text-yellow-400' : 'text-white'}`}>NORMAL</h4>
            <p className="text-[10px] text-indigo-100 mt-1 leading-snug font-semibold">
              Standard timing & depth. The signature balanced experience.
            </p>
          </button>

          {/* Hard */}
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onChangeDifficulty('hard');
            }}
            className={`text-left p-4 rounded-2xl border-4 transform transition-all duration-150 relative overflow-hidden group cursor-pointer ${
              difficulty === 'hard'
                ? 'bg-indigo-950 border-pink-500 scale-[1.02] shadow-[3px_3px_0px_rgba(236,72,153,0.3)]'
                : 'bg-indigo-950/40 border-indigo-950 hover:bg-indigo-950/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-widest uppercase ${
                difficulty === 'hard' ? 'bg-pink-500 text-white border-indigo-950' : 'bg-indigo-900 text-pink-400'
              }`}>
                1.5x XP
              </span>
            </div>
            <h4 className={`text-sm font-display font-black mt-3 transition-colors ${difficulty === 'hard' ? 'text-pink-400' : 'text-white'}`}>HARD</h4>
            <p className="text-[10px] text-indigo-100 mt-1 leading-snug font-semibold">
              Fast clock, complex details. Calibrated for true experts.
            </p>
          </button>

          {/* Extreme */}
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onChangeDifficulty('extreme');
            }}
            className={`text-left p-4 rounded-2xl border-4 transform transition-all duration-150 relative overflow-hidden group cursor-pointer ${
              difficulty === 'extreme'
                ? 'bg-indigo-950 border-red-500 scale-[1.02] shadow-[3px_3px_0px_rgba(239,68,68,0.3)]'
                : 'bg-indigo-950/40 border-indigo-950 hover:bg-indigo-950/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-widest uppercase ${
                difficulty === 'extreme' ? 'bg-red-500 text-white border-indigo-950' : 'bg-indigo-900 text-red-500'
              }`}>
                2.5x XP
              </span>
            </div>
            <h4 className={`text-sm font-display font-black mt-3 transition-colors ${difficulty === 'extreme' ? 'text-red-400' : 'text-white'}`}>EXTREME</h4>
            <p className="text-[10px] text-indigo-100 mt-1 leading-snug font-semibold">
              7s ticking doom. Absolute master level lore. Flawless sync demanded.
            </p>
          </button>

        </div>
      </div>

      {/* Main Categories Panel */}
      <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-6 shadow-[6px_6px_0px_rgba(30,27,75,1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
          <div>
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
              <LucideIcon name="TrendingUp" className="text-pink-500 stroke-[3]" size={22} />
              CHOOSE FIELD MATRIX
            </h3>
            <p className="text-xs text-indigo-200 font-semibold mt-1">
              Select an editor preset or spin up a user custom theme query below!
            </p>
          </div>
          
          {/* Custom Category input field */}
          <form onSubmit={handleCustomCategorySubmit} className="flex items-center gap-2.5 w-full md:w-80">
            <div className="relative flex-1">
              <input
                type="text"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                placeholder="Topic e.g. Marvel, 90s Grunge..."
                className="w-full bg-indigo-950 border-3 border-indigo-950 placeholder:text-indigo-400/80 text-xs text-indigo-150 rounded-xl px-4 py-2.5 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all pl-9 font-bold font-sans"
              />
              <div className="absolute left-3 top-3.5 text-indigo-400">
                <LucideIcon name="Search" size={13} />
              </div>
            </div>
            <button
              type="submit"
              disabled={!customKeyword.trim()}
              className="py-2.5 px-4 bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white text-xs font-display font-black tracking-wider rounded-xl border-2 border-indigo-950 shadow-[2px_2px_0px_#1e1b4b] cursor-pointer inline-flex items-center gap-1.5 shrink-0"
            >
              <LucideIcon name="Plus" size={13} className="stroke-[3]" />
              <span>SPIN</span>
            </button>
          </form>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const isSelected = selectedCategoryName?.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectPredefined(cat.name)}
                className={`relative overflow-hidden rounded-2xl border-4 p-5 text-left transition-all duration-200 group cursor-pointer ${
                  isSelected
                    ? `bg-indigo-950 border-yellow-400 scale-[1.02] shadow-[4px_4px_0px_rgba(234,179,8,0.25)]`
                    : `bg-indigo-950/40 border-indigo-950 hover:bg-indigo-950/80 hover:-translate-y-1`
                }`}
              >
                {/* Glowing border accent */}
                <div className={`absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r ${cat.colorClass}`} />
                
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${cat.colorClass} text-black border-2 border-indigo-950 font-bold shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]`}>
                    <LucideIcon name={cat.iconName} size={18} />
                  </div>
                  {isSelected && (
                    <span className="text-[8px] font-mono font-black bg-yellow-400 text-black px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-wide uppercase">Active</span>
                  )}
                </div>

                <h4 className="text-md font-display font-black text-white mt-4 tracking-tight leading-tighter">
                  {cat.name}
                </h4>
                <p className="text-xs text-indigo-200 font-medium mt-1 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-[10px] text-indigo-300 font-mono font-bold tracking-wider pt-2 border-t border-indigo-900/40">
                  <span>UNLIMITED INDEX</span>
                  <span className="text-yellow-400 group-hover:text-yellow-300 transition-colors flex items-center gap-0.5 uppercase">
                    Launch
                    <LucideIcon name="ChevronRight" size={11} className="stroke-[2.5]" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom topic selection indicator */}
        {selectedCategoryName && !categories.some(c => c.name.toLowerCase() === selectedCategoryName.toLowerCase()) && (
          <div className="mt-5 p-4 rounded-xl border-3 border-dashed border-pink-500/50 bg-indigo-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-pink-500 text-white border-2 border-indigo-950 shadow-[2px_2px_0px_#1e1b4b]">
                <LucideIcon name="Sparkles" className="animate-spin text-white" size={18} />
              </div>
              <div>
                <div className="text-[10px] text-pink-400 font-mono font-black tracking-widest leading-none">ACTIVE USER SPECTRUM</div>
                <div className="text-white font-display font-black text-md mt-1">“{selectedCategoryName}”</div>
              </div>
            </div>
            <div className="text-[10px] text-[#b3b3b3] font-sans font-semibold max-w-sm hidden md:block">
              AI engines are synthesizing non-repeating custom items mapping specifically to this criteria.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
