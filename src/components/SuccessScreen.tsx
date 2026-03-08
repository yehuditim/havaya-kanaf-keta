import CodeTracker from "./CodeTracker";
import { SECRET_WORD } from "./gameState";
import { useEffect } from "react";
import { playComplete, playClick } from "./SoundEffects";

interface Props {
  collected: { [key: number]: string };
  onRestart: () => void;
}

const SuccessScreen = ({ collected, onRestart }: Props) => {
  useEffect(() => {
    const timer = setTimeout(playComplete, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-adventure stars-bg relative overflow-hidden">
      {/* Celebration particles */}
      <div className="absolute inset-0 pointer-events-none">
        {["🎉", "⭐", "🦅", "✨", "🌟", "🎊", "🪶", "🏆"].map((emoji, i) => (
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
            {emoji}
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

        {/* Professor final message */}
        <div className="glass-card rounded-2xl p-6 card-glow mb-8 animate-slide-up text-right">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl border border-primary/20">
              👨‍🔬
            </div>
            <div>
              <p className="text-primary font-black text-sm">הודעת ניצחון!</p>
              <p className="text-muted-foreground text-xs">פרופסור דרור</p>
            </div>
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

        {/* Achievements summary */}
        <div className="glass-card rounded-xl p-4 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">🗺️ 4 תחנות הושלמו</span>
            <span className="flex items-center gap-1.5">🧩 12 חידות נפתרו</span>
            <span className="flex items-center gap-1.5">🔓 הקוד נפתח</span>
          </div>
        </div>

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
