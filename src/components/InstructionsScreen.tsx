import CodeTracker from "./CodeTracker";

const InstructionsScreen = ({ onContinue }: { onContinue: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-adventure stars-bg">
    <div className="max-w-lg w-full">
      <CodeTracker collected={{}} totalStations={4} />

      <div className="glass-card rounded-2xl p-8 card-glow text-right animate-slide-up mt-4">
        <div className="text-center mb-6">
          <span className="text-4xl">📜</span>
          <h2 className="text-2xl font-black mt-2 text-primary">תדריך המשימה</h2>
          <div className="w-16 h-0.5 bg-primary/30 mx-auto mt-3 rounded-full" />
        </div>

        <div className="space-y-4 mb-8">
          {[
            { icon: "🗺️", color: "border-station-1/40 bg-station-1/5", text: "לפניכם <strong>4 תחנות חקירה</strong>. בכל תחנה חידות שונות על נדידת ציפורים בישראל." },
            { icon: "🔑", color: "border-primary/40 bg-primary/5", text: "פתרון כל תחנה יחשוף <strong>אות סודית</strong> מקוד הבריחה." },
            { icon: "🧠", color: "border-accent/40 bg-accent/5", text: "קראו בעיון — לפעמים התשובה מסתתרת <strong>בין השורות</strong>. אין מגבלת זמן." },
            { icon: "🔐", color: "border-secondary/40 bg-secondary/5", text: "רק כשתאספו את כל האותיות תוכלו <strong>לפצח את הקוד ולברוח!</strong>" },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 p-4 rounded-xl border ${item.color} transition-all`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-2xl mt-0.5 shrink-0">{item.icon}</span>
              <span className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.text }} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-gradient-to-l from-secondary to-secondary/80 text-secondary-foreground px-8 py-3.5 rounded-xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-secondary/20"
          >
            🔍 לתחנה הראשונה
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default InstructionsScreen;
