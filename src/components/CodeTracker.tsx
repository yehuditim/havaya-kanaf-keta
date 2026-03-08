import { CODE_LETTERS } from "./gameState";

interface Props {
  collected: { [key: number]: string };
  totalStations: number;
  currentStation?: number;
}

const CodeTracker = ({ collected, totalStations, currentStation }: Props) => (
  <div className="flex items-center justify-center gap-2 py-3">
    <span className="text-sm text-muted-foreground ml-3">🔐 קוד הבריחה:</span>
    <div className="flex gap-1.5 direction-ltr">
      {CODE_LETTERS.map((letter, i) => {
        const isCollected = collected[i] !== undefined;
        const isCurrent = currentStation === i;
        return (
          <div
            key={i}
            className={`w-10 h-10 rounded-md flex items-center justify-center text-lg font-bold border-2 transition-all duration-500
              ${isCollected
                ? "border-primary bg-primary/20 text-primary animate-reveal"
                : isCurrent
                  ? "border-primary/50 bg-muted text-muted-foreground animate-pulse-glow"
                  : "border-border bg-muted/50 text-muted-foreground/30"
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
