import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { playClick } from "../SoundEffects";
import { useHebrewNarration } from "../../hooks/useHebrewNarration";
import { unlockAudioOnGesture } from "../../lib/audioUnlock";

interface NarrationPlayerProps {
  text: string;
  /** Optional nikud (vowel-pointed) version of the text for cleaner TTS pronunciation.
   *  If provided, TTS uses this text while the display still shows `text`. */
  speechText?: string;
  /** If provided, plays this audio file directly instead of TTS. */
  audioSrc?: string;
  speaker?: string;
  speakerEmoji?: string;
  autoExpand?: boolean;
  autoPlay?: boolean;
  className?: string;
}

const NarrationPlayer = ({
  text,
  speechText,
  audioSrc,
  speaker = "פרופסור דרור",
  speakerEmoji = "👨‍🔬",
  autoExpand = true,
  autoPlay = true,
  className = "",
}: NarrationPlayerProps) => {
  const [revealed, setRevealed] = useState(autoExpand);
  const [displayedChars, setDisplayedChars] = useState(autoExpand ? text.length : 0);
  const [tapHint, setTapHint] = useState(false);
  const [wavPlaying, setWavPlaying] = useState(false);
  const wavRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { isSpeaking, canSpeak, speak, stopSpeaking } = useHebrewNarration(speechText ?? text);

  // WAV audio setup
  useEffect(() => {
    if (!audioSrc) return;
    const audio = new Audio(audioSrc);
    wavRef.current = audio;
    audio.onplay = () => { setWavPlaying(true); setTapHint(false); };
    audio.onended = () => setWavPlaying(false);
    audio.onpause = () => setWavPlaying(false);
    if (autoPlay) {
      audio.play().catch(() => setTapHint(true));
    }
    return () => { audio.pause(); audio.src = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc]);

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

  // Auto-play narration immediately on mount (TTS only — WAV is handled above).
  // On mobile the audio context may not yet be unlocked — in that case we show
  // a pulsing "tap to hear" hint on the button after a short wait.
  useEffect(() => {
    if (!autoPlay || !canSpeak || audioSrc) return;
    void speak();
    // If not speaking after 600ms, audio was blocked → show tap hint
    const timer = setTimeout(() => {
      setTapHint(prev => prev || true);
    }, 600);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, canSpeak]);

  // Hide tap hint once narration actually starts
  useEffect(() => {
    if (isSpeaking) setTapHint(false);
  }, [isSpeaking]);

  const handlePlay = () => {
    playClick();
    unlockAudioOnGesture();
    setRevealed(true);
    setTapHint(false);
    if (audioSrc && wavRef.current) {
      wavRef.current.currentTime = 0;
      wavRef.current.play().catch(() => setTapHint(true));
    } else {
      void speak();
    }
  };

  const handleSkip = () => {
    setDisplayedChars(text.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleTTSToggle = () => {
    unlockAudioOnGesture();
    if (audioSrc && wavRef.current) {
      if (wavPlaying) {
        wavRef.current.pause();
        wavRef.current.currentTime = 0;
      } else {
        setTapHint(false);
        wavRef.current.play().catch(() => setTapHint(true));
      }
    } else {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        setTapHint(false);
        void speak();
      }
    }
  };

  const activePlaying = audioSrc ? wavPlaying : isSpeaking;
  const activeCanSpeak = audioSrc ? true : canSpeak;

  return (
    <div className={`bg-muted/25 rounded-xl border border-border/20 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 p-3 border-b border-border/10">
        <div className={`w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0 ${activePlaying ? "animate-pulse" : ""}`}>
          {speakerEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-primary">{speaker}</p>
          <p className="text-[10px] text-muted-foreground">
            {activePlaying ? "🎙 מקריא..." : tapHint ? "👆 לחצו להאזין" : "קריינות סיפור"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {activeCanSpeak && (
            <button
              onClick={revealed ? handleTTSToggle : handlePlay}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activePlaying
                  ? "bg-primary/20 text-primary border-primary/30 animate-pulse"
                  : tapHint
                  ? "bg-primary text-primary-foreground border-primary animate-pulse scale-105 shadow-lg shadow-primary/30"
                  : "bg-primary/15 text-primary border-primary/20 hover:bg-primary/25"
              }`}
              title={activePlaying ? "עצור הקראה" : "הקרא בקול"}
            >
              {activePlaying ? "⏸ עצור" : "🔊 הקרא"}
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
