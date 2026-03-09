import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { playClick, playSuccess, playError, playComplete } from "../SoundEffects";
import type { InventoryItem } from "./useGameState";
import { SECRET_WORD, CODE_LETTERS } from "../gameState";
import BirdIcon from "../BirdIcon";
import GameNav from "./GameNav";

/**
 * Final Puzzle: Combine all 4 collected items to crack the escape code.
 */

interface Props {
  inventory: InventoryItem[];
  collectedLetters: { [key: number]: string };
  onSuccess: () => void;
  onGoMap: () => void;
  onGoHome: () => void;
}

const FinalPuzzle = ({ inventory, collectedLetters, onSuccess, onGoMap, onGoHome }: Props) => {
  const [enteredLetters, setEnteredLetters] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shakeError, setShakeError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const handleLetterClick = (stationIndex: number) => {
    if (isCorrect || unlocking) return;
    const letter = collectedLetters[stationIndex];
    if (!letter) return;
    playClick();

    const newLetters = [...enteredLetters, letter];
    setEnteredLetters(newLetters);

    if (newLetters.length === 6) {
      const word = newLetters.join("");
      if (word === SECRET_WORD) {
        setIsCorrect(true);
        setUnlocking(true);
        playSuccess();
        setTimeout(() => playComplete(), 600);
      } else {
        playError();
        setAttempts(a => a + 1);
        setShakeError(true);
        setTimeout(() => {
          setShakeError(false);
          setEnteredLetters([]);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (unlocking) {
      const timer = setTimeout(() => onSuccess(), 3000);
      return () => clearTimeout(timer);
    }
  }, [unlocking, onSuccess]);

  return (
    <div className="min-h-screen bg-adventure stars-bg p-4 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full">
        {/* Navigation */}
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 card-glow text-center"
        >
          {/* Lock icon */}
          <motion.div
            animate={unlocking ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } : shakeError ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-5xl border-2 transition-all duration-700 ${
              isCorrect
                ? "bg-primary/20 border-primary shadow-xl shadow-primary/30"
                : "bg-muted/30 border-border/40"
            }`}>
              {isCorrect ? "🔓" : "🔐"}
            </div>
          </motion.div>

          <h2 className="text-2xl font-black text-primary mb-1">
            {isCorrect ? "הקוד נפתח!" : "הפאזל הסופי"}
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            {isCorrect
              ? "כל המחקר חזר לסדר!"
              : "לחצו על הפריטים בסדר הנכון כדי ליצור את המילה הסודית"}
          </p>

          {/* Code entry display */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-6" style={{ direction: "ltr" }}>
            {CODE_LETTERS.map((_, i) => {
              const entered = enteredLetters[i];
              return (
                <motion.div
                  key={i}
                  animate={entered && isCorrect ? { scale: [1, 1.3, 1], y: [0, -10, 0] } : {}}
                  transition={{ delay: i * 0.15 }}
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black border-2 transition-all duration-500 ${
                    entered
                      ? isCorrect
                        ? "border-primary bg-primary/25 text-primary shadow-lg shadow-primary/30"
                        : "border-secondary bg-secondary/15 text-secondary"
                      : "border-border/40 bg-muted/20 text-muted-foreground/20"
                  }`}
                >
                  {entered || "?"}
                </motion.div>
              );
            })}
          </div>

          {!isCorrect && (
            <>
              {/* Inventory items to click */}
              <p className="text-xs text-muted-foreground mb-3">לחצו על הפריטים בסדר הנכון:</p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {inventory.map(item => {
                  const letter = collectedLetters[item.stationIndex];
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleLetterClick(item.stationIndex)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-muted/30 border border-border/25 hover:border-primary/40 transition-all flex flex-col items-center gap-1"
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-lg font-black text-primary">{letter}</span>
                      <span className="text-[7px] text-muted-foreground">{item.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {attempts > 0 && (
                <p className="text-xs text-destructive mb-2">
                  {attempts === 1 ? "🔒 לא נכון... נסו סדר אחר!" : "💡 רמז: המילה קשורה למה שציפורים עושות פעמיים בשנה..."}
                </p>
              )}

              <button
                onClick={() => { playClick(); setEnteredLetters([]); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                disabled={enteredLetters.length === 0}
              >
                🔄 נקו והתחילו מחדש
              </button>
            </>
          )}

          {/* Unlocking animation */}
          {isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="inline-block bg-primary/10 border-2 border-primary rounded-2xl px-8 py-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">המילה הסודית:</p>
                <p className="text-4xl font-black text-primary text-glow tracking-[0.3em]">{SECRET_WORD}</p>
              </div>
              <div className="flex justify-center gap-3 mt-4">
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-2xl">🎉</motion.span>
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="text-2xl">⭐</motion.span>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
                  <BirdIcon type="eagle" size={28} className="text-primary" />
                </motion.div>
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="text-2xl">✨</motion.span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FinalPuzzle;
