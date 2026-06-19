/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PlayerProfile, GameMode, LeaderboardEntry, Difficulty } from './types';
import { ProfileWidget } from './components/ProfileWidget';
import { CategoryBoard } from './components/CategoryBoard';
import { LeaderboardBoard } from './components/LeaderboardBoard';
import { GameSessionConsole } from './components/GameSessionConsole';
import { MatchReport } from './components/MatchReport';
import { LucideIcon } from './components/LucideIcon';
import { audio } from './utils/audio';

export default function App() {
  // Sync profile state with local storage
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const stored = localStorage.getItem('trivia_player_profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    
    // Default fallback initial profile
    const num = Math.floor(100 + Math.random() * 900);
    return {
      username: `PixelPilot${num}`,
      userId: `user_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      totalGames: 0,
      highScores: { sprint: 0, survival: 0, time_attack: 0 },
      totalCorrect: 0,
      totalAnswered: 0,
      level: 1,
      experience: 25,
      categoryStats: {}
    };
  });

  // Track state changes to preserve profile
  useEffect(() => {
    localStorage.setItem('trivia_player_profile', JSON.stringify(profile));
  }, [profile]);

  // Gameplay configuration states
  const [selectedCategory, setSelectedCategory] = useState<string>('General Knowledge');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('sprint');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard'>('play'); // for mobile toggle

  // Session state controller
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'completed'>('idle');
  
  // Scoring storage for report phase
  const [reportData, setReportData] = useState({
    score: 0,
    correctCount: 0,
    totalCount: 0
  });

  const handleSelectCategory = (catName: string, isCustom: boolean) => {
    setSelectedCategory(catName);
    setIsCustomCategory(isCustom);
  };

  const handleStartGame = () => {
    audio.playLevelUp(); // Vintage arcade startup synth chime
    setGameState('playing');
  };

  const handleGameComplete = (_history: any, finalScore: number, correctCount: number) => {
    // Sprint has 10, survival and frenzy can take variable answers based on correct hits
    const totalCount = gameMode === 'sprint' ? 10 : correctCount + (gameMode === 'survival' ? 3 : 2); // approximate total based on loss
    setReportData({
      score: finalScore,
      correctCount,
      totalCount: Math.max(correctCount, totalCount)
    });
    setGameState('completed');
  };

  const handleRestart = () => {
    setGameState('idle');
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-white selection:bg-yellow-400 selection:text-black font-sans pb-12">
      
      {/* Vibrant ambient background lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-[13%] right-[10%] w-[600px] h-[600px] bg-yellow-500/10 rounded-full filter blur-[120px]" />
        <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full filter blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6 min-h-screen">
        
        {/* Header Navigation Area - Vibrant Theme Style */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-5 bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-5 sm:px-8 shadow-[6px_6px_0px_rgba(30,27,75,1)]">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {/* Fun cartoon logo block */}
              <div className="relative w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center border-4 border-indigo-950 text-black rotate-6 font-display font-black text-2xl shadow-[3px_3px_0px_#1e1b4b] animate-float select-none">
                ?
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3.5xl font-display font-black tracking-tight italic uppercase text-yellow-400 leading-none">
                TRIVIA<span className="text-pink-500">BLASTER</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-cyan-300 font-mono font-bold tracking-widest mt-1 uppercase">
                ⚡ INFINITE AI SPECTRUM QUIZ CORE
              </p>
            </div>
            
            <div className="hidden sm:inline-block bg-indigo-800 border-2 border-indigo-950 text-[10px] font-mono font-bold text-white px-3 py-1 rounded-full uppercase tracking-wider shadow">
              ONLINE
            </div>
          </div>

          {/* Mobile Display Mode Tabs */}
          <div className="flex sm:hidden bg-indigo-950/80 rounded-2xl p-1 border-2 border-indigo-900/60 w-full justify-between">
            <button
              onClick={() => { audio.playClick(); setActiveTab('play'); }}
              className={`flex-1 text-center py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                activeTab === 'play' ? 'bg-pink-500 text-white font-extrabold shadow-sm' : 'text-indigo-200'
              }`}
            >
              PLAY STAGE
            </button>
            <button
              onClick={() => { audio.playClick(); setActiveTab('leaderboard'); }}
              className={`flex-1 text-center py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                activeTab === 'leaderboard' ? 'bg-pink-500 text-white font-extrabold shadow-sm' : 'text-indigo-200'
              }`}
            >
              LEADERBOARD
            </button>
          </div>
          
          <div className="hidden sm:flex items-center gap-3 text-xs text-yellow-100 font-mono bg-indigo-950 border-2 border-indigo-950 px-4 py-2 rounded-2xl shadow-inner uppercase font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping inline-block" />
            <span>AI ENGINE ACTIVE</span>
          </div>
        </header>

        {/* Inner Adaptive Bento Workspace layout Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
          
          {/* LEFT/MID MAIN gameplay workspace columns (2/3 width) */}
          <div className={`col-span-1 lg:col-span-2 flex flex-col gap-6 ${activeTab === 'play' ? 'block' : 'hidden sm:block'}`}>
            
            {gameState === 'idle' && (
              <div className="flex flex-col gap-6">
                {/* Profile module */}
                <ProfileWidget profile={profile} onChangeProfile={setProfile} />
                
                {/* Board grid picker */}
                <CategoryBoard
                  onSelectCategory={handleSelectCategory}
                  selectedCategoryName={selectedCategory}
                  gameMode={gameMode}
                  onChangeGameMode={setGameMode}
                  difficulty={difficulty}
                  onChangeDifficulty={setDifficulty}
                />

                {/* Confirm deployment trigger action */}
                <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 mt-2 shadow-[6px_6px_0px_rgba(30,27,75,1)]">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-pink-500 text-yellow-300 border-3 border-indigo-950 rounded-2xl shadow-[2px_2px_0px_#1e1b4b] rotate-[-2deg]">
                      <LucideIcon name="Play" size={20} className="animate-pulse text-yellow-300 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-md font-display font-black tracking-tight text-yellow-400 uppercase">LAUNCH TRIVIA WAVE</h4>
                      <p className="text-xs text-indigo-100 mt-1 font-semibold">
                        Ready to play: <span className="text-yellow-300 font-extrabold underline decoration-pink-500 underline-offset-2">“{selectedCategory}”</span> in <span className="text-pink-400 font-extrabold uppercase">{gameMode.replace('_', ' ')}</span> mode.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartGame}
                    className="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-display font-black text-sm uppercase tracking-wider rounded-2xl border-4 border-indigo-950 shadow-[4px_4px_0px_#1e1b4b] hover:shadow-[2px_2px_0px_#1e1b4b] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer shrink-0"
                  >
                    START BATTLE!
                  </button>
                </div>
              </div>
            )}

            {gameState === 'playing' && (
              <GameSessionConsole
                category={selectedCategory}
                isCustomCategory={isCustomCategory}
                gameMode={gameMode}
                difficulty={difficulty}
                onGameComplete={handleGameComplete}
                onExit={handleRestart}
              />
            )}

            {gameState === 'completed' && (
              <MatchReport
                score={reportData.score}
                correctCount={reportData.correctCount}
                totalCount={reportData.totalCount}
                category={selectedCategory}
                gameMode={gameMode}
                difficulty={difficulty}
                profile={profile}
                onChangeProfile={setProfile}
                onRestart={handleRestart}
              />
            )}

          </div>

          {/* RIGHT SIDEBAR COLUMN: High-Fidelity Sync Global Leaderboard (1/3 width) */}
          <div className={`col-span-1 ${activeTab === 'leaderboard' ? 'block' : 'hidden sm:block lg:block'}`}>
            <LeaderboardBoard />
          </div>

        </main>

        {/* Footer Area */}
        <footer className="mt-auto border-t border-[#1e293b]/40 pt-4 pb-2 text-center text-[10px] text-slate-500 font-mono uppercase flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>INFINITE ARCADE TRIVIA © 2026</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <LucideIcon name="Shield" size={10} className="text-cyan-400" />
              SECURE FIREBASE AUTH
            </span>
            <span className="flex items-center gap-1">
              <LucideIcon name="Cpu" size={10} className="text-indigo-400" />
              GEMINI SYNTHESIS ENGINES
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
}
