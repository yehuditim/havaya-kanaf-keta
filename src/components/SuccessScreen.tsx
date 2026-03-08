import CodeTracker from "./CodeTracker";
import { SECRET_WORD } from "./gameState";

interface Props {
  collected: { [key: number]: string };
  onRestart: () => void;
}

const SuccessScreen = ({ collected, onRestart }: Props) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <div className="max-w-lg">
      <div className="text-6xl mb-4 animate-reveal">🔓</div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-glow text-primary">
        הקוד נפתח!
      </h1>
      <div className="my-6">
        <CodeTracker collected={collected} totalStations={4} />
      </div>
      <div className="bg-card rounded-lg p-6 card-glow mb-8 animate-slide-up text-right">
        <p className="text-base leading-relaxed mb-3">
          <span className="text-primary font-bold">הודעה מפרופסור דרור:</span>
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground italic">
          ״מדהים! פיצחתם את הקוד — <span className="text-primary font-bold">{SECRET_WORD}</span>! 
          המחקר שלי חזר לסדר. הוכחתם שאתם חוקרי טבע אמיתיים.
          עכשיו אתם יודעים למה ישראל היא מקום כל כך מיוחד לציפורים נודדות,
          ולמה חשוב לשמור עליהן. תודה רבה, שותפים למדע!״
        </p>
      </div>
      <button
        onClick={onRestart}
        className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-xl font-bold hover:opacity-90 transition-all hover:scale-105"
      >
        🔄 משימה חדשה
      </button>
    </div>
  </div>
);

export default SuccessScreen;
