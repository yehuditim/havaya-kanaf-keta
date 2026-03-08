import { playClick } from "./SoundEffects";
import BirdIcon from "./BirdIcon";

const HomeScreen = ({ onStart, onOpenResearch }: { onStart: () => void; onOpenResearch: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-adventure stars-bg relative overflow-hidden">
    {/* Animated floating elements */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[8%] right-[8%] opacity-[0.12] animate-float">
        <BirdIcon type="eagle" size={56} className="text-primary" />
      </div>
      <div className="absolute top-[18%] left-[12%] text-3xl opacity-[0.1] animate-float" style={{ animationDelay: '1.2s' }}>🌍</div>
      <div className="absolute bottom-[22%] right-[18%] text-4xl opacity-[0.1] animate-float" style={{ animationDelay: '2.4s' }}>🧭</div>
      <div className="absolute bottom-[12%] left-[8%] text-5xl opacity-[0.12] animate-float" style={{ animationDelay: '0.6s' }}>🌙</div>
      <div className="absolute top-[45%] right-[5%] text-2xl opacity-[0.08] animate-float" style={{ animationDelay: '1.8s' }}>✨</div>
      <div className="absolute top-[55%] left-[5%] opacity-[0.1] animate-float" style={{ animationDelay: '3s' }}>
        <BirdIcon type="stork" size={40} className="text-muted-foreground" />
      </div>
    </div>

    <div className="max-w-lg relative z-10">
      {/* Animated hero icon */}
      <div className="relative mb-8 inline-block">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-lg shadow-primary/10">
          <BirdIcon type="eagle" size={64} className="text-primary animate-float filter drop-shadow-lg" />
        </div>
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-sm animate-pulse-glow">✨</div>
        <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-xs animate-pulse-glow" style={{ animationDelay: '1s' }}>⭐</div>
      </div>

      {/* Badge */}
      <div className="mb-3">
        <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold px-5 py-2 rounded-full border border-primary/15 tracking-[0.2em] uppercase">
          חדר בריחה דיגיטלי
        </span>
      </div>

      {/* Title */}
      <h1 className="text-5xl md:text-7xl font-black mb-2 text-glow text-primary leading-[1.1]">
        תעלומת הנדידה
      </h1>
      <p className="text-muted-foreground mb-10 tracking-wider text-sm">
        הרפתקת חקר • כיתה ד׳ מחוננים
      </p>

      {/* Professor message */}
      <div className="glass-card rounded-2xl p-6 card-glow mb-8 text-right animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl border border-primary/20 shadow-sm">
            👨‍🔬
          </div>
          <div>
            <p className="text-primary font-black text-sm">הודעה דחופה!</p>
            <p className="text-muted-foreground text-xs">פרופסור דרור — חוקר ציפורים נודדות</p>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-5 border border-border/40">
          <p className="text-[13px] leading-[2] text-foreground/90">
            ״ילדים יקרים, אני פרופסור דרור. מישהו פרץ למחשב שלי וערבב את כל מחקר הנדידה! 
            אני צריך <strong className="text-primary">חוקרים צעירים ומוכשרים</strong> שיעזרו לי לפענח 
            את החידות ולשחזר את <span className="text-primary font-black">קוד הבריחה הסודי</span>. 
            בכל תחנה תגלו רמז חדש. ארבע אותיות — מילה אחת — וכל המחקר יחזור לסדר. 
            מוכנים לצאת למשימה?״
          </p>
        </div>
      </div>

      {/* CTA button */}
      <button
        onClick={() => { playClick(); onStart(); }}
        className="group relative bg-gradient-to-l from-primary via-primary to-primary/85 text-primary-foreground px-12 py-5 rounded-2xl text-xl font-black hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/25 mb-6"
      >
        🔓 קבלו את המשימה
      </button>

      {/* Research center - prominent card */}
      <div
        onClick={() => { playClick(); onOpenResearch(); }}
        className="glass-card rounded-2xl p-4 mt-8 mb-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 border border-accent/20 hover:border-accent/35 hover:shadow-lg hover:shadow-accent/10 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
            📚
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm font-black text-accent mb-0.5">ארכיון המחקר של פרופסור דרור</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              13 כרטיסי מחקר סודיים • מכילים רמזים לחידות • <span className="text-accent/80">כדאי לקרוא לפני שמתחילים!</span>
            </p>
          </div>
          <span className="text-accent/40 group-hover:text-accent text-lg transition-colors shrink-0">←</span>
        </div>
      </div>

      {/* Info footer */}
      <div className="flex items-center justify-center gap-5 text-muted-foreground/40 text-xs">
        <span className="flex items-center gap-1.5">🗺️ 4 תחנות</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
        <span className="flex items-center gap-1.5">🧩 12 חידות</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
        <span className="flex items-center gap-1.5">🔑 קוד סודי</span>
      </div>
    </div>
  </div>
);

export default HomeScreen;
