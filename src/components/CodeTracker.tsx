import { CODE_LETTERS } from "./gameState";

interface Props {
  collected: { [key: number]: string };
  totalStations: number;
  currentStation?: number;
}

const CodeTracker = ({ collected, totalStations, currentStation }: Props) => (
  <div className="glass-card rounded-2xl px-5 py-4 flex items-center justify-center gap-3">
    <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
      🔐 <span className="hidden sm:inline">קוד הבריחה:</span>
    </span>
    <div className="flex gap-2" style={{ direction: 'ltr' }}>
      {CODE_LETTERS.map((letter, i) => {
        const isCollected = collected[i] !== undefined;
        const isCurrent = currentStation === i;
        return (
          <div
            key={i}
            className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg font-black border-2 transition-all duration-500
              ${isCollected
                ? "border-primary bg-primary/20 text-primary animate-reveal shadow-md shadow-primary/20"
                : isCurrent
                  ? "border-primary/40 bg-muted/80 text-muted-foreground animate-pulse-glow"
                  : "border-border/50 bg-muted/30 text-muted-foreground/20"
              }`}
          >
            {isCollected ? collected[i] : "?"}
          </div>
        );
      })}
    </div>
  </div>
);

export default CodeTracker;
