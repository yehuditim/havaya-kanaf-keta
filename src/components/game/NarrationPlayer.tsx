import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { playClick } from "../SoundEffects";
import { useHebrewNarration } from "../../hooks/useHebrewNarration";

interface NarrationPlayerProps {
  text: string;
  speaker?: string;
  speakerEmoji?: string;
  autoExpand?: boolean;
  autoPlay?: boolean;
  autoPlayDelay?: number; // ms
  className?: string;
}

const NarrationPlayer = ({
  text,
  speaker = "פרופסור דרור",
  speakerEmoji = "👨‍🔬",
  autoExpand = true,
  autoPlay = false,
  autoPlayDelay = 800,
  className = "",
}: NarrationPlayerProps) => {
  const [revealed, setRevealed] = useState(autoExpand);
  const [displayedChars, setDisplayedChars] = useState(autoExpand ? text.length : 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isSpeaking, canSpeak, speak, stopSpeaking } = useHebrewNarration(text);

  useEffect(() => {
    if (revealed && displayedChars < text.length) {
      intervalRef.current = setInterval(() => {
        setDisplayedChars(prev => {
          if (prev >= text.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return text.length;
          }
          return prev + 2;
        });
      }, 15);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [revealed, text, displayedChars]);

  // Auto-play disabled by default for mobile compatibility
  // Audio only starts on explicit user click

  const handlePlay = () => {
    playClick();
    setRevealed(true);
    void speak();
  };

  const handleSkip = () => {
    setDisplayedChars(text.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleTTSToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      void speak();
    }
  };

  return (
    <div className={`bg-muted/25 rounded-xl border border-border/20 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 p-3 border-b border-border/10">
        <div className={`w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0 ${isSpeaking ? "animate-pulse" : ""}`}>
          {speakerEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-primary">{speaker}</p>
          <p className="text-[10px] text-muted-foreground">
            {isSpeaking ? "🎙 מקריא..." : "קריינות סיפור"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {canSpeak && (
            <button
              onClick={revealed ? handleTTSToggle : handlePlay}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isSpeaking
                  ? "bg-primary/20 text-primary border-primary/30 animate-pulse"
                  : "bg-primary/15 text-primary border-primary/20 hover:bg-primary/25"
              }`}
              title={isSpeaking ? "עצור הקראה" : "הקרא בקול"}
            >
              {isSpeaking ? "⏸ עצור" : "🔊 הקרא"}
            </button>
          )}
          {revealed && displayedChars < text.length && (
            <button onClick={handleSkip} className="text-muted-foreground/60 text-[10px] hover:text-muted-foreground transition-colors">
              דלג ⏭
            </button>
          )}
        </div>
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
