import { useState } from "react";
import { motion } from "framer-motion";
import { playClick, playReveal } from "../SoundEffects";

interface ImageClueProps {
  /** Image source URL or import */
  src: string;
  /** Alt text */
  alt: string;
  /** The clue text hidden in/around the image */
  clueText: string;
  /** Optional label */
  label?: string;
  /** Hotspot areas to discover (click zones) */
  hotspots?: { x: string; y: string; label: string; detail: string }[];
  className?: string;
}

/**
 * An image-based clue component.
 * Shows an image with optional clickable hotspots that reveal clues.
 */
const ImageClue = ({
  src,
  alt,
  clueText,
  label = "🔍 תמונת רמז",
  hotspots = [],
  className = "",
}: ImageClueProps) => {
  const [revealed, setRevealed] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [discoveredHotspots, setDiscoveredHotspots] = useState<Set<number>>(new Set());

  const handleImageClick = () => {
    if (!revealed) {
      playReveal();
      setRevealed(true);
    }
  };

  const handleHotspotClick = (index: number) => {
    playClick();
    setActiveHotspot(activeHotspot === index ? null : index);
    setDiscoveredHotspots(prev => new Set([...prev, index]));
  };

  return (
    <div className={`rounded-xl border border-border/25 overflow-hidden bg-muted/10 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/15">
        <span className="text-xs font-bold text-foreground/70">{label}</span>
        {hotspots.length > 0 && (
          <span className="text-[9px] text-muted-foreground mr-auto">
            {discoveredHotspots.size}/{hotspots.length} נמצאו
          </span>
        )}
      </div>

      <div className="relative cursor-pointer" onClick={handleImageClick}>
        <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
        
        {/* Magnifying glass overlay before reveal */}
        {!revealed && hotspots.length === 0 && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity hover:bg-black/20">
            <span className="text-4xl">🔍</span>
          </div>
        )}

        {/* Hotspots */}
        {hotspots.map((hs, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); handleHotspotClick(i); }}
            className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              discoveredHotspots.has(i)
                ? "bg-primary/30 border-primary/50"
                : "bg-white/20 border-white/40 animate-pulse-glow"
            }`}
            style={{ left: hs.x, top: hs.y, transform: "translate(-50%, -50%)" }}
          >
            <span className="text-xs">{discoveredHotspots.has(i) ? "✓" : "?"}</span>
          </button>
        ))}
      </div>

      {/* Clue text */}
      {revealed && hotspots.length === 0 && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="p-3 border-t border-border/15">
          <p className="text-xs text-foreground/80 text-right leading-[1.8]">{clueText}</p>
        </motion.div>
      )}

      {/* Hotspot detail */}
      {activeHotspot !== null && hotspots[activeHotspot] && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 border-t border-border/15 bg-primary/5">
          <p className="text-xs font-bold text-primary mb-0.5">{hotspots[activeHotspot].label}</p>
          <p className="text-[11px] text-foreground/70 text-right leading-[1.8]">{hotspots[activeHotspot].detail}</p>
        </motion.div>
      )}
    </div>
  );
};

export default ImageClue;
