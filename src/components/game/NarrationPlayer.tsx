import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { playClick } from "../SoundEffects";

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
  autoPlay = true,
  autoPlayDelay = 1200,
  className = "",
}: NarrationPlayerProps) => {
  const [revealed, setRevealed] = useState(autoExpand);
  const [displayedChars, setDisplayedChars] = useState(autoExpand ? text.length : 0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, [revealed, text]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) window.speechSynthesis.cancel();
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, []);

  const doSpeak = useCallback((voices?: SpeechSynthesisVoice[]) => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "he-IL";
    utter.rate = 0.9;
    utter.pitch = 1;

    const availableVoices = voices || window.speechSynthesis.getVoices();
    const heVoice = availableVoices.find(v => v.lang.startsWith("he")) || availableVoices.find(v => v.lang.startsWith("ar")) || null;
    if (heVoice) utter.voice = heVoice;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [text, ttsSupported]);

  const speak = useCallback(() => {
    if (!ttsSupported) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      const onVoices = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
        doSpeak(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoices);
      setTimeout(() => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
        doSpeak(window.speechSynthesis.getVoices());
      }, 300);
    } else {
      doSpeak(voices);
    }
  }, [ttsSupported, doSpeak]);

  // Auto-play on mount
  useEffect(() => {
    if (!autoPlay || !ttsSupported) return;
    autoPlayTimerRef.current = setTimeout(() => {
      speak();
    }, autoPlayDelay);
    return () => { if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const handlePlay = () => {
    playClick();
    setRevealed(true);
    speak();
  };

  const handleSkip = () => {
    setDisplayedChars(text.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleTTSToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak();
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
          {!revealed && (
            <button onClick={handlePlay} className="bg-primary/15 text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/25 transition-colors border border-primary/20">
              ▶ השמע
            </button>
          )}
          {revealed && ttsSupported && (
            <button
              onClick={handleTTSToggle}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isSpeaking
                  ? "bg-primary/20 text-primary border-primary/30 animate-pulse"
                  : "bg-muted/40 text-muted-foreground border-border/25 hover:bg-primary/10 hover:text-primary"
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
