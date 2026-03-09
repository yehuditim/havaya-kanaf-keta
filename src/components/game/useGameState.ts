import { useState, useCallback, useRef } from "react";

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  stationIndex: number;
}

export type Screen = "home" | "instructions" | "hub" | "final" | "success" | number;

export interface StationStats {
  mistakes: number;
  hintsUsed: number;
}

export interface GameStats {
  totalMistakes: number;
  totalHintsUsed: number;
  elapsedSeconds: number;
  stationStats: { [key: number]: StationStats };
}

export interface GameState {
  screen: Screen;
  completedStations: Set<number>;
  inventory: InventoryItem[];
  collectedLetters: { [key: number]: string };
  hintsUsed: number;
}

const STATION_REWARDS: InventoryItem[] = [
  { id: "map-fragment", name: "קטע מפה", emoji: "🗺️", description: "קטע ממפת הנדידה הגדולה — מסמן את שער הכניסה הדרומי", stationIndex: 0 },
  { id: "binoculars", name: "משקפת שדה", emoji: "🔭", description: "משקפת תצפית מתחנת אגמון החולה — חושפת את הנסתר", stationIndex: 1 },
  { id: "shield", name: "מגן שימור", emoji: "🛡️", description: "סמל פרויקט ׳פורשים כנף׳ — מגן על הנודדות", stationIndex: 2 },
  { id: "compass", name: "מצפן ניווט", emoji: "🧭", description: "מצפן מגנטי ביולוגי — הסוד של הציפורים", stationIndex: 3 },
  { id: "ring-band", name: "טבעת טיבוע", emoji: "🏷️", description: "טבעת SA-1985 — עדות למסע של 7,150 ק״מ", stationIndex: 4 },
  { id: "treaty-seal", name: "חותם דיפלומטי", emoji: "🌍", description: "חותם פגישת הפסגה — עדות לשיתוף פעולה בין-לאומי", stationIndex: 5 },
];

export const getStationReward = (stationIndex: number) => STATION_REWARDS[stationIndex];

export const useGameState = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [completedStations, setCompletedStations] = useState<Set<number>>(new Set());
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [collectedLetters, setCollectedLetters] = useState<{ [key: number]: string }>({});
  const [hintsUsed, setHintsUsed] = useState(0);
  const [stationStats, setStationStats] = useState<{ [key: number]: StationStats }>({});
  const startTimeRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startGame = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const stopTimer = useCallback(() => {
    if (startTimeRef.current) {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
  }, []);

  // All stations unlocked from start — free order!
  const isStationUnlocked = useCallback((_index: number) => {
    return true;
  }, []);

  const completeStation = useCallback((stationIndex: number, letter: string, mistakes = 0, hints = 0) => {
    setCompletedStations(prev => new Set([...prev, stationIndex]));
    setCollectedLetters(prev => ({ ...prev, [stationIndex]: letter }));
    setStationStats(prev => ({ ...prev, [stationIndex]: { mistakes, hintsUsed: hints } }));
    const reward = STATION_REWARDS[stationIndex];
    if (reward) {
      setInventory(prev => [...prev, reward]);
    }
  }, []);

  const useHint = useCallback(() => {
    setHintsUsed(prev => prev + 1);
  }, []);

  const canAccessFinal = completedStations.size === 6;

  const getGameStats = useCallback((): GameStats => {
    const totalMistakes = Object.values(stationStats).reduce((sum, s) => sum + s.mistakes, 0);
    const totalHintsUsed = Object.values(stationStats).reduce((sum, s) => sum + s.hintsUsed, 0) + hintsUsed;
    const elapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : elapsedSeconds;
    return { totalMistakes, totalHintsUsed, elapsedSeconds: elapsed, stationStats };
  }, [stationStats, hintsUsed, elapsedSeconds]);

  const restart = useCallback(() => {
    setScreen("home");
    setCompletedStations(new Set());
    setInventory([]);
    setCollectedLetters({});
    setHintsUsed(0);
    setStationStats({});
    startTimeRef.current = null;
    setElapsedSeconds(0);
  }, []);

  return {
    screen, setScreen,
    completedStations, inventory, collectedLetters,
    hintsUsed, useHint,
    isStationUnlocked, completeStation,
    canAccessFinal, restart,
    startGame, stopTimer, getGameStats, stationStats,
  };
};
