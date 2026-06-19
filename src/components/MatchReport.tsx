import React, { useEffect, useState } from 'react';
import { GameMode, PlayerProfile, Difficulty } from '../types';
import { savePlayerScore } from '../dbService';
import { LucideIcon } from './LucideIcon';
import { audio } from '../utils/audio';

interface MatchReportProps {
  score: number;
  correctCount: number;
  totalCount: number;
  category: string;
  gameMode: GameMode;
  difficulty?: Difficulty;
  profile: PlayerProfile;
  onChangeProfile: (updated: PlayerProfile) => void;
  onRestart: () => void;
}

export const MatchReport: React.FC<MatchReportProps> = ({
  score,
  correctCount,
  totalCount,
  category,
  gameMode,
  difficulty = 'normal',
  profile,
  onChangeProfile,
  onRestart,
}) => {
  const [hasSaved, setHasSaved] = useState(false);
  const [levelUpOccurred, setLevelUpOccurred] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    // 1. Calculate XP Gained: 25 XP per correct answer + 100 finishing challenge bonus
    const rawXp = (correctCount * 25) + 100;
    setXpEarned(rawXp);

    let nextExperience = profile.experience + rawXp;
    let nextLevel = profile.level;
    let leveledUp = false;

    // Level formula: 100 XP per level
    while (nextExperience >= nextLevel * 100) {
      nextLevel += 1;
      leveledUp = true;
    }

    if (leveledUp) {
      setLevelUpOccurred(true);
      setTimeout(() => {
        audio.playLevelUp();
      }, 800);
    }

    // Update profile high scores
    const currentHighScore = profile.highScores[gameMode] || 0;
    const isNewHighScore = score > currentHighScore;
    const updatedHighScores = {
      ...profile.highScores,
      [gameMode]: isNewHighScore ? score : currentHighScore
    };

    // Update category statistics
    const currentCategoryStats = profile.categoryStats[category] || { answered: 0, correct: 0 };
    const updatedCategoryStats = {
      ...profile.categoryStats,
      [category]: {
        answered: currentCategoryStats.answered + totalCount,
        correct: currentCategoryStats.correct + correctCount
      }
    };

    const updatedProfile: PlayerProfile = {
      ...profile,
      totalGames: profile.totalGames + 1,
      totalCorrect: profile.totalCorrect + correctCount,
      totalAnswered: profile.totalAnswered + totalCount,
      level: nextLevel,
      experience: nextExperience,
      highScores: updatedHighScores,
      categoryStats: updatedCategoryStats
    };

    onChangeProfile(updatedProfile);

    // 2. Automatically save the player high score to Firestore in the background
    const saveToCloud = async () => {
      try {
        await savePlayerScore({
          username: profile.username,
          score,
          gameMode,
          category,
          correctCount,
          totalAnswered: totalCount,
          timestamp: null // Populated by Firestore serverTimestamp()
        });
        setHasSaved(true);
      } catch (err) {
        console.error('Error auto-syncing score to master leaderboard', err);
      }
    };

    saveToCloud();
  }, [score, correctCount, totalCount, category, gameMode]);

  // Performance reviews
  const correctPercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  
  let evaluationTitle = 'COMPILER SECURED';
  let evaluationDesc = 'Nice effort, Pilot! Take up another category matrix to stack your XP level-up and climb terminal leaderboard indices.';
  let evaluationBadge = '★ NOVICE CODER ★';
  let badgeColor = 'text-cyan-400 bg-indigo-950 border-2 border-indigo-950';

  if (correctPercent >= 90) {
    evaluationTitle = 'INTEGRITY: PERFECT 100%';
    evaluationDesc = 'Spectacular precision! Deep structures parsed successfully with ultimate throughput rates. Terminal high score logged.';
    evaluationBadge = '✦ GRANDMASTER CORE ✦';
    badgeColor = 'text-yellow-400 bg-indigo-950 border-2 border-indigo-950';
  } else if (correctPercent >= 70) {
    evaluationTitle = 'DECISION ACCURACY: HIGH';
    evaluationDesc = 'Outstanding quiz sweep. Speed multipliers and strategic knowledge aligned flawlessly in active execution waves.';
    evaluationBadge = '❈ VETERAN INDEX ❈';
    badgeColor = 'text-pink-500 bg-indigo-950 border-2 border-indigo-950';
  } else if (correctPercent < 50) {
    evaluationTitle = 'LINK CHASSIS FAILURE';
    evaluationDesc = 'A low success sweep. Study question explanations closely and run another system loop to stabilize metrics.';
    evaluationBadge = '⚙ APPRENTICE REBOOT ⚙';
    badgeColor = 'text-red-400 bg-indigo-950 border-2 border-red-500/40';
  }

  return (
    <div className="max-w-xl mx-auto w-full flex flex-col gap-5">
      
      {/* Level-up Celebrations Toast banner */}
      {levelUpOccurred && (
        <div className="bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 p-[3px] rounded-3xl animate-bounce shadow-[6px_6px_0px_rgba(30,27,75,1)] border-4 border-indigo-950">
          <div className="bg-indigo-900 rounded-[20px] p-4 text-center">
            <span className="text-xl">🎉</span>
            <span className="text-sm font-display font-black uppercase text-yellow-300 ml-1">
              PROMOTED TO LEVEL {profile.level}!
            </span>
            <p className="text-[10px] text-indigo-100 mt-1 font-sans font-semibold uppercase">
              Your ranking module upgraded. Synthetic circuits optimized!
            </p>
          </div>
        </div>
      )}

      {/* Main Report Card */}
      <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[6px_6px_0px_rgba(30,27,75,1)] font-sans">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />

        <div className="text-center mb-6">
          <div className="text-[10px] text-indigo-300 font-mono font-black tracking-widest uppercase mb-1">CHALLENGE DISMISSED</div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white leading-tight uppercase">{evaluationTitle}</h2>
          <span className={`inline-block mt-3 px-4 py-1.5 text-[10px] font-mono font-black border rounded-xl tracking-widest uppercase ${badgeColor}`}>
            {evaluationBadge}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-indigo-200 mt-2 font-medium text-center leading-relaxed mb-6 max-w-md mx-auto">
          {evaluationDesc}
        </p>

        {/* Stats Matrix Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          
          <div className="bg-indigo-950 border-3 border-indigo-950 rounded-2xl p-4 text-center shadow-inner">
            <div className="text-[10px] text-indigo-300 font-mono font-black uppercase">CHALLENGE SCORE</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-yellow-300 mt-1 tracking-wider leading-none">
              {score.toLocaleString()}
            </div>
            <div className="text-[8px] text-indigo-400 font-mono font-black uppercase mt-1">XP CALIBRATED</div>
          </div>

          <div className="bg-indigo-950 border-3 border-indigo-950 rounded-2xl p-4 text-center shadow-inner">
            <div className="text-[10px] text-indigo-300 font-mono font-black uppercase">SUCCESS RATE</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-pink-400 mt-1 tracking-wider leading-none">
              {correctPercent}%
            </div>
            <div className="text-[8px] text-indigo-400 font-mono font-black uppercase mt-1">
              {correctCount} OF {totalCount} WAVE
            </div>
          </div>

        </div>

        {/* Secondary Info lines */}
        <div className="bg-indigo-950/80 border-2 border-indigo-950 rounded-2xl p-4 flex flex-col gap-3 text-xs mb-6 font-mono font-bold">
          <div className="flex justify-between">
            <span className="text-indigo-300 uppercase font-bold text-[10px]">GAME MODEL:</span>
            <span className="text-white uppercase text-[10px]">{gameMode.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between border-t border-indigo-900/60 pt-2.5">
            <span className="text-indigo-300 uppercase font-bold text-[10px]">MATRIX SPHERE:</span>
            <span className="text-white truncate max-w-[170px] sm:max-w-none text-[10px]">{category}</span>
          </div>
          <div className="flex justify-between border-t border-indigo-900/60 pt-2.5">
            <span className="text-indigo-300 uppercase font-bold text-[10px]">DIFFICULTY MODE:</span>
            <span className="text-pink-400 font-extrabold uppercase text-[10px]">{difficulty}</span>
          </div>
          <div className="flex justify-between border-t border-indigo-900/60 pt-2.5">
            <span className="text-indigo-300 uppercase font-bold text-[10px]">ACTIVE SIGNATURE:</span>
            <span className="text-yellow-400 text-[10px]">@{profile.username}</span>
          </div>
          <div className="flex justify-between border-t border-indigo-900/60 pt-2.5">
            <span className="text-indigo-300 uppercase font-bold text-[10px]">CALIBRATED INCREMENT:</span>
            <span className="text-emerald-400 text-[10px]">+{xpEarned} XP</span>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="w-full py-3.5 bg-pink-500 hover:bg-pink-400 text-white font-display font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-indigo-950 shadow-[3px_3px_0px_#1e1b4b] cursor-pointer"
          >
            LAUNCH ANOTHER WAVE
          </button>
          
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className={`w-1.5 h-1.5 rounded-full ${hasSaved ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`} />
            <span className="text-[9px] text-indigo-300 font-mono font-black uppercase tracking-wider">
              {hasSaved ? 'Synced cloud-chassis' : 'Securing link... saving metrics'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
