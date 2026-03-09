import { playClick } from "../SoundEffects";
import { ArrowRight, Home, Map } from "lucide-react";

interface GameNavProps {
  onBack?: () => void;
  onHome?: () => void;
  onMap?: () => void;
  backLabel?: string;
}

/** Persistent navigation bar at the top of every game screen */
const GameNav = ({ onBack, onHome, onMap, backLabel = "חזרה" }: GameNavProps) => (
  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
    <div className="flex items-center gap-2">
      {onBack && (
        <button
          onClick={() => { playClick(); onBack(); }}
          className="glass-card rounded-xl px-3 py-2.5 flex items-center gap-1.5 border border-border/30 hover:border-primary/40 hover:scale-105 transition-all text-sm min-h-[44px]"
        >
          <ArrowRight size={16} className="text-primary" />
          <span className="font-bold text-foreground/80">{backLabel}</span>
        </button>
      )}
      {onMap && (
        <button
          onClick={() => { playClick(); onMap(); }}
          className="glass-card rounded-xl px-3 py-2.5 flex items-center gap-1.5 border border-border/30 hover:border-secondary/40 hover:scale-105 transition-all text-sm min-h-[44px]"
        >
          <Map size={16} className="text-secondary" />
          <span className="font-bold text-foreground/80">מפה</span>
        </button>
      )}
    </div>
    {onHome && (
      <button
        onClick={() => { playClick(); onHome(); }}
        className="glass-card rounded-xl px-3 py-2.5 flex items-center gap-1.5 border border-border/30 hover:border-accent/40 hover:scale-105 transition-all text-sm min-h-[44px]"
      >
        <Home size={16} className="text-accent" />
        <span className="font-bold text-foreground/80">בית</span>
      </button>
    )}
  </div>
);

export default GameNav;
