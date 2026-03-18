import { useState } from "react";
import hulaBg from "../../assets/backgrounds/hula-wetlands.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";
import NarrationPlayer from "./NarrationPlayer";
import AtbashDecoder from "./AtbashDecoder";
import { encodeAtbash } from "./AtbashDecoder";
import ResearchMission from "./ResearchMission";
import SceneExplorer, { type SceneHotspot } from "./SceneExplorer";

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

type Phase = "briefing" | "explore" | "research" | "decode" | "reward";

const sceneHotspots: SceneHotspot[] = [
  { id: "binoculars", x: "15%", y: "25%", emoji: "🔭", label: "עמדת תצפית", clue: "להקות ענקיות של עופות אפורים רוקדים בשדות", detail: "עגורים אפורים — עד 40,000 חונים בחולה בחורף!" },
  { id: "screen", x: "72%", y: "18%", emoji: "🖥️", label: "מסך נתונים", clue: "חצי מיליארד ציפורים בשנה עוברות דרך עמק החולה", detail: "אגמון החולה — תחנת תדלוק בינלאומית קריטית" },
  { id: "notebook", x: "48%", y: "55%", emoji: "📓", label: "יומן שדה", clue: "85% מחסידות מזרח אירופה — כחצי מיליון — עוברות דרך ישראל!", detail: "חסידה עם GPS תועדה טסה 11,000 ק״מ ברצף" },
  { id: "map", x: "82%", y: "62%", emoji: "🗺️", label: "מפת ביצות", clue: "ביצות, שדות חקלאיים ובריכות דגים — מקורות מזון ומנוחה", detail: "שילוב מים, מזון ושטחים פתוחים = גן עדן לציפורים" },
  { id: "feather", x: "30%", y: "78%", emoji: "🔬", label: "נוצה על השולחן", clue: "נוצה אפורה ענקית — של עגור. ידוע בריקודי חיזור מרהיבים", detail: "שם העגור באתב״ש הוא: ״שבוק״" },
];

const researchCards = [
  { id: "hula", title: "אגמון החולה", emoji: "🌿", content: "עמק החולה בצפון הוא ״האב של האקולוגיה הצפונית״. ביצות, שדות חקלאיים ובריכות דגים מושכים חצי מיליארד ציפורים בשנה! עד 40,000 עגורים אפורים חונים כאן כל חורף.", hiddenClue: "המספר מופיע בסוף הפסקה — כמה עגורים חונים בחולה?" },
  { id: "v-form", title: "תצורת V", emoji: "✈️", content: "כשעגורים טסים בתצורת V, כל ציפור ׳רוכבת׳ על זרם האוויר — חיסכון של עד 70% באנרגיה! הן מתחלפות בהובלה." },
  { id: "stopover", title: "תחנות תדלוק", emoji: "⛽", content: "תחנות תדלוק (Stopover sites) הן מקומות בהם ציפורים נחות, אוכלות ושותות. בלי תחנות כאלה הנדידה בלתי אפשרית. החולה היא תחנת תדלוק מרכזית." },
];

const ATBASH_ANSWER = "עגור";
const ATBASH_ENCODED = encodeAtbash(ATBASH_ANSWER);

const phaseVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};
const phaseTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

const Station2Hula = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [sceneComplete, setSceneComplete] = useState(false);
  const [researchDone, setResearchDone] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [errors, setErrors] = useState(0);

  const reward = getStationReward(1);

  return (
    <div className="min-h-screen p-3 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${hulaBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/30 to-background/60 backdrop-blur-[1px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10 mt-12 sm:mt-0">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-4">
              <div className="glass-card-immersive rounded-2xl p-5 station-glow-1">
                <div className="text-center mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-station-1/10 border border-station-1/25 flex items-center justify-center text-4xl mx-auto mb-2">🌿</div>
                  <h2 className="text-xl font-black text-station-1">תחנה 2: אגמון החולה</h2>
                  <p className="text-[11px] text-muted-foreground mt-1">תחנת התצפית • חקירת שטח</p>
                </div>
                <NarrationPlayer
                  text="הגעתם לצפון — לאגמון החולה! זה אחד ממרכזי הצפרות המדהימים בעולם. חפשו 5 רמזים חבויים בתחנת התצפית, חקרו בכרטיסים, ופענחו צופן אתב״ש מסתורי!"
                  className="mb-3"
                />
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => { playClick(); setPhase("explore"); }} className="bg-gradient-to-l from-station-1 to-station-1/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-1/20">
                    🔍 סרקו את תחנת התצפית
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
                backgroundImage={hulaBg}
                instruction="🔍 חפשו 5 רמזים בתחנת התצפית — שימו לב לצופן ברמז האחרון!"
                onAllDiscovered={() => setSceneComplete(true)}
              />
              {sceneComplete && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <p className="text-xs text-primary mb-2">🔓 שמתם לב? ברמז של הנוצה יש צופן אתב״ש!</p>
                  <button onClick={() => { playClick(); setPhase("research"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🔬 למשימת החקר
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* RESEARCH */}
          {phase === "research" && (
            <motion.div key="research" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card-immersive rounded-2xl p-4 station-glow-1">
                <p className="text-xs font-black text-station-1 mb-2">🔬 שלב 2: משימת חקר</p>
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
            <motion.div key="decode" variants={phaseVariants} initial="initial" animate="animate" exit="exit" transition={phaseTransition} className="space-y-3">
              <div className="glass-card-immersive rounded-2xl p-4 station-glow-1">
                <p className="text-xs font-black text-station-1 mb-2">🔐 שלב 3: פענוח צופן אתב״ש</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  בנוצה מצאתם: ״שם העגור באתב״ש: ״{ATBASH_ENCODED}״. <strong className="text-foreground">פענחו — מה המילה?</strong>
                </p>
                <AtbashDecoder
                  encodedMessage={ATBASH_ENCODED}
                  correctAnswer={ATBASH_ANSWER}
                  explanation="העגור האפור — אחד העופות המרשימים בטבע. עד 40,000 חונים בחולה בחורף!"
                  onDecode={() => { setShowCorrectEffect(true); setTimeout(() => { playReveal(); setPhase("reward"); }, 1500); }}
                />
              </div>
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="glass-card-immersive rounded-2xl p-5 station-glow-1 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-4xl mx-auto shadow-xl shadow-primary/20">{reward?.emoji}</div>
              </motion.div>
              <h2 className="text-lg font-black text-primary mb-1">פריט התגלה!</h2>
              <p className="text-sm font-bold text-foreground/80 mb-1">{reward?.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{reward?.description}</p>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary rounded-xl px-5 py-3 mb-3">
                <span className="text-xs text-muted-foreground">אות נחשפה:</span>
                <span className="text-3xl font-black text-primary">ו</span>
              </motion.div>
              <div className="bg-background/30 backdrop-blur-sm rounded-xl p-3 mb-4 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״נפלא! פתחתם את תחנת התצפית של החולה. חצי מיליארד אורחים בשנה — אכסנייה עולמית לציפורים!״
                </p>
              </div>
              <button onClick={() => onComplete("ו", errors, 0)} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-secondary/20">
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
