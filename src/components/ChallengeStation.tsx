import { useState } from "react";
import type { Station } from "./stationsData";
import CodeTracker from "./CodeTracker";

interface Props {
  station: Station;
  stationIndex: number;
  totalStations: number;
  collected: { [key: number]: string };
  onComplete: (codeLetter: string) => void;
}

type Phase = "briefing" | "challenge" | "debriefing";

const ChallengeStation = ({ station, stationIndex, totalStations, collected, onComplete }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showRevelation, setShowRevelation] = useState(false);

  const q = station.questions[current];

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === q.correct) setShowRevelation(true);
  };

  const handleNext = () => {
    if (current < station.questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowRevelation(false);
    } else {
      setPhase("debriefing");
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setShowRevelation(false);
  };

  // BRIEFING PHASE
  if (phase === "briefing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <CodeTracker collected={collected} totalStations={totalStations} currentStation={stationIndex} />
          <div className={`bg-card rounded-lg p-8 mt-4 animate-slide-up ${station.glowClass}`}>
            <div className="text-center mb-4">
              <span className="text-5xl">{station.emoji}</span>
            </div>
            <h2 className={`text-2xl font-bold text-center mb-2 ${station.accentClass}`}>
              תחנה {stationIndex + 1}: {station.title}
            </h2>
            <p className="text-xs text-muted-foreground text-center mb-5">
              {stationIndex + 1} מתוך {totalStations}
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-right">
              <p className="text-sm leading-relaxed text-foreground italic">
                ״{station.briefing}״
              </p>
              <p className="text-xs text-muted-foreground mt-2 text-left">— פרופסור דרור</p>
            </div>
            <div className="text-center">
              <button
                onClick={() => setPhase("challenge")}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-bold hover:opacity-90 transition-all hover:scale-105"
              >
                🔍 התחילו לחקור
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEBRIEFING PHASE
  if (phase === "debriefing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <CodeTracker
            collected={{ ...collected, [stationIndex]: station.codeLetter }}
            totalStations={totalStations}
          />
          <div className={`bg-card rounded-lg p-8 mt-4 animate-slide-up ${station.glowClass}`}>
            <div className="text-center mb-4">
              <span className="text-5xl animate-reveal">🔑</span>
            </div>
            <h2 className={`text-2xl font-bold text-center mb-4 ${station.accentClass}`}>
              אות נחשפה: <span className="text-3xl">{station.codeLetter}</span>
            </h2>
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-right">
              <p className="text-sm leading-relaxed text-foreground italic">
                ״{station.debriefing}״
              </p>
            </div>
            <div className="text-center">
              <button
                onClick={() => onComplete(station.codeLetter)}
                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg text-lg font-bold hover:opacity-90 transition-all hover:scale-105"
              >
                {stationIndex < totalStations - 1 ? "➡️ לתחנה הבאה" : "🔐 פצחו את הקוד!"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGE PHASE
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <CodeTracker collected={collected} totalStations={totalStations} currentStation={stationIndex} />
        <div className={`bg-card rounded-lg p-8 mt-4 ${station.glowClass}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-muted-foreground">
              חידה {current + 1} מתוך {station.questions.length}
            </span>
            <div className="flex gap-1.5">
              {station.questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < current ? "bg-primary" : i === current ? "bg-secondary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Narrative context */}
          <div className="bg-muted/30 rounded-lg p-3 mb-4 text-right">
            <p className="text-xs text-muted-foreground italic leading-relaxed">{q.context}</p>
          </div>

          <h2 className="text-lg font-bold mb-5 text-right">{q.question}</h2>

          <div className="space-y-2.5 mb-5">
            {q.options.map((option, i) => {
              let style = "bg-muted/70 hover:bg-muted";
              if (selected !== null) {
                if (i === q.correct) style = "bg-primary/20 border-primary text-primary ring-1 ring-primary";
                else if (i === selected) style = "bg-destructive/20 border-destructive text-destructive ring-1 ring-destructive";
                else style = "bg-muted/40 opacity-50";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={`w-full text-right p-3.5 rounded-lg text-sm font-medium transition-all border border-transparent ${style}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showRevelation && (
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-4 text-right animate-reveal">
              <p className="text-sm text-foreground leading-relaxed">{q.revelation}</p>
            </div>
          )}

          {selected !== null && selected !== q.correct && (
            <div className="text-center animate-slide-up">
              <p className="text-destructive mb-3 text-sm font-medium">🔒 המנעול לא נפתח... נסו שוב!</p>
              <button
                onClick={handleRetry}
                className="bg-muted text-foreground px-6 py-2 rounded-lg text-sm font-bold hover:bg-muted/80 transition-colors"
              >
                🔄 ניסיון נוסף
              </button>
            </div>
          )}

          {showRevelation && (
            <div className="text-center">
              <button
                onClick={handleNext}
                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all hover:scale-105"
              >
                {current < station.questions.length - 1 ? "➡️ לחידה הבאה" : "🔑 חשפו את האות!"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeStation;
