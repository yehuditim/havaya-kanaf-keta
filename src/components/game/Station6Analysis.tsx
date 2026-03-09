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

type Phase = "briefing" | "treaties" | "dilemma" | "summit" | "reward";

interface TreatyCard {
  id: string;
  name: string;
  emoji: string;
  description: string;
  matchId: string;
}

interface RoleCard {
  id: string;
  label: string;
}

const treaties: TreatyCard[] = [
  { id: "aewa", name: "AEWA", emoji: "🌍", description: "הסכם לשימור ציפורי מים נודדות באפריקה-אירואסיה", matchId: "waterbirds" },
  { id: "cms", name: "CMS / אמנת בון", emoji: "📜", description: "אמנה בין-לאומית לשמירה על בעלי חיים נודדים", matchId: "migratory" },
  { id: "ramsar", name: "אמנת רמסר", emoji: "💧", description: "הגנה על אתרי ביצות וחבלי מים בעלי חשיבות בין-לאומית", matchId: "wetlands" },
  { id: "birdlife", name: "BirdLife International", emoji: "🐦", description: "רשת עולמית של ארגוני שימור ציפורים ב-120 מדינות", matchId: "network" },
];

const roles: RoleCard[] = [
  { id: "waterbirds", label: "הגנה על שקנאים, ברווזים ועגורים בנתיבי הנדידה" },
  { id: "migratory", label: "חוקים שמחייבים מדינות לשתף פעולה על חיות שחוצות גבולות" },
  { id: "wetlands", label: "שמירה על אגמון החולה, ים המלח ואתרי מים קריטיים" },
  { id: "network", label: "מחקר, חינוך ופעולה מעשית בכל רחבי העולם" },
];

const dilemmaScenario = {
  title: "המשבר הבין-לאומי",
  description: "קיבלתם דיווח דחוף: אוכלוסיית החסידות הלבנות ירדה ב-30% בשלוש שנים. הציפורים נודדות דרך 15 מדינות. יש לכם תקציב מוגבל לפעולה אחת. מה תעשו?",
  options: [
    {
      id: "one-country",
      label: "להשקיע הכל בהגנה בישראל בלבד",
      emoji: "🇮🇱",
      feedback: "לא מספיק! ישראל היא רק תחנה אחת מ-15. אם הציפורים נהרגות במדינה אחרת, ההשקעה שלנו לא תעזור.",
      correct: false,
    },
    {
      id: "research",
      label: "לחקור את הבעיה שנה נוספת לפני שפועלים",
      emoji: "🔬",
      feedback: "מחקר חשוב, אבל כשהירידה כל כך מהירה — אי אפשר לחכות. צריך גם לפעול וגם לחקור במקביל.",
      correct: false,
    },
    {
      id: "cooperation",
      label: "לארגן פעולה מתואמת עם כל 15 המדינות לאורך נתיב הנדידה",
      emoji: "🤝",
      feedback: "מצוין! זה בדיוק העיקרון של שיתוף פעולה בין-לאומי. ציפור נודדת לא מכירה גבולות — ולכן ההגנה עליה חייבת לחצות גבולות. כל מדינה אחראית על הקטע שלה בנתיב!",
      correct: true,
    },
    {
      id: "breed",
      label: "לגדל חסידות בשבי ולשחרר אותן",
      emoji: "🥚",
      feedback: "גידול בשבי יכול לעזור למינים נדירים מאוד, אבל חסידות צריכות טבע פתוח ונתיב נדידה בטוח. בלי לתקן את הבעיות בדרך — גם חסידות משוחררות ייפגעו.",
      correct: false,
    },
  ],
};

const summitQuestion = {
  title: "ההחלטה הדיפלומטית",
  description: "אתם בפגישת פסגה. שלוש מדינות מציעות תוכניות שונות. רק תוכנית אחת משלבת את כל העקרונות שלמדתם. איזו?",
  options: [
    {
      id: "plan-a",
      label: "תוכנית A: כל מדינה תגן על הציפורים בשטחה לפי הכללים שלה, בלי תיאום",
      emoji: "📋",
      feedback: "בלי תיאום, כל מדינה תפעל אחרת. מה קורה אם מדינה אחת מגנה על הביצות ומדינה שכנה הורסת אותן?",
      correct: false,
    },
    {
      id: "plan-b",
      label: "תוכנית B: מערכת מעקב משותפת + הגנה על תחנות תדלוק + חינוך בכל מדינה",
      emoji: "🌐",
      feedback: "מושלם! שילוב של טכנולוגיה (מעקב), שטח (הגנה על תחנות תדלוק), ואנשים (חינוך) — בכל המדינות. זה מודל AEWA במיטבו!",
      correct: true,
    },
    {
      id: "plan-c",
      label: "תוכנית C: איסור ציד בכל המדינות — ודי",
      emoji: "🚫",
      feedback: "איסור ציד חשוב מאוד, אבל הוא לא מספיק. ציפורים מתות גם מהתחשמלות, הרעלה ואובדן בתי גידול. צריך פתרון מקיף.",
      correct: false,
    },
  ],
};

const phaseVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};
const phaseTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

const Station6Analysis = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [matches, setMatches] = useState<{ [treatyId: string]: string }>({});
  const [selectedTreaty, setSelectedTreaty] = useState<string | null>(null);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [errors, setErrors] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [dilemmaAnswer, setDilemmaAnswer] = useState<string | null>(null);
  const [dilemmaFeedback, setDilemmaFeedback] = useState<string | null>(null);
  const [dilemmaCorrect, setDilemmaCorrect] = useState(false);
  const [summitAnswer, setSummitAnswer] = useState<string | null>(null);
  const [summitFeedback, setSummitFeedback] = useState<string | null>(null);
  const [summitCorrect, setSummitCorrect] = useState(false);

  const reward = getStationReward(5);

  const availableRoles = roles.filter(r => !Object.values(matches).includes(r.id));
  const allMatched = Object.keys(matches).length === treaties.length;
  const allCorrect = treaties.every(t => matches[t.id] === t.matchId);

  const handleRoleSelect = (roleId: string) => {
    if (!selectedTreaty) return;
    playClick();
    setMatches(prev => ({ ...prev, [selectedTreaty]: roleId }));
    setSelectedTreaty(null);
  };

  const handleCheckMatches = () => {
    if (allCorrect) {
      playSuccess();
      setShowCorrectEffect(true);
      setTimeout(() => { setShowCorrectEffect(false); setPhase("dilemma"); }, 800);
    } else {
      playError();
      setErrors(e => e + 1);
      // Reset wrong matches
      const corrected: { [key: string]: string } = {};
      treaties.forEach(t => {
        if (matches[t.id] === t.matchId) corrected[t.id] = matches[t.id];
      });
      setMatches(corrected);
    }
  };

  const handleDilemmaSubmit = () => {
    const option = dilemmaScenario.options.find(o => o.id === dilemmaAnswer);
    if (!option) return;
    setDilemmaFeedback(option.feedback);
    if (option.correct) {
      playSuccess();
      setDilemmaCorrect(true);
      setShowCorrectEffect(true);
      setTimeout(() => { setShowCorrectEffect(false); setPhase("summit"); }, 1200);
    } else {
      playError();
      setErrors(e => e + 1);
    }
  };

  const handleSummitSubmit = () => {
    const option = summitQuestion.options.find(o => o.id === summitAnswer);
    if (!option) return;
    setSummitFeedback(option.feedback);
    if (option.correct) {
      playReveal();
      setSummitCorrect(true);
      setShowCorrectEffect(true);
      setTimeout(() => { setShowCorrectEffect(false); setPhase("reward"); }, 1200);
    } else {
      playError();
      setErrors(e => e + 1);
    }
  };

  const useHint = () => {
    setHintsUsed(h => h + 1);
    setShowHint(true);
  };

  const hints: Record<string, string> = {
    treaties: "💡 AEWA עוסקת בציפורי מים, CMS בכל בעלי החיים הנודדים, רמסר בביצות ואגמים, ו-BirdLife היא רשת של ארגונים.",
    dilemma: "💡 ציפור נודדת עוברת דרך 15 מדינות. אם מגנים עליה רק באחת — מה קורה בשאר 14?",
    summit: "💡 חשבו מה צריך כדי להגן על ציפור לאורך כל הדרך: לדעת איפה היא, לשמור על המקומות שהיא צריכה, ולחנך אנשים לא לפגוע.",
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-4">
              <div className="glass-card rounded-2xl p-6 station-glow-5">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-center text-5xl mx-auto mb-3">🌍</div>
                  <h2 className="text-2xl font-black text-accent">תחנה 6: שגרירות הציפורים</h2>
                  <p className="text-sm text-muted-foreground mt-1">שיתוף פעולה בין-לאומי • החלטות דיפלומטיות</p>
                </div>
                <NarrationPlayer
                  text="חוקרים, ברוכים הבאים לשגרירות הציפורים! ציפורים נודדות לא מכירות גבולות — הן חוצות 15 מדינות בדרכן מאפריקה לאירופה. לכן, כדי להגן עליהן, מדינות חייבות לשתף פעולה. במשימה הזו תלמדו על הסכמים בין-לאומיים, תתמודדו עם דילמה אמיתית, ותקבלו החלטה דיפלומטית כחוקרים אמיתיים!"
                  className="mb-4"
                />
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => { playClick(); setPhase("treaties"); }} className="bg-gradient-to-l from-accent to-accent/80 text-accent-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-accent/20">
                    🌍 למשימה הדיפלומטית
                  </button>
                  <button onClick={onOpenResearch} className="text-xs text-muted-foreground hover:text-accent transition-colors underline">
                    📚 פתח ארכיון מחקר
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TREATIES MATCHING */}
          {phase === "treaties" && (
            <motion.div key="treaties" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-5">
                <span className="text-xs font-black text-accent bg-accent/10 px-3 py-1 rounded-lg border border-accent/20 mb-3 inline-block">🌍 שלב 1: הכירו את ההסכמים</span>
                <p className="text-xs text-muted-foreground text-right mb-4">
                  התאימו כל הסכם בין-לאומי לתפקיד שלו. <strong className="text-foreground">לחצו על הסכם, ואז על התפקיד המתאים.</strong>
                </p>

                <div className="space-y-2 mb-3">
                  {treaties.map(treaty => {
                    const matched = matches[treaty.id];
                    const isSelected = selectedTreaty === treaty.id;
                    const matchedRole = roles.find(r => r.id === matched);
                    return (
                      <button
                        key={treaty.id}
                        onClick={() => { if (!matched) { playClick(); setSelectedTreaty(isSelected ? null : treaty.id); } }}
                        className={`w-full text-right p-3 rounded-xl border transition-all ${
                          matched
                            ? "bg-primary/10 border-primary/30 cursor-default"
                            : isSelected
                              ? "bg-accent/15 border-accent/40 ring-2 ring-accent/20"
                              : "bg-muted/10 border-border/20 hover:border-accent/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{treaty.emoji}</span>
                          <div className="flex-1">
                            <p className="font-bold text-sm">{treaty.name}</p>
                            <p className="text-[10px] text-muted-foreground">{treaty.description}</p>
                          </div>
                          {matched && <span className="text-primary text-xs">✓</span>}
                        </div>
                        {matched && matchedRole && (
                          <p className="text-[10px] text-primary/80 mt-1 mr-9">← {matchedRole.label}</p>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedTreaty && availableRoles.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/5 border border-accent/15 rounded-xl p-3 mb-3">
                    <p className="text-[10px] text-accent font-bold mb-2">בחרו את התפקיד המתאים ל-{treaties.find(t => t.id === selectedTreaty)?.name}:</p>
                    <div className="space-y-1.5">
                      {availableRoles.map(role => (
                        <button
                          key={role.id}
                          onClick={() => handleRoleSelect(role.id)}
                          className="w-full text-right p-2 rounded-lg border border-border/20 bg-muted/10 hover:bg-accent/10 hover:border-accent/30 transition-all text-xs"
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {allMatched && (
                  <button onClick={handleCheckMatches} className="w-full bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-6 py-3 rounded-xl font-black hover:scale-[1.02] transition-all mt-2">
                    ✅ בדקו התאמות
                  </button>
                )}

                {!showHint && (
                  <button onClick={useHint} className="text-[10px] text-muted-foreground hover:text-accent transition-colors underline mt-2 block">
                    💡 צריכים רמז?
                  </button>
                )}
                {showHint && (
                  <div className="bg-accent/5 border border-accent/15 rounded-lg p-2 mt-2">
                    <p className="text-[10px] text-accent">{hints.treaties}</p>
                  </div>
                )}

                {errors > 0 && !allCorrect && (
                  <p className="text-[10px] text-destructive/70 text-center mt-2">חלק מההתאמות לא נכונות — נשארו רק הנכונות. נסו שוב!</p>
                )}
              </div>
            </motion.div>
          )}

          {/* DILEMMA */}
          {phase === "dilemma" && (
            <motion.div key="dilemma" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-5">
                <span className="text-xs font-black text-accent bg-accent/10 px-3 py-1 rounded-lg border border-accent/20 mb-3 inline-block">⚖️ שלב 2: {dilemmaScenario.title}</span>
                <p className="text-sm text-foreground/90 text-right mb-4 leading-relaxed">{dilemmaScenario.description}</p>

                <div className="space-y-2 mb-4">
                  {dilemmaScenario.options.map(option => (
                    <button
                      key={option.id}
                      onClick={() => { playClick(); setDilemmaAnswer(option.id); setDilemmaFeedback(null); }}
                      disabled={dilemmaCorrect}
                      className={`w-full text-right p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        dilemmaAnswer === option.id
                          ? dilemmaCorrect && option.correct
                            ? "bg-primary/15 border-primary/40"
                            : "bg-accent/10 border-accent/30"
                          : "bg-muted/10 border-border/20 hover:border-accent/30"
                      }`}
                    >
                      <span className="text-xl">{option.emoji}</span>
                      <span className="text-xs font-medium flex-1">{option.label}</span>
                    </button>
                  ))}
                </div>

                {dilemmaFeedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-3 rounded-xl border text-xs mb-3 ${
                    dilemmaCorrect ? "bg-primary/10 border-primary/30 text-primary" : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}>
                    {dilemmaFeedback}
                  </motion.div>
                )}

                {dilemmaAnswer && !dilemmaCorrect && (
                  <button onClick={handleDilemmaSubmit} className="w-full bg-gradient-to-l from-accent to-accent/80 text-accent-foreground px-6 py-3 rounded-xl font-black hover:scale-[1.02] transition-all">
                    ⚖️ זו ההחלטה שלי!
                  </button>
                )}

                {!showHint && !dilemmaCorrect && (
                  <button onClick={useHint} className="text-[10px] text-muted-foreground hover:text-accent transition-colors underline mt-2 block">
                    💡 צריכים רמז?
                  </button>
                )}
                {showHint && !dilemmaCorrect && (
                  <div className="bg-accent/5 border border-accent/15 rounded-lg p-2 mt-2">
                    <p className="text-[10px] text-accent">{hints.dilemma}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SUMMIT DECISION */}
          {phase === "summit" && (
            <motion.div key="summit" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-5">
                <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 mb-3 inline-block">🏛️ שלב 3: {summitQuestion.title}</span>
                <p className="text-sm text-foreground/90 text-right mb-4 leading-relaxed">{summitQuestion.description}</p>

                <div className="space-y-2 mb-4">
                  {summitQuestion.options.map(option => (
                    <button
                      key={option.id}
                      onClick={() => { playClick(); setSummitAnswer(option.id); setSummitFeedback(null); }}
                      disabled={summitCorrect}
                      className={`w-full text-right p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        summitAnswer === option.id
                          ? summitCorrect && option.correct
                            ? "bg-primary/15 border-primary/40"
                            : "bg-accent/10 border-accent/30"
                          : "bg-muted/10 border-border/20 hover:border-accent/30"
                      }`}
                    >
                      <span className="text-xl">{option.emoji}</span>
                      <span className="text-xs font-medium flex-1">{option.label}</span>
                    </button>
                  ))}
                </div>

                {summitFeedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-3 rounded-xl border text-xs mb-3 ${
                    summitCorrect ? "bg-primary/10 border-primary/30 text-primary" : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}>
                    {summitFeedback}
                  </motion.div>
                )}

                {summitAnswer && !summitCorrect && (
                  <button onClick={handleSummitSubmit} className="w-full bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-6 py-3 rounded-xl font-black hover:scale-[1.02] transition-all">
                    🏛️ זו ההחלטה הדיפלומטית!
                  </button>
                )}

                {!showHint && !summitCorrect && (
                  <button onClick={useHint} className="text-[10px] text-muted-foreground hover:text-accent transition-colors underline mt-2 block">
                    💡 צריכים רמז?
                  </button>
                )}
                {showHint && !summitCorrect && (
                  <div className="bg-accent/5 border border-accent/15 rounded-lg p-2 mt-2">
                    <p className="text-[10px] text-accent">{hints.summit}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && reward && (
            <motion.div key="reward" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-4">
              <div className="glass-card rounded-2xl p-6 station-glow-5 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-5xl mx-auto mb-4">
                  🌍
                </motion.div>
                <h2 className="text-xl font-black text-primary mb-2">משימה הושלמה!</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  הוכחתם שאתם מבינים: ציפורים נודדות הן אחריות של כל העולם. שיתוף פעולה בין-לאומי הוא המפתח להגנה עליהן!
                </p>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="glass-card rounded-xl p-3 flex items-center gap-2">
                    <span className="text-2xl">{reward.emoji}</span>
                    <div className="text-right">
                      <p className="text-xs font-black">{reward.name}</p>
                      <p className="text-[10px] text-muted-foreground">{reward.description}</p>
                    </div>
                  </div>
                </div>

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="w-16 h-16 rounded-full bg-accent/15 border-2 border-accent flex items-center justify-center text-3xl mx-auto mb-3 font-black text-accent">
                  ם
                </motion.div>
                <p className="text-xs text-muted-foreground mb-1">האות שאספתם:</p>
                <p className="text-2xl font-black text-accent">ם</p>

                <div className="bg-accent/5 border border-accent/15 rounded-xl p-3 mt-4 text-right">
                  <p className="text-[10px] text-accent font-bold mb-1">🌟 עובדה מדהימה</p>
                  <p className="text-[10px] text-muted-foreground">
                    ישראל חתומה על יותר מ-10 הסכמים בין-לאומיים להגנה על ציפורים נודדות. מדי שנה, נציגים מ-130 מדינות נפגשים כדי לתאם מדיניות הגנה על הנתיבים!
                  </p>
                </div>

                <button
                  onClick={() => onComplete("ם", errors, hintsUsed)}
                  className="mt-4 bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-primary/20 w-full"
                >
                  🗺️ חזרה למפה
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Station6Analysis;
