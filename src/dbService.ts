import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  increment,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { LeaderboardEntry } from './types';

// Collection references
const LEADERBOARD_COLLECTION = 'leaderboard';
const GLOBAL_STATS_DOC = 'stats/global';

/**
 * Saves a high score to Firebase Firestore, with a local localStorage backup
 */
export async function savePlayerScore(entry: LeaderboardEntry): Promise<string> {
  try {
    const dataToSave = {
      ...entry,
      timestamp: serverTimestamp()
    };
    
    // 1. Save to Firebase
    const docRef = await addDoc(collection(db, LEADERBOARD_COLLECTION), dataToSave);
    
    // 2. Increment global generated questions ticker internally in Firebase count (just for fun!)
    try {
      const statsRef = doc(db, GLOBAL_STATS_DOC);
      await setDoc(statsRef, { 
        questionsGeneratedCount: increment(entry.correctCount),
        gamesPlayedCount: increment(1)
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to update live global stat increments, skipping silently.', e);
    }
    
    // 3. Save to Local Backup
    backupScoreToLocal(entry);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving score to Firestore:', error);
    // Backup to localStorage
    backupScoreToLocal(entry);
    return `local_${Date.now()}`;
  }
}

/**
 * Query the top leaders for a specific game mode from Firestore
 */
export function subscribeToLeaderboard(
  gameMode: string, 
  callback: (entries: LeaderboardEntry[]) => void
): () => void {
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      where('gameMode', '==', gameMode),
      orderBy('score', 'desc'),
      limit(25)
    );

    return onSnapshot(q, (snapshot) => {
      const entries: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          username: data.username || 'Anonymous',
          score: Number(data.score) || 0,
          gameMode: data.gameMode || 'sprint',
          category: data.category || 'General',
          correctCount: Number(data.correctCount) || 0,
          totalAnswered: Number(data.totalAnswered) || 0,
          timestamp: data.timestamp
        });
      });
      
      // If empty and we have local backup, mix them in or return
      if (entries.length === 0) {
        callback(getLocalBackupScores().filter(s => s.gameMode === gameMode));
      } else {
        callback(entries);
      }
    }, (error) => {
      console.warn('Firebase snapshot listener error:', error);
      // Fallback: callback with local backup
      callback(getLocalBackupScores().filter(s => s.gameMode === gameMode));
    });
  } catch (error) {
    console.error('Failed to setup leaderboard listener:', error);
    callback(getLocalBackupScores().filter(s => s.gameMode === gameMode));
    return () => {};
  }
}

/**
 * Live counts of total processed questions inside our ecosystem
 */
export function subscribeToGlobalStats(
  callback: (status: { questionsGeneratedCount: number; gamesPlayedCount: number }) => void
): () => void {
  try {
    const statsRef = doc(db, GLOBAL_STATS_DOC);
    return onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          questionsGeneratedCount: data?.questionsGeneratedCount || 105634, // Base start above 100k
          gamesPlayedCount: data?.gamesPlayedCount || 3421
        });
      } else {
        callback({ questionsGeneratedCount: 105634, gamesPlayedCount: 3421 });
      }
    }, () => {
      callback({ questionsGeneratedCount: 105634, gamesPlayedCount: 3421 });
    });
  } catch (e) {
    callback({ questionsGeneratedCount: 105634, gamesPlayedCount: 3421 });
    return () => {};
  }
}

// Local backups helpers
function backupScoreToLocal(entry: LeaderboardEntry) {
  try {
    const scores = getLocalBackupScores();
    scores.push({
      ...entry,
      id: `local_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    // Sort and limit
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('trivia_local_leaderboard', JSON.stringify(scores.slice(0, 50)));
  } catch (e) {
    console.error('Failed to backup score locally', e);
  }
}

export function getLocalBackupScores(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem('trivia_local_leaderboard');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(e);
  }
  return [
    { username: 'NeoGamer', score: 9500, gameMode: 'sprint', category: 'General Knowledge', correctCount: 10, totalAnswered: 10, timestamp: null },
    { username: 'RetroBrain', score: 8200, gameMode: 'sprint', category: 'General Knowledge', correctCount: 9, totalAnswered: 10, timestamp: null },
    { username: 'QuizMaster', score: 14500, gameMode: 'survival', category: 'Science & Cosmos', correctCount: 18, totalAnswered: 20, timestamp: null },
    { username: 'AstroMind', score: 11200, gameMode: 'survival', category: 'Science & Cosmos', correctCount: 15, totalAnswered: 17, timestamp: null },
    { username: 'SpeedRunner', score: 7600, gameMode: 'time_attack', category: 'Tech & Gaming', correctCount: 12, totalAnswered: 14, timestamp: null },
    { username: 'PixelGuesser', score: 6200, gameMode: 'time_attack', category: 'Pop Culture & Screen', correctCount: 10, totalAnswered: 13, timestamp: null },
  ];
}
