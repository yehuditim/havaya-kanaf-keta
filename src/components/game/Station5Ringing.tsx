import { useState } from "react";
import ringingBg from "../../assets/backgrounds/ringing-station.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";
import NarrationPlayer from "./NarrationPlayer";
import CodeLock from "./CodeLock";

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

type Phase = "briefing" | "investigate" | "calculate" | "lock" | "reward";

const phaseVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};
const phaseTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

const logEntries = [
  { id: "ring", label: "מספר טבעת", value: "SA-1985", emoji: "🏷️" },
  { id: "species", label: "מין", value: "עקב מזרחי (Aquila nipalensis)", emoji: "🦅" },
  { id: "route", label: "מסלול", value: "אילת → דרום אפריקה", emoji: "🗺️" },
  { id: "distance", label: "מרחק קו אווירי", value: "7,150 ק״מ", emoji: "📏" },
  { id: "speed", label: "מהירות טיסה ממוצעת", value: "50 קמ״ש", emoji: "⚡" },
];

const Station5Ringing = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [revealedEntries, setRevealedEntries] = useState<Set<string>>(new Set());
  const [calcAnswer, setCalcAnswer] = useState("");
  const [calcError, setCalcError] = useState(false);
  const [calcDone, setCalcDone] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showCalcHint, setShowCalcHint] = useState(false);

  const reward = getStationReward(4);
  const allRevealed = revealedEntries.size === logEntries.length;

  const handleRevealEntry = (id: string) => {
    playClick();
    setRevealedEntries(prev => new Set([...prev, id]));
  };

  const handleCalcSubmit = () => {
    const trimmed = calcAnswer.trim();
    if (trimmed === "143") {
      playSuccess();
      setCalcDone(true);
      setShowCorrectEffect(true);
    } else {
      playError();
      setCalcError(true);
      setMistakes(m => m + 1);
      if (mistakes >= 1) setShowCalcHint(true);
      setTimeout(() => setCalcError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${ringingBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/60 via-background/40 to-background/70 backdrop-blur-[1px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10 mt-12 sm:mt-0">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-4">
              <div className="glass-card rounded-2xl p-6 station-glow-5">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-station-5/10 border border-station-5/25 flex items-center justify-center text-5xl mx-auto mb-3">🏷️</div>
                  <h2 className="text-2xl font-black text-station-5">תחנה 5: מרכז הטיבוע</h2>
                  <p className="text-sm text-muted-foreground mt-1">תחנת מעקב • חישוב מדעי</p>
                </div>

                <NarrationPlayer
                  text="הגעתם למרכז הבקרה של תחנת הטיבוע. כאן מתעדים כל ציפור שנתפסה, נמדדה וקיבלה טבעת זיהוי. ביומן התחנה הישן מצאנו תיעוד מרתק של עקב מזרחי נודד. המשימה שלכם: לפענח את נתוני הטיסה ולחשב את קוד היציאה מהתחנה!"
                  className="mb-4"
                />

                <div className="bg-accent/5 rounded-lg p-3 border border-accent/15 text-right mb-4">
                  <p className="text-[11px] text-accent/80">📖 <strong>טיפ:</strong> קראו על טיבוע ציפורים ב<a href="https://he.wikipedia.org/wiki/%D7%98%D7%99%D7%91%D7%95%D7%A2_%D7%A6%D7%99%D7%A4%D7%95%D7%A8%D7%99%D7%9D" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/70">ויקיפדיה</a> או בארכיון המחקר</p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => { playClick(); setPhase("investigate"); }} className="bg-gradient-to-l from-station-5 to-station-5/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-5/20">
                    📋 לפתיחת היומן
                  </button>
                  <button onClick={() => { playClick(); onOpenResearch(); }} className="text-accent/60 text-xs hover:text-accent transition-colors">
                    📚 פתחו את ארכיון המחקר
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* INVESTIGATE — reveal log entries */}
          {phase === "investigate" && (
            <motion.div key="investigate" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-5">
                <p className="text-xs font-black text-station-5 mb-3">📋 שלב 1: יומן התחנה</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  לחצו על כל שורה ביומן כדי לחשוף את הנתונים. <strong className="text-foreground">שימו לב לכל פרט — תצטרכו אותם לחישוב!</strong>
                </p>

                <div className="space-y-2 mb-4">
                  {logEntries.map((entry) => {
                    const revealed = revealedEntries.has(entry.id);
                    return (
                      <motion.button
                        key={entry.id}
                        onClick={() => handleRevealEntry(entry.id)}
                        disabled={revealed}
                        layout
                        className={`w-full text-right p-3 rounded-xl border-2 transition-all ${
                          revealed
                            ? "bg-station-5/5 border-station-5/20"
                            : "bg-muted/30 border-border/25 hover:border-station-5/40 hover:bg-station-5/5 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{revealed ? entry.emoji : "❓"}</span>
                          <div className="text-right flex-1 mr-3">
                            <span className="text-[11px] font-bold text-muted-foreground">{entry.label}</span>
                            {revealed ? (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-black text-foreground"
                              >
                                {entry.value}
                              </motion.p>
                            ) : (
                              <p className="text-sm text-muted-foreground/40">לחצו לחשיפה...</p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {allRevealed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <p className="text-xs text-primary mb-3">✅ כל הנתונים נחשפו! עכשיו — לחישוב</p>
                    <button onClick={() => { playClick(); setPhase("calculate"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                      🧮 למשימת החישוב
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* CALCULATE */}
          {phase === "calculate" && (
            <motion.div key="calculate" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-5">
                <p className="text-xs font-black text-station-5 mb-3">🧮 שלב 2: חישוב מדעי</p>

                <div className="bg-muted/20 rounded-xl p-4 border border-border/20 mb-4 text-right space-y-2">
                  <p className="text-xs text-foreground/80">
                    🦅 <strong>העקב המזרחי SA-1985</strong> טס מאילת לדרום אפריקה
                  </p>
                  <p className="text-xs text-foreground/80">
                    📏 <strong>מרחק:</strong> 7,150 ק״מ בקו אווירי
                  </p>
                  <p className="text-xs text-foreground/80">
                    ⚡ <strong>מהירות טיסה ממוצעת:</strong> 50 קמ״ש
                  </p>
                  <div className="border-t border-border/20 pt-2 mt-2">
                    <p className="text-sm font-black text-station-5">
                      ❓ כמה שעות טיסה נטו נדרשו לעקב כדי להשלים את המסע?
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      💡 חלקו את המרחק הכולל במהירות הטיסה
                    </p>
                  </div>
                </div>

                {!calcDone ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 justify-center">
                      <span className="text-xs text-muted-foreground">התשובה:</span>
                      <input
                        type="text"
                        value={calcAnswer}
                        onChange={e => setCalcAnswer(e.target.value)}
                        placeholder="?"
                        className={`w-24 text-center text-xl font-black bg-background/80 border-2 rounded-xl py-2 px-3 transition-colors ${
                          calcError ? "border-destructive text-destructive" : "border-border/40 text-foreground"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">שעות</span>
                    </div>
                    <button
                      onClick={handleCalcSubmit}
                      className="bg-station-5/15 text-station-5 px-6 py-2 rounded-xl text-xs font-bold hover:bg-station-5/25 transition-colors border border-station-5/20"
                    >
                      ✅ בדקו תשובה
                    </button>
                    {calcError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-destructive">
                        ❌ לא מדויק — נסו שוב! ({mistakes} ניסיונות)
                      </motion.p>
                    )}
                    {showCalcHint && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-accent text-center">
                        💡 רמז מהמכ״ם: 7,150 ÷ 50 = ?
                      </motion.p>
                    )}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
                    <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
                      <p className="text-sm font-black text-primary">✅ נכון! 143 שעות טיסה נטו!</p>
                      <p className="text-[10px] text-muted-foreground mt-1">7,150 ÷ 50 = 143 — זהו הקוד למנעול היציאה</p>
                    </div>
                    <button onClick={() => { playClick(); setPhase("lock"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                      🔒 למנעול הקוד
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* LOCK PHASE */}
          {phase === "lock" && (
            <motion.div key="lock" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-5">
                <p className="text-xs font-black text-station-5 mb-3">🔒 שלב 3: מנעול יציאה</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  הכניסו את <strong className="text-foreground">מספר שעות הטיסה נטו</strong> שחישבתם כדי לפתוח את דלת היציאה!
                </p>
                <CodeLock
                  correctCode="143"
                  label="🔒 מנעול תחנת הטיבוע"
                  hint="7,150 ÷ 50 = ?"
                  onUnlock={() => { setShowCorrectEffect(true); playReveal(); setTimeout(() => setPhase("reward"), 1200); }}
                />
              </div>
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="glass-card rounded-2xl p-6 station-glow-5 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-5xl mx-auto shadow-xl shadow-primary/20">{reward?.emoji}</div>
              </motion.div>
              <h2 className="text-xl font-black text-primary mb-1">פריט התגלה!</h2>
              <p className="text-sm font-bold text-foreground/80 mb-1">{reward?.name}</p>
              <p className="text-xs text-muted-foreground mb-4">{reward?.description}</p>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary rounded-xl px-5 py-3 mb-4">
                <span className="text-xs text-muted-foreground">אות נחשפה:</span>
                <span className="text-3xl font-black text-primary">י</span>
              </motion.div>
              <div className="bg-muted/25 rounded-xl p-4 mb-5 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״מדהים! חישבתם את זמן הטיסה של העקב המזרחי. 143 שעות נטו באוויר — בלי לישון, בלי לאכול. תחנות הטיבוע עוזרות לנו לעקוב אחרי הנדידות האלה ולהגן על הציפורים!״
                </p>
              </div>
              <button onClick={() => onComplete("י", mistakes, hintsUsed)} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-secondary/20">
                ➡️ חזרה למפה
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Station5Ringing;
