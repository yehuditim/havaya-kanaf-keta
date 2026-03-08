import { useState } from "react";
import eilatBg from "../../assets/backgrounds/eilat-desert.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import BirdIcon, { birdIdToIcon } from "../BirdIcon";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";
import NarrationPlayer from "./NarrationPlayer";
import YouTubeEmbed from "./YouTubeEmbed";
import CodeLock from "./CodeLock";
import ResearchMission from "./ResearchMission";

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

type Phase = "briefing" | "video" | "research" | "sort" | "lock" | "reward";

interface BirdCard {
  id: string;
  name: string;
  iconType: "stork" | "crane" | "pelican" | "warbler" | "robin" | "flycatcher";
  type: "soaring" | "night";
  fact: string;
}

const birds: BirdCard[] = [
  { id: "stork", name: "חסידה לבנה", iconType: "stork", type: "soaring", fact: "רוכבת על תרמיקות ביום, נמנעת מחציית ימים" },
  { id: "crane", name: "עגור אפור", iconType: "crane", type: "soaring", fact: "טס בתצורת V בגובה אלפי מטרים" },
  { id: "pelican", name: "שקנאי לבן", iconType: "pelican", type: "soaring", fact: "דואה ענק — מוטת כנפיים של 3 מטר!" },
  { id: "warbler", name: "סבכי", iconType: "warbler", type: "night", fact: "טס לבד בחשיכה, מנווט לפי כוכבים" },
  { id: "robin", name: "אדום-חזה", iconType: "robin", type: "night", fact: "נודד לילה — נמנע מטורפים ומחום" },
  { id: "flycatcher", name: "זמיר", iconType: "flycatcher", type: "night", fact: "ציפור שיר קטנה שטסה אלפי ק״מ בלילות" },
];

const researchCards = [
  { id: "flyway", title: "הנתיב האפרו-פליארקטי", emoji: "🗺️", content: "ישראל נמצאת על הנתיב האפרו-פליארקטי — אחד ממסלולי הנדידה הגדולים בעולם. כמיליארד ציפורים חולפות דרכה פעמיים בשנה. ישראל היא ׳צוואר בקבוק׳ — רצועת יבשה צרה בין שלוש יבשות.", hiddenClue: "המספר הקריטי: כמיליארד ציפורים, פעמיים בשנה." },
  { id: "soaring", title: "דואים מול נודדי לילה", emoji: "☀️", content: "דואים (חסידות, שקנאים, דורסים) — עופות גדולים שרוכבים על תרמיקות ביום. הם נמנעים מלחצות ימים. נודדי לילה (סבכיים, זמירים) — ציפורי שיר קטנות שטסות בחשיכה." },
  { id: "hyperphagia", title: "היפרפגיה — תדלוק לפני הטיסה", emoji: "⚖️", content: "לפני נדידה ציפורים עוברות היפרפגיה — אכילה מוגברת שמעלה את משקלן עד 50% בשומן. תהליך זה נמשך כשבועיים. אחוז השומן המדויק: עד 50 אחוז ממשקל הגוף.", hiddenClue: "הקוד הוא אחוז השומן שציפורים צוברות: 50" },
  { id: "eilat", title: "אילת — שער הכניסה", emoji: "🏜️", content: "אילת היא תחנת הדלק הראשונה אחרי 2,000 ק״מ של מדבר סהרה. פסטיבל הצפרות באילת (מרץ) הוא אירוע בינלאומי." },
];

const Station1Eilat = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [sortedBirds, setSortedBirds] = useState<{ soaring: string[]; night: string[] }>({ soaring: [], night: [] });
  const [selectedBird, setSelectedBird] = useState<string | null>(null);
  const [sortErrors, setSortErrors] = useState(0);
  const [researchDone, setResearchDone] = useState(false);
  const [lockUnlocked, setLockUnlocked] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const unsortedBirds = birds.filter(b => !sortedBirds.soaring.includes(b.id) && !sortedBirds.night.includes(b.id));
  const allSorted = unsortedBirds.length === 0;
  const reward = getStationReward(0);

  const handleSelectBird = (id: string) => { playClick(); setSelectedBird(selectedBird === id ? null : id); };

  const handleDropInBucket = (bucket: "soaring" | "night") => {
    if (!selectedBird) return;
    const bird = birds.find(b => b.id === selectedBird);
    if (!bird) return;
    if (bird.type === bucket) { playSuccess(); setSortedBirds(prev => ({ ...prev, [bucket]: [...prev[bucket], bird.id] })); }
    else { playError(); setSortErrors(e => e + 1); }
    setSelectedBird(null);
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${eilatBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-0 bg-background/75 backdrop-blur-[2px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING with Narration */}
          {phase === "briefing" && (
            <motion.div key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-6 station-glow-3">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-station-3/10 border border-station-3/25 flex items-center justify-center text-5xl mx-auto mb-3">🏜️</div>
                  <h2 className="text-2xl font-black text-station-3">תחנה 1: שער אילת</h2>
                  <p className="text-sm text-muted-foreground mt-1">הכניסה הדרומית • חקירת נדידה</p>
                </div>

                <NarrationPlayer
                  text="הגעתם לאילת — השער הדרומי של ישראל. כאן, אחרי טיסה של אלפיים קילומטר מעל מדבר סהרה, נוחתות ציפורים על סף התמוטטות. מישהו פרץ למחשב שלי ונעל את כל הנתונים. כדי לשחזר אותם, תצטרכו קודם ללמוד על הנדידה — לצפות בסרטון, לחפש מידע בכרטיסי המחקר, למיין את הציפורים, ולפענח את קוד המנעול. בהצלחה, חוקרים!"
                  className="mb-4"
                />

                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => { playClick(); setPhase("video"); }} className="bg-gradient-to-l from-station-3 to-station-3/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-3/20">
                    🎬 צפו בסרטון קודם
                  </button>
                  <button onClick={() => { playClick(); onOpenResearch(); }} className="text-accent/60 text-xs hover:text-accent transition-colors">
                    📚 או קפצו ישר לארכיון המחקר
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIDEO PHASE */}
          {phase === "video" && (
            <motion.div key="video" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-3">
                <p className="text-xs font-black text-station-3 mb-3">🎬 שלב 1: צפו וחקרו</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  צפו בסרטון ושימו לב: <strong className="text-foreground">אילו ציפורים טסות ביום ואילו בלילה?</strong> מה ההבדל בין דואים לנודדי לילה?
                </p>
                <YouTubeEmbed
                  videoId="bRz9TdDxM_0"
                  title="נדידת ציפורים בישראל"
                  className="mb-3"
                />
                <div className="bg-accent/5 rounded-lg p-2.5 border border-accent/15 text-right">
                  <p className="text-[10px] text-accent/80">💡 <strong>טיפ מפרופסור דרור:</strong> שימו לב למילה ״תרמיקות״ בסרטון — היא המפתח למשימת המיון!</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => { playClick(); setPhase("research"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                  ➡️ למשימת החקר
                </button>
              </div>
            </motion.div>
          )}

          {/* RESEARCH MISSION */}
          {phase === "research" && (
            <motion.div key="research" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-3">
                <p className="text-xs font-black text-station-3 mb-3">🔬 שלב 2: משימת חקר</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  חפשו בכרטיסי המחקר: <strong className="text-foreground">כמה אחוזי שומן ציפורים צוברות לפני הנדידה?</strong> המספר הזה הוא הקוד למנעול בשלב הבא!
                </p>
                <ResearchMission
                  prompt="פרופסור דרור מבקש: ׳חפשו בכרטיסי המחקר — כמה אחוזי שומן ציפורים צוברות בהיפרפגיה? הרשמו את המספר — תצטרכו אותו כדי לפתוח את המנעול!׳"
                  cards={researchCards}
                  targetCardId="hyperphagia"
                  question="כמה אחוזי שומן ציפורים צוברות לפני נדידה?"
                  correctAnswer={["50", "50%", "חמישים"]}
                  onComplete={() => { setResearchDone(true); setShowCorrectEffect(true); }}
                  onOpenResearch={onOpenResearch}
                />
              </div>
              {researchDone && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <p className="text-xs text-primary mb-2">✅ מצאתם את המספר — 50! זכרו אותו למנעול</p>
                  <button onClick={() => { playClick(); setPhase("sort"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    ➡️ למשימת המיון
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SORT PHASE */}
          {phase === "sort" && (
            <motion.div key="sort" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-3 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-station-3 bg-station-3/10 px-3 py-1 rounded-lg border border-station-3/20">🏜️ שלב 3: מיון ציפורים</span>
                  <span className="text-[10px] text-muted-foreground">{6 - unsortedBirds.length}/6</span>
                </div>
                <p className="text-xs text-muted-foreground text-right mb-3">
                  השתמשו במה שלמדתם מהסרטון והכרטיסים — מיינו כל ציפור לקטגוריה הנכונה
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {birds.map(bird => {
                    const isSorted = sortedBirds.soaring.includes(bird.id) || sortedBirds.night.includes(bird.id);
                    const isSelected = selectedBird === bird.id;
                    return (
                      <motion.button key={bird.id} layout onClick={() => !isSorted && handleSelectBird(bird.id)} disabled={isSorted}
                        className={`p-2.5 rounded-xl border-2 text-center transition-all ${isSorted ? "bg-primary/5 border-primary/20 opacity-50" : isSelected ? "bg-station-3/15 border-station-3 scale-105 shadow-md" : "bg-muted/30 border-border/25 hover:border-station-3/40"}`}>
                        <div className="flex justify-center mb-1"><BirdIcon type={bird.iconType} size={32} className={isSorted ? "text-primary/50" : isSelected ? "text-station-3" : "text-foreground/70"} /></div>
                        <span className="text-[10px] font-bold block">{bird.name}</span>
                        {isSorted && <span className="text-[8px] text-primary">✓</span>}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleDropInBucket("soaring")} className={`p-3 rounded-xl border-2 border-dashed text-center transition-all ${selectedBird ? "border-primary/50 bg-primary/5 hover:bg-primary/10" : "border-border/25 bg-muted/10"}`}>
                    <span className="text-xl block mb-0.5">☀️</span>
                    <span className="text-[10px] font-black text-primary">דואים (יום)</span>
                    <div className="flex justify-center gap-1 mt-1">{sortedBirds.soaring.map(id => { const b = birds.find(x => x.id === id); return b ? <BirdIcon key={id} type={b.iconType} size={14} className="text-primary/60" /> : null; })}</div>
                  </button>
                  <button onClick={() => handleDropInBucket("night")} className={`p-3 rounded-xl border-2 border-dashed text-center transition-all ${selectedBird ? "border-accent/50 bg-accent/5 hover:bg-accent/10" : "border-border/25 bg-muted/10"}`}>
                    <span className="text-xl block mb-0.5">🌙</span>
                    <span className="text-[10px] font-black text-accent">נודדי לילה</span>
                    <div className="flex justify-center gap-1 mt-1">{sortedBirds.night.map(id => { const b = birds.find(x => x.id === id); return b ? <BirdIcon key={id} type={b.iconType} size={14} className="text-accent/60" /> : null; })}</div>
                  </button>
                </div>
                {sortErrors > 0 && <p className="text-[10px] text-destructive text-center mt-2">💡 דואים = גדולים + תרמיקות + יום. נודדי לילה = קטנים + כוכבים + חשיכה</p>}
              </div>
              {allSorted && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-primary mb-2">🎉 כל הציפורים מוינו!</p>
                  <p className="text-xs text-muted-foreground mb-3">נשאר שלב אחרון — פתחו את המנעול כדי לחשוף את האות!</p>
                  <button onClick={() => { playClick(); setPhase("lock"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🔒 למנעול הקוד
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* LOCK PHASE */}
          {phase === "lock" && (
            <motion.div key="lock" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-3">
                <p className="text-xs font-black text-station-3 mb-3">🔒 שלב 4: מנעול קוד</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  זוכרים את המספר שמצאתם במשימת החקר? <strong className="text-foreground">אחוז השומן שציפורים צוברות לפני נדידה?</strong> הכניסו אותו כדי לפתוח!
                </p>
                <CodeLock
                  correctCode="50"
                  label="🔒 הכניסו את אחוז השומן"
                  hint="חפשו בכרטיס ההיפרפגיה — כמה אחוז ממשקל הגוף?"
                  onUnlock={() => { setLockUnlocked(true); setShowCorrectEffect(true); playReveal(); setTimeout(() => setPhase("reward"), 1200); }}
                />
              </div>
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 station-glow-3 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-5xl mx-auto shadow-xl shadow-primary/20">{reward?.emoji}</div>
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
                  ״מעולה! שחזרתם את נתוני תחנת אילת. כמיליארד ציפורים עוברות מעל ישראל — וכל אחת עוברת את הנדידה הקשה הזו רק בזכות התדלוק והכנה מדהימים. עכשיו אתם מבינים!״
                </p>
              </div>
              <p className="text-xs text-muted-foreground mb-4">💡 עגורים תועדו טסים בגובה 8,000 מטר — מעל הרי ההימלאיה!</p>
              <button onClick={() => onComplete("נ", sortErrors, hintsUsed)} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-secondary/20">
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
