import { useState } from "react";
import hulaBg from "../../assets/backgrounds/hula-wetlands.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";
import NarrationPlayer from "./NarrationPlayer";
import YouTubeEmbed from "./YouTubeEmbed";
import AtbashDecoder from "./AtbashDecoder";
import { encodeAtbash } from "./AtbashDecoder";
import ResearchMission from "./ResearchMission";

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

type Phase = "briefing" | "investigate" | "video" | "research" | "decode" | "reward";

interface Hotspot {
  id: string; x: string; y: string; emoji: string; label: string;
  clue: string; detail: string;
}

const hotspots: Hotspot[] = [
  { id: "binoculars", x: "15%", y: "25%", emoji: "🔭", label: "עמדת תצפית", clue: "להקות ענקיות של עופות אפורים רוקדים בשדות", detail: "עגורים אפורים — עד 40,000 חונים בחולה בחורף!" },
  { id: "screen", x: "70%", y: "20%", emoji: "🖥️", label: "מסך נתונים", clue: "חצי מיליארד ציפורים בשנה עוברות דרך עמק החולה", detail: "אגמון החולה — תחנת תדלוק בינלאומית קריטית" },
  { id: "notebook", x: "45%", y: "55%", emoji: "📓", label: "יומן שדה", clue: "85% מחסידות מזרח אירופה — כחצי מיליון — עוברות דרך ישראל!", detail: "חסידה עם GPS תועדה טסה 11,000 ק״מ ברצף" },
  { id: "map", x: "80%", y: "60%", emoji: "🗺️", label: "מפת ביצות", clue: "ביצות, שדות חקלאיים ובריכות דגים — מקורות מזון ומנוחה", detail: "שילוב מים, מזון ושטחים פתוחים = גן עדן לציפורים" },
  { id: "feather", x: "30%", y: "75%", emoji: "🔬", label: "נוצה על השולחן", clue: "נוצה אפורה ענקית — של עגור. ידוע בריקודי חיזור מרהיבים", detail: "שם העגור באתב״ש הוא: ״שבוק״" },
];

const researchCards = [
  { id: "hula", title: "אגמון החולה", emoji: "🌿", content: "עמק החולה בצפון הוא ״האב של האקולוגיה הצפונית״. ביצות, שדות חקלאיים ובריכות דגים מושכים חצי מיליארד ציפורים בשנה! עד 40,000 עגורים אפורים חונים כאן כל חורף.", hiddenClue: "מספר העגורים: 40,000 — ארבעים אלף!" },
  { id: "v-form", title: "תצורת V", emoji: "✈️", content: "כשעגורים טסים בתצורת V, כל ציפור ׳רוכבת׳ על זרם האוויר — חיסכון של עד 70% באנרגיה! הן מתחלפות בהובלה." },
  { id: "stopover", title: "תחנות תדלוק", emoji: "⛽", content: "תחנות תדלוק (Stopover sites) הן מקומות בהם ציפורים נחות, אוכלות ושותות. בלי תחנות כאלה הנדידה בלתי אפשרית. החולה היא תחנת תדלוק מרכזית." },
];

// Atbash target: "עגור" (the crane)
const ATBASH_ANSWER = "עגור";
const ATBASH_ENCODED = encodeAtbash(ATBASH_ANSWER);

const Station2Hula = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [discoveredHotspots, setDiscoveredHotspots] = useState<Set<string>>(new Set());
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [researchDone, setResearchDone] = useState(false);
  const [atbashDone, setAtbashDone] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [errors, setErrors] = useState(0);

  const allDiscovered = discoveredHotspots.size === hotspots.length;
  const reward = getStationReward(1);

  const handleHotspotClick = (id: string) => {
    playClick();
    setActiveHotspot(activeHotspot === id ? null : id);
    if (!discoveredHotspots.has(id)) { playSuccess(); setDiscoveredHotspots(prev => new Set([...prev, id])); }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${hulaBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-0 bg-background/75 backdrop-blur-[2px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-6 station-glow-1">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-station-1/10 border border-station-1/25 flex items-center justify-center text-5xl mx-auto mb-3">🌿</div>
                  <h2 className="text-2xl font-black text-station-1">תחנה 2: אגמון החולה</h2>
                  <p className="text-sm text-muted-foreground mt-1">תחנת התצפית • חקירת שטח</p>
                </div>
                <NarrationPlayer
                  text="הגעתם לצפון — לאגמון החולה! זה אחד ממרכזי הצפרות המדהימים בעולם. הפורץ סגר את כל המסכים בתחנת התצפית. תצטרכו לחפש 5 רמזים חבויים, לצפות בסרטון, לחקור בכרטיסי מידע, ולפענח צופן אתב״ש מסתורי שמסתתר באחד הרמזים. רק כך תגלו את האות השנייה!"
                  className="mb-4"
                />
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => { playClick(); setPhase("investigate"); }} className="bg-gradient-to-l from-station-1 to-station-1/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-1/20">
                    🔍 היכנסו לתחנה
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* INVESTIGATE */}
          {phase === "investigate" && (
            <motion.div key="investigate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-1 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-station-1 bg-station-1/10 px-3 py-1 rounded-lg border border-station-1/20">🌿 שלב 1: חקירת שטח</span>
                  <span className="text-[10px] text-muted-foreground">{discoveredHotspots.size}/{hotspots.length}</span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full mb-3 overflow-hidden">
                  <motion.div className="h-full bg-station-1 rounded-full" animate={{ width: `${(discoveredHotspots.size / hotspots.length) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground text-right mb-3">🔍 לחצו על 5 האלמנטים כדי לחשוף רמזים. <strong className="text-foreground">שימו לב לרמז האחרון — יש בו צופן!</strong></p>
                <div className="relative bg-muted/15 rounded-xl border border-border/20 h-56 overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.04]">
                    <div className="absolute top-[5%] left-[30%] text-7xl">🌿</div>
                    <div className="absolute bottom-[5%] right-[20%] text-6xl">🌾</div>
                  </div>
                  {hotspots.map(hs => {
                    const discovered = discoveredHotspots.has(hs.id);
                    return (
                      <motion.button key={hs.id} onClick={() => handleHotspotClick(hs.id)}
                        className={`absolute z-10 ${!discovered && "animate-pulse-glow"}`}
                        style={{ left: hs.x, top: hs.y, transform: "translate(-50%, -50%)" }}
                        whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg border-2 ${discovered ? "bg-station-1/15 border-station-1/40" : "bg-muted/40 border-primary/30 hover:border-primary shadow-md"}`}>
                          {hs.emoji}
                        </div>
                        <span className="text-[7px] font-bold block mt-0.5 text-center text-foreground/50">{hs.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {activeHotspot && (() => {
                    const hs = hotspots.find(h => h.id === activeHotspot)!;
                    return (
                      <motion.div key={activeHotspot} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 bg-station-1/8 border border-station-1/20 rounded-xl p-3 text-right">
                        <p className="text-xs font-bold text-station-1 mb-1">{hs.emoji} {hs.label}</p>
                        <p className="text-[11px] leading-[1.8] text-foreground/80">״{hs.clue}״</p>
                        <p className="text-[10px] text-muted-foreground italic mt-1">{hs.detail}</p>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
              {allDiscovered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-station-1 mb-2">🔓 כל הרמזים נחשפו!</p>
                  <p className="text-xs text-muted-foreground mb-3">שמתם לב לצופן ברמז של הנוצה? עכשיו צפו בסרטון וחקרו!</p>
                  <button onClick={() => { playClick(); setPhase("video"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🎬 לסרטון
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* VIDEO */}
          {phase === "video" && (
            <motion.div key="video" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-1">
                <p className="text-xs font-black text-station-1 mb-3">🎬 שלב 2: צפו וחקרו</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  צפו בסרטון על עגורים באגמון החולה. <strong className="text-foreground">כמה עגורים חונים בחולה בחורף?</strong> תזדקקו למספר הזה!
                </p>
                <YouTubeEmbed videoId="kYsG5ml1ARY" title="עגורים באגמון החולה" className="mb-3" />
              </div>
              <div className="text-center">
                <button onClick={() => { playClick(); setPhase("research"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                  ➡️ למשימת החקר
                </button>
              </div>
            </motion.div>
          )}

          {/* RESEARCH */}
          {phase === "research" && (
            <motion.div key="research" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-1">
                <p className="text-xs font-black text-station-1 mb-3">🔬 שלב 3: משימת חקר</p>
                <ResearchMission
                  prompt="פרופסור דרור שואל: ׳כמה עגורים אפורים חונים באגמון החולה כל חורף? חפשו את המספר המדויק!׳"
                  cards={researchCards}
                  targetCardId="hula"
                  question="כמה עגורים חונים בחולה כל חורף? (מספר)"
                  correctAnswer={["40000", "40,000", "ארבעים אלף", "40.000"]}
                  onComplete={() => { setResearchDone(true); setShowCorrectEffect(true); }}
                  onOpenResearch={onOpenResearch}
                />
              </div>
              {researchDone && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <p className="text-xs text-primary mb-2">✅ נכון — 40,000 עגורים! עכשיו פענחו את הצופן</p>
                  <button onClick={() => { playClick(); setPhase("decode"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🔐 לפענוח הצופן
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* DECODE - Atbash */}
          {phase === "decode" && (
            <motion.div key="decode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-1">
                <p className="text-xs font-black text-station-1 mb-3">🔐 שלב 4: פענוח צופן אתב״ש</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  ברמז של הנוצה מצאתם ש״שם העגור באתב״ש הוא: ״{ATBASH_ENCODED}״. <strong className="text-foreground">פענחו — מה המילה האמיתית?</strong>
                </p>
                <AtbashDecoder
                  encodedMessage={ATBASH_ENCODED}
                  correctAnswer={ATBASH_ANSWER}
                  explanation="העגור האפור — אחד העופות המרשימים בטבע. עד 40,000 חונים בחולה בחורף!"
                  onDecode={() => { setAtbashDone(true); setShowCorrectEffect(true); setTimeout(() => { playReveal(); setPhase("reward"); }, 1500); }}
                />
              </div>
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 station-glow-1 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-5xl mx-auto shadow-xl shadow-primary/20">{reward?.emoji}</div>
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
                  ״נפלא! פתחתם את תחנת התצפית של החולה. חצי מיליארד אורחים בשנה — אכסנייה עולמית לציפורים!״
                </p>
              </div>
              <button onClick={() => onComplete("ד", errors, 0)} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-secondary/20">
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
