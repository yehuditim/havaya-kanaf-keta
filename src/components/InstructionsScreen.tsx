import CodeTracker from "./CodeTracker";

const InstructionsScreen = ({ onContinue }: { onContinue: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6">
    <div className="max-w-lg w-full">
      <CodeTracker collected={{}} totalStations={4} />
      <div className="bg-card rounded-lg p-8 card-glow text-right animate-slide-up mt-4">
        <h2 className="text-2xl font-bold mb-5 text-center text-primary">📜 תדריך המשימה</h2>
        <ul className="space-y-4 text-foreground mb-8">
          <li className="flex items-start gap-3">
            <span className="text-xl">🗺️</span>
            <span className="text-sm">לפניכם <strong>4 תחנות חקירה</strong>. בכל תחנה חידות שונות על נדידת ציפורים בישראל.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">🔑</span>
            <span className="text-sm">פתרון כל תחנה יחשוף <strong>אות סודית</strong> מקוד הבריחה.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">🧠</span>
            <span className="text-sm">קראו בעיון — לפעמים התשובה מסתתרת בין השורות. אין מגבלת זמן.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">🔐</span>
            <span className="text-sm">רק כשתאספו את כל האותיות תוכלו <strong>לפצח את הקוד ולברוח!</strong></span>
          </li>
        </ul>
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg text-lg font-bold hover:opacity-90 transition-all hover:scale-105"
          >
            🔍 לתחנה הראשונה
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default InstructionsScreen;
