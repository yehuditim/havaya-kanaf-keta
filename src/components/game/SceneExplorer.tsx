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
  /** Background image URL — hotspots are placed directly on this image */
  backgroundImage?: string;
  instruction?: string;
  onAllDiscovered?: () => void;
  stationColor?: string;
  className?: string;
}

/**
 * Full-screen interactive scene explorer.
 * Renders hotspots directly on the background image.
 * Hotspots are camouflaged until discovered.
 */
const SceneExplorer = ({
  hotspots,
  backgroundImage,
  instruction = "🔍 חפשו וגלו את כל הרמזים בסצנה",
  onAllDiscovered,
  stationColor = "primary",
  className = "",
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
    <div className={`relative w-full ${className}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[11px] text-foreground/80 font-bold">{instruction}</p>
        <span className="text-[10px] text-muted-foreground bg-background/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {discovered.size}/{hotspots.length}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1 bg-muted/20 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${(discovered.size / hotspots.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Scene area with hotspots — background image rendered here */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-border/20">
        {/* Background image */}
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        )}
        {/* Subtle overlay to help readability without hiding the scene */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/15 z-[1]" />

        {/* Hotspots */}
        {hotspots.map((hs) => {
          const isDiscovered = discovered.has(hs.id);
          const isActive = activeId === hs.id;
          return (
            <motion.button
              key={hs.id}
              onClick={() => handleClick(hs.id)}
              className="absolute z-10 group"
              style={{ left: hs.x, top: hs.y, transform: "translate(-50%, -50%)" }}
              whileTap={{ scale: 0.9 }}
            >
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isDiscovered
                    ? isActive
                      ? "w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-primary/25 border-2 border-primary/60 shadow-lg shadow-primary/20"
                      : "w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/15 border border-primary/30"
                    : "w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-transparent border border-transparent group-hover:bg-foreground/8 group-hover:border-foreground/10 group-hover:shadow-sm"
                }`}
              >
                <span
                  className={`transition-all duration-300 ${
                    isDiscovered
                      ? "text-base sm:text-lg"
                      : "text-xs sm:text-sm opacity-[0.2] group-hover:opacity-[0.45] grayscale group-hover:grayscale-0"
                  }`}
                >
                  {hs.emoji}
                </span>
                {isDiscovered && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[8px] text-primary-foreground font-bold">✓</span>
                )}
              </div>
              {isDiscovered && (
                <span className="text-[8px] sm:text-[9px] font-bold block mt-0.5 text-center text-primary/80 drop-shadow-sm">
                  {hs.label}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Active clue card — floating below the scene */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            key={activeHotspot.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-3 bg-background/70 backdrop-blur-md border border-primary/20 rounded-xl p-3 text-right"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All found message */}
      {allFound && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 text-center"
        >
          <p className="text-xs font-black text-primary">✅ כל הרמזים נמצאו! המשיכו הלאה</p>
        </motion.div>
      )}
    </div>
  );
};

export default SceneExplorer;
