import { useState } from "react";
import { motion } from "framer-motion";
import { playClick, playSuccess, playError } from "../SoundEffects";

interface CodeLockProps {
  /** The correct code (string of digits or Hebrew letters) */
  correctCode: string;
  /** Number of digits/characters in the code */
  length?: number;
  /** Label above the lock */
  label?: string;
  /** Hint shown after failed attempts */
  hint?: string;
  /** Called when code is correct */
  onUnlock: () => void;
  /** Type of characters */
  type?: "digits" | "hebrew";
  className?: string;
}

const HEBREW_LETTERS = "אבגדהוזחטיכלמנסעפצקרשת".split("");
const DIGITS = "0123456789".split("");

/**
 * A combination lock UI that requires entering the correct code.
 * Can be digit-based or Hebrew-letter based.
 */
const CodeLock = ({
  correctCode,
  length,
  label = "🔒 מנעול קוד",
  hint,
  onUnlock,
  type = "digits",
  className = "",
}: CodeLockProps) => {
  const codeLength = length || correctCode.length;
  const [values, setValues] = useState<string[]>(Array(codeLength).fill(""));
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [shaking, setShaking] = useState(false);

  const chars = type === "digits" ? DIGITS : HEBREW_LETTERS;

  const handleCharChange = (index: number, direction: 1 | -1) => {
    playClick();
    setValues(prev => {
      const newVals = [...prev];
      const currentIdx = chars.indexOf(newVals[index]);
      let nextIdx = currentIdx + direction;
      if (nextIdx < 0) nextIdx = chars.length - 1;
      if (nextIdx >= chars.length) nextIdx = 0;
      newVals[index] = chars[nextIdx];
      return newVals;
    });
  };

  const handleSubmit = () => {
    const entered = values.join("");
    if (entered === correctCode) {
      playSuccess();
      setUnlocked(true);
      onUnlock();
    } else {
      playError();
      setAttempts(a => a + 1);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      if (attempts >= 1 && hint) setShowHint(true);
    }
  };

  if (unlocked) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`bg-primary/10 border border-primary/25 rounded-xl p-4 text-center ${className}`}>
        <span className="text-3xl block mb-1">🔓</span>
        <p className="text-sm font-bold text-primary">המנעול נפתח!</p>
      </motion.div>
    );
  }

  return (
    <div className={`bg-muted/20 border border-border/25 rounded-xl p-4 ${className}`}>
      <p className="text-xs font-bold text-center mb-3">{label}</p>
      
      <motion.div
        animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center gap-2 mb-3"
        dir="ltr"
      >
        {values.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleCharChange(i, 1)}
              className="w-8 h-6 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              ▲
            </button>
            <div className="w-11 h-14 rounded-lg bg-background/80 border-2 border-border/40 flex items-center justify-center text-xl font-black text-foreground">
              {val || "–"}
            </div>
            <button
              onClick={() => handleCharChange(i, -1)}
              className="w-8 h-6 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              ▼
            </button>
          </div>
        ))}
      </motion.div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-primary/15 text-primary px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary/25 transition-colors border border-primary/20"
        >
          🔑 נסו לפתוח
        </button>
      </div>

      {showHint && hint && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-accent text-center mt-2">
          💡 {hint}
        </motion.p>
      )}

      {attempts > 0 && !showHint && (
        <p className="text-[10px] text-destructive/70 text-center mt-2">❌ הקוד שגוי — נסו שוב ({attempts} ניסיונות)</p>
      )}
    </div>
  );
};

export default CodeLock;
