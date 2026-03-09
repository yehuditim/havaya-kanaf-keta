import CodeTracker from "./CodeTracker";
import { SECRET_WORD } from "./gameState";
import { useEffect, useRef, useState } from "react";
import { playComplete, playClick } from "./SoundEffects";
import BirdIcon from "./BirdIcon";
import type { GameStats } from "./game/useGameState";
import { useHebrewNarration } from "../hooks/useHebrewNarration";
import { saveGameResult } from "../lib/leaderboard";
import Leaderboard from "./game/Leaderboard";

interface Props {
  collected: { [key: number]: string };
  onRestart: () => void;
  gameStats: GameStats;
}

const STATION_NAMES = ["אילת — שער הנדידה", "עמק החולה", "שביל הסכנות", "מעבדת הניווט"];

const getStarRating = (stats: GameStats): number => {
  let stars = 5;
  // Deduct for mistakes
  if (stats.totalMistakes > 10) stars -= 2;
  else if (stats.totalMistakes > 5) stars -= 1;
  // Deduct for hints
  if (stats.totalHintsUsed > 4) stars -= 1;
  else if (stats.totalHintsUsed > 2) stars -= 0.5;
  // Deduct for time (over 20 min)
  if (stats.elapsedSeconds > 25 * 60) stars -= 1;
  else if (stats.elapsedSeconds > 20 * 60) stars -= 0.5;
  return Math.max(1, Math.min(5, Math.round(stars)));
};

const getBadges = (stats: GameStats): { emoji: string; label: string }[] => {
  const badges: { emoji: string; label: string }[] = [];
  if (stats.totalMistakes === 0) badges.push({ emoji: "🎯", label: "אפס טעויות!" });
  if (stats.totalHintsUsed === 0) badges.push({ emoji: "🧠", label: "בלי רמזים!" });
  if (stats.elapsedSeconds < 10 * 60) badges.push({ emoji: "⚡", label: "ברק!" });
  if (stats.elapsedSeconds < 15 * 60) badges.push({ emoji: "🚀", label: "מהיר במיוחד" });
  if (stats.totalMistakes <= 3 && stats.totalHintsUsed <= 1) badges.push({ emoji: "🏆", label: "חוקר מומחה" });
  if (badges.length === 0) badges.push({ emoji: "🎓", label: "חוקר צעיר מצטיין" });
  return badges;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const VICTORY_TEXT = `מדהים! פיצחתם את הקוד! כל המחקר שלי חזר לסדר בזכותכם. הוכחתם שאתם חוקרי טבע אמיתיים עם מוח חד ולב סקרן. עכשיו אתם יודעים למה ישראל היא מקום כל כך מיוחד לציפורים נודדות, ולמה חשוב לכולנו לשמור עליהן. תודה רבה, שותפים למדע!`;

const SuccessScreen = ({ collected, onRestart, gameStats }: Props) => {
  const { isSpeaking, canSpeak, speak, stopSpeaking } = useHebrewNarration(VICTORY_TEXT);
  const savedRef = useRef(false);
  const [currentGameId, setCurrentGameId] = useState<string | undefined>();

  const stars = getStarRating(gameStats);
  const badges = getBadges(gameStats);

  useEffect(() => {
    const timer = setTimeout(playComplete, 400);
    return () => clearTimeout(timer);
  }, []);

  // Save result to leaderboard once
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const entry = saveGameResult(
      gameStats.elapsedSeconds,
      gameStats.totalMistakes,
      gameStats.totalHintsUsed,
      stars,
    );
    setCurrentGameId(entry.id);
  }, [gameStats, stars]);

  const handleSpeak = async () => {
    playClick();

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    await speak();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-adventure stars-bg relative overflow-hidden">
      {/* Celebration particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { el: "🎉" }, { el: "⭐" },
          { el: <BirdIcon type="eagle" size={28} className="text-primary/60" /> },
          { el: "✨" }, { el: "🌟" }, { el: "🎊" },
          { el: <BirdIcon type="crane" size={24} className="text-accent/50" /> },
          { el: "🏆" },
        ].map((item, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-float"
            style={{
              top: `${8 + i * 11}%`,
              left: `${5 + i * 12}%`,
              animationDelay: `${i * 0.35}s`,
              opacity: 0.15 + (i % 3) * 0.05,
            }}
          >
            {item.el}
          </div>
        ))}
      </div>

      <div className="max-w-lg relative z-10">
        {/* Trophy */}
        <div className="relative mb-6 inline-block">
          <div className="w-24 h-24 rounded-3xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto shadow-xl shadow-primary/15">
            <span className="text-6xl animate-reveal">🏆</span>
          </div>
          <div className="absolute -top-3 -right-3 text-2xl animate-pulse-glow">🎉</div>
          <div className="absolute -bottom-2 -left-2 text-xl animate-pulse-glow" style={{ animationDelay: '0.5s' }}>✨</div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-3xl transition-all duration-500 ${i < stars ? "scale-110" : "opacity-20 grayscale"}`}
              style={{ animationDelay: `${i * 0.15}s` }}>
              ⭐
            </span>
          ))}
        </div>

        <h1 className="text-5xl md:text-6xl font-black mb-1 text-glow text-primary">
          הקוד נפתח!
        </h1>
        <p className="text-muted-foreground text-sm mb-6">פיצחתם את התעלומה של פרופסור דרור!</p>

        {/* Code display */}
        <div className="my-6">
          <CodeTracker collected={collected} totalStations={4} />
        </div>

        {/* Secret word highlight */}
        <div className="glass-card rounded-2xl px-6 py-4 inline-block mb-6 animate-reveal">
          <p className="text-xs text-muted-foreground mb-1">המילה הסודית:</p>
          <p className="text-4xl font-black text-primary text-glow tracking-widest">{SECRET_WORD}</p>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex items-center justify-center gap-2 flex-wrap mb-6 animate-slide-up">
            {badges.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-accent/15 text-accent border border-accent/25 rounded-full px-4 py-1.5 text-xs font-bold">
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        )}

        {/* Detailed Results Board */}
        <div className="glass-card rounded-2xl p-5 mb-6 animate-slide-up text-right" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-sm font-black text-primary mb-4 text-center">📊 לוח תוצאות</h3>
          
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/30">
              <p className="text-2xl font-black text-foreground">{formatTime(gameStats.elapsedSeconds)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">⏱️ זמן כולל</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/30">
              <p className="text-2xl font-black text-foreground">{gameStats.totalMistakes}</p>
              <p className="text-[10px] text-muted-foreground mt-1">❌ טעויות</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/30">
              <p className="text-2xl font-black text-foreground">{gameStats.totalHintsUsed}</p>
              <p className="text-[10px] text-muted-foreground mt-1">💡 רמזים</p>
            </div>
          </div>

          {/* Per-station breakdown */}
          <div className="space-y-2">
            {STATION_NAMES.map((name, i) => {
              const stat = gameStats.stationStats[i];
              const mistakes = stat?.mistakes ?? 0;
              const hints = stat?.hintsUsed ?? 0;
              const perfect = mistakes === 0 && hints === 0;
              return (
                <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs border ${perfect ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/20"}`}>
                  <span className="text-base">{perfect ? "⭐" : "✅"}</span>
                  <span className="flex-1 font-bold text-foreground/80">{name}</span>
                  <span className="text-muted-foreground">
                    {mistakes > 0 && <span className="text-destructive/70">❌{mistakes}</span>}
                    {hints > 0 && <span className="mr-2 text-accent/70">💡{hints}</span>}
                    {perfect && <span className="text-primary">מושלם!</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Professor final message */}
        <div className="glass-card rounded-2xl p-6 card-glow mb-8 animate-slide-up text-right" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl border border-primary/20 ${isSpeaking ? "animate-pulse" : ""}`}>
              👨‍🔬
            </div>
            <div className="flex-1 text-right">
              <p className="text-primary font-black text-sm">הודעת ניצחון!</p>
              <p className="text-muted-foreground text-xs">
                {isSpeaking ? "🎙 פרופסור דרור מקריא..." : "פרופסור דרור"}
              </p>
            </div>
            {canSpeak && (
              <button
                onClick={handleSpeak}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all duration-200 border shadow-md shrink-0 ${
                  isSpeaking
                    ? "bg-primary text-primary-foreground border-primary shadow-primary/30 animate-pulse scale-105"
                    : "bg-primary/15 text-primary border-primary/25 hover:bg-primary/25 hover:scale-105 hover:shadow-primary/20"
                }`}
                title={isSpeaking ? "עצור הקראה" : "הקרא בקול"}
              >
                <span className="text-base">{isSpeaking ? "⏸" : "🔊"}</span>
                <span>{isSpeaking ? "עצור" : "הקרא"}</span>
              </button>
            )}
          </div>
          <div className="bg-muted/30 rounded-xl p-5 border border-border/30">
            <p className="text-[13px] leading-[2] text-foreground/90">
              ״מד-הי-ם! פיצחתם את הקוד — <span className="text-primary font-black text-base">{SECRET_WORD}</span>! 
              כל המחקר שלי חזר לסדר בזכותכם. הוכחתם שאתם חוקרי טבע אמיתיים עם מוח חד ולב סקרן. 
              עכשיו אתם יודעים למה ישראל היא מקום כל כך מיוחד לציפורים נודדות, 
              ולמה חשוב לכולנו לשמור עליהן. תודה רבה, שותפים למדע!״
            </p>
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard currentGameId={currentGameId} className="mb-8 animate-slide-up" />

        <button
          onClick={() => { playClick(); onRestart(); }}
          className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-12 py-5 rounded-2xl text-xl font-black hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/25"
        >
          🔄 שחקו שוב!
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
