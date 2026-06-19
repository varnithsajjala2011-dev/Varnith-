import React, { useState, useEffect, useRef } from 'react';
import { Question, GameMode, GameSession, Difficulty } from '../types';
import { LucideIcon } from './LucideIcon';
import { audio } from '../utils/audio';

interface GameSessionConsoleProps {
  category: string;
  isCustomCategory: boolean;
  gameMode: GameMode;
  difficulty: Difficulty;
  onGameComplete: (history: any, finalScore: number, correctCount: number) => void;
  onExit: () => void;
}

export const GameSessionConsole: React.FC<GameSessionConsoleProps> = ({
  category,
  isCustomCategory,
  gameMode,
  difficulty,
  onGameComplete,
  onExit,
}) => {
  // Game session states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  
  // Game stats
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3); // for survival
  
  // Timers
  const [timer, setTimer] = useState(() => {
    switch (difficulty) {
      case 'easy': return gameMode === 'survival' ? 30 : 25;
      case 'normal': return gameMode === 'survival' ? 20 : 15;
      case 'hard': return gameMode === 'survival' ? 12 : 10;
      case 'extreme': return gameMode === 'survival' ? 8 : 7;
      default: return gameMode === 'survival' ? 20 : 15;
    }
  });
  const [attackGlobalTimer, setAttackGlobalTimer] = useState(60); // global Time Attack clock
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingNextBatch, setIsGeneratingNextBatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Time tracker for speed bonus calculation
  const questionStartTime = useRef<number>(Date.now());
  const intervalId = useRef<any>(null);

  // Load initial batch of questions from custom server API
  const fetchQuestions = async (isAppending = false) => {
    if (!isAppending) {
      setIsLoading(true);
    } else {
      setIsGeneratingNextBatch(true);
    }
    
    setErrorMessage(null);
    try {
      // Determine count: 10 for Sprint, 5 per dynamic batch for Survival/Time attack
      const countToFetch = gameMode === 'sprint' ? 10 : 5;
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          difficulty: difficulty, // Real selected difficulty passed dynamically to server prompt
          count: countToFetch,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status code: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data.message || 'No questions parsed from response.');
      }

      if (isAppending) {
        setQuestions((prev) => [...prev, ...data.questions]);
      } else {
        setQuestions(data.questions);
        setSelectedOption(null);
        setIsAnswerRevealed(false);
        setCurrentIndex(0);
        questionStartTime.current = Date.now();
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Check your internet connection or try again.');
    } finally {
      setIsLoading(false);
      setIsGeneratingNextBatch(false);
    }
  };

  // Start procedural retro backdrop music loop when entering match console, cleanup on exit
  useEffect(() => {
    audio.startBgMusic();
    return () => {
      audio.stopBgMusic();
    };
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [category, gameMode]);

  // Timers thread logic
  useEffect(() => {
    if (isLoading || questions.length === 0 || isAnswerRevealed || errorMessage) return;

    // Tick interval
    intervalId.current = setInterval(() => {
      if (gameMode === 'time_attack') {
        // Global count ticking down
        setAttackGlobalTimer((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      } else {
        // Local per-question countdown
        setTimer((prev) => {
          if (prev <= 1) {
            handleAnswerSelect(-1); // Automatically trigger wrong/timeout answer
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [isLoading, questions, currentIndex, isAnswerRevealed, gameMode, errorMessage]);

  // Handle sudden game termination
  const handleGameOver = () => {
    if (intervalId.current) clearInterval(intervalId.current);
    audio.playGameOver();
    onGameComplete([], score, correctCount);
  };

  // Select option workflow
  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswerRevealed) return; // Answer locked
    if (intervalId.current) clearInterval(intervalId.current);

    setSelectedOption(optionIndex);
    setIsAnswerRevealed(true);

    const activeQuestion = questions[currentIndex];
    const isCorrect = optionIndex === activeQuestion.correctAnswerIndex;

    const timeTakenSeconds = (Date.now() - questionStartTime.current) / 1000;

    let pointsEarned = 0;

    if (isCorrect) {
      audio.playCorrect();
      setCorrectCount((prev) => prev + 1);
      
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Streak multiplier: 1x, 1.5x, 2x, 3x
      let multiplier = 1.0;
      if (newStreak >= 8) multiplier = 3.0;
      else if (newStreak >= 5) multiplier = 2.0;
      else if (newStreak >= 3) multiplier = 1.5;

      // Base difficulty multipliers
      let difficultyFactor = 1.0;
      if (difficulty === 'easy') difficultyFactor = 0.6;
      else if (difficulty === 'normal') difficultyFactor = 1.0;
      else if (difficulty === 'hard') difficultyFactor = 1.5;
      else if (difficulty === 'extreme') difficultyFactor = 2.5;
      
      // Speed bonus: max +500 points for answering instantly, ramped down to 0
      const limitSeconds = difficulty === 'easy' ? 25 : difficulty === 'normal' ? 15 : difficulty === 'hard' ? 10 : 7;
      const speedBonus = Math.max(0, Math.floor((limitSeconds - timeTakenSeconds) * (500 / limitSeconds)));

      pointsEarned = Math.round((1000 + speedBonus) * difficultyFactor * multiplier);
      setScore((prev) => prev + pointsEarned);

      // Time attack gives bonus seconds depending on difficulty
      if (gameMode === 'time_attack') {
        const bonusSec = difficulty === 'easy' ? 5 : difficulty === 'normal' ? 3 : difficulty === 'hard' ? 2 : 1;
        setAttackGlobalTimer((prev) => Math.min(prev + bonusSec, 99)); // Max 99 seconds
      }
    } else {
      audio.playWrong();
      setStreak(0); // broken

      // Survival subtracts heart
      if (gameMode === 'survival') {
        setLives((prev) => {
          const nextLives = prev - 1;
          if (nextLives <= 0) {
            // Heart-beat delay to let player view the correct answer block before finishing
            setTimeout(() => {
              handleGameOver();
            }, 3000);
          }
          return nextLives;
        });
      }

      // Time Attack deducts time penalty depending on difficulty
      if (gameMode === 'time_attack') {
        const penaltySec = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 5 : difficulty === 'hard' ? 6 : 8;
        setAttackGlobalTimer((prev) => Math.max(prev - penaltySec, 0));
      }
    }
  };

  // Next Question workflow
  const handleNextQuestion = () => {
    audio.playClick();
    
    // Check if game is completed for Sprint Mode (10 questions limit)
    if (gameMode === 'sprint' && currentIndex >= 9) {
      if (intervalId.current) clearInterval(intervalId.current);
      onGameComplete([], score, correctCount);
      return;
    }

    // Prepare next step
    const nextIndex = currentIndex + 1;
    
    // For non-sprint modes, let's load or append questions infinitely as we approach the end
    if (gameMode !== 'sprint' && nextIndex >= questions.length - 2 && !isGeneratingNextBatch) {
      fetchQuestions(true); // append more questions recursively in background!
    }

    setCurrentIndex(nextIndex);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    
    // Reset individual timers
    setTimer(() => {
      switch (difficulty) {
        case 'easy': return gameMode === 'survival' ? 30 : 25;
        case 'normal': return gameMode === 'survival' ? 20 : 15;
        case 'hard': return gameMode === 'survival' ? 12 : 10;
        case 'extreme': return gameMode === 'survival' ? 8 : 7;
        default: return gameMode === 'survival' ? 20 : 15;
      }
    });
    questionStartTime.current = Date.now();
  };

  // Scoring/Stat displays
  const activeQuestion = questions[currentIndex];
  const totalLimit = gameMode === 'sprint' ? 10 : questions.length;
  const progressPercent = Math.min(((currentIndex) / totalLimit) * 100, 100);

  // Multiplier metadata
  let currentMultiplier = '1.0x';
  if (streak >= 8) currentMultiplier = '3.0x 🔥';
  else if (streak >= 5) currentMultiplier = '2.0x ⚡';
  else if (streak >= 3) currentMultiplier = '1.5x ★';

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">
      
      {/* Game Stage Top Info Bar */}
      <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono shadow-[4px_4px_0px_#1e1b4b]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audio.playClick();
              onExit();
            }}
            className="text-indigo-200 hover:text-white transition-colors p-2 flex items-center justify-center rounded-xl bg-indigo-950 border-2 border-indigo-950 cursor-pointer"
            title="Exit game"
          >
            <LucideIcon name="ChevronLeft" size={18} className="stroke-[3]" />
          </button>
          
          <div>
            <span className="text-[9px] font-mono font-black text-black bg-yellow-400 px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-widest uppercase">
              {gameMode === 'sprint' ? '10-Sprint' : gameMode === 'survival' ? 'Survival' : 'Frenzy'}
            </span>
            <div className="text-xs text-white font-extrabold mt-1 truncate max-w-[150px] sm:max-w-none">
              {category}
            </div>
          </div>
        </div>

        {/* Dynamic Timers display / Multiplier Metres */}
        <div className="flex items-center gap-4">
          
          {/* Heart container for survival game */}
          {gameMode === 'survival' && (
            <div className="flex items-center gap-1 bg-indigo-950 border-2 border-indigo-950 rounded-2xl px-2.5 py-1.5 shadow-inner">
              {[1, 2, 3].map((heartIdx) => (
                <span 
                  key={heartIdx} 
                  className={`text-sm ${heartIdx <= lives ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}
                >
                  {heartIdx <= lives ? '❤️' : '💀'}
                </span>
              ))}
            </div>
          )}

          {/* Clock timer */}
          <div className="flex items-center gap-2 bg-indigo-950 border-2 border-indigo-950 rounded-2xl px-3 py-1.5 min-w-[80px] justify-center shadow-inner">
            <LucideIcon 
              name="Clock" 
              className={
                gameMode === 'time_attack' 
                  ? attackGlobalTimer < 15 ? 'text-red-400 animate-pulse' : 'text-pink-400'
                  : timer < 6 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
              } 
              size={14} 
            />
            <span className={`text-md font-mono font-black ${
              gameMode === 'time_attack'
                ? attackGlobalTimer < 15 ? 'text-red-400' : 'text-pink-400'
                : timer < 6 ? 'text-red-400' : 'text-cyan-400'
            }`}>
              {gameMode === 'time_attack' ? `${attackGlobalTimer}s` : `${timer}s`}
            </span>
          </div>

          <div className="text-right">
            <div className="text-[9px] text-indigo-300 font-mono font-bold tracking-wider">SCORE CHASSIS</div>
            <div className="text-lg font-mono font-black text-yellow-300 leading-none">
              {score.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Loading or Gameplay Area */}
      {isLoading ? (
        <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-16 flex flex-col items-center justify-center gap-4 text-center min-h-[350px] shadow-[6px_6px_0px_rgba(30,27,75,1)]">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-pink-500 blur opacity-60 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full border-4 border-t-pink-500 border-r-pink-500 border-b-transparent border-l-transparent animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-display font-black text-white mt-4 uppercase">SYNTHESIZING QUESTIONS...</h3>
            <p className="text-xs text-indigo-250 font-semibold mt-1 max-w-sm mx-auto">
              Google Gemini is modeling a completely non-repeating custom trivia set calibrated directly to your spectrum inputs.
            </p>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 text-center shadow-[6px_6px_0px_rgba(30,27,75,1)]">
          <div className="p-4 bg-red-500/20 rounded-2xl text-red-400 border border-red-500/30">
            <LucideIcon name="XCircle" size={40} />
          </div>
          <div>
            <h3 className="text-lg font-display font-black text-white">DATALINK SYNC FELL OUT</h3>
            <p className="text-xs text-indigo-200 mt-2 max-w-xs mx-auto font-sans">
              Could not launch dynamic AI trivia questions. Error trace: {errorMessage}
            </p>
          </div>
          <button
            onClick={() => fetchQuestions()}
            className="mt-4 px-6 py-2.5 bg-pink-500 hover:bg-pink-400 text-white text-xs font-display font-black uppercase rounded-2xl border-2 border-indigo-950 shadow-[2px_2px_0px_#1e1b4b] cursor-pointer"
          >
            Retry Connection Sync
          </button>
        </div>
      ) : activeQuestion ? (
        <div className="flex flex-col gap-4">
          
          {/* Progress Indicators */}
          {gameMode === 'sprint' && (
            <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden p-[1px] border-2 border-indigo-950">
              <div 
                className="bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Question Card Display */}
          <div className="bg-indigo-900 border-4 border-indigo-950 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[6px_6px_0px_rgba(30,27,75,1)]">
            {/* Ambient glows and tags */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-500/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 text-xs font-mono text-indigo-200 border-b-2 border-indigo-950 pb-3.5 font-bold">
              <span>WAVE {currentIndex + 1} {gameMode === 'sprint' && `OF 10`}</span>
              <div className="flex items-center gap-2">
                {streak >= 3 && (
                  <span className="text-yellow-300 font-black bg-indigo-950 px-2 py-0.5 rounded-lg border-2 border-indigo-950 tracking-wider">
                    STREAK: {streak} {currentMultiplier}
                  </span>
                )}
                <span className="text-cyan-400 font-extrabold bg-indigo-950 px-2 py-0.5 rounded-lg border-2 border-indigo-950">
                  {activeQuestion.difficulty.toUpperCase()}
                </span>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-display font-bold text-white leading-relaxed mb-6 uppercase">
              {activeQuestion.questionText}
            </h2>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 gap-3.5">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === activeQuestion.correctAnswerIndex;
                
                // Color mapping states
                let optionStyleClass = 'bg-indigo-950/40 border-indigo-950 text-slate-100 hover:border-pink-500 hover:bg-indigo-950 shadow-[3px_3px_0px_#1e1b4b] cursor-pointer';
                
                if (isAnswerRevealed) {
                  if (isCorrectOption) {
                    // Correct one lights up green
                    optionStyleClass = 'bg-emerald-400 border-indigo-950 text-black font-extrabold shadow-[2px_2px_0px_#1e1b4b]';
                  } else if (isSelected) {
                    // Selected wrong one lights up red
                    optionStyleClass = 'bg-red-500 border-indigo-950 text-white font-extrabold shadow-[2px_2px_0px_#1e1b4b]';
                  } else {
                    // Non-involved options fade out
                    optionStyleClass = 'bg-indigo-950/20 border-indigo-950/55 text-indigo-300 opacity-60 cursor-not-allowed';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerRevealed}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`p-4 rounded-2xl border-3 text-left text-sm sm:text-base transition-all duration-100 flex items-center justify-between group active:scale-[0.99] active:translate-y-[2px] ${optionStyleClass}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs border-2 border-indigo-950 shrink-0 ${
                        isSelected 
                          ? isAnswerRevealed && isCorrectOption 
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-indigo-900 text-yellow-300 group-hover:bg-yellow-400 group-hover:text-black'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="leading-snug font-semibold">{option}</span>
                    </div>

                    {/* Quick validation icons */}
                    {isAnswerRevealed && isCorrectOption && (
                      <LucideIcon name="CheckCircle" className="text-black shrink-0 stroke-[3.5]" size={18} />
                    )}
                    {isAnswerRevealed && isSelected && !isCorrectOption && (
                      <LucideIcon name="XCircle" className="text-white shrink-0 stroke-[3.5]" size={18} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedbacks Panel (Explanations & Fun Facts) */}
            {isAnswerRevealed && (
              <div className="mt-6 border-t-3 border-indigo-950 pt-5 flex flex-col gap-4 animate-fadeIn">
                
                {/* Result Message Banner */}
                <div className={`flex items-start gap-2.5 p-3.5 rounded-2xl border-3 ${
                  selectedOption === activeQuestion.correctAnswerIndex 
                    ? 'bg-emerald-400 border-indigo-950 text-black' 
                    : 'bg-red-500 border-indigo-950 text-white'
                }`}>
                  <div className="mt-0.5">
                    {selectedOption === activeQuestion.correctAnswerIndex ? (
                      <LucideIcon name="CheckCircle" size={16} className="stroke-[3]" />
                    ) : (
                      <LucideIcon name="XCircle" size={16} className="stroke-[3]" />
                    )
                    }
                  </div>
                  <div>
                    <h5 className="font-mono font-black text-xs uppercase tracking-wider">
                      {selectedOption === activeQuestion.correctAnswerIndex ? 'Correct Verification' : 'Simulation Interrupted'}
                    </h5>
                    <p className="text-xs sm:text-xs mt-1 leading-relaxed font-semibold">
                      {activeQuestion.explanation}
                    </p>
                  </div>
                </div>

                {/* Collapsible/Slick Mind-Blow factual drawer */}
                {activeQuestion.funFact && (
                  <div className="bg-indigo-950/60 border-2 border-indigo-950 rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1.5 opacity-10">
                      <LucideIcon name="Plus" size={36} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-black text-yellow-300 tracking-wide uppercase mb-1">
                      <LucideIcon name="Sparkles" size={12} className="animate-pulse" />
                      MIND-BLOWING FACTUAL RECORD
                    </div>
                    <p className="text-indigo-100 text-[11px] sm:text-xs leading-relaxed italic font-medium">
                      “{activeQuestion.funFact}”
                    </p>
                  </div>
                )}

                {/* Continue panel actions */}
                <div className="flex items-center justify-end mt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-display font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl border-2 border-indigo-950 shadow-[3px_3px_0px_#1e1b4b] cursor-pointer flex items-center gap-2 group transform active:translate-y-[2px]"
                  >
                    <span>
                      {gameMode === 'sprint' && currentIndex >= 9 ? 'PROCESS MATCH' : 'COMPILE NEXT'}
                    </span>
                    <LucideIcon name="ChevronRight" size={16} className="group-hover:translate-x-1 transition-transform stroke-[3]" />
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Subtext warning when loading appended queries for survival */}
          {isGeneratingNextBatch && (
            <div className="text-center text-[10px] text-yellow-300 font-mono font-bold animate-pulse uppercase">
              Caching more infinite questions in memory matrix ...
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
};
