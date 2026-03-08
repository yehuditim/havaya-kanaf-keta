import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Pause } from "lucide-react";

interface GameTimerProps {
  /** Total time in seconds (default 30 minutes) */
  totalSeconds?: number;
  onTimeUp?: () => void;
  className?: string;
}

const GameTimer = ({ totalSeconds = 30 * 60, onTimeUp, className = "" }: GameTimerProps) => {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [showWarning, setShowWarning] = useState(true);

  // Auto-start immediately
  useEffect(() => {
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
  }, [onTimeUp]);

  // Dismiss warning after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowWarning(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = (remaining / totalSeconds) * 100;
  const isLow = remaining < 120;
  const isCritical = remaining < 60;

  return (
    <>
      {/* Countdown warning banner */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center"
          >
            <div className="bg-destructive/90 backdrop-blur-md text-destructive-foreground px-6 py-3 rounded-b-2xl shadow-xl shadow-destructive/30 flex items-center gap-3 max-w-md">
              <span className="text-xl">⏰</span>
              <div className="text-right">
                <p className="text-sm font-black">הטיימר התחיל!</p>
                <p className="text-[11px] opacity-90">יש לכם 30 דקות — אם הזמן ייגמר, החדר יינעל והמחקר יימחק!</p>
              </div>
              <button onClick={() => setShowWarning(false)} className="text-destructive-foreground/60 hover:text-destructive-foreground text-lg ml-2">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer display */}
      <div className={`fixed top-4 right-16 z-50 flex items-center gap-2 ${className}`}>
        <div
          className={`glass-card rounded-full flex items-center gap-2 px-3 py-2 border transition-all ${
            isCritical
              ? "border-destructive/50 shadow-lg shadow-destructive/20"
              : isLow
                ? "border-primary/50 shadow-lg shadow-primary/20"
                : "border-border/30"
          }`}
        >
          <Timer size={14} className={isCritical ? "text-destructive" : isLow ? "text-primary" : "text-muted-foreground"} />
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
        </div>
      </div>
    </>
  );
};

export default GameTimer;
