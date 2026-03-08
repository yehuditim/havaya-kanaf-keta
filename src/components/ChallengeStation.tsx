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

  const stationColors = [
    { accent: "text-station-1", border: "border-station-1", bg: "bg-station-1" },
    { accent: "text-station-2", border: "border-station-2", bg: "bg-station-2" },
    { accent: "text-station-3", border: "border-station-3", bg: "bg-station-3" },
    { accent: "text-station-4", border: "border-station-4", bg: "bg-station-4" },
  ];
  const colors = stationColors[stationIndex] || stationColors[0];

  // BRIEFING PHASE
  if (phase === "briefing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-adventure stars-bg">
        <div className="max-w-lg w-full">
          <CodeTracker collected={collected} totalStations={totalStations} currentStation={stationIndex} />
          <div className={`glass-card rounded-2xl p-8 mt-4 animate-slide-up ${station.glowClass}`}>
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 text-4xl mb-3 border border-border/50">
                {station.emoji}
              </div>
              <h2 className={`text-2xl font-black ${colors.accent}`}>
                תחנה {stationIndex + 1}: {station.title}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                {Array.from({ length: totalStations }).map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${
                    i === stationIndex ? `w-8 ${colors.bg}` : i < stationIndex ? "w-4 bg-primary/40" : "w-4 bg-muted/50"
                  }`} />
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-5 mb-6 text-right border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">👨‍🔬</span>
                <span className="text-xs text-muted-foreground font-medium">פרופסור דרור</span>
              </div>
              <p className="text-sm leading-[1.8] text-foreground/90 italic">
                ״{station.briefing}״
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setPhase("challenge")}
                className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-8 py-3.5 rounded-xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20"
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-adventure stars-bg">
        <div className="max-w-lg w-full">
          <CodeTracker
            collected={{ ...collected, [stationIndex]: station.codeLetter }}
            totalStations={totalStations}
          />
          <div className={`glass-card rounded-2xl p-8 mt-4 animate-slide-up ${station.glowClass}`}>
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-4xl mb-3 border border-primary/20 animate-reveal">
                🔑
              </div>
              <h2 className={`text-2xl font-black ${colors.accent}`}>
                אות נחשפה!
              </h2>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 border-2 border-primary text-primary text-3xl font-black mt-3 shadow-lg shadow-primary/20">
                {station.codeLetter}
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-5 mb-6 text-right border border-border/30">
              <p className="text-sm leading-[1.8] text-foreground/90 italic">
                ״{station.debriefing}״
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => onComplete(station.codeLetter)}
                className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3.5 rounded-xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-secondary/20"
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-adventure stars-bg">
      <div className="max-w-lg w-full">
        <CodeTracker collected={collected} totalStations={totalStations} currentStation={stationIndex} />
        <div className={`glass-card rounded-2xl p-7 mt-4 ${station.glowClass}`}>
          {/* Progress header */}
          <div className="flex justify-between items-center mb-5">
            <span className={`text-xs font-bold ${colors.accent} bg-muted/50 px-3 py-1 rounded-full`}>
              {station.emoji} תחנה {stationIndex + 1}
            </span>
            <div className="flex gap-2">
              {station.questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < current ? "bg-primary scale-100" : i === current ? `${colors.bg} scale-125` : "bg-muted/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Narrative context */}
          <div className="bg-muted/20 rounded-xl p-4 mb-4 text-right border border-border/20">
            <p className="text-xs text-muted-foreground italic leading-relaxed">{q.context}</p>
          </div>

          <h2 className="text-lg font-bold mb-5 text-right leading-relaxed">{q.question}</h2>

          <div className="space-y-2.5 mb-5">
            {q.options.map((option, i) => {
              let style = "bg-muted/40 hover:bg-muted/70 border-border/30";
              if (selected !== null) {
                if (i === q.correct) style = "bg-primary/15 border-primary/50 text-primary ring-1 ring-primary/30";
                else if (i === selected) style = "bg-destructive/15 border-destructive/50 text-destructive ring-1 ring-destructive/30";
                else style = "bg-muted/20 opacity-40 border-transparent";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={`w-full text-right p-4 rounded-xl text-sm font-medium transition-all duration-300 border ${style}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showRevelation && (
            <div className="bg-primary/8 border border-primary/20 p-4 rounded-xl mb-5 text-right animate-reveal">
              <p className="text-sm text-foreground/90 leading-relaxed">{q.revelation}</p>
            </div>
          )}

          {selected !== null && selected !== q.correct && (
            <div className="text-center animate-slide-up">
              <p className="text-destructive mb-3 text-sm font-medium">🔒 המנעול לא נפתח... נסו שוב!</p>
              <button
                onClick={handleRetry}
                className="bg-muted/70 text-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-muted transition-colors"
              >
                🔄 ניסיון נוסף
              </button>
            </div>
          )}

          {showRevelation && (
            <div className="text-center">
              <button
                onClick={handleNext}
                className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-secondary/20"
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
