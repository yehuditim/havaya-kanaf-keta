import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";
import NarrationPlayer from "./NarrationPlayer";

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

type Phase = "briefing" | "data" | "analyze" | "conclude" | "reward";

interface BirdData {
  id: string;
  name: string;
  emoji: string;
  species: string;
  gpsData: { date: string; location: string; speed: string; altitude: string; notes: string }[];
  status: "healthy" | "warning" | "danger";
  analysis: string;
}

const birdsData: BirdData[] = [
  {
    id: "stork-a",
    name: "חסידה א׳ — ״מרים״",
    emoji: "🐦",
    species: "חסידה לבנה",
    gpsData: [
      { date: "15.03", location: "אילת", speed: "45 קמ״ש", altitude: "1,200 מ׳", notes: "נחיתה לתדלוק" },
      { date: "17.03", location: "בית שאן", speed: "52 קמ״ש", altitude: "1,500 מ׳", notes: "המשך צפונה" },
      { date: "19.03", location: "לבנון", speed: "48 קמ״ש", altitude: "1,800 מ׳", notes: "חצתה את הגבול" },
      { date: "22.03", location: "טורקיה", speed: "50 קמ״ש", altitude: "2,000 מ׳", notes: "בדרך לאירופה" },
    ],
    status: "healthy",
    analysis: "מרים נודדת בקצב תקין, עוצרת לתדלוק כנדרש, וממשיכה בנתיב הקלאסי. הכל תקין!"
  },
  {
    id: "eagle-b",
    name: "נשר ב׳ — ״עוז״",
    emoji: "🦅",
    species: "נשר מקראי",
    gpsData: [
      { date: "10.03", location: "מכתש רמון", speed: "35 קמ״ש", altitude: "800 מ׳", notes: "טיסה רגילה" },
      { date: "12.03", location: "ים המלח", speed: "22 קמ״ש", altitude: "400 מ׳", notes: "⚠️ מהירות נמוכה" },
      { date: "14.03", location: "ים המלח", speed: "5 קמ״ש", altitude: "50 מ׳", notes: "⚠️ כמעט לא זז!" },
      { date: "16.03", location: "ים המלח", speed: "0 קמ״ש", altitude: "0 מ׳", notes: "🚨 נייח — חובה לבדוק!" },
    ],
    status: "danger",
    analysis: "עוז הפסיק לזוז! ירידה דרמטית במהירות ובגובה, ואז עצירה מוחלטת. זו התראה אדומה — ייתכן שנפגע מהתחשמלות או הרעלה. צריך לשלוח צוות חילוץ מיד!"
  },
  {
    id: "crane-c",
    name: "עגור ג׳ — ״נועם״",
    emoji: "🪿",
    species: "עגור אפור",
    gpsData: [
      { date: "01.02", location: "אגמון החולה", speed: "0 קמ״ש", altitude: "0 מ׳", notes: "חניית חורף" },
      { date: "15.02", location: "אגמון החולה", speed: "0 קמ״ש", altitude: "0 מ׳", notes: "עדיין בחולה" },
      { date: "28.02", location: "אגמון החולה", speed: "0 קמ״ש", altitude: "0 מ׳", notes: "מחכה לאביב" },
      { date: "10.03", location: "צפון ישראל", speed: "55 קמ״ש", altitude: "1,600 מ׳", notes: "יצא לנדידה!" },
    ],
    status: "healthy",
    analysis: "נועם חנה בחולה כל החורף (זה נורמלי לעגורים!) ויצא לנדידת האביב בזמן. הכל תקין!"
  },
];

const phaseVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};
const phaseTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

const Station6Analysis = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [expandedBird, setExpandedBird] = useState<string | null>(null);
  const [viewedBirds, setViewedBirds] = useState<Set<string>>(new Set());
  const [selectedDanger, setSelectedDanger] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [errors, setErrors] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [conclusionDone, setconclusionDone] = useState(false);

  const allViewed = viewedBirds.size === birdsData.length;
  const reward = getStationReward(5);

  const reasons = [
    { id: "poison", label: "הרעלה — אכל פגר מורעל", emoji: "☠️" },
    { id: "electric", label: "התחשמלות — נגע בעמוד חשמל", emoji: "⚡" },
    { id: "tired", label: "עייפות — פשוט נח קצת", emoji: "😴" },
    { id: "lost", label: "תעה — איבד את הדרך", emoji: "🧭" },
  ];

  const handleBirdClick = (id: string) => {
    playClick();
    setExpandedBird(expandedBird === id ? null : id);
    if (!viewedBirds.has(id)) {
      setViewedBirds(prev => new Set([...prev, id]));
    }
  };

  const handleDangerSubmit = () => {
    if (selectedDanger === "eagle-b") {
      playSuccess();
      setShowCorrectEffect(true);
      setTimeout(() => setPhase("conclude"), 800);
    } else {
      playError();
      setErrors(e => e + 1);
    }
  };

  const handleReasonSubmit = () => {
    // Both poison and electric are valid — real-world uncertainty!
    if (selectedReason === "poison" || selectedReason === "electric") {
      playReveal();
      setShowCorrectEffect(true);
      setconclusionDone(true);
      setTimeout(() => setPhase("reward"), 1200);
    } else {
      playError();
      setErrors(e => e + 1);
    }
  };

  const useHint = () => {
    setHintsUsed(h => h + 1);
    setShowHint(true);
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-station-5/5 via-background to-accent/5" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-4">
              <div className="glass-card rounded-2xl p-6 station-glow-5">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-center text-5xl mx-auto mb-3">📊</div>
                  <h2 className="text-2xl font-black text-accent">תחנה 6: חדר הניתוח</h2>
                  <p className="text-sm text-muted-foreground mt-1">ניתוח נתונים • הסקת מסקנות</p>
                </div>
                <NarrationPlayer
                  text="חוקרים, הגעתם לחדר הניתוח! כאן אנחנו מנתחים נתוני GPS ממשדרים שהתקנו על ציפורים. קיבלנו התראה שמשהו לא בסדר עם אחת הציפורים שלנו. תצטרכו לעבור על הנתונים של שלוש ציפורים, לזהות מי בסכנה, ולהסיק למה. זו משימה של חקירה אמיתית — בדיוק כמו שחוקרים עושים בשטח!"
                  className="mb-4"
                />
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => { playClick(); setPhase("data"); }} className="bg-gradient-to-l from-accent to-accent/80 text-accent-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-accent/20">
                    📡 לנתוני ה-GPS
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* DATA REVIEW */}
          {phase === "data" && (
            <motion.div key="data" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition}>
              <div className="glass-card rounded-2xl p-5 station-glow-5 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-accent bg-accent/10 px-3 py-1 rounded-lg border border-accent/20">📊 שלב 1: סקירת נתונים</span>
                  <span className="text-[10px] text-muted-foreground">{viewedBirds.size}/{birdsData.length}</span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full mb-3 overflow-hidden">
                  <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${(viewedBirds.size / birdsData.length) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground text-right mb-3">📋 לחצו על כל ציפור כדי לראות את נתוני ה-GPS שלה. <strong className="text-foreground">שימו לב לדפוסים חריגים!</strong></p>
                
                <div className="space-y-2">
                  {birdsData.map(bird => {
                    const viewed = viewedBirds.has(bird.id);
                    const expanded = expandedBird === bird.id;
                    return (
                      <div key={bird.id}>
                        <button
                          onClick={() => handleBirdClick(bird.id)}
                          className={`w-full text-right p-3 rounded-xl border transition-all ${
                            expanded
                              ? "bg-accent/10 border-accent/30"
                              : viewed
                                ? "bg-muted/20 border-border/30"
                                : "bg-muted/10 border-border/20 hover:border-accent/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{bird.emoji}</span>
                            <div className="flex-1">
                              <p className="font-bold text-sm">{bird.name}</p>
                              <p className="text-xs text-muted-foreground">{bird.species}</p>
                            </div>
                            {viewed && <span className="text-primary text-xs">✓ נבדק</span>}
                          </div>
                        </button>
                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 bg-muted/10 rounded-b-xl border-x border-b border-border/15 mt-[-4px]">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-muted-foreground">
                                      <th className="text-right pb-2">תאריך</th>
                                      <th className="text-right pb-2">מיקום</th>
                                      <th className="text-right pb-2">מהירות</th>
                                      <th className="text-right pb-2">גובה</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {bird.gpsData.map((row, i) => (
                                      <tr key={i} className={row.notes.includes("⚠️") || row.notes.includes("🚨") ? "text-destructive font-bold" : ""}>
                                        <td className="py-1">{row.date}</td>
                                        <td className="py-1">{row.location}</td>
                                        <td className="py-1">{row.speed}</td>
                                        <td className="py-1">{row.altitude}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="mt-2 pt-2 border-t border-border/15">
                                  <p className="text-[10px] text-muted-foreground">
                                    {bird.gpsData.map(d => d.notes).filter(n => n).join(" → ")}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
              {allViewed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-accent mb-2">📊 כל הנתונים נבדקו!</p>
                  <p className="text-xs text-muted-foreground mb-3">עכשיו הגיע הזמן לנתח — איזו ציפור בסכנה?</p>
                  <button onClick={() => { playClick(); setPhase("analyze"); }} className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🔍 לניתוח
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ANALYZE */}
          {phase === "analyze" && (
            <motion.div key="analyze" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-5">
                <p className="text-xs font-black text-accent mb-3">🔍 שלב 2: זיהוי הציפור בסכנה</p>
                <p className="text-[11px] text-muted-foreground text-right mb-4">
                  על בסיס הנתונים שראיתם — <strong className="text-foreground">איזו ציפור נמצאת בסכנה ודורשת התערבות מיידית?</strong>
                </p>
                
                <div className="space-y-2 mb-4">
                  {birdsData.map(bird => (
                    <button
                      key={bird.id}
                      onClick={() => { playClick(); setSelectedDanger(bird.id); }}
                      className={`w-full text-right p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        selectedDanger === bird.id
                          ? "bg-destructive/10 border-destructive/40"
                          : "bg-muted/10 border-border/20 hover:border-destructive/30"
                      }`}
                    >
                      <span className="text-xl">{bird.emoji}</span>
                      <span className="font-bold text-sm flex-1">{bird.name}</span>
                      {selectedDanger === bird.id && <span className="text-destructive">🚨</span>}
                    </button>
                  ))}
                </div>

                {!showHint && (
                  <button onClick={useHint} className="text-[10px] text-muted-foreground hover:text-accent transition-colors underline mb-3 block">
                    💡 צריכים רמז?
                  </button>
                )}
                {showHint && (
                  <div className="bg-accent/5 border border-accent/15 rounded-lg p-2 mb-3">
                    <p className="text-[10px] text-accent">💡 חפשו ציפור שהמהירות והגובה שלה יורדים בצורה דרמטית ובסוף נעצרים לגמרי. זה לא נורמלי!</p>
                  </div>
                )}

                {selectedDanger && (
                  <button onClick={handleDangerSubmit} className="w-full bg-gradient-to-l from-destructive to-destructive/80 text-destructive-foreground px-6 py-3 rounded-xl font-black hover:scale-[1.02] transition-all">
                    🚨 זו הציפור בסכנה!
                  </button>
                )}

                {errors > 0 && (
                  <p className="text-[10px] text-destructive/70 text-center mt-2">
                    לא מדויק — בדקו שוב את הנתונים. חפשו דפוס חריג!
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* CONCLUDE */}
          {phase === "conclude" && (
            <motion.div key="conclude" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-5">
                <p className="text-xs font-black text-primary mb-3">✅ נכון! עוז הנשר בסכנה!</p>
                <p className="text-[11px] text-muted-foreground text-right mb-4">
                  זיהיתם נכון! עכשיו <strong className="text-foreground">הסיקו — מה לדעתכם קרה לעוז?</strong> זכרו: נשרים אוכלים פגרים, ולפעמים מתיישבים על עמודי חשמל גבוהים...
                </p>
                
                <div className="space-y-2 mb-4">
                  {reasons.map(reason => (
                    <button
                      key={reason.id}
                      onClick={() => { playClick(); setSelectedReason(reason.id); }}
                      className={`w-full text-right p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        selectedReason === reason.id
                          ? "bg-primary/10 border-primary/40"
                          : "bg-muted/10 border-border/20 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-xl">{reason.emoji}</span>
                      <span className="font-bold text-sm flex-1">{reason.label}</span>
                    </button>
                  ))}
                </div>

                {selectedReason && (
                  <button onClick={handleReasonSubmit} className="w-full bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-6 py-3 rounded-xl font-black hover:scale-[1.02] transition-all">
                    ✓ זו ההסקה שלי
                  </button>
                )}

                {errors > 1 && (
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    חשבו — מה יכול לגרום לנשר להפסיק לזוז פתאום? מה האיומים שלמדתם עליהם?
                  </p>
                )}
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
                <span className="text-3xl font-black text-primary">ם</span>
              </motion.div>
              <div className="bg-muted/25 rounded-xl p-4 mb-5 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״מדהים! הוכחתם יכולת ניתוח מעולה. בזיהוי מהיר כזה, צוות השטח יכול להגיע לעוז בזמן ולהציל אותו. זו בדיוק העבודה של חוקרי טבע אמיתיים!״
                </p>
              </div>
              <button onClick={() => onComplete("ם", errors, hintsUsed)} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-secondary/20">
                ➡️ חזרה למפה
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Station6Analysis;
