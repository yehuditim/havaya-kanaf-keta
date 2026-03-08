const SuccessScreen = ({ onRestart }: { onRestart: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <div className="text-7xl mb-6 animate-bounce-soft">🏆</div>
    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
      כל הכבוד! 🎉
    </h1>
    <p className="text-xl text-muted-foreground mb-2 max-w-md">
      הצלחתם לפתור את כל החידות ולברוח מחדר הבריחה!
    </p>
    <p className="text-lg text-muted-foreground mb-8">
      עכשיו אתם מומחים לנדידת ציפורים בישראל 🐦
    </p>
    <button
      onClick={onRestart}
      className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-xl font-bold hover:opacity-90 transition-opacity"
    >
      🔄 שחקו שוב
    </button>
  </div>
);

export default SuccessScreen;
