import { useState } from "react";
import hulaBg from "../../assets/backgrounds/hula-wetlands.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";

/**
 * Station 2: Hula Valley — "Field Station Investigation"
 */

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

interface Hotspot {
  id: string;
  x: string;
  y: string;
  emoji: string;
  label: string;
  clue: string;
  detail: string;
}

const hotspots: Hotspot[] = [
  { id: "binoculars", x: "15%", y: "25%", emoji: "🔭", label: "עמדת תצפית", clue: "מהחלון נראות להקות ענקיות של עופות אפורים גדולים שרוקדים בשדות", detail: "עגורים אפורים — עד 40,000 חונים בחולה בחורף!" },
  { id: "screen", x: "70%", y: "20%", emoji: "🖥️", label: "מסך נתונים", clue: "המסך מציג: ״חצי מיליארד ציפורים בשנה עוברות דרך עמק החולה״", detail: "אגמון החולה — תחנת תדלוק בינלאומית קריטית" },
  { id: "notebook", x: "45%", y: "55%", emoji: "📓", label: "יומן שדה", clue: "היומן פתוח על עמוד: ״85% מחסידות מזרח אירופה — כחצי מיליון — עוברות דרך ישראל!״", detail: "חסידה אחת עם GPS תועדה טסה 11,000 ק״מ ברצף" },
  { id: "map", x: "80%", y: "60%", emoji: "🗺️", label: "מפת ביצות", clue: "המפה מראה: ביצות, שדות חקלאיים ובריכות דגים — מקורות מזון ומנוחה", detail: "שילוב מים, מזון ושטחים פתוחים הופך את החולה למושלם" },
  { id: "feather", x: "30%", y: "75%", emoji: "🔬", label: "נוצה על השולחן", clue: "נוצה אפורה ענקית — שייכת לעגור. ציפור שידועה בריקודי חיזור מרהיבים", detail: "העגור האפור — אחד העופות המרשימים בטבע" },
];

type Phase = "briefing" | "investigate" | "riddle" | "reward";

interface Riddle {
  question: string;
  options: string[];
  correct: number;
  revelation: string;
}

const riddles: Riddle[] = [
  {
    question: "על סמך הרמזים שגיליתם — למה אגמון החולה כל כך חשוב לציפורים נודדות?",
    options: [
      "כי שם יש חוקרים שמאכילים ציפורים",
      "כי הוא תחנת תדלוק קריטית — מים, מזון ומנוחה אחרי טיסה של אלפי ק״מ",
      "כי הטמפרטורה שם תמיד מושלמת",
      "כי הוא המקום היחיד עם עצים בישראל",
    ],
    correct: 1,
    revelation: "🌿 נכון! אגמון החולה מספק בדיוק מה שציפור עייפה צריכה — מים, מזון ושקט. בלי תחנות תדלוק כאלה, נדידה בלתי אפשרית.",
  },
  {
    question: "איזו ציפור מגיעה לחולה בעשרות אלפים כל חורף ורוקדת ריקודי חיזור?",
    options: [
      "חסידה לבנה",
      "עגור אפור — הרקדן הגדול",
      "שקנאי לבן",
      "נשר מקראי",
    ],
    correct: 1,
    revelation: "🕊️ מצוין! העגור האפור — אחד העופות המרשימים בטבע. עד 40,000 עגורים חונים בחולה כל חורף!",
  },
];

const Station2Hula = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [discoveredHotspots, setDiscoveredHotspots] = useState<Set<string>>(new Set());
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [riddleAnswer, setRiddleAnswer] = useState<number | null>(null);
  const [riddleErrors, setRiddleErrors] = useState(0);

  const allDiscovered = discoveredHotspots.size === hotspots.length;
  const reward = getStationReward(1);

  const handleHotspotClick = (id: string) => {
    playClick();
    setActiveHotspot(activeHotspot === id ? null : id);
    if (!discoveredHotspots.has(id)) {
      playSuccess();
      setDiscoveredHotspots(prev => new Set([...prev, id]));
    }
  };

  const handleRiddleAnswer = (index: number) => {
    const riddle = riddles[riddleIndex];
    setRiddleAnswer(index);
    if (index === riddle.correct) {
      playSuccess();
    } else {
      playError();
      setRiddleErrors(e => e + 1);
    }
  };

  const handleNextRiddle = () => {
    playClick();
    if (riddleIndex < riddles.length - 1) {
      setRiddleIndex(i => i + 1);
      setRiddleAnswer(null);
    } else {
      playReveal();
      setPhase("reward");
    }
  };

  const handleRetryRiddle = () => {
    playClick();
    setRiddleAnswer(null);
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${hulaBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-0 bg-background/75 backdrop-blur-[2px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10">
        {/* Navigation */}
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card rounded-2xl p-6 station-glow-1">
              <div className="text-center mb-5">
                <div className="w-20 h-20 rounded-2xl bg-station-1/10 border border-station-1/25 flex items-center justify-center text-5xl mx-auto mb-3">🌿</div>
                <h2 className="text-2xl font-black text-station-1">תחנה 2: אגמון החולה</h2>
                <p className="text-sm text-muted-foreground mt-1">תחנת התצפית • חקירת שטח</p>
              </div>
              <div className="bg-muted/25 rounded-xl p-4 mb-5 border border-border/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👨‍🔬</span>
                  <span className="text-xs font-bold text-muted-foreground">פרופסור דרור</span>
                </div>
                <p className="text-[13px] leading-[2] text-foreground/85 italic text-right">
                  ״הגעתם לצפון — לאגמון החולה! הפורץ הצליח לסגור את כל המסכים בתחנת התצפית.
                  חפשו 5 רמזים חבויים בתחנה, קראו אותם בעיון, ואז תצטרכו לענות על שאלות חקירה.
                  כל רמז חשוב!״
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button onClick={() => { playClick(); setPhase("investigate"); }} className="bg-gradient-to-l from-station-1 to-station-1/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-1/20">
                  🔍 היכנסו לתחנה
                </button>
                <button onClick={() => { playClick(); onOpenResearch(); }} className="text-accent/60 text-xs hover:text-accent transition-colors">
                  📚 בדקו בארכיון המחקר קודם
                </button>
              </div>
            </motion.div>
          )}

          {/* INVESTIGATE */}
          {phase === "investigate" && (
            <motion.div key="investigate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-1 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-station-1 bg-station-1/10 px-3 py-1 rounded-lg border border-station-1/20">🌿 חקירת שטח</span>
                  <span className="text-[10px] text-muted-foreground">נמצאו {discoveredHotspots.size}/{hotspots.length} רמזים</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-muted/30 rounded-full mb-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-station-1 rounded-full"
                    animate={{ width: `${(discoveredHotspots.size / hotspots.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <p className="text-xs text-muted-foreground text-right mb-3">
                  🔍 לחצו על האלמנטים בתחנה כדי לחשוף רמזים
                </p>

                {/* Scene with hotspots */}
                <div className="relative bg-muted/15 rounded-xl border border-border/20 h-64 overflow-hidden">
                  {/* Background scene elements */}
                  <div className="absolute inset-0 opacity-[0.06]">
                    <div className="absolute top-[5%] left-[30%] text-7xl">🌿</div>
                    <div className="absolute bottom-[5%] right-[20%] text-6xl">🌾</div>
                    <div className="absolute top-[40%] left-[60%] text-5xl">💧</div>
                  </div>

                  {hotspots.map(hotspot => {
                    const discovered = discoveredHotspots.has(hotspot.id);
                    return (
                      <motion.button
                        key={hotspot.id}
                        onClick={() => handleHotspotClick(hotspot.id)}
                        className={`absolute z-10 transition-all duration-300 ${
                          discovered ? "" : "animate-pulse-glow"
                        }`}
                        style={{ left: hotspot.x, top: hotspot.y, transform: "translate(-50%, -50%)" }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border-2 ${
                          discovered
                            ? "bg-station-1/15 border-station-1/40 shadow-sm shadow-station-1/20"
                            : "bg-muted/40 border-primary/30 hover:border-primary shadow-md"
                        }`}>
                          {hotspot.emoji}
                        </div>
                        <span className={`text-[8px] font-bold block mt-0.5 text-center ${discovered ? "text-station-1/70" : "text-foreground/50"}`}>
                          {hotspot.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Active clue panel */}
                <AnimatePresence>
                  {activeHotspot && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 bg-station-1/8 border border-station-1/20 rounded-xl p-4 text-right"
                    >
                      {(() => {
                        const hs = hotspots.find(h => h.id === activeHotspot)!;
                        return (
                          <>
                            <p className="text-xs font-bold text-station-1 mb-1">{hs.emoji} {hs.label}</p>
                            <p className="text-[12px] leading-[1.8] text-foreground/80 mb-1">״{hs.clue}״</p>
                            <p className="text-[10px] text-muted-foreground italic">{hs.detail}</p>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {allDiscovered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-station-1 mb-2">🔓 כל הרמזים נחשפו!</p>
                  <p className="text-xs text-muted-foreground mb-3">עכשיו השתמשו במה שגיליתם כדי לענות על שאלות החקירה</p>
                  <button onClick={() => { playClick(); setPhase("riddle"); setActiveHotspot(null); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🧩 לשאלות החקירה
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* RIDDLE */}
          {phase === "riddle" && (
            <motion.div key="riddle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-station-1 bg-station-1/10 px-3 py-1 rounded-lg border border-station-1/20">🌿 שאלת חקירה {riddleIndex + 1}/{riddles.length}</span>
                </div>

                <h3 className="text-sm font-bold text-right mb-4 leading-[1.8]">{riddles[riddleIndex].question}</h3>

                <div className="space-y-2 mb-4">
                  {riddles[riddleIndex].options.map((opt, i) => {
                    let style = "bg-muted/30 border-border/20 hover:border-station-1/30";
                    if (riddleAnswer !== null) {
                      if (i === riddles[riddleIndex].correct) style = "bg-primary/10 border-primary/40 ring-1 ring-primary/25";
                      else if (i === riddleAnswer) style = "bg-destructive/10 border-destructive/40";
                      else style = "bg-muted/15 opacity-30 border-transparent";
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => riddleAnswer === null && handleRiddleAnswer(i)}
                        className={`w-full text-right p-3 rounded-xl text-xs font-medium border transition-all leading-relaxed ${style}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {riddleAnswer !== null && riddleAnswer === riddles[riddleIndex].correct && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/8 border border-primary/15 rounded-xl p-4 mb-4 text-right">
                    <p className="text-xs leading-[1.8] text-foreground/85">{riddles[riddleIndex].revelation}</p>
                  </motion.div>
                )}

                {riddleAnswer !== null && riddleAnswer !== riddles[riddleIndex].correct && (
                  <div className="text-center">
                    <p className="text-xs text-destructive mb-2">🔒 לא בדיוק... חשבו על הרמזים שגיליתם!</p>
                    <button onClick={handleRetryRiddle} className="bg-muted/50 px-5 py-2 rounded-xl text-xs font-bold hover:bg-muted transition-colors">🔄 נסו שוב</button>
                  </div>
                )}

                {riddleAnswer === riddles[riddleIndex].correct && (
                  <div className="text-center">
                    <button onClick={handleNextRiddle} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                      {riddleIndex < riddles.length - 1 ? "➡️ שאלה הבאה" : "🔑 חשפו את הפריט!"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 station-glow-1 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-5xl mx-auto shadow-xl shadow-primary/20">
                  {reward?.emoji}
                </div>
              </motion.div>
              <h2 className="text-xl font-black text-primary mb-1">פריט התגלה!</h2>
              <p className="text-sm font-bold text-foreground/80 mb-1">{reward?.name}</p>
              <p className="text-xs text-muted-foreground mb-4">{reward?.description}</p>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary rounded-xl px-5 py-3 mb-4">
                <span className="text-xs text-muted-foreground">אות נחשפה:</span>
                <span className="text-3xl font-black text-primary">ד</span>
              </motion.div>

              <div className="bg-muted/25 rounded-xl p-4 mb-5 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״נפלא! פתחתם את תחנת התצפית של החולה. עמק הזה הוא בית מלון עולמי — חצי מיליארד אורחים בשנה!״
                </p>
              </div>

              <button onClick={() => onComplete("ד")} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-secondary/20">
                ➡️ חזרה למפה
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Station2Hula;
