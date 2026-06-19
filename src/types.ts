export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export interface Question {
  id: string;
  questionText: string;
  category: string;
  options: string[];
  correctAnswerIndex: number; // 0 to 3
  difficulty: Difficulty;
  explanation: string;
  funFact?: string;
  generatedAt?: string; // ISO Date
}

export type GameMode = 'sprint' | 'survival' | 'time_attack';

export interface GameSession {
  id: string;
  mode: GameMode;
  category: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  correctAnswers: number;
  livesRemaining: number; // for survival: starts at 3
  progressPercent: number;
  timeRemaining: number; // in seconds, for time attack and sprint general timer or per-question timer
  isGameOver: boolean;
  history: {
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    timeTakenSeconds: number;
  }[];
}

export interface PlayerProfile {
  username: string; // The selected name of the player
  userId: string;   // Local device uuid or anonymous auth id
  totalGames: number;
  highScores: {
    [mode in GameMode]?: number;
  };
  totalCorrect: number;
  totalAnswered: number;
  level: number;
  experience: number;
  categoryStats: {
    [category: string]: {
      answered: number;
      correct: number;
    }
  };
}

export interface LeaderboardEntry {
  id?: string;
  username: string;
  score: number;
  gameMode: GameMode;
  category: string;
  correctCount: number;
  totalAnswered: number;
  timestamp: any; // Firestore timestamp representation
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  description: string;
  colorClass: string; // Tailwind color theme
  glowingColor: string; // Neon glows
}
