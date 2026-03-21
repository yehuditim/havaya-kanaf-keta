import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess } from "../SoundEffects";

export interface SceneHotspot {
  id: string;
  x: string;
  y: string;
  emoji: string;
  label: string;
  clue: string;
  detail?: string;
}

interface SceneExplorerProps {
  hotspots: SceneHotspot[];
  instruction?: string;
  onAllDiscovered?: () => void;
  /** Label for the continue button shown after all hotspots are found */
  continueLabel?: string;
  stationColor?: string;
  className?: string;
  backgroundImage?: string;
  onGoMap?: () => void;
}

/**
 * Full-screen interactive scene explorer.
 * Renders hotspots directly on the station background (which fills the viewport).
 * Hotspots are nearly invisible until hovered/tapped, then reveal clues.
 */
const SceneExplorer = ({
  hotspots,
  instruction = "🔍 חפשו וגלו את כל הרמזים בסצנה",
  onAllDiscovered,
  className = "",
  backgroundImage,
  onGoMap,
}: SceneExplorerProps) => {
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const allFound = discovered.size === hotspots.length;

  const handleClick = (id: string) => {
    playClick();
    const isNew = !discovered.has(id);
    if (isNew) {
      playSuccess();
      const next = new Set([...discovered, id]);
      setDiscovered(next);
      if (next.size === hotspots.length) {
        setTimeout(() => onAllDiscovered?.(), 600);
      }
    }
    setActiveId(activeId === id ? null : id);
  };

  const activeHotspot = hotspots.find(h => h.id === activeId);

  return (
    <div className={`fixed inset-0 z-20 ${className}`}>
      {/* Optional background image (for stations that supply one) */}
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Subtle vignette so UI elements remain legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/50 pointer-events-none z-[1]" />

      {/* Top HUD: back button + instruction + counter */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2">
        {onGoMap && (
          <button
            onClick={onGoMap}
            className="text-[11px] text-foreground/90 font-bold drop-shadow-md bg-background/50 backdrop-blur-sm rounded-lg px-2.5 py-1 hover:bg-background/70 transition-all shrink-0"
          >
            ← חזרה למפה
          </button>
        )}
        <p className="text-[11px] text-foreground/90 font-bold drop-shadow-md bg-background/30 backdrop-blur-sm rounded-lg px-2.5 py-1 flex-1 text-center">
          {instruction}
        </p>
        <span className="text-[10px] text-foreground/80 bg-background/40 backdrop-blur-sm px-2.5 py-1 rounded-full font-bold drop-shadow-md shrink-0">
          {discovered.size}/{hotspots.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="absolute top-12 left-3 right-3 z-30">
        <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(discovered.size / hotspots.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Hotspots — placed directly on the viewport */}
      {hotspots.map((hs) => {
        const isDiscovered = discovered.has(hs.id);
        const isActive = activeId === hs.id;
        return (
          <motion.button
            key={hs.id}
            onClick={() => handleClick(hs.id)}
            className="absolute z-10"
            style={{ left: hs.x, top: hs.y, transform: "translate(-50%, -50%)" }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={!isDiscovered ? { scale: [1, 1.18, 1] } : {}}
            transition={!isDiscovered ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : {}}
          >
            <div
              className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base transition-all duration-300 ${
                isDiscovered
                  ? isActive
                    ? "bg-primary/25 border-2 border-primary/60 shadow-lg shadow-primary/20"
                    : "bg-primary/15 border border-primary/30"
                  : "bg-white/20 border border-white/40 shadow-sm hover:bg-foreground/10 hover:border-foreground/30"
              }`}
            >
              <span
                className={`transition-opacity duration-200 ${
                  isDiscovered ? "opacity-100" : "opacity-80 hover:opacity-100"
                }`}
              >
                {hs.emoji}
              </span>
              {isDiscovered && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center text-[7px] text-primary-foreground font-bold">
                  ✓
                </span>
              )}
            </div>
            {isDiscovered && (
              <span className="text-[7px] sm:text-[8px] font-bold block mt-0.5 text-center text-primary/80 drop-shadow-sm">
                {hs.label}
              </span>
            )}
          </motion.button>
        );
      })}

      {/* Active clue card — floating at bottom */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            key={activeHotspot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-4 left-3 right-3 z-30 bg-background/80 backdrop-blur-md border border-primary/20 rounded-xl p-3 text-right"
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">{activeHotspot.emoji}</span>
              <div className="flex-1">
                <p className="text-xs font-black text-primary mb-0.5">{activeHotspot.label}</p>
                <p className="text-[11px] leading-[1.8] text-foreground/90">״{activeHotspot.clue}״</p>
                {activeHotspot.detail && (
                  <p className="text-[10px] text-muted-foreground italic mt-1">{activeHotspot.detail}</p>
                )}
              </div>
              <button
                onClick={() => setActiveId(null)}
                className="text-muted-foreground/60 hover:text-foreground text-lg leading-none shrink-0 -mt-0.5"
                aria-label="סגור"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All found message */}
      {allFound && !activeId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
        >
          <p className="text-xs font-black text-primary bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full drop-shadow-lg">
            ✅ כל הרמזים נמצאו! המשיכו הלאה
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SceneExplorer;
