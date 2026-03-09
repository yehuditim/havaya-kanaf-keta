const STORAGE_KEY = "migration-mystery-leaderboard";

export interface LeaderboardEntry {
  id: string;
  date: string;
  elapsedSeconds: number;
  totalMistakes: number;
  totalHintsUsed: number;
  stars: number;
}

export interface PersonalBest {
  fastestTime: number | null;
  lowestMistakes: number | null;
  highestStars: number | null;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
};

export const saveGameResult = (
  elapsedSeconds: number,
  totalMistakes: number,
  totalHintsUsed: number,
  stars: number
): LeaderboardEntry => {
  const entry: LeaderboardEntry = {
    id: generateId(),
    date: new Date().toISOString(),
    elapsedSeconds,
    totalMistakes,
    totalHintsUsed,
    stars,
  };

  const entries = getLeaderboard();
  entries.unshift(entry);

  // Keep only the last 20 entries
  const trimmed = entries.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

  return entry;
};

export const getPersonalBest = (): PersonalBest => {
  const entries = getLeaderboard();

  if (entries.length === 0) {
    return { fastestTime: null, lowestMistakes: null, highestStars: null };
  }

  return {
    fastestTime: Math.min(...entries.map((e) => e.elapsedSeconds)),
    lowestMistakes: Math.min(...entries.map((e) => e.totalMistakes)),
    highestStars: Math.max(...entries.map((e) => e.stars)),
  };
};

export const clearLeaderboard = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
  });
};
