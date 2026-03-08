import { useState } from "react";
import dangersBg from "../../assets/backgrounds/dangers-path.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSuccess, playError, playReveal } from "../SoundEffects";
import { getStationReward } from "./useGameState";
import GameNav from "./GameNav";
import CorrectEffect from "./CorrectEffect";
import NarrationPlayer from "./NarrationPlayer";
import CodeLock from "./CodeLock";
import ResearchMission from "./ResearchMission";

interface Props {
  onComplete: (letter: string, mistakes: number, hints: number) => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

interface ThreatPair {
  id: string; threat: string; threatEmoji: string; solution: string; solutionEmoji: string; explanation: string;
}

const threatPairs: ThreatPair[] = [
  { id: "electric", threat: "עמודי חשמל", threatEmoji: "⚡", solution: "מיגון עמודים", solutionEmoji: "🔧", explanation: "נשרים ודורסים גדולים מתחשמלים — מיגון עמודים מציל חיים!" },
  { id: "invasive", threat: "מינים פולשים", threatEmoji: "⚠️", solution: "בקרת אוכלוסין", solutionEmoji: "🛡️", explanation: "המיינה גונבת קינים — חייבים לשלוט באוכלוסייה" },
  { id: "turbines", threat: "טורבינות רוח", threatEmoji: "💨", solution: "מיקום חכם", solutionEmoji: "📍", explanation: "הצבת טורבינות רחוק מנתיבי נדידה מונעת התנגשויות" },
  { id: "poison", threat: "חומרי הדברה", threatEmoji: "☠️", solution: "חקלאות ירוקה", solutionEmoji: "🌱", explanation: "חומרי הדברה מרעילים את שרשרת המזון" },
  { id: "light", threat: "זיהום אור", threatEmoji: "💡", solution: "תאורה חכמה", solutionEmoji: "🌙", explanation: "אור מלאכותי מבלבל נודדי לילה שמנווטים לפי כוכבים" },
];

const researchCards = [
  { id: "threats", title: "איומים על הנודדות", emoji: "⚠️", content: "הרעלות, ציד לא חוקי, עמודי חשמל, טורבינות רוח, זיהום אור ומינים פולשים — כל אלה מאיימים על ציפורים נודדות. בישראל מתו 5 נשרים בשנת 2023 מהרעלה. מספר הנשרים שניצלו בפרויקט ׳פורשים כנף׳: 143.", hiddenClue: "הקוד: 143 — מספר הנשרים שניצלו" },
  { id: "wing", title: "פרויקט ׳פורשים כנף׳", emoji: "🛡️", content: "מאמץ ישראלי ייחודי: מיגון עמודי חשמל, תחנות האכלה, גידול רבייה בשבי. בזכותו, אוכלוסיות נשרים מתאוששות." },
  { id: "ebird", title: "eBird — מדע אזרחי", emoji: "📱", content: "פרויקט מדע אזרחי גלובלי. צפרים מדווחים תצפיות באפליקציה. מיליוני דיווחים עוזרים לתכנן שמורות." },
];

// Simple cipher: each letter shifted by 1 (same as before but now clearly labeled)
const CIPHER_MAP: Record<string, string> = {
  "מ": "ל", "ד": "ג", "ע": "ס", " ": " ", "א": "ת", "ז": "ו", "ר": "ק", "ח": "ז",
  "י": "ח", "כ": "י", "ל": "כ", "ה": "ד", "ו": "ה", "ש": "ר", "נ": "מ", "ת": "ש",
  "ב": "א", "ג": "ב", "ס": "נ", "פ": "ע", "צ": "פ", "ק": "צ",
};
const SECRET = "מדע אזרחי";
const ENCODED = SECRET.split("").map(ch => CIPHER_MAP[ch] || ch).join("");

type Phase = "briefing" | "match" | "decode" | "research" | "lock" | "reward";

const Station3Dangers = ({ onComplete, onOpenResearch, onGoHome, onGoMap }: Props) => {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [matchErrors, setMatchErrors] = useState(0);
  const [decodeInput, setDecodeInput] = useState("");
  const [decodeAttempts, setDecodeAttempts] = useState(0);
  const [showCipherHint, setShowCipherHint] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const [researchDone, setResearchDone] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);

  const reward = getStationReward(2);
  const allMatched = matchedPairs.size === threatPairs.length;
  const shuffledSolutions = [...threatPairs].sort((a, b) => a.id.localeCompare(b.id)).reverse();

  const handleThreatClick = (id: string) => { if (matchedPairs.has(id)) return; playClick(); setSelectedThreat(selectedThreat === id ? null : id); };
  const handleSolutionClick = (pairId: string) => {
    if (!selectedThreat || matchedPairs.has(pairId)) return;
    if (selectedThreat === pairId) { playSuccess(); setMatchedPairs(prev => new Set([...prev, pairId])); }
    else { playError(); setMatchErrors(e => e + 1); }
    setSelectedThreat(null);
  };
  const handleDecodeSubmit = () => {
    if (decodeInput.trim() === SECRET) { playSuccess(); setDecoded(true); setShowCorrectEffect(true); }
    else { playError(); setDecodeAttempts(a => a + 1); if (decodeAttempts >= 1) setShowCipherHint(true); }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${dangersBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-0 bg-background/75 backdrop-blur-[2px]" />
      <CorrectEffect show={showCorrectEffect} onDone={() => setShowCorrectEffect(false)} />
      <div className="max-w-lg w-full relative z-10">
        <GameNav onBack={onGoMap} backLabel="חזרה למפה" onHome={onGoHome} />

        <AnimatePresence mode="wait">
          {/* BRIEFING */}
          {phase === "briefing" && (
            <motion.div key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-6 station-glow-2">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-station-2/10 border border-station-2/25 flex items-center justify-center text-5xl mx-auto mb-3">⚡</div>
                  <h2 className="text-2xl font-black text-station-2">תחנה 3: שביל הסכנות</h2>
                  <p className="text-sm text-muted-foreground mt-1">חקירת איומים • צופן • מנעול</p>
                </div>
                <NarrationPlayer
                  text="נכנסים לאזור המסוכן! הציפורים מתמודדות עם איומים שבני אדם יצרו. קודם תתאימו כל איום לפתרון שלו. אחר כך תפענחו הודעה מוצפנת שתחשוף עיקרון חשוב. לבסוף — תחפשו בכרטיסי המחקר מספר סודי ותפתחו מנעול. כל שלב מקרב אתכם לאות השלישית!"
                  className="mb-4"
                />
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => { playClick(); setPhase("match"); }} className="bg-gradient-to-l from-station-2 to-station-2/80 text-background px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-station-2/20">
                    🔍 פתחו את התיק
                  </button>
                  <button onClick={() => { playClick(); onOpenResearch(); }} className="text-accent/60 text-xs hover:text-accent transition-colors">
                    📚 בדקו בארכיון המחקר קודם
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* MATCH */}
          {phase === "match" && (
            <motion.div key="match" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-station-2 bg-station-2/10 px-3 py-1 rounded-lg border border-station-2/20">⚡ שלב 1: התאימו איום ← פתרון</span>
                  <span className="text-[10px] text-muted-foreground">{matchedPairs.size}/{threatPairs.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-destructive/70 text-center">⚠️ איומים</p>
                    {threatPairs.map(p => (
                      <button key={p.id} onClick={() => handleThreatClick(p.id)} disabled={matchedPairs.has(p.id)}
                        className={`w-full p-2 rounded-xl border-2 text-center text-xs transition-all ${matchedPairs.has(p.id) ? "bg-primary/8 border-primary/20 opacity-50" : selectedThreat === p.id ? "bg-station-2/15 border-station-2" : "bg-muted/25 border-border/20 hover:border-station-2/30"}`}>
                        <span className="text-lg block">{p.threatEmoji}</span><span className="font-bold">{p.threat}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-secondary/70 text-center">✅ פתרונות</p>
                    {shuffledSolutions.map(p => (
                      <button key={p.id} onClick={() => handleSolutionClick(p.id)} disabled={matchedPairs.has(p.id) || !selectedThreat}
                        className={`w-full p-2 rounded-xl border-2 text-center text-xs transition-all ${matchedPairs.has(p.id) ? "bg-primary/8 border-primary/20 opacity-50" : selectedThreat ? "bg-muted/25 border-border/20 hover:border-secondary/40" : "bg-muted/15 border-border/15 opacity-50"}`}>
                        <span className="text-lg block">{p.solutionEmoji}</span><span className="font-bold">{p.solution}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {matchedPairs.size > 0 && (
                  <div className="mt-3 space-y-1">{threatPairs.filter(p => matchedPairs.has(p.id)).map(p => (
                    <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 rounded-lg p-2 text-right border border-primary/10">
                      <p className="text-[10px] text-foreground/70">{p.threatEmoji} → {p.solutionEmoji} {p.explanation}</p>
                    </motion.div>
                  ))}</div>
                )}
              </div>
              {allMatched && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center">
                  <button onClick={() => { playClick(); setPhase("decode"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🔐 לשלב הפענוח
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* DECODE */}
          {phase === "decode" && (
            <motion.div key="decode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card rounded-2xl p-5 station-glow-2">
                <p className="text-xs font-black text-station-2 mb-3">⚡ שלב 2: פענוח צופן הזזה</p>
                <div className="bg-background/50 rounded-lg p-3 border border-station-2/20 text-center mb-3">
                  <p className="text-[10px] text-muted-foreground mb-1">ההודעה המוצפנת:</p>
                  <p className="text-xl font-black tracking-[0.3em] text-station-2" dir="rtl">{ENCODED}</p>
                </div>
                <div className="bg-accent/5 rounded-lg p-2.5 border border-accent/15 text-right mb-3">
                  <p className="text-[10px] text-accent/80">🔑 <strong>מפתח:</strong> כל אות הוחלפה באות שלפניה באל״ף-בי״ת (ב←א, ג←ב, ד←ג...)</p>
                </div>
                {showCipherHint && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 rounded-lg p-2.5 mb-3 border border-primary/15 text-right">
                    <p className="text-[10px] text-primary">💡 ל→כ, ג→ב, נ→מ... חשבו: מה זה ״כ ג ס  ת ו ק ז ח״ אם כל אות חוזרת אחורה?</p>
                  </motion.div>
                )}
                {!decoded ? (
                  <div className="flex gap-2">
                    <input type="text" value={decodeInput} onChange={e => setDecodeInput(e.target.value)} placeholder="הקלידו את ההודעה המפוענחת..." dir="rtl"
                      className="flex-1 bg-muted/30 border border-border/25 rounded-xl px-4 py-3 text-sm text-right placeholder:text-muted-foreground/40 focus:outline-none focus:border-station-2/50"
                      onKeyDown={e => e.key === "Enter" && handleDecodeSubmit()} />
                    <button onClick={handleDecodeSubmit} className="bg-station-2 text-background px-4 py-3 rounded-xl font-bold hover:scale-105 transition-all">✓</button>
                  </div>
                ) : (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-primary/8 border border-primary/20 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-primary mb-1">🔓 פוענח: ״{SECRET}״!</p>
                    <p className="text-xs text-foreground/70">מדע אזרחי — כמו eBird — מאפשר לכל אדם לעזור למדענים.</p>
                  </motion.div>
                )}
              </div>
              {decoded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center">
                  <button onClick={() => { playClick(); setPhase("research"); }} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-6 py-2.5 rounded-xl font-black hover:scale-105 transition-all">
                    🔬 למשימת החקר
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* RESEARCH + LOCK */}
          {phase === "research" && (
            <motion.div key="research" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <div className="glass-card rounded-2xl p-5 station-glow-2">
                <p className="text-xs font-black text-station-2 mb-3">🔬 שלב 3: חקר + מנעול</p>
                <p className="text-[11px] text-muted-foreground text-right mb-3">
                  חפשו בכרטיסי המחקר: <strong className="text-foreground">כמה נשרים ניצלו בפרויקט ׳פורשים כנף׳?</strong> המספר הזה הוא הקוד למנעול!
                </p>
                {!researchDone ? (
                  <ResearchMission
                    prompt="חפשו בכרטיסים: כמה נשרים ניצלו בפרויקט ׳פורשים כנף׳? הרשמו את המספר."
                    cards={researchCards}
                    targetCardId="threats"
                    question="כמה נשרים ניצלו?"
                    correctAnswer={["143"]}
                    onComplete={() => { setResearchDone(true); setShowCorrectEffect(true); }}
                    onOpenResearch={onOpenResearch}
                  />
                ) : (
                  <div>
                    <p className="text-xs text-primary mb-3 text-center">✅ מצאתם: 143! עכשיו הכניסו את הקוד:</p>
                    <CodeLock
                      correctCode="143"
                      label="🔒 מנעול שביל הסכנות"
                      hint="מספר הנשרים שניצלו — שלוש ספרות"
                      onUnlock={() => { playReveal(); setShowCorrectEffect(true); setTimeout(() => setPhase("reward"), 1200); }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* REWARD */}
          {phase === "reward" && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 station-glow-2 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mb-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary flex items-center justify-center text-5xl mx-auto shadow-xl shadow-primary/20">{reward?.emoji}</div>
              </motion.div>
              <h2 className="text-xl font-black text-primary mb-1">פריט התגלה!</h2>
              <p className="text-sm font-bold text-foreground/80 mb-1">{reward?.name}</p>
              <p className="text-xs text-muted-foreground mb-4">{reward?.description}</p>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary rounded-xl px-5 py-3 mb-4">
                <span className="text-xs text-muted-foreground">אות נחשפה:</span>
                <span className="text-3xl font-black text-primary">י</span>
              </motion.div>
              <div className="bg-muted/25 rounded-xl p-4 mb-5 text-right border border-border/20">
                <p className="text-xs leading-[1.8] text-foreground/80 italic">
                  ״חקירה מצוינת! האיום הגדול ביותר על ציפורים הוא לא טורפים טבעיים — אלא דברים שבני אדם יצרו. 143 נשרים ניצלו בזכות ׳פורשים כנף׳ — ההוכחה שאנחנו יכולים גם לתקן!״
                </p>
              </div>
              <button onClick={() => onComplete("י", matchErrors + decodeAttempts, showCipherHint ? 1 : 0)} className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg shadow-secondary/20">
                ➡️ חזרה למפה
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Station3Dangers;
