import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode } from '../types';
import { subscribeToLeaderboard } from '../dbService';
import { LucideIcon } from './LucideIcon';
import { audio } from '../utils/audio';

export const LeaderboardBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameMode>('sprint');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Subscribe to real-time additions to Firestore
    const unsubscribe = subscribeToLeaderboard(activeTab, (data) => {
      // Sort desc order just in case Firestore index is propagating
      const sorted = [...data].sort((a, b) => b.score - a.score);
      setLeaders(sorted);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const changeTab = (tabName: GameMode) => {
    audio.playClick();
    setActiveTab(tabName);
  };

  // Extract top players for podium
  const podium = leaders.slice(0, 3);
  const regularLeaders = leaders.slice(3);

  // Pad the podium with mock/empty elements if needed for nice rendering
  const gold = podium[0];
  const silver = podium[1];
  const bronze = podium[2];

  return (
    <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-6 shadow-[6px_6px_0px_rgba(30,27,75,1)] relative overflow-hidden">
      
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-pink-500/10 to-transparent pointer-events-none" />
      
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-6 border-b-3 border-indigo-950 pb-4">
        <div className="text-center xl:text-left">
          <h3 className="text-xl font-display font-black text-yellow-400 tracking-tight leading-none uppercase">
            LEADERBOARD
          </h3>
          <p className="text-[11px] text-indigo-200 mt-1 font-semibold uppercase">
            🏆 Real-time Terminal Pilots
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-indigo-950 rounded-2xl p-1 border-2 border-indigo-950 shadow-inner">
          <button
            onClick={() => changeTab('sprint')}
            className={`px-3 py-1.5 text-[10px] font-mono font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'sprint' ? 'bg-emerald-400 text-black shadow-sm' : 'text-indigo-200 hover:text-white'
            }`}
          >
            SPRINT
          </button>
          <button
            onClick={() => changeTab('survival')}
            className={`px-3 py-1.5 text-[10px] font-mono font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'survival' ? 'bg-yellow-400 text-black shadow-sm' : 'text-indigo-200 hover:text-white'
            }`}
          >
            SURVIVAL
          </button>
          <button
            onClick={() => changeTab('time_attack')}
            className={`px-3 py-1.5 text-[10px] font-mono font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'time_attack' ? 'bg-pink-500 text-white shadow-sm' : 'text-indigo-200 hover:text-white'
            }`}
          >
            FRENZY
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-t-pink-500 border-r-pink-500 border-b-transparent border-l-transparent animate-spin" />
          <span className="text-xs text-indigo-200 font-mono font-bold uppercase">RETRIEVING SPECTRA...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Top 3 Podium Displays */}
          {podium.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-4 pb-2 items-end max-w-lg mx-auto w-full border-b border-[#1e293b]/50">
              
              {/* 2nd Place: Silver */}
              <div className="flex flex-col items-center">
                <div className="relative group flex flex-col items-center">
                  <div className="absolute -inset-1 rounded-full bg-slate-400/20 blur opacity-70 group-hover:opacity-100 transition" />
                  <div className="relative w-11 h-11 rounded-full bg-[#1e293b] flex items-center justify-center border border-slate-400/40 text-slate-300 font-semibold shadow">
                    {silver ? silver.username.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#000]">
                    2
                  </div>
                </div>
                <div className="text-center mt-2 w-full">
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[80px] mx-auto">
                    {silver ? silver.username : 'Empty Slot'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {silver ? silver.score.toLocaleString() : '---'}
                  </div>
                </div>
                {/* Visual Stand */}
                <div className="w-20 h-10 mt-2 bg-gradient-to-t from-slate-800/80 to-slate-700/80 border border-slate-500/20 rounded-t-lg flex items-center justify-center">
                  <span className="text-[9px] font-mono font-bold text-slate-300">SILVER</span>
                </div>
              </div>

              {/* 1st Place: Gold */}
              <div className="flex flex-col items-center">
                <div className="relative group flex flex-col items-center">
                  <div className="absolute -inset-1.5 rounded-full bg-yellow-500/30 blur opacity-70 group-hover:opacity-100 transition" />
                  {/* Neon Crown Badge */}
                  <div className="absolute -top-4 text-yellow-400 animate-bounce">
                    👑
                  </div>
                  <div className="relative w-14 h-14 rounded-full bg-[#1e2a38] flex items-center justify-center border-2 border-yellow-400 text-yellow-300 font-bold shadow-lg">
                    {gold ? gold.username.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#000]">
                    1
                  </div>
                </div>
                <div className="text-center mt-2 w-full">
                  <div className="text-sm font-bold text-yellow-300 truncate max-w-[90px] mx-auto">
                    {gold ? gold.username : 'Empty Slot'}
                  </div>
                  <div className="text-xs font-mono font-bold text-yellow-400">
                    {gold ? gold.score.toLocaleString() : '---'}
                  </div>
                </div>
                {/* Visual Stand */}
                <div className="w-24 h-14 mt-2 bg-gradient-to-t from-yellow-600/30 via-yellow-500/10 to-transparent border-t border-x border-yellow-500/40 rounded-t-lg flex items-center justify-center">
                  <span className="text-[9px] font-mono font-bold text-yellow-400 tracking-widest">CHAMP</span>
                </div>
              </div>

              {/* 3rd Place: Bronze */}
              <div className="flex flex-col items-center">
                <div className="relative group flex flex-col items-center">
                  <div className="absolute -inset-1 rounded-full bg-amber-700/20 blur opacity-70 group-hover:opacity-100 transition" />
                  <div className="relative w-11 h-11 rounded-full bg-[#1e293b] flex items-center justify-center border border-amber-600/40 text-amber-500 font-semibold shadow">
                    {bronze ? bronze.username.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-600 text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#000]">
                    3
                  </div>
                </div>
                <div className="text-center mt-2 w-full">
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[80px] mx-auto">
                    {bronze ? bronze.username : 'Empty Slot'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {bronze ? bronze.score.toLocaleString() : '---'}
                  </div>
                </div>
                {/* Visual Stand */}
                <div className="w-20 h-8 mt-2 bg-gradient-to-t from-amber-900/60 to-amber-800/40 border border-amber-800/20 rounded-t-lg flex items-center justify-center">
                  <span className="text-[9px] font-mono font-bold text-amber-500">BRONZE</span>
                </div>
              </div>

            </div>
          )}

          {/* Leaderboard List (Rankings 4+) */}
          <div className="max-h-72 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-slate-800">
            {leaders.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                NO MATRIX SCORES RECORDED YET. BE THE FIRST!
              </div>
            ) : (
              (leaders.length <= 3 ? leaders : leaders.slice(3)).map((entry, index) => {
                const actualRank = leaders.length <= 3 ? index + 1 : index + 4;
                return (
                  <div
                    key={entry.id || `${entry.username}_${index}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/60 border-2 border-indigo-950 hover:border-pink-500/50 hover:bg-indigo-950/80 transition-all font-sans"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Index */}
                      <span className="w-5 text-center text-xs font-mono font-black text-indigo-400">
                        #{actualRank}
                      </span>
                      
                      {/* Avatar initial */}
                      <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center border-2 border-indigo-950 font-bold text-xs text-white shadow-sm">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
 
                      {/* Username and category tag */}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {entry.username}
                        </div>
                        <div className="text-[9px] font-mono font-semibold text-indigo-200 truncate max-w-[120px] sm:max-w-none">
                          {entry.category}
                        </div>
                      </div>
                    </div>
 
                    {/* Score detail */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-yellow-300 font-mono">
                        {entry.score.toLocaleString()} pts
                      </div>
                      <div className="text-[8px] font-mono font-bold text-indigo-300">
                        {entry.correctCount}/{entry.totalAnswered} Ans
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
 
          {/* Quick info footer */}
          <div className="text-center pt-3 border-t border-indigo-950">
            <span className="text-[9px] text-[#b3b3b3] font-mono font-bold inline-flex items-center gap-1.5 justify-center uppercase">
              <LucideIcon name="Shield" size={10} className="text-emerald-400" />
              Authenticated & synced live via Firestore Cloud
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
