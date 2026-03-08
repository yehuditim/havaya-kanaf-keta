import { useState } from "react";
import labBg from "../../assets/backgrounds/research-lab.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";

/**
 * Station 4: Navigation Lab — "Build the Compass"
 */

interface Props {
  onComplete: (letter: string) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

interface NavMethod {
  id: string;
  name: string;
  emoji: string;
  description: string;
  slot: string; // which compass slot it belongs to
}

const navMethods: NavMethod[] = [
  { id: "magnetic", name: "שדה מגנטי", emoji: "🧲", description: "מצפן מולד שחש את השדה המגנטי של כדור הארץ", slot: "north" },
  { id: "sun", name: "מיקום השמש", emoji: "☀️", description: "ניווט לפי זווית השמש — עובד ביום", slot: "east" },
  { id: "stars", name: "מפת כוכבים", emoji: "⭐", description: "ניווט לפי כוכבים — עובד בלילה", slot: "west" },
  { id: "landmarks", name: "ציוני דרך", emoji: "🏔️", description: "זיהוי נהרות, הרים וחופים מהאוויר", slot: "south" },
];

const compassSlots = [
  { id: "north", label: "צפון", x: "50%", y: "10%" },
  { id: "east", label: "מזרח", x: "85%", y: "45%" },
  { id: "south", label: "דרום", x: "50%", y: "80%" },
  { id: "west", label: "מערב", x: "15%", y: "45%" },
];

interface TechItem {
  id: string;
  name: string;
  emoji: string;
  year: string;
  description: string;
  order: number;
}

const techItems: TechItem[] = [
  { id: "ring", name: "טיבוע", emoji: "💍", year: "1899", description: "טבעת אלומיניום עם מספר ייחודי — השיטה הוותיקה", order: 0 },
  { id: "radar", name: "מכ״ם", emoji: "📡", year: "1940s", description: "מעקב אחרי להקות שלמות מרחוק — יום ולילה", order: 1 },
  { id: "gps", name: "GPS", emoji: "📍", year: "2000s", description: "משדרים זעירים (פחות מ-5 גרם!) — מעקב בזמן אמת", order: 2 },
  { id: "citizen", name: "מדע אזרחי", emoji: "📱", year: "2010s", description: "eBird ואפליקציות — מיליוני תצפיות מכל העולם", order: 3 },
];

type Phase = "briefing" | "compass" | "sequence" | "reward";

const Station4Lab = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [selectedNav, setSelectedNav] = useState<string | null>(null);
  const [placedNavs, setPlacedNavs] = useState<{ [slot: string]: string }>({});
  const [compassErrors, setCompassErrors] = useState(0);
  const [techOrder, setTechOrder] = useState<string[]>([]);
  const [seqErrors, setSeqErrors] = useState(0);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);

  const reward = getStationReward(3);
  const allNavPlaced = Object.keys(placedNavs).length === 4;
  const allSequenced = techOrder.length === 4;
  const isSequenceCorrect = techOrder.every((id, i) => techItems.find(t => t.id === id)?.order === i);

  const unplacedNavs = navMethods.filter(n => !Object.values(placedNavs).includes(n.id));

  const handleNavSelect = (id: string) => {
    playClick();
    setSelectedNav(selectedNav === id ? null : id);
  };

  const handleSlotClick = (slotId: string) => {
    if (!selectedNav || placedNavs[slotId]) return;
    const method = navMethods.find(n => n.id === selectedNav);
    if (!method) return;

    if (method.slot === slotId) {
      playSuccess();
      setPlacedNavs(prev => ({ ...prev, [slotId]: method.id }));
    } else {
      playError();
      setCompassErrors(e => e + 1);
    }
    setSelectedNav(null);
  };

  const handleTechClick = (id: string) => {
    if (techOrder.includes(id)) return;
    playClick();
    const newOrder = [...techOrder, id];
    setTechOrder(newOrder);

    // Check if wrong so far
    if (newOrder.length > 0) {
      const expected = techItems.find(t => t.order === newOrder.length - 1);
      if (expected && expected.id !== id) {
        playError();
        setSeqErrors(e => e + 1);
        // Reset after a moment
        setTimeout(() => setTechOrder([]), 500);
      } else if (newOrder.length === 4) {
        playSuccess();
      }
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${labBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-0 bg-background/75 backdrop-blur-[2px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full">
        {/* Navigation */}
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card rounded-2xl p-6 station-glow-4">
              <div className="text-center mb-5">
                <div className="w-20 h-20 rounded-2xl bg-station-4/10 border border-station-4/25 flex items-center justify-center text-5xl mx-auto mb-3">🧭</div>
                <h2 className="text-2xl font-black text-station-4">תחנה 4: מעבדת הניווט</h2>
                <p className="text-sm text-muted-foreground mt-1">טכנולוגיה ומדע • הרכבת מצפן</p>
              </div>
              <div className="bg-muted/25 rounded-xl p-4 mb-5 border border-border/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">👨‍🔬</span>
                  <span className="text-sm font-bold text-muted-foreground">פרופסור דרור</span>
                </div>
                <p className="text-[13px] leading-[2] text-foreground/85 italic text-right">
                  ״התחנה האחרונה! כאן נמצאת מעבדת הניווט שלי.
                  קודם — הרכיבו מצפן ניווט ביולוגי על ידי שיבוץ שיטות הניווט במקומות הנכונים.
                  אחר כך — סדרו את טכנולוגיות המעקב לפי סדר ההמצאה. האות האחרונה מחכה!״
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button onClick={() => { playClick(); setPhase("compass"); }} className="bg-gradient-to-l from-station-4 to-station-4/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-4/20">
                  🔍 היכנסו למעבדה
                </button>
                <button onClick={() => { playClick(); onOpenResearch(); }} className="text-accent/60 text-xs hover:text-accent transition-colors">
                  📚 בדקו בארכיון המחקר קודם
                </button>
              </div>
            </motion.div>
          )}

          {/* COMPASS PHASE */}
          {phase === "compass" && (
            <motion.div key="compass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-station-4 bg-station-4/10 px-3 py-1 rounded-lg border border-station-4/20">🧭 שלב 1: בנו את המצפן</span>
                  <span className="text-[10px] text-muted-foreground">{Object.keys(placedNavs).length}/4</span>
                </div>

                <p className="text-xs text-muted-foreground text-right mb-3">
                  בחרו שיטת ניווט ➜ שבצו אותה במקום הנכון על המצפן
                </p>

                {/* Compass diagram */}
                <div className="relative w-full aspect-square max-w-[280px] mx-auto mb-4">
                  {/* Compass circle */}
                  <div className="absolute inset-[15%] rounded-full border-2 border-station-4/20 bg-station-4/5" />
                  <div className="absolute inset-[30%] rounded-full border border-station-4/10" />
                  {/* Center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-station-4/15 border border-station-4/30 flex items-center justify-center text-lg">
                    🧭
                  </div>

                  {/* Slots */}
                  {compassSlots.map(slot => {
                    const placedNavId = placedNavs[slot.id];
                    const placedMethod = navMethods.find(n => n.id === placedNavId);
                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotClick(slot.id)}
                        className={`absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                          placedMethod
                            ? "bg-station-4/15 border-station-4/40 shadow-sm"
                            : selectedNav
                              ? "border-station-4/50 hover:bg-station-4/10 cursor-pointer animate-pulse-glow"
                              : "border-border/30 bg-muted/15"
                        }`}
                        style={{ left: slot.x, top: slot.y }}
                      >
                        {placedMethod ? (
                          <>
                            <span className="text-xl">{placedMethod.emoji}</span>
                            <span className="text-[7px] font-bold text-station-4/70">{placedMethod.name}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-muted-foreground/40">?</span>
                            <span className="text-[7px] text-muted-foreground/40">{slot.label}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Nav method cards to place */}
                {!allNavPlaced && (
                  <div className="grid grid-cols-2 gap-2">
                    {unplacedNavs.map(nav => (
                      <button
                        key={nav.id}
                        onClick={() => handleNavSelect(nav.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          selectedNav === nav.id
                            ? "bg-station-4/15 border-station-4 shadow-sm scale-105"
                            : "bg-muted/25 border-border/20 hover:border-station-4/30"
                        }`}
                      >
                        <span className="text-xl block mb-1">{nav.emoji}</span>
                        <span className="text-[10px] font-bold block">{nav.name}</span>
                        <span className="text-[8px] text-muted-foreground">{nav.description}</span>
                      </button>
                    ))}
                  </div>
                )}

                {compassErrors > 1 && !allNavPlaced && (
                  <p className="text-[10px] text-accent text-center mt-2">💡 רמז: מגנטי=צפון, שמש=מזרח (זריחה), כוכבים=מערב (שקיעה), ציוני דרך=דרום (נוף)</p>
                )}
              </div>

              {allNavPlaced && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 glass-card rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-station-4 mb-2">🧭 המצפן הושלם!</p>
                  <p className="text-xs text-muted-foreground mb-3">ציפורים משתמשות בכל ארבע השיטות ביחד — GPS ביולוגי מדהים!</p>
                  <button onClick={() => { playClick(); setPhase("sequence"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    ➡️ לשלב הבא: סדר טכנולוגיות
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SEQUENCE PHASE */}
          {phase === "sequence" && (
            <motion.div key="sequence" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-station-4 bg-station-4/10 px-3 py-1 rounded-lg border border-station-4/20">🧭 שלב 2: סדרו לפי זמן</span>
                  <span className="text-[10px] text-muted-foreground">{techOrder.length}/4</span>
                </div>

                <p className="text-xs text-muted-foreground text-right mb-3">
                  לחצו על טכנולוגיות המעקב בסדר כרונולוגי — מהישנה לחדשה
                </p>

                {/* Timeline slots */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[0, 1, 2, 3].map(i => {
                    const techId = techOrder[i];
                    const tech = techItems.find(t => t.id === techId);
                    return (
                      <div key={i} className="flex items-center gap-1">
                        <div className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                          tech
                            ? "bg-station-4/15 border-station-4/40 shadow-sm"
                            : "bg-muted/15 border-border/25 border-dashed"
                        }`}>
                          {tech ? (
                            <>
                              <span className="text-lg">{tech.emoji}</span>
                              <span className="text-[7px] font-bold text-station-4/70">{tech.year}</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground/30">{i + 1}</span>
                          )}
                        </div>
                        {i < 3 && <span className="text-muted-foreground/20 text-xs">→</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Tech cards to sequence */}
                <div className="grid grid-cols-2 gap-2">
                  {techItems.map(tech => {
                    const placed = techOrder.includes(tech.id);
                    return (
                      <button
                        key={tech.id}
                        onClick={() => handleTechClick(tech.id)}
                        disabled={placed}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          placed
                            ? "bg-primary/5 border-primary/15 opacity-40"
                            : "bg-muted/25 border-border/20 hover:border-station-4/40 hover:bg-station-4/5"
                        }`}
                      >
                        <span className="text-xl block mb-1">{tech.emoji}</span>
                        <span className="text-[10px] font-bold block">{tech.name}</span>
                        <span className="text-[8px] text-muted-foreground">{tech.description}</span>
                      </button>
                    );
                  })}
                </div>

                {seqErrors > 0 && (
                  <p className="text-[10px] text-accent text-center mt-2">💡 רמז: מה היה קודם — טבעת פשוטה על רגל, מכ״ם צבאי, משדר אלקטרוני, או אפליקציה?</p>
                )}
              </div>

              {allSequenced && isSequenceCorrect && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 glass-card rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-station-4 mb-2">📡 סדר כרונולוגי מושלם!</p>
                  <div className="text-xs text-foreground/70 text-right space-y-1 mb-3">
                    {techItems.map(t => (
                      <p key={t.id}>{t.emoji} {t.year}: {t.name} — {t.description}</p>
                    ))}
                  </div>
                  <button onClick={() => { playReveal(); setPhase("reward"); }} className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
                    🔑 חשפו את הפריט האחרון!
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 station-glow-4 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-5xl mx-auto shadow-xl shadow-primary/20">
                  {reward?.emoji}
                </div>
              </motion.div>
              <h2 className="text-xl font-black text-primary mb-1">הפריט האחרון!</h2>
              <p className="text-sm font-bold text-foreground/80 mb-1">{reward?.name}</p>
              <p className="text-xs text-muted-foreground mb-4">{reward?.description}</p>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary rounded-xl px-5 py-3 mb-4">
                <span className="text-xs text-muted-foreground">אות אחרונה:</span>
                <span className="text-3xl font-black text-primary">ד</span>
              </motion.div>

              <div className="bg-muted/25 rounded-xl p-4 mb-5 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״פנטסטי! כל הפריטים נאספו וכל האותיות נחשפו! עכשיו — חזרו למפה ופצחו את הקוד הסופי!״
                </p>
              </div>

              <p className="text-xs text-station-4/60 mb-4">💡 עגורים תועדו טסים בגובה 8,000 מטר — מעל הרי ההימלאיה!</p>

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

export default Station4Lab;
