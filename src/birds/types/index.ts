// ── Difficulty ────────────────────────────────────────────────────────────────
export type Difficulty = 'easy' | 'medium' | 'hard';

// ── Bird Data ─────────────────────────────────────────────────────────────────
export interface Bird {
  id: string;
  hebrewName: string;
  englishName: string;
  scientificName: string;
  emoji: string;
  imageUrl: string;
  imageCredit: string;
  habitat: string[];
  diet: string[];
  size: 'tiny' | 'small' | 'medium' | 'large' | 'very_large';
  colors: string[];
  distinctiveFeature: string;
  sound: string;
  seasonInIsrael: string[];
  region: string[];
  funFact: string;
  riddle: string;
  habitatDescription: string;
  distractors: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
  difficulty: Difficulty;
  rarity: 'common' | 'uncommon' | 'rare';
  xpValue: number;
}

// ── Question System ───────────────────────────────────────────────────────────
export type QuestionType = 'image_choice' | 'riddle' | 'habitat';

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  targetBirdId: string;
  prompt: string;
  imageUrl?: string;
  options: AnswerOption[];
  correctOptionId: string;
  xpReward: number;
  explanation: string;
}

export interface AnswerOption {
  id: string;
  label: string;
  birdId: string;
}

// ── Adaptive Difficulty State ─────────────────────────────────────────────────
export interface DifficultyState {
  current: Difficulty;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalCorrect: number;
  totalWrong: number;
  levelUps: number;
  levelDowns: number;
}

// ── XP & Progression ─────────────────────────────────────────────────────────
export interface PlayerProgress {
  xp: number;
  level: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  unlockedBadges: string[];
  collectedBirdIds: string[];
  discoveredBirdIds: string[];
  riddleCorrect: number;
  habitatCorrect: number;
  imageCorrect: number;
  perfectSessions: number;
  hardCorrect: number;
}

// ── Achievement / Badge ───────────────────────────────────────────────────────
export interface Achievement {
  id: string;
  hebrewName: string;
  description: string;
  emoji: string;
  condition: (progress: PlayerProgress) => boolean;
  xpBonus: number;
}

// ── Story Mode ────────────────────────────────────────────────────────────────
export type BackgroundTheme = 'forest' | 'wetland' | 'desert' | 'coast' | 'mountain' | 'city';

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  narrative: string;
  locationName: string;
  backgroundTheme: BackgroundTheme;
  birdsToQuiz: string[];
  questionsPerSession: number;
  unlockCondition: {
    previousChapterId?: string;
    minLevel?: number;
  };
}

// ── Game Session ──────────────────────────────────────────────────────────────
export type GameScreen =
  | 'splash'
  | 'story'
  | 'map'
  | 'quiz'
  | 'result'
  | 'level_up'
  | 'collection'
  | 'achievements'
  | 'end';

export interface GameSession {
  screen: GameScreen;
  currentChapterId: string | null;
  currentQuestion: Question | null;
  questionQueue: Question[];
  questionsAnsweredThisSession: number;
  sessionXpEarned: number;
  lastAnswerCorrect: boolean | null;
  showingResult: boolean;
  sessionCorrect: number;
  sessionWrong: number;
  newlyUnlockedBadgeIds: string[];
}
