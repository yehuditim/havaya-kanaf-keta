import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { playClick } from "../SoundEffects";

interface NarrationPlayerProps {
  /** Display text to show (the narration script) */
  text: string;
  /** Speaker name */
  speaker?: string;
  /** Speaker emoji */
  speakerEmoji?: string;
  /** Auto-expand on mount */
  autoExpand?: boolean;
  className?: string;
}

/**
 * Narration component that shows story text with a typewriter-like reveal effect.
 * Designed for pre-recorded audio (placeholder URLs) — currently shows text with
 * animated reveal to create an immersive narration feel.
 */
const NarrationPlayer = ({
  text,
  speaker = "פרופסור דרור",
  speakerEmoji = "👨‍🔬",
  autoExpand = true,
  className = "",
}: NarrationPlayerProps) => {
  const [revealed, setRevealed] = useState(autoExpand);
  const [displayedChars, setDisplayedChars] = useState(autoExpand ? text.length : 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (revealed && displayedChars < text.length) {
      intervalRef.current = setInterval(() => {
        setDisplayedChars(prev => {
          if (prev >= text.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return text.length;
          }
          return prev + 2; // reveal 2 chars at a time for speed
        });
      }, 15);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [revealed, text]);

  const handlePlay = () => {
    playClick();
    setRevealed(true);
  };

  const handleSkip = () => {
    setDisplayedChars(text.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className={`bg-muted/25 rounded-xl border border-border/20 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 p-3 border-b border-border/10">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
          {speakerEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-primary">{speaker}</p>
          <p className="text-[10px] text-muted-foreground">קריינות סיפור</p>
        </div>
        {!revealed && (
          <button onClick={handlePlay} className="bg-primary/15 text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/25 transition-colors border border-primary/20">
            ▶ השמע
          </button>
        )}
        {revealed && displayedChars < text.length && (
          <button onClick={handleSkip} className="text-muted-foreground/60 text-[10px] hover:text-muted-foreground transition-colors">
            דלג ⏭
          </button>
        )}
      </div>
      {revealed && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="p-4">
          <p className="text-[13px] leading-[2.1] text-foreground/85 italic text-right" dir="rtl">
            ״{text.slice(0, displayedChars)}
            {displayedChars < text.length && <span className="animate-pulse text-primary">|</span>}
            {displayedChars >= text.length && "״"}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default NarrationPlayer;
