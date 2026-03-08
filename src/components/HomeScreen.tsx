const HomeScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-adventure stars-bg relative overflow-hidden">
    {/* Decorative floating elements */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[10%] right-[10%] text-4xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>🦅</div>
      <div className="absolute top-[20%] left-[15%] text-3xl opacity-15 animate-float" style={{ animationDelay: '1s' }}>🌍</div>
      <div className="absolute bottom-[25%] right-[20%] text-3xl opacity-15 animate-float" style={{ animationDelay: '2s' }}>🧭</div>
      <div className="absolute bottom-[15%] left-[10%] text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🌙</div>
    </div>

    <div className="max-w-lg relative z-10">
      {/* Icon cluster */}
      <div className="relative mb-6">
        <div className="text-7xl animate-float filter drop-shadow-lg">🦅</div>
        <div className="absolute -top-2 -right-4 text-2xl animate-pulse-glow">✨</div>
        <div className="absolute -bottom-1 -left-3 text-xl animate-pulse-glow" style={{ animationDelay: '1s' }}>⭐</div>
      </div>

      <div className="mb-2">
        <span className="inline-block bg-primary/15 text-primary text-xs font-bold px-4 py-1.5 rounded-full border border-primary/20 tracking-widest">
          חדר בריחה דיגיטלי
        </span>
      </div>

      <h1 className="text-5xl md:text-6xl font-black mb-2 text-glow text-primary leading-tight">
        תעלומת הנדידה
      </h1>
      <p className="text-sm text-muted-foreground mb-8 tracking-wider">הרפתקה חינוכית • כיתה ד׳</p>

      <div className="glass-card rounded-2xl p-7 card-glow mb-8 text-right animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg border border-primary/30">
            👨‍🔬
          </div>
          <div>
            <p className="text-primary font-bold text-sm">הודעה דחופה</p>
            <p className="text-muted-foreground text-xs">מפרופסור דרור — חוקר ציפורים</p>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <p className="text-sm leading-[1.8] text-foreground/90">
            ״ילדים יקרים, המחשב שלי נפרץ ומישהו
            ערבב את כל מחקר הנדידה שלי! אני צריך את עזרתכם לפענח את החידות ולשחזר
            את <span className="text-primary font-bold">קוד הבריחה הסודי</span> שיחזיר הכל לסדר.
            בכל תחנה תגלו רמז חדש. מוכנים למשימה?״
          </p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="group relative bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-10 py-4 rounded-xl text-xl font-black hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25"
      >
        <span className="relative z-10 flex items-center gap-2 justify-center">
          🔓 קבלו את המשימה
        </span>
      </button>

      <div className="flex items-center justify-center gap-6 mt-8 text-muted-foreground/50 text-xs">
        <span className="flex items-center gap-1.5">🗺️ 4 תחנות</span>
        <span className="flex items-center gap-1.5">🧩 12 חידות</span>
        <span className="flex items-center gap-1.5">🔑 קוד סודי</span>
      </div>
    </div>
  </div>
);

export default HomeScreen;
