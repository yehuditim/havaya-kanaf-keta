import { useState } from "react";
import eilatBg from "../../assets/backgrounds/eilat-desert.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import BirdIcon, { birdIdToIcon } from "../BirdIcon";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";

/**
 * Station 1: Eilat Gateway — "Sort the Migrants"
 */

interface Props {
  onComplete: (letter: string) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

interface BirdCard {
  id: string;
  name: string;
  iconType: "stork" | "crane" | "pelican" | "warbler" | "robin" | "flycatcher";
  type: "soaring" | "night";
  fact: string;
}

const birds: BirdCard[] = [
  { id: "stork", name: "חסידה לבנה", iconType: "stork", type: "soaring", fact: "רוכבת על תרמיקות ביום, נמנעת מחציית ימים" },
  { id: "crane", name: "עגור אפור", iconType: "crane", type: "soaring", fact: "טס בתצורת V בגובה אלפי מטרים, חוסך 70% אנרגיה" },
  { id: "pelican", name: "שקנאי לבן", iconType: "pelican", type: "soaring", fact: "דואה ענק — מוטת כנפיים של 3 מטר!" },
  { id: "warbler", name: "סבכי", iconType: "warbler", type: "night", fact: "טס לבד בחשיכה, מנווט לפי כוכבים" },
  { id: "robin", name: "אדום-חזה", iconType: "robin", type: "night", fact: "נודד לילה — נמנע מטורפים ומחום" },
  { id: "flycatcher", name: "זמיר", iconType: "flycatcher", type: "night", fact: "ציפור שיר קטנה שטסה אלפי ק״מ בלילות" },
];

type Phase = "briefing" | "sort" | "match" | "reward";

interface MatchItem {
  id: string;
  behavior: string;
  explanation: string;
  correct: string;
}

const matchItems: MatchItem[] = [
  { id: "hyperphagia", behavior: "אוכלות כמויות עצומות לפני הנדידה", explanation: "היפרפגיה — צבירת עד 50% שומן ממשקל הגוף!", correct: "fuel" },
  { id: "thermals", behavior: "רוכבות על זרמי אוויר חם שעולים מהקרקע", explanation: "תרמיקות — עמודי אוויר חם שמאפשרים דאייה ללא מאמץ", correct: "fly" },
  { id: "stopover", behavior: "עוצרות לנוח ולאכול בתחנות לאורך הדרך", explanation: "תחנות תדלוק (Stopover) — בלעדיהן הנדידה בלתי אפשרית!", correct: "rest" },
];

const matchTargets = [
  { id: "fuel", label: "⛽ תדלוק", emoji: "⛽" },
  { id: "fly", label: "🌤️ תעופה", emoji: "🌤️" },
  { id: "rest", label: "🏕️ מנוחה", emoji: "🏕️" },
];

const Station1Eilat = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [sortedBirds, setSortedBirds] = useState<{ soaring: string[]; night: string[] }>({ soaring: [], night: [] });
  const [selectedBird, setSelectedBird] = useState<string | null>(null);
  const [sortErrors, setSortErrors] = useState(0);
  const [matchAnswers, setMatchAnswers] = useState<{ [itemId: string]: string }>({});
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matchErrors, setMatchErrors] = useState(0);
  const [showSortResult, setShowSortResult] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);

  const unsortedBirds = birds.filter(
    b => !sortedBirds.soaring.includes(b.id) && !sortedBirds.night.includes(b.id)
  );

  const handleSelectBird = (id: string) => {
    playClick();
    setSelectedBird(selectedBird === id ? null : id);
  };

  const handleDropInBucket = (bucket: "soaring" | "night") => {
    if (!selectedBird) return;
    const bird = birds.find(b => b.id === selectedBird);
    if (!bird) return;

    if (bird.type === bucket) {
      playSuccess();
      setSortedBirds(prev => ({ ...prev, [bucket]: [...prev[bucket], bird.id] }));
    } else {
      playError();
      setSortErrors(e => e + 1);
    }
    setSelectedBird(null);
  };

  const allSorted = unsortedBirds.length === 0;

  const handleMatchSelect = (itemId: string) => {
    playClick();
    setSelectedMatch(selectedMatch === itemId ? null : itemId);
  };

  const handleMatchTarget = (targetId: string) => {
    if (!selectedMatch) return;
    const item = matchItems.find(m => m.id === selectedMatch);
    if (!item) return;

    if (item.correct === targetId) {
      playSuccess();
      setMatchAnswers(prev => ({ ...prev, [item.id]: targetId }));
    } else {
      playError();
      setMatchErrors(e => e + 1);
    }
    setSelectedMatch(null);
  };

  const allMatched = Object.keys(matchAnswers).length === matchItems.length;
  const reward = getStationReward(0);

  return (
    <div className="min-h-screen bg-adventure stars-bg p-4 flex flex-col items-center justify-center">
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full">
        {/* Navigation */}
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card rounded-2xl p-6 station-glow-3">
              <div className="text-center mb-5">
                <div className="w-20 h-20 rounded-2xl bg-station-3/10 border border-station-3/25 flex items-center justify-center text-5xl mx-auto mb-3">🏜️</div>
                <h2 className="text-2xl font-black text-station-3">תחנה 1: שער אילת</h2>
                <p className="text-sm text-muted-foreground mt-1">הכניסה הדרומית • משימת מיון</p>
              </div>
              <div className="bg-muted/25 rounded-xl p-4 mb-5 border border-border/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👨‍🔬</span>
                  <span className="text-xs font-bold text-muted-foreground">פרופסור דרור</span>
                </div>
                <p className="text-[13px] leading-[2] text-foreground/85 italic text-right">
                  ״הגעתם לאילת! כאן נוחתות ציפורים אחרי מסע של 2,000 ק״מ מעל מדבר סהרה.
                  הפורץ ערבב את כל תיקי הציפורים — יש לכם 6 כרטיסי ציפורים שצריך למיין:
                  אילו טסות ביום על תרמיקות (דואים) ואילו טסות בלילה.
                  אחרי המיון, תצטרכו להתאים התנהגויות נדידה. בהצלחה!״
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button onClick={() => { playClick(); setPhase("sort"); }} className="bg-gradient-to-l from-station-3 to-station-3/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-3/20">
                  🔍 התחילו למיין!
                </button>
                <button onClick={() => { playClick(); onOpenResearch(); }} className="text-accent/60 text-xs hover:text-accent transition-colors">
                  📚 בדקו בארכיון המחקר קודם
                </button>
              </div>
            </motion.div>
          )}

          {/* SORT PHASE */}
          {phase === "sort" && (
            <motion.div key="sort" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-3 mb-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-station-3 bg-station-3/10 px-3 py-1 rounded-lg border border-station-3/20">🏜️ שלב 1: מיון ציפורים</span>
                  <span className="text-[10px] text-muted-foreground">{6 - unsortedBirds.length}/6 מוינו</span>
                </div>

                <p className="text-xs text-muted-foreground text-right mb-4">
                  בחרו ציפור ➜ לחצו על הקטגוריה הנכונה
                </p>

                {/* Bird cards */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {birds.map(bird => {
                    const isSorted = sortedBirds.soaring.includes(bird.id) || sortedBirds.night.includes(bird.id);
                    const isSelected = selectedBird === bird.id;
                    return (
                      <motion.button
                        key={bird.id}
                        layout
                        onClick={() => !isSorted && handleSelectBird(bird.id)}
                        disabled={isSorted}
                        className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                          isSorted
                            ? "bg-primary/5 border-primary/20 opacity-50"
                            : isSelected
                              ? "bg-station-3/15 border-station-3 scale-105 shadow-md shadow-station-3/15"
                              : "bg-muted/30 border-border/25 hover:border-station-3/40"
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          <BirdIcon type={bird.iconType} size={36} className={isSorted ? "text-primary/50" : isSelected ? "text-station-3" : "text-foreground/70"} />
                        </div>
                        <span className="text-[11px] font-bold block">{bird.name}</span>
                        {isSorted && <span className="text-[9px] text-primary">✓</span>}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Buckets */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDropInBucket("soaring")}
                    className={`p-4 rounded-xl border-2 border-dashed transition-all text-center ${
                      selectedBird ? "border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer" : "border-border/25 bg-muted/10"
                    }`}
                  >
                    <span className="text-2xl block mb-1">☀️</span>
                    <span className="text-xs font-black text-primary">דואים (יום)</span>
                    <p className="text-[9px] text-muted-foreground mt-1">תרמיקות • להקות • גדולים</p>
                    <div className="flex justify-center gap-1 mt-2">
                      {sortedBirds.soaring.map(id => {
                        const b = birds.find(x => x.id === id);
                        return b ? <BirdIcon key={id} type={b.iconType} size={18} className="text-primary/60" /> : null;
                      })}
                    </div>
                  </button>
                  <button
                    onClick={() => handleDropInBucket("night")}
                    className={`p-4 rounded-xl border-2 border-dashed transition-all text-center ${
                      selectedBird ? "border-accent/50 bg-accent/5 hover:bg-accent/10 cursor-pointer" : "border-border/25 bg-muted/10"
                    }`}
                  >
                    <span className="text-2xl block mb-1">🌙</span>
                    <span className="text-xs font-black text-accent">נודדי לילה</span>
                    <p className="text-[9px] text-muted-foreground mt-1">כוכבים • לבד • קטנים</p>
                    <div className="flex justify-center gap-1 mt-2">
                      {sortedBirds.night.map(id => {
                        const b = birds.find(x => x.id === id);
                        return b ? <BirdIcon key={id} type={b.iconType} size={18} className="text-accent/60" /> : null;
                      })}
                    </div>
                  </button>
                </div>

                {sortErrors > 0 && (
                  <p className="text-[10px] text-destructive text-center mt-2">💡 רמז: דואים הם עופות גדולים שצריכים תרמיקות. נודדי לילה הם ציפורי שיר קטנות.</p>
                )}
              </div>

              {/* Sort complete transition */}
              {allSorted && !showSortResult && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-5 text-center">
                  <p className="text-sm font-bold text-primary mb-2">🎉 כל הציפורים מוינו נכון!</p>
                  <div className="space-y-1 mb-4">
                    {birds.map(b => (
                      <div key={b.id} className="flex items-center gap-2 justify-center text-[11px] text-foreground/70">
                        <BirdIcon type={b.iconType} size={16} className="text-foreground/50" />
                        <span>{b.name}: {b.fact}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { playClick(); setShowSortResult(true); setPhase("match"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    ➡️ לשלב הבא: התאמת התנהגויות
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* MATCH PHASE */}
          {phase === "match" && (
            <motion.div key="match" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-station-3 bg-station-3/10 px-3 py-1 rounded-lg border border-station-3/20">🏜️ שלב 2: התאמת התנהגויות</span>
                  <span className="text-[10px] text-muted-foreground">{Object.keys(matchAnswers).length}/3</span>
                </div>

                <p className="text-xs text-muted-foreground text-right mb-4">
                  בחרו התנהגות ➜ לחצו על הקטגוריה המתאימה
                </p>

                {/* Behavior cards */}
                <div className="space-y-2 mb-4">
                  {matchItems.map(item => {
                    const matched = matchAnswers[item.id];
                    const isSelected = selectedMatch === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => !matched && handleMatchSelect(item.id)}
                        disabled={!!matched}
                        className={`w-full text-right p-3 rounded-xl border-2 transition-all ${
                          matched
                            ? "bg-primary/8 border-primary/25 opacity-60"
                            : isSelected
                              ? "bg-station-3/10 border-station-3 shadow-sm"
                              : "bg-muted/25 border-border/20 hover:border-station-3/30"
                        }`}
                      >
                        <p className="text-xs font-bold">{matched ? "✅ " : ""}{item.behavior}</p>
                        {matched && <p className="text-[10px] text-primary mt-1">{item.explanation}</p>}
                      </button>
                    );
                  })}
                </div>

                {/* Targets */}
                <div className="grid grid-cols-3 gap-2">
                  {matchTargets.map(target => {
                    const used = Object.values(matchAnswers).includes(target.id);
                    return (
                      <button
                        key={target.id}
                        onClick={() => handleMatchTarget(target.id)}
                        disabled={used || !selectedMatch}
                        className={`p-3 rounded-xl border-2 border-dashed text-center transition-all ${
                          used
                            ? "bg-primary/5 border-primary/20 opacity-40"
                            : selectedMatch
                              ? "border-station-3/40 hover:bg-station-3/10 cursor-pointer"
                              : "border-border/20 bg-muted/10"
                        }`}
                      >
                        <span className="text-xl block mb-1">{target.emoji}</span>
                        <span className="text-[10px] font-bold">{target.label}</span>
                      </button>
                    );
                  })}
                </div>

                {matchErrors > 0 && (
                  <p className="text-[10px] text-destructive text-center mt-2">💡 חשבו: אכילה = תדלוק, תרמיקות = תעופה, עצירה = מנוחה</p>
                )}
              </div>

              {allMatched && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center">
                  <button onClick={() => { playReveal(); setPhase("reward"); }} className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
                    🔑 חשפו את הפריט והאות!
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card rounded-2xl p-6 station-glow-3 text-center">
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
                <span className="text-3xl font-black text-primary">נ</span>
              </motion.div>

              <div className="bg-muted/25 rounded-xl p-4 mb-5 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״מעולה! שחזרתם את נתוני תחנת אילת. עכשיו אתם מבינים למה הנגב הוא שער חיים — ציפורים שחצו 2,000 ק״מ של מדבר מגיעות לכאן על סף התמוטטות.״
                </p>
              </div>

              <button onClick={() => onComplete("נ")} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-secondary/20">
                ➡️ חזרה למפה
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Station1Eilat;
