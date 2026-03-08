import { useState } from "react";
import type { Station } from "./stationsData";
import CodeTracker from "./CodeTracker";
import { playSuccess, playReveal, playError, playClick } from "./SoundEffects";

interface Props {
  station: Station;
  stationIndex: number;
  totalStations: number;
  collected: { [key: number]: string };
  onComplete: (codeLetter: string) => void;
  onOpenResearch: () => void;
}

type Phase = "briefing" | "challenge" | "debriefing";

const themeGradients: Record<string, string> = {
  spring: "from-station-1/5 via-transparent to-primary/3",
  night: "from-station-2/8 via-transparent to-station-2/3",
  desert: "from-station-3/5 via-transparent to-station-3/3",
  lab: "from-station-4/5 via-transparent to-secondary/3",
};

const ChallengeStation = ({ station, stationIndex, totalStations, collected, onComplete, onOpenResearch }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showRevelation, setShowRevelation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const q = station.questions[current];
  const extraGradient = themeGradients[station.theme] || "";

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === q.correct) {
      setShowRevelation(true);
      setCorrectCount((c) => c + 1);
      playSuccess();
    } else {
      playError();
    }
  };

  const handleNext = () => {
    playClick();
    if (current < station.questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowRevelation(false);
      setShowHint(false);
    } else {
      playReveal();
      setPhase("debriefing");
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setShowRevelation(false);
  };

  const stationColorMap = [
    { accent: "text-station-1", border: "border-station-1", bg: "bg-station-1", bgSoft: "bg-station-1/10" },
    { accent: "text-station-2", border: "border-station-2", bg: "bg-station-2", bgSoft: "bg-station-2/10" },
    { accent: "text-station-3", border: "border-station-3", bg: "bg-station-3", bgSoft: "bg-station-3/10" },
    { accent: "text-station-4", border: "border-station-4", bg: "bg-station-4", bgSoft: "bg-station-4/10" },
  ];
  const colors = stationColorMap[stationIndex] || stationColorMap[0];

  // BRIEFING PHASE
  if (phase === "briefing") {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-adventure stars-bg relative`}>
        <div className={`absolute inset-0 bg-gradient-to-b ${extraGradient} pointer-events-none`} />
        <div className="max-w-lg w-full relative z-10">
          <CodeTracker collected={collected} totalStations={totalStations} currentStation={stationIndex} />
          <div className={`glass-card rounded-2xl p-8 mt-5 animate-slide-up ${station.glowClass}`}>
            {/* Station icon & title */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${colors.bgSoft} border ${colors.border}/20 text-5xl mb-3 shadow-sm`}>
                {station.emoji}
              </div>
              <h2 className={`text-2xl font-black ${colors.accent} mb-1`}>
                תחנה {stationIndex + 1}: {station.title}
              </h2>
              {/* Progress bar */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {Array.from({ length: totalStations }).map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-500 ${
                    i === stationIndex ? `w-10 ${colors.bg}` : i < stationIndex ? "w-5 bg-primary/30" : "w-5 bg-muted/30"
                  }`} />
                ))}
              </div>
            </div>

            {/* Briefing message */}
            <div className="bg-muted/25 rounded-xl p-5 mb-6 border border-border/25">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-base border border-primary/20">👨‍🔬</div>
                <span className="text-xs text-muted-foreground font-bold">פרופסור דרור</span>
              </div>
              <p className="text-[13px] leading-[2] text-foreground/85 italic">
                ״{station.briefing}״
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => { playClick(); setPhase("challenge"); }}
                className={`bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-10 py-4 rounded-xl text-lg font-black hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20`}
              >
                🔍 התחילו לחקור
              </button>
              <div
                onClick={() => { playClick(); onOpenResearch(); }}
                className="glass-card rounded-xl px-5 py-3 cursor-pointer hover:scale-[1.03] transition-all border border-accent/15 hover:border-accent/30 group flex items-center gap-3"
              >
                <span className="text-lg">📚</span>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-accent">ארכיון המחקר</p>
                  <p className="text-[10px] text-muted-foreground">רמזים שיעזרו לכם בחידות</p>
                </div>
                <span className="text-accent/30 group-hover:text-accent text-sm mr-auto transition-colors">←</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEBRIEFING PHASE
  if (phase === "debriefing") {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-adventure stars-bg relative`}>
        <div className={`absolute inset-0 bg-gradient-to-b ${extraGradient} pointer-events-none`} />
        <div className="max-w-lg w-full relative z-10">
          <CodeTracker
            collected={{ ...collected, [stationIndex]: station.codeLetter }}
            totalStations={totalStations}
          />
          <div className={`glass-card rounded-2xl p-8 mt-5 animate-slide-up ${station.glowClass}`}>
            {/* Revealed letter */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-4xl mb-3 animate-reveal shadow-md shadow-primary/15">
                🔑
              </div>
              <h2 className={`text-2xl font-black ${colors.accent} mb-2`}>אות נחשפה!</h2>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary text-primary text-4xl font-black shadow-lg shadow-primary/25 animate-reveal">
                {station.codeLetter}
              </div>
            </div>

            {/* Achievement badge */}
            <div className="text-center mb-4">
              <span className={`inline-block ${colors.bgSoft} ${colors.accent} text-xs font-bold px-4 py-1.5 rounded-full border ${colors.border}/20`}>
                {correctCount === station.questions.length ? "🌟 מושלם! כל התשובות נכונות מהניסיון הראשון" : `✅ השלמתם ${correctCount}/${station.questions.length} מהניסיון הראשון`}
              </span>
            </div>

            {/* Debriefing */}
            <div className="bg-muted/25 rounded-xl p-5 mb-4 border border-border/25">
              <p className="text-[13px] leading-[2] text-foreground/85 italic">
                ״{station.debriefing}״
              </p>
            </div>

            {/* Fun fact */}
            <div className={`${colors.bgSoft} rounded-xl p-4 mb-6 border ${colors.border}/15`}>
              <p className="text-xs leading-relaxed">
                <span className="font-bold">💡 עובדה מעניינת: </span>
                <span className="text-foreground/80">{station.funFact}</span>
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => { playClick(); onComplete(station.codeLetter); }}
                className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-10 py-4 rounded-xl text-lg font-black hover:scale-105 transition-all duration-300 shadow-lg shadow-secondary/20"
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
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-adventure stars-bg relative`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${extraGradient} pointer-events-none`} />
      <div className="max-w-lg w-full relative z-10">
        <CodeTracker collected={collected} totalStations={totalStations} currentStation={stationIndex} />
        <div className={`glass-card rounded-2xl p-7 mt-5 ${station.glowClass}`}>
          {/* Header with station tag + dots */}
          <div className="flex justify-between items-center mb-5">
            <span className={`text-[11px] font-black ${colors.accent} ${colors.bgSoft} px-3 py-1.5 rounded-lg border ${colors.border}/20`}>
              {station.emoji} תחנה {stationIndex + 1} • חידה {current + 1}/{station.questions.length}
            </span>
            <div className="flex gap-2">
              {station.questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    i < current ? "bg-primary shadow-sm shadow-primary/30" : i === current ? `${colors.bg} scale-125 shadow-sm` : "bg-muted/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Narrative context */}
          <div className="bg-muted/20 rounded-xl p-4 mb-4 border border-border/15">
            <p className="text-xs text-muted-foreground/80 italic leading-[1.8]">{q.context}</p>
          </div>

          {/* Question */}
          <h2 className="text-base font-bold mb-5 text-right leading-[1.8]">{q.question}</h2>

          {/* Options */}
          <div className="space-y-2.5 mb-5">
            {q.options.map((option, i) => {
              let style = "bg-muted/30 hover:bg-muted/50 border-border/20";
              if (selected !== null) {
                if (i === q.correct) style = "bg-primary/12 border-primary/40 text-primary ring-1 ring-primary/25 shadow-sm shadow-primary/10";
                else if (i === selected) style = "bg-destructive/10 border-destructive/40 text-destructive ring-1 ring-destructive/25";
                else style = "bg-muted/15 opacity-35 border-transparent";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={`w-full text-right p-4 rounded-xl text-[13px] font-medium transition-all duration-300 border leading-relaxed ${style}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Hint button */}
          {!showRevelation && selected === null && q.hint && (
            <div className="text-center mb-4">
              {showHint ? (
                <div className="bg-accent/8 border border-accent/15 p-4 rounded-xl text-right animate-slide-up">
                  <p className="text-xs text-accent/80 leading-[1.8]">💡 {q.hint}</p>
                </div>
              ) : (
                <button
                  onClick={() => { playClick(); setShowHint(true); }}
                  className="text-accent/50 hover:text-accent text-xs transition-colors"
                >
                  💡 צריכים רמז?
                </button>
              )}
            </div>
          )}

          {/* Revelation on correct */}
          {showRevelation && (
            <div className="bg-primary/6 border border-primary/15 p-5 rounded-xl mb-5 text-right animate-reveal">
              <p className="text-[13px] text-foreground/85 leading-[1.9]">{q.revelation}</p>
            </div>
          )}

          {/* Error state */}
          {selected !== null && selected !== q.correct && (
            <div className="text-center animate-slide-up">
              <p className="text-destructive mb-3 text-sm font-bold">🔒 המנעול לא נפתח...</p>
              <p className="text-muted-foreground text-xs mb-4">נסו שוב! קראו את הרמזים בעיון.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { playClick(); handleRetry(); }}
                  className="bg-muted/60 text-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-muted transition-colors"
                >
                  🔄 ניסיון נוסף
                </button>
                {q.hint && !showHint && (
                  <button
                    onClick={() => { playClick(); setShowHint(true); }}
                    className="bg-accent/15 text-accent px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent/25 transition-colors border border-accent/15"
                  >
                    💡 רמז
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Next button on correct */}
          {showRevelation && (
            <div className="text-center">
              <button
                onClick={handleNext}
                className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-9 py-3.5 rounded-xl font-black hover:scale-105 transition-all duration-300 shadow-lg shadow-secondary/20"
              >
                {current < station.questions.length - 1 ? "➡️ לחידה הבאה" : "🔑 חשפו את האות!"}
              </button>
            </div>
          )}

          {/* Research center link */}
          {selected === null && (
            <div className="text-center mt-4">
              <button
                onClick={() => { playClick(); onOpenResearch(); }}
                className="text-accent/40 hover:text-accent/70 text-[11px] transition-colors"
              >
                📚 מרכז החקר
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeStation;
