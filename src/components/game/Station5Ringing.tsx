import { useState } from "react";
import ringingBg from "../../assets/backgrounds/ringing-station.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";
import NarrationPlayer from "./NarrationPlayer";
import CodeLock from "./CodeLock";
import SceneExplorer, { type SceneHotspot } from "./SceneExplorer";

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

type Phase = "briefing" | "explore" | "calculate" | "lock" | "reward";

const sceneHotspots: SceneHotspot[] = [
  { id: "ring", x: "30%", y: "50%", emoji: "🏷️", label: "טבעת זיהוי", clue: "טבעת אלומיניום חרוטה: SA-1985. זו הטבעת של העקב המזרחי!", detail: "כל טבעת מספרה ייחודי — כמו תעודת זהות" },
  { id: "species", x: "65%", y: "30%", emoji: "🦅", label: "פוסטר זיהוי", clue: "על הקיר: תמונה של עקב מזרחי (Aquila nipalensis) — דורס גדול ומרשים!", detail: "העקב המזרחי נודד אלפי קילומטרים כל שנה" },
  { id: "route", x: "78%", y: "55%", emoji: "🗺️", label: "מפת מסלול", clue: "מפה עם חץ: אילת ← דרום אפריקה. מסע של אלפי קילומטרים!", detail: "המסלול: מאילת דרך מזרח אפריקה עד לדרום היבשת" },
  { id: "distance", x: "20%", y: "25%", emoji: "📏", label: "מד מרחק", clue: "לוח נתונים: מרחק קו אווירי — 7,150 ק״מ! מספר עצום.", detail: "7,150 ק״מ — זכרו את המספר הזה!" },
  { id: "speed", x: "50%", y: "75%", emoji: "⚡", label: "מד מהירות", clue: "מהירות טיסה ממוצעת של העקב: 50 קמ״ש. לא מהר, אבל בלי הפסקה!", detail: "50 קמ״ש — גם את המספר הזה תצטרכו" },
];

const phaseVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};
const phaseTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

const Station5Ringing = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [sceneComplete, setSceneComplete] = useState(false);
  const [calcAnswer, setCalcAnswer] = useState("");
  const [calcError, setCalcError] = useState(false);
  const [calcDone, setCalcDone] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showCalcHint, setShowCalcHint] = useState(false);

  const reward = getStationReward(4);

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
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/30 to-background/60 backdrop-blur-[1px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10 mt-12 sm:mt-0">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-4">
              <div className="glass-card-immersive rounded-2xl p-5 station-glow-5">
                <div className="text-center mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-station-5/10 border border-station-5/25 flex items-center justify-center text-4xl mx-auto mb-2">🏷️</div>
                  <h2 className="text-xl font-black text-station-5">תחנה 5: מרכז הטיבוע</h2>
                  <p className="text-[11px] text-muted-foreground mt-1">תחנת מעקב • חישוב מדעי</p>
                </div>

                <NarrationPlayer
                  text="הגעתם למרכז הטיבוע! סרקו את התחנה, גלו את נתוני הטיסה של העקב המזרחי, ואז — חשבו את זמן הטיסה כדי לפתוח את המנעול!"
                  className="mb-3"
                />

                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => { playClick(); setPhase("explore"); }} className="bg-gradient-to-l from-station-5 to-station-5/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-5/20">
                    🔍 סרקו את תחנת הטיבוע
                  </button>
                  <button onClick={() => { playClick(); onOpenResearch(); }} className="text-accent/60 text-xs hover:text-accent transition-colors">
                    📚 פתחו את ארכיון המחקר
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* EXPLORE SCENE */}
          {phase === "explore" && (
            <motion.div key="explore" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <SceneExplorer
                hotspots={sceneHotspots}
                instruction="🔍 חפשו 5 פריטים בתחנת הטיבוע — אספו את כל נתוני הטיסה!"
                onAllDiscovered={() => setSceneComplete(true)}
              />
              {sceneComplete && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <p className="text-xs text-primary mb-2">✅ אספתם את כל הנתונים! עכשיו — חישוב</p>
                  <button onClick={() => { playClick(); setPhase("calculate"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🧮 למשימת החישוב
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* CALCULATE */}
          {phase === "calculate" && (
            <motion.div key="calculate" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card-immersive rounded-2xl p-4 station-glow-5">
                <p className="text-xs font-black text-station-5 mb-2">🧮 שלב 2: חישוב מדעי</p>

                <div className="bg-background/30 backdrop-blur-sm rounded-xl p-3 border border-border/20 mb-4 text-right space-y-2">
                  <p className="text-xs text-foreground/80">
                    🦅 <strong>העקב SA-1985</strong> — מאילת לדרום אפריקה
                  </p>
                  <p className="text-xs text-foreground/80">
                    📏 <strong>מרחק:</strong> 7,150 ק״מ &nbsp; ⚡ <strong>מהירות:</strong> 50 קמ״ש
                  </p>
                  <div className="border-t border-border/20 pt-2 mt-2">
                    <p className="text-sm font-black text-station-5">
                      ❓ כמה שעות טיסה נטו נדרשו?
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      💡 חלקו מרחק ÷ מהירות
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
                        className={`w-24 text-center text-xl font-black bg-background/50 border-2 rounded-xl py-2 px-3 transition-colors ${
                          calcError ? "border-destructive text-destructive" : "border-border/40 text-foreground"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">שעות</span>
                    </div>
                    <button onClick={handleCalcSubmit} className="bg-station-5/15 text-station-5 px-6 py-2 rounded-xl text-xs font-bold hover:bg-station-5/25 transition-colors border border-station-5/20">
                      ✅ בדקו תשובה
                    </button>
                    {calcError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-destructive">
                        ❌ לא מדויק — נסו שוב! ({mistakes} ניסיונות)
                      </motion.p>
                    )}
                    {showCalcHint && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-accent text-center">
                        💡 חשבו על הנוסחה: מרחק חלקי מהירות. מצאתם את שני המספרים בסצנה — עכשיו חשבו!
                      </motion.p>
                    )}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
                    <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
                      <p className="text-sm font-black text-primary">✅ נכון! 143 שעות!</p>
                      <p className="text-[10px] text-muted-foreground mt-1">7,150 ÷ 50 = 143 — זה הקוד!</p>
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
              <div className="glass-card-immersive rounded-2xl p-4 station-glow-5">
                <p className="text-xs font-black text-station-5 mb-2">🔒 שלב 3: מנעול יציאה</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  הכניסו את <strong className="text-foreground">שעות הטיסה</strong> שחישבתם!
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
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="glass-card-immersive rounded-2xl p-5 station-glow-5 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-4xl mx-auto shadow-xl shadow-primary/20">{reward?.emoji}</div>
              </motion.div>
              <h2 className="text-lg font-black text-primary mb-1">פריט התגלה!</h2>
              <p className="text-sm font-bold text-foreground/80 mb-1">{reward?.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{reward?.description}</p>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary rounded-xl px-5 py-3 mb-3">
                <span className="text-xs text-muted-foreground">אות נחשפה:</span>
                <span className="text-3xl font-black text-primary">י</span>
              </motion.div>
              <div className="bg-background/30 backdrop-blur-sm rounded-xl p-3 mb-4 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״מדהים! 143 שעות נטו באוויר — בלי לישון, בלי לאכול. תחנות הטיבוע עוזרות לנו לעקוב אחרי הנדידות ולהגן על הציפורים!״
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
