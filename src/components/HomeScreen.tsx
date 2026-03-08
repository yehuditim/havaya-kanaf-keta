const HomeScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <div className="max-w-lg">
      <div className="text-6xl animate-float mb-4">🦅</div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-glow text-primary">
        תעלומת הנדידה
      </h1>
      <p className="text-sm text-muted-foreground mb-6 tracking-wider">חדר בריחה דיגיטלי • כיתה ד׳</p>

      <div className="bg-card rounded-lg p-6 card-glow mb-8 text-right animate-slide-up">
        <p className="text-base leading-relaxed mb-3">
          <span className="text-primary font-bold">הודעה דחופה מפרופסור דרור:</span>
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground italic">
          ״ילדים יקרים, אני פרופסור דרור — חוקר ציפורים נודדות. המחשב שלי נפרץ ומישהו
          ערבב את כל מחקר הנדידה שלי! אני צריך את עזרתכם לפענח את החידות ולשחזר
          את <span className="text-primary font-semibold">קוד הבריחה הסודי</span> שיחזיר הכל לסדר.
          בכל תחנה תגלו רמז חדש. מוכנים למשימה?״
        </p>
      </div>

      <button
        onClick={onStart}
        className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-xl font-bold hover:opacity-90 transition-all hover:scale-105"
      >
        🔓 קבלו את המשימה
      </button>
    </div>
  </div>
);

export default HomeScreen;
