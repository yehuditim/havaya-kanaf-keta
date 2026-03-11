import { useState } from "react";
import labBg from "../../assets/backgrounds/research-lab.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";
import NarrationPlayer from "./NarrationPlayer";
import CodeLock from "./CodeLock";
import AtbashDecoder from "./AtbashDecoder";
import { encodeAtbash } from "./AtbashDecoder";
import ResearchMission from "./ResearchMission";

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

interface NavMethod { id: string; name: string; emoji: string; description: string; slot: string; }
const navMethods: NavMethod[] = [
  { id: "magnetic", name: "שדה מגנטי", emoji: "🧲", description: "מצפן מולד — חש את השדה המגנטי", slot: "north" },
  { id: "sun", name: "מיקום השמש", emoji: "☀️", description: "ניווט לפי זווית השמש ביום", slot: "east" },
  { id: "stars", name: "מפת כוכבים", emoji: "⭐", description: "ניווט לפי כוכבים בלילה", slot: "west" },
  { id: "landmarks", name: "ציוני דרך", emoji: "🏔️", description: "זיהוי נהרות, הרים וחופים", slot: "south" },
];
const compassSlots = [
  { id: "north", label: "צפון", x: "50%", y: "10%" },
  { id: "east", label: "מזרח", x: "85%", y: "45%" },
  { id: "south", label: "דרום", x: "50%", y: "80%" },
  { id: "west", label: "מערב", x: "15%", y: "45%" },
];

const researchCards = [
  { id: "tech", title: "טיבוע, GPS ומכ״ם", emoji: "📡", content: "טיבוע — טבעת אלומיניום עם מספר ייחודי. שנת ההמצאה: 1899. משדרי GPS זעירים (פחות מ-5 גרם!) מאפשרים מעקב בזמן אמת — התחילו להשתמש בהם בשנות ה-2000. מכ״ם — מעקב אחרי להקות שלמות מרחוק, מאז שנות ה-1940.", hiddenClue: "השנה מופיעה אחרי ׳שנת ההמצאה׳ — חפשו את המספר בן 4 הספרות" },
  { id: "nav", title: "GPS ביולוגי", emoji: "🧠", content: "ציפורים מנווטות באמצעות מצפן מגנטי מולד, שמש, כוכבים וציוני דרך. ארבע שיטות שעובדות ביחד!" },
  { id: "citizen", title: "eBird — מדע אזרחי", emoji: "📱", content: "eBird הוא פרויקט מדע אזרחי — צפרים מדווחים תצפיות באפליקציה. מאז שנות ה-2010 חולל מהפכה במחקר הנדידה." },
];

const ATBASH_ANSWER = "נדיד";
const ATBASH_ENCODED = encodeAtbash(ATBASH_ANSWER);

const phaseVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};
const phaseTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

type Phase = "briefing" | "compass" | "research" | "lock" | "atbash" | "reward";

const Station4Lab = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [selectedNav, setSelectedNav] = useState<string | null>(null);
  const [placedNavs, setPlacedNavs] = useState<{ [slot: string]: string }>({});
  const [compassErrors, setCompassErrors] = useState(0);
  const [researchDone, setResearchDone] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);

  const reward = getStationReward(3);
  const allNavPlaced = Object.keys(placedNavs).length === 4;
  const unplacedNavs = navMethods.filter(n => !Object.values(placedNavs).includes(n.id));

  const handleNavSelect = (id: string) => { playClick(); setSelectedNav(selectedNav === id ? null : id); };
  const handleSlotClick = (slotId: string) => {
    if (!selectedNav || placedNavs[slotId]) return;
    const method = navMethods.find(n => n.id === selectedNav);
    if (!method) return;
    if (method.slot === slotId) { playSuccess(); setPlacedNavs(prev => ({ ...prev, [slotId]: method.id })); }
    else { playError(); setCompassErrors(e => e + 1); }
    setSelectedNav(null);
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${labBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/60 via-background/40 to-background/70 backdrop-blur-[1px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10 mt-12 sm:mt-0">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-4">
              <div className="glass-card rounded-2xl p-6 station-glow-4">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-station-4/10 border border-station-4/25 flex items-center justify-center text-5xl mx-auto mb-3">🧭</div>
                  <h2 className="text-2xl font-black text-station-4">תחנה 4: מעבדת הניווט</h2>
                  <p className="text-sm text-muted-foreground mt-1">טכנולוגיה ומדע • המשימה האחרונה</p>
                </div>
                <NarrationPlayer
                  text="התחנה האחרונה! כאן נמצאת מעבדת הניווט והטכנולוגיה שלי. תבנו מצפן ביולוגי, תחקרו בכרטיסי מידע כדי למצוא קוד למנעול, ולבסוף — תפענחו צופן אתב״ש שיחשוף את האות האחרונה. כשתשלימו — הקוד הסודי יתגלה!"
                  className="mb-4"
                />
                <div className="bg-accent/5 rounded-lg p-3 border border-accent/15 text-right mb-4">
                  <p className="text-[11px] text-accent/80">📖 <strong>טיפ:</strong> קראו על <a href="https://he.wikipedia.org/wiki/%D7%98%D7%99%D7%91%D7%95%D7%A2_(%D7%A6%D7%99%D7%A4%D7%95%D7%A8%D7%99%D7%9D)" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/70">טיבוע ציפורים בוויקיפדיה</a> — תצטרכו מידע על הטכנולוגיה!</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => { playClick(); setPhase("compass"); }} className="bg-gradient-to-l from-station-4 to-station-4/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-4/20">
                    🧭 בנו את המצפן
                  </button>
                  <button onClick={() => { playClick(); onOpenResearch(); }} className="text-accent/60 text-xs hover:text-accent transition-colors">
                    📚 פתחו את ארכיון המחקר
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* COMPASS */}
          {phase === "compass" && (
            <motion.div key="compass" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition}>
              <div className="glass-card rounded-2xl p-5 station-glow-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-station-4 bg-station-4/10 px-3 py-1 rounded-lg border border-station-4/20">🧭 שלב 1: בנו את המצפן</span>
                  <span className="text-[10px] text-muted-foreground">{Object.keys(placedNavs).length}/4</span>
                </div>
                <p className="text-xs text-muted-foreground text-right mb-3">בחרו שיטת ניווט ➜ שבצו אותה במקום הנכון</p>
                <div className="relative w-full aspect-square max-w-[250px] mx-auto mb-4">
                  <div className="absolute inset-[15%] rounded-full border-2 border-station-4/20 bg-station-4/5" />
                  <div className="absolute inset-[30%] rounded-full border border-station-4/10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-station-4/15 border border-station-4/30 flex items-center justify-center text-lg">🧭</div>
                  {compassSlots.map(slot => {
                    const placedNavId = placedNavs[slot.id];
                    const method = navMethods.find(n => n.id === placedNavId);
                    return (
                      <button key={slot.id} onClick={() => handleSlotClick(slot.id)}
                        className={`absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${method ? "bg-station-4/15 border-station-4/40" : selectedNav ? "border-station-4/50 hover:bg-station-4/10 animate-pulse-glow" : "border-border/30 bg-muted/15"}`}
                        style={{ left: slot.x, top: slot.y }}>
                        {method ? (<><span className="text-lg">{method.emoji}</span><span className="text-[6px] font-bold text-station-4/70">{method.name}</span></>) :
                          (<><span className="text-xs text-muted-foreground/40">?</span><span className="text-[6px] text-muted-foreground/40">{slot.label}</span></>)}
                      </button>
                    );
                  })}
                </div>
                {!allNavPlaced && (
                  <div className="grid grid-cols-2 gap-2">
                    {unplacedNavs.map(nav => (
                      <button key={nav.id} onClick={() => handleNavSelect(nav.id)}
                        className={`p-2.5 rounded-xl border-2 text-center transition-all ${selectedNav === nav.id ? "bg-station-4/15 border-station-4 scale-105" : "bg-muted/25 border-border/20 hover:border-station-4/30"}`}>
                        <span className="text-lg block mb-0.5">{nav.emoji}</span>
                        <span className="text-[9px] font-bold block">{nav.name}</span>
                        <span className="text-[7px] text-muted-foreground">{nav.description}</span>
                      </button>
                    ))}
                  </div>
                )}
                {compassErrors > 1 && !allNavPlaced && <p className="text-[10px] text-accent text-center mt-2">💡 מגנטי=צפון, שמש=מזרח, כוכבים=מערב, ציוני דרך=דרום</p>}
              </div>
              {allNavPlaced && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 glass-card rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-station-4 mb-2">🧭 המצפן הושלם!</p>
                  <button onClick={() => { playClick(); setPhase("research"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    ➡️ למשימת החקר
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* RESEARCH + LOCK */}
          {phase === "research" && (
            <motion.div key="research" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-4">
                <p className="text-xs font-black text-station-4 mb-3">🔬 שלב 2: חקר + מנעול</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  חפשו: <strong className="text-foreground">באיזו שנה הומצא הטיבוע?</strong> המספר הזה הוא הקוד!
                </p>
                {!researchDone ? (
                  <ResearchMission
                    prompt="פרופסור דרור שואל: ׳באיזו שנה הומצא הטיבוע? חפשו בכרטיסי הטכנולוגיה!׳"
                    cards={researchCards}
                    targetCardId="tech"
                    question="שנת המצאת הטיבוע?"
                    correctAnswer={["1899"]}
                    onComplete={() => { setResearchDone(true); setShowCorrectEffect(true); }}
                    onOpenResearch={onOpenResearch}
                  />
                ) : (
                  <div>
                    <p className="text-xs text-primary mb-3 text-center">✅ מצאתם: 1899! הכניסו את הקוד:</p>
                    <CodeLock
                      correctCode="1899"
                      label="🔒 מנעול המעבדה"
                      hint="שנת המצאת הטיבוע — ארבע ספרות, סוף המאה ה-19"
                      onUnlock={() => { playReveal(); setShowCorrectEffect(true); setTimeout(() => setPhase("atbash"), 800); }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ATBASH FINAL */}
          {phase === "atbash" && (
            <motion.div key="atbash" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-4">
                <p className="text-xs font-black text-station-4 mb-3">🔐 שלב 3: הצופן האחרון</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  בתוך המנעול מצאתם פתק: <strong className="text-foreground">״המילה שמתארת את כל המסע — מוצפנת באתב״ש.״</strong> פענחו אותה לגלות את האות האחרונה!
                </p>
                <AtbashDecoder
                  encodedMessage={ATBASH_ENCODED}
                  correctAnswer={ATBASH_ANSWER}
                  explanation="נדיד — זו המילה שמסכמת את כל מה שלמדתם! ציפור נדידה, נתיב נדידה, עוף נדיד."
                  onDecode={() => { setShowCorrectEffect(true); setTimeout(() => { playReveal(); setPhase("reward"); }, 1500); }}
                />
              </div>
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="glass-card rounded-2xl p-6 station-glow-4 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-5xl mx-auto shadow-xl shadow-primary/20">{reward?.emoji}</div>
              </motion.div>
              <h2 className="text-xl font-black text-primary mb-1">הפריט האחרון!</h2>
              <p className="text-sm font-bold text-foreground/80 mb-1">{reward?.name}</p>
              <p className="text-xs text-muted-foreground mb-4">{reward?.description}</p>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary rounded-xl px-5 py-3 mb-4">
                <span className="text-xs text-muted-foreground">אות נחשפה:</span>
                <span className="text-3xl font-black text-primary">ד</span>
              </motion.div>
              <div className="bg-muted/25 rounded-xl p-4 mb-5 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״פנטסטי! פיצחתם את כל החידות! המילה הסודית — ״{ATBASH_ANSWER}״ — מסכמת את כל מה שלמדתם. עכשיו — לפאזל הסופי!״
                </p>
              </div>
              <button onClick={() => onComplete("ד", compassErrors, 0)} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-secondary/20">
                ➡️ חזרה למפה
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Station4Lab;
