const HomeScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <div className="text-6xl animate-fly mb-6">🦅</div>
    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
      חדר הבריחה של הציפורים
    </h1>
    <p className="text-lg md:text-xl text-muted-foreground mb-2 max-w-md">
      הצטרפו למסע מרתק בעקבות ציפורים נודדות בשמי ישראל!
    </p>
    <p className="text-muted-foreground mb-8">🌍 נדידת ציפורים • כיתה ד׳ מחוננים</p>
    <button
      onClick={onStart}
      className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-xl font-bold hover:opacity-90 transition-opacity animate-bounce-soft"
    >
      🚀 יאללה, מתחילים!
    </button>
  </div>
);

export default HomeScreen;
