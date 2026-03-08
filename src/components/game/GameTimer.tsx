import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Timer, Play, Pause } from "lucide-react";
import { playClick, playError } from "../SoundEffects";

interface GameTimerProps {
  /** Total time in seconds (default 30 minutes) */
  totalSeconds?: number;
  onTimeUp?: () => void;
  className?: string;
}

const GameTimer = ({ totalSeconds = 30 * 60, onTimeUp, className = "" }: GameTimerProps) => {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onTimeUp]);

  const toggle = useCallback(() => {
    playClick();
    if (!started) setStarted(true);
    setRunning(r => !r);
  }, [started]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = (remaining / totalSeconds) * 100;
  const isLow = remaining < 120; // under 2 minutes
  const isCritical = remaining < 60; // under 1 minute

  return (
    <div className={`fixed top-4 right-16 z-50 flex items-center gap-2 ${className}`}>
      <button
        onClick={toggle}
        className={`glass-card rounded-full w-11 h-11 flex items-center justify-center border transition-all hover:scale-110 ${
          isCritical
            ? "border-destructive/50 shadow-lg shadow-destructive/20"
            : isLow
              ? "border-primary/50 shadow-lg shadow-primary/20"
              : "border-border/30"
        }`}
        title={running ? "עצור טיימר" : "התחל טיימר"}
      >
        {!started ? (
          <Timer size={18} className="text-muted-foreground" />
        ) : running ? (
          <Pause size={16} className="text-primary" />
        ) : (
          <Play size={16} className="text-primary" />
        )}
      </button>

      {started && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`glass-card rounded-xl px-3 py-1.5 border flex items-center gap-2 min-w-[100px] ${
            isCritical
              ? "border-destructive/40 bg-destructive/10"
              : isLow
                ? "border-primary/40 bg-primary/10"
                : "border-border/30"
          }`}
        >
          {/* Mini progress bar */}
          <div className="w-8 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isCritical ? "bg-destructive" : isLow ? "bg-primary" : "bg-secondary"
              }`}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span
            className={`font-mono text-sm font-black tabular-nums ${
              isCritical
                ? "text-destructive animate-pulse"
                : isLow
                  ? "text-primary"
                  : "text-foreground/80"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default GameTimer;
