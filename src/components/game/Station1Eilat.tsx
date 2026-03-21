import { useState } from "react";
import eilatBg from "../../assets/backgrounds/eilat-desert.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import BirdIcon from "../BirdIcon";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";
import NarrationPlayer from "./NarrationPlayer";
import CodeLock from "./CodeLock";
import ResearchMission from "./ResearchMission";
import SceneExplorer, { type SceneHotspot } from "./SceneExplorer";

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

type Phase = "briefing" | "explore" | "research" | "sort" | "lock" | "reward";

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

const sceneHotspots: SceneHotspot[] = [
  { id: "exhausted-bird", x: "25%", y: "65%", emoji: "🦅", label: "ציפור עייפה", clue: "ציפור נחתה על סלע, רזה ותשושה. היא טסה 2,000 ק״מ מעל מדבר סהרה — בלי מים ובלי מזון.", detail: "אילת היא תחנת התדלוק הראשונה אחרי המדבר" },
  { id: "oasis", x: "70%", y: "45%", emoji: "🌴", label: "נווה מדבר", clue: "בריכות מים קטנות באמצע המדבר. ציפורים שותות בשקיקה — הגוף שלהן איבד עד 30% מהמים.", detail: "בלי תחנות תדלוק כאלה, רוב הציפורים לא ישרדו" },
  { id: "scale", x: "45%", y: "30%", emoji: "⚖️", label: "משקל שדה", clue: "על המאזניים מדידות שדה: ציפורים שוקלות הרבה יותר לפני הנדידה מאשר אחריה. הגוף מאחסן כמות עצומה של אנרגיה לטיסה הארוכה — אבל כמה בדיוק?", detail: "בארכיון המחקר — כרטיס 'היפרפגיה' — תמצאו את הנתון המדויק הנדרש למנעול" },
  { id: "binoculars", x: "82%", y: "20%", emoji: "🔭", label: "עמדת תצפית", clue: "מהעמדה רואים להקות ענקיות: דואים גדולים רוכבים על תרמיקות ביום, וציפורי שיר קטנות טסות בלילה.", detail: "שני סוגי נודדים: דואים (יום) ונודדי לילה" },
  { id: "sign", x: "15%", y: "35%", emoji: "🗺️", label: "שלט מידע", clue: "ישראל — צוואר בקבוק על הנתיב האפרו-פליארקטי. כמיליארד ציפורים עוברות כאן פעמיים בשנה!", detail: "אחד ממסלולי הנדידה הגדולים בעולם" },
];

const researchCards = [
  { id: "flyway", title: "הנתיב האפרו-פליארקטי", emoji: "🗺️", content: "ישראל נמצאת על הנתיב האפרו-פליארקטי — אחד ממסלולי הנדידה הגדולים בעולם. כמיליארד ציפורים חולפות דרכה פעמיים בשנה. ישראל היא ׳צוואר בקבוק׳ — רצועת יבשה צרה בין שלוש יבשות.", hiddenClue: "המספר הקריטי: כמיליארד ציפורים, פעמיים בשנה." },
  { id: "soaring", title: "דואים מול נודדי לילה", emoji: "☀️", content: "דואים (חסידות, שקנאים, דורסים) — עופות גדולים שרוכבים על תרמיקות ביום. הם נמנעים מלחצות ימים. נודדי לילה (סבכיים, זמירים) — ציפורי שיר קטנות שטסות בחשיכה." },
  { id: "hyperphagia", title: "היפרפגיה — תדלוק לפני הטיסה", emoji: "⚖️", content: "לפני נדידה ציפורים עוברות היפרפגיה — אכילה מוגברת שמעלה את משקלן עד 50% בשומן. תהליך זה נמשך כשבועיים, ובסופו הגוף מוכן לטיסה הארוכה.", hiddenClue: "כמה אחוז שומן ממשקל הגוף ציפור מסוגלת לצבור בהיפרפגיה?" },
  { id: "eilat", title: "אילת — שער הכניסה", emoji: "🏜️", content: "אילת היא תחנת הדלק הראשונה אחרי 2,000 ק״מ של מדבר סהרה. פסטיבל הצפרות באילת (מרץ) הוא אירוע בינלאומי." },
];

const phaseVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};
const phaseTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

const Station1Eilat = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [sortedBirds, setSortedBirds] = useState<{ soaring: string[]; night: string[] }>({ soaring: [], night: [] });
  const [selectedBird, setSelectedBird] = useState<string | null>(null);
  const [sortErrors, setSortErrors] = useState(0);
  const [researchDone, setResearchDone] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [sceneComplete, setSceneComplete] = useState(false);

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
    <div className="min-h-screen p-3 sm:p-4 flex flex-col items-center justify-center relative overflow-x-hidden overflow-y-auto">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${eilatBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/30 to-background/60 backdrop-blur-[1px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10 mt-12 sm:mt-0">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-4">
              <div className="glass-card-immersive rounded-2xl p-5 station-glow-3">
                <div className="text-center mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-station-3/10 border border-station-3/25 flex items-center justify-center text-4xl mx-auto mb-2">🏜️</div>
                  <h2 className="text-xl font-black text-station-3">תחנה 1: שער אילת</h2>
                  <p className="text-[11px] text-muted-foreground mt-1">הכניסה הדרומית • חקירת נדידה</p>
                </div>

                <NarrationPlayer
                  text="הגעתם לאילת — השער הדרומי של ישראל. כאן, אחרי טיסה של אלפיים קילומטר מעל מדבר סהרה, נוחתות ציפורים על סף התמוטטות. חפשו 5 רמזים חבויים בסצנת המדבר, חקרו בכרטיסי המחקר, מיינו ציפורים, ופצחו את המנעול!"
                  speechText="הִגַּעְתֶּם לְאֵילַת — הַשַּׁעַר הַדְּרוֹמִי שֶׁל יִשְׂרָאֵל. כָּאן, אַחֲרֵי טִיסָה שֶׁל אַלְפַּיִם קִילוֹמֶטֶר מֵעַל מִדְבַּר סָהָרָה, נוֹחֲתוֹת צִפּוֹרִים עַל סַף הִתְמוֹטְטוּת. חַפְּשׂוּ 5 רְמָזִים חֲבוּיִים בִּסְצֵנַת הַמִּדְבָּר, חָקְרוּ בְּכַרְטִיסֵי הַמֶּחְקָר, מִיְּנוּ צִפּוֹרִים, וּפָצְחוּ אֶת הַמַּנְעוּל!"
                  className="mb-3"
                />

                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => { playClick(); setPhase("explore"); }} className="bg-gradient-to-l from-station-3 to-station-3/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-3/20">
                    🔍 סרקו את הסצנה
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
            <motion.div key="explore" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition}>
              <SceneExplorer
                hotspots={sceneHotspots}
                backgroundImage={eilatBg}
                instruction="🔍 לחצו על האלמנטים בסצנת המדבר כדי לחשוף רמזים"
                onAllDiscovered={() => setSceneComplete(true)}
                onGoMap={onGoMap}
              />
              {sceneComplete && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
                  <button onClick={() => { playClick(); setPhase("research"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all shadow-lg">
                    🔬 למשימת החקר
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* RESEARCH MISSION */}
          {phase === "research" && (
            <motion.div key="research" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card-immersive rounded-2xl p-4 station-glow-3">
                <p className="text-xs font-black text-station-3 mb-2">🔬 שלב 2: משימת חקר</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  מצאתם בסצנה שציפורים צוברות שומן לפני נדידה. <strong className="text-foreground">כמה אחוז? חפשו בכרטיסים!</strong>
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
            <motion.div key="sort" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition}>
              <div className="glass-card-immersive rounded-2xl p-4 station-glow-3 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-station-3 bg-station-3/10 px-3 py-1 rounded-lg border border-station-3/20">🏜️ שלב 3: מיון ציפורים</span>
                  <span className="text-[10px] text-muted-foreground">{6 - unsortedBirds.length}/6</span>
                </div>
                <p className="text-xs text-muted-foreground text-right mb-3">
                  בסצנה ראיתם: דואים גדולים ביום, ציפורי שיר בלילה. <strong className="text-foreground">מיינו!</strong>
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {birds.map(bird => {
                    const isSorted = sortedBirds.soaring.includes(bird.id) || sortedBirds.night.includes(bird.id);
                    const isSelected = selectedBird === bird.id;
                    return (
                      <motion.button key={bird.id} layout onClick={() => !isSorted && handleSelectBird(bird.id)} disabled={isSorted}
                        className={`p-2.5 rounded-xl border-2 text-center transition-all ${isSorted ? "bg-primary/5 border-primary/20 opacity-50" : isSelected ? "bg-station-3/15 border-station-3 scale-105 shadow-md" : "bg-background/30 border-border/20 hover:border-station-3/40"}`}>
                        <div className="flex justify-center mb-1"><BirdIcon type={bird.iconType} size={32} className={isSorted ? "text-primary/50" : isSelected ? "text-station-3" : "text-foreground/70"} /></div>
                        <span className="text-[10px] font-bold block">{bird.name}</span>
                        {isSorted && <span className="text-[8px] text-primary">✓</span>}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleDropInBucket("soaring")} className={`p-3 rounded-xl border-2 border-dashed text-center transition-all ${selectedBird ? "border-primary/50 bg-primary/5 hover:bg-primary/10" : "border-border/25 bg-background/20"}`}>
                    <span className="text-xl block mb-0.5">☀️</span>
                    <span className="text-[10px] font-black text-primary">דואים (יום)</span>
                    <div className="flex justify-center gap-1 mt-1">{sortedBirds.soaring.map(id => { const b = birds.find(x => x.id === id); return b ? <BirdIcon key={id} type={b.iconType} size={14} className="text-primary/60" /> : null; })}</div>
                  </button>
                  <button onClick={() => handleDropInBucket("night")} className={`p-3 rounded-xl border-2 border-dashed text-center transition-all ${selectedBird ? "border-accent/50 bg-accent/5 hover:bg-accent/10" : "border-border/25 bg-background/20"}`}>
                    <span className="text-xl block mb-0.5">🌙</span>
                    <span className="text-[10px] font-black text-accent">נודדי לילה</span>
                    <div className="flex justify-center gap-1 mt-1">{sortedBirds.night.map(id => { const b = birds.find(x => x.id === id); return b ? <BirdIcon key={id} type={b.iconType} size={14} className="text-accent/60" /> : null; })}</div>
                  </button>
                </div>
                {sortErrors > 0 && <p className="text-[10px] text-destructive text-center mt-2">💡 דואים = גדולים + תרמיקות + יום. נודדי לילה = קטנים + כוכבים + חשיכה</p>}
              </div>
              {allSorted && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-immersive rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-primary mb-2">🎉 כל הציפורים מוינו!</p>
                  <button onClick={() => { playClick(); setPhase("lock"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🔒 למנעול הקוד
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* LOCK PHASE */}
          {phase === "lock" && (
            <motion.div key="lock" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card-immersive rounded-2xl p-4 station-glow-3">
                <p className="text-xs font-black text-station-3 mb-2">🔒 שלב 4: מנעול קוד</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  זוכרים? <strong className="text-foreground">אחוז השומן שמצאתם על המשקל בסצנה ובכרטיסי המחקר</strong> — הכניסו אותו!
                </p>
                <CodeLock
                  correctCode="50"
                  label="🔒 הכניסו את אחוז השומן"
                  hint="חפשו בכרטיס ההיפרפגיה — כמה אחוז ממשקל הגוף?"
                  onUnlock={() => { setShowCorrectEffect(true); playReveal(); setTimeout(() => setPhase("reward"), 1200); }}
                />
              </div>
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="glass-card-immersive rounded-2xl p-5 station-glow-3 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-4xl mx-auto shadow-xl shadow-primary/20">{reward?.emoji}</div>
              </motion.div>
              <h2 className="text-lg font-black text-primary mb-1">פריט התגלה!</h2>
              <p className="text-sm font-bold text-foreground/80 mb-1">{reward?.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{reward?.description}</p>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary rounded-xl px-5 py-3 mb-3">
                <span className="text-xs text-muted-foreground">אות נחשפה:</span>
                <span className="text-3xl font-black text-primary">נ</span>
              </motion.div>
              <div className="bg-background/30 backdrop-blur-sm rounded-xl p-3 mb-4 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״מצוין! שחזרתם את הנתונים של תחנת אילת. ציפורים מגיעות לכאן רזות ועייפות — אילת מצילה את חייהן!״
                </p>
              </div>
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
