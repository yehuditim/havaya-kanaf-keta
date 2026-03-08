import { useState, useCallback } from "react";

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  stationIndex: number;
}

export type Screen = "home" | "instructions" | "hub" | "final" | "success" | number;

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
];

export const getStationReward = (stationIndex: number) => STATION_REWARDS[stationIndex];

export const useGameState = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [completedStations, setCompletedStations] = useState<Set<number>>(new Set());
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [collectedLetters, setCollectedLetters] = useState<{ [key: number]: string }>({});
  const [hintsUsed, setHintsUsed] = useState(0);

  const isStationUnlocked = useCallback((index: number) => {
    if (index === 0) return true;
    return completedStations.has(index - 1);
  }, [completedStations]);

  const completeStation = useCallback((stationIndex: number, letter: string) => {
    setCompletedStations(prev => new Set([...prev, stationIndex]));
    setCollectedLetters(prev => ({ ...prev, [stationIndex]: letter }));
    const reward = STATION_REWARDS[stationIndex];
    if (reward) {
      setInventory(prev => [...prev, reward]);
    }
  }, []);

  const useHint = useCallback(() => {
    setHintsUsed(prev => prev + 1);
  }, []);

  const canAccessFinal = completedStations.size === 4;

  const restart = useCallback(() => {
    setScreen("home");
    setCompletedStations(new Set());
    setInventory([]);
    setCollectedLetters({});
    setHintsUsed(0);
  }, []);

  return {
    screen, setScreen,
    completedStations, inventory, collectedLetters,
    hintsUsed, useHint,
    isStationUnlocked, completeStation,
    canAccessFinal, restart,
  };
};
