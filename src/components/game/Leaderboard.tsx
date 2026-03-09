import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getLeaderboard,
  getPersonalBest,
  formatTime,
  formatDate,
  type LeaderboardEntry,
  type PersonalBest,
} from "../../lib/leaderboard";

interface LeaderboardProps {
  currentGameId?: string;
  className?: string;
}

const Leaderboard = ({ currentGameId, className = "" }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [personalBest, setPersonalBest] = useState<PersonalBest>({
    fastestTime: null,
    lowestMistakes: null,
    highestStars: null,
  });
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setEntries(getLeaderboard());
    setPersonalBest(getPersonalBest());
  }, []);

  if (entries.length === 0) {
    return null;
  }

  const displayedEntries = showAll ? entries : entries.slice(0, 5);

  return (
    <div className={`glass-card rounded-2xl p-5 text-right ${className}`}>
      <h3 className="text-sm font-black text-accent mb-4 text-center flex items-center justify-center gap-2">
        <span>🏅</span>
        <span>לוח שיאים אישי</span>
      </h3>

      {/* Personal Best Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-primary/10 rounded-xl p-2.5 text-center border border-primary/20">
          <p className="text-lg font-black text-primary">
            {personalBest.fastestTime !== null ? formatTime(personalBest.fastestTime) : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">⚡ זמן שיא</p>
        </div>
        <div className="bg-secondary/10 rounded-xl p-2.5 text-center border border-secondary/20">
          <p className="text-lg font-black text-secondary">
            {personalBest.lowestMistakes !== null ? personalBest.lowestMistakes : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">🎯 מינ׳ טעויות</p>
        </div>
        <div className="bg-accent/10 rounded-xl p-2.5 text-center border border-accent/20">
          <p className="text-lg font-black text-accent">
            {personalBest.highestStars !== null ? "⭐".repeat(personalBest.highestStars) : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">🌟 מקס׳ כוכבים</p>
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-2 pb-1 border-b border-border/20">
          <span className="w-6 text-center">#</span>
          <span className="flex-1">תאריך</span>
          <span className="w-12 text-center">זמן</span>
          <span className="w-10 text-center">טעויות</span>
          <span className="w-16 text-center">כוכבים</span>
        </div>

        <AnimatePresence>
          {displayedEntries.map((entry, idx) => {
            const isCurrent = entry.id === currentGameId;
            const isBestTime = entry.elapsedSeconds === personalBest.fastestTime;
            const isBestMistakes = entry.totalMistakes === personalBest.lowestMistakes;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-all ${
                  isCurrent
                    ? "bg-primary/15 border border-primary/30"
                    : "bg-muted/20 border border-transparent hover:bg-muted/30"
                }`}
              >
                <span className="w-6 text-center text-muted-foreground font-bold">
                  {idx + 1}
                </span>
                <span className="flex-1 text-foreground/70">
                  {formatDate(entry.date)}
                  {isCurrent && (
                    <span className="mr-1 text-primary text-[10px] font-bold">עכשיו</span>
                  )}
                </span>
                <span
                  className={`w-12 text-center font-bold ${
                    isBestTime ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {formatTime(entry.elapsedSeconds)}
                  {isBestTime && <span className="text-[8px] mr-0.5">🏆</span>}
                </span>
                <span
                  className={`w-10 text-center font-bold ${
                    isBestMistakes ? "text-secondary" : "text-foreground/80"
                  }`}
                >
                  {entry.totalMistakes}
                  {isBestMistakes && entry.totalMistakes === 0 && (
                    <span className="text-[8px] mr-0.5">🎯</span>
                  )}
                </span>
                <span className="w-16 text-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-[10px] ${i < entry.stars ? "" : "opacity-20"}`}
                    >
                      ⭐
                    </span>
                  ))}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {entries.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAll ? "הסתר ↑" : `הצג עוד (${entries.length - 5}) ↓`}
        </button>
      )}
    </div>
  );
};

export default Leaderboard;
