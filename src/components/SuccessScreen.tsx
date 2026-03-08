import CodeTracker from "./CodeTracker";
import { SECRET_WORD } from "./gameState";

interface Props {
  collected: { [key: number]: string };
  onRestart: () => void;
}

const SuccessScreen = ({ collected, onRestart }: Props) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-adventure stars-bg relative overflow-hidden">
    {/* Celebration particles */}
    <div className="absolute inset-0 pointer-events-none">
      {["🎉", "⭐", "🦅", "✨", "🌟", "🎊"].map((emoji, i) => (
        <div
          key={i}
          className="absolute text-2xl opacity-20 animate-float"
          style={{
            top: `${15 + i * 13}%`,
            left: `${10 + i * 15}%`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>

    <div className="max-w-lg relative z-10">
      <div className="relative mb-4">
        <div className="text-7xl animate-reveal filter drop-shadow-lg">🏆</div>
        <div className="absolute -top-2 -right-4 text-2xl animate-pulse-glow">🎉</div>
        <div className="absolute -bottom-1 -left-3 text-xl animate-pulse-glow" style={{ animationDelay: '0.5s' }}>✨</div>
      </div>

      <h1 className="text-5xl md:text-6xl font-black mb-2 text-glow text-primary">
        הקוד נפתח!
      </h1>
      <p className="text-muted-foreground text-sm mb-6">פיצחתם את התעלומה!</p>

      <div className="my-6">
        <CodeTracker collected={collected} totalStations={4} />
      </div>

      <div className="glass-card rounded-2xl p-7 card-glow mb-8 animate-slide-up text-right">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg border border-primary/30">
            👨‍🔬
          </div>
          <div>
            <p className="text-primary font-bold text-sm">הודעה מפרופסור דרור</p>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
          <p className="text-sm leading-[1.8] text-foreground/90">
            ״מדהים! פיצחתם את הקוד — <span className="text-primary font-black text-base">{SECRET_WORD}</span>!
            המחקר שלי חזר לסדר. הוכחתם שאתם חוקרי טבע אמיתיים.
            עכשיו אתם יודעים למה ישראל היא מקום כל כך מיוחד לציפורים נודדות,
            ולמה חשוב לשמור עליהן. תודה רבה, שותפים למדע!״
          </p>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-10 py-4 rounded-xl text-xl font-black hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25"
      >
        🔄 משימה חדשה
      </button>
    </div>
  </div>
);

export default SuccessScreen;
