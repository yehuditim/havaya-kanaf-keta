import CodeTracker from "./CodeTracker";
import { playClick } from "./SoundEffects";

const InstructionsScreen = ({ onContinue }: { onContinue: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-adventure stars-bg">
    <div className="max-w-lg w-full">
      <CodeTracker collected={{}} totalStations={4} />

      <div className="glass-card rounded-2xl p-8 card-glow text-right animate-slide-up mt-5">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm">
            📜
          </div>
          <h2 className="text-2xl font-black text-accent">תדריך המשימה</h2>
          <p className="text-xs text-muted-foreground mt-1">קראו בעיון לפני שמתחילים</p>
          <div className="w-20 h-0.5 bg-accent/20 mx-auto mt-3 rounded-full" />
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-8">
          {[
            {
              icon: "🗺️",
              color: "border-station-1/30 bg-station-1/5",
              title: "4 תחנות חקירה",
              text: "בכל תחנה חידות שונות על נדידת ציפורים בישראל. כל תחנה עם אווירה ייחודית.",
            },
            {
              icon: "🔑",
              color: "border-primary/30 bg-primary/5",
              title: "אות סודית בכל תחנה",
              text: "פתרון כל תחנה יחשוף אות אחת מ<strong>קוד הבריחה</strong>. אספו את כולן!",
            },
            {
              icon: "💡",
              color: "border-accent/30 bg-accent/5",
              title: "רמזים ומרכז חקר",
              text: "נתקעתם? יש רמזים בכל חידה, ו<strong>מרכז חקר</strong> עם מידע שיעזור לכם.",
            },
            {
              icon: "🔐",
              color: "border-secondary/30 bg-secondary/5",
              title: "פצחו את הקוד!",
              text: "רק כשתאספו את כל 4 האותיות תוכלו <strong>לפתוח את המנעול ולהציל את המחקר.</strong>",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 p-4 rounded-xl border ${item.color} transition-all`}
            >
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xl shrink-0 border border-border/30">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold mb-0.5">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: item.text }} />
              </div>
            </div>
          ))}
        </div>

        {/* Professor encouragement */}
        <div className="bg-muted/20 rounded-xl p-4 mb-6 border border-border/20 text-center">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            👨‍🔬 ״אין מגבלת זמן. קחו את הזמן שלכם, קראו בעיון, וזכרו — לפעמים התשובה מסתתרת בין השורות.״
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => { playClick(); onContinue(); }}
            className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-10 py-4 rounded-xl text-lg font-black hover:scale-105 transition-all duration-300 shadow-lg shadow-secondary/20"
          >
            🔍 יוצאים לחקור!
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default InstructionsScreen;
