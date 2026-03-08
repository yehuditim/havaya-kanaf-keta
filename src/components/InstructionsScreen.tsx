const InstructionsScreen = ({ onContinue }: { onContinue: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6">
    <div className="bg-card rounded-lg shadow-lg p-8 max-w-lg w-full text-right">
      <h2 className="text-3xl font-bold mb-6 text-center">📋 הוראות המשחק</h2>
      <ul className="space-y-4 text-lg text-foreground mb-8">
        <li className="flex items-start gap-3">
          <span className="text-2xl">🔍</span>
          <span>קראו כל שאלה בעיון ובחרו את התשובה הנכונה.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-2xl">🧩</span>
          <span>כל תשובה נכונה תפתח לכם רמז חדש.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-2xl">⏱️</span>
          <span>אין מגבלת זמן – חשבו טוב לפני שאתם עונים!</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-2xl">🏆</span>
          <span>פתרו את כל החידות כדי לברוח מחדר הבריחה!</span>
        </li>
      </ul>
      <div className="text-center">
        <button
          onClick={onContinue}
          className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg text-lg font-bold hover:opacity-90 transition-opacity"
        >
          🐦 קדימה לאתגר!
        </button>
      </div>
    </div>
  </div>
);

export default InstructionsScreen;
