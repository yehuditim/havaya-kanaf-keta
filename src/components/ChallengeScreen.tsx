import { useState } from "react";

const questions = [
  {
    question: "באיזה עונה ציפורים רבות נודדות דרך ישראל מאפריקה לאירופה?",
    options: ["קיץ", "אביב", "חורף", "סתיו"],
    correct: 1,
    hint: "🌸 נכון! באביב ציפורים רבות עוברות דרך ישראל בדרכן צפונה.",
  },
  {
    question: "איזו ציפור נודדת ידועה בצבעה השחור-לבן ובמקורה האדום הארוך?",
    options: ["עגור אפור", "חסידה לבנה", "דרור", "נשר"],
    correct: 1,
    hint: "🦩 מצוין! החסידה הלבנה היא מהציפורים הנודדות המפורסמות ביותר.",
  },
  {
    question: "מדוע ישראל נחשבת למקום חשוב בנדידת ציפורים?",
    options: [
      "כי יש בה הרבה אוכל",
      "כי היא נמצאת על צומת דרכים בין יבשות",
      "כי בה חם תמיד",
      "כי הציפורים אוהבות את הים",
    ],
    correct: 1,
    hint: "🗺️ בדיוק! ישראל נמצאת על נתיב הנדידה בין אפריקה, אסיה ואירופה.",
  },
];

const ChallengeScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const q = questions[current];

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === q.correct) {
      setShowHint(true);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowHint(false);
    } else {
      onComplete();
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setShowHint(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-card rounded-lg shadow-lg p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-muted-foreground">
            שאלה {current + 1} מתוך {questions.length}
          </span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < current ? "bg-primary" : i === current ? "bg-secondary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-right">{q.question}</h2>

        <div className="space-y-3 mb-6">
          {q.options.map((option, i) => {
            let style = "bg-muted hover:bg-accent hover:text-accent-foreground";
            if (selected !== null) {
              if (i === q.correct) style = "bg-primary text-primary-foreground";
              else if (i === selected) style = "bg-destructive text-destructive-foreground";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-right p-4 rounded-lg font-medium transition-colors ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showHint && (
          <div className="bg-muted p-4 rounded-lg mb-4 text-right text-foreground">
            {q.hint}
          </div>
        )}

        {selected !== null && selected !== q.correct && (
          <div className="text-center">
            <p className="text-destructive mb-3 font-medium">לא מדויק, נסו שוב! 💪</p>
            <button
              onClick={handleRetry}
              className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              🔄 נסו שוב
            </button>
          </div>
        )}

        {showHint && (
          <div className="text-center">
            <button
              onClick={handleNext}
              className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg text-lg font-bold hover:opacity-90 transition-opacity"
            >
              {current < questions.length - 1 ? "➡️ לשאלה הבאה" : "🏆 סיימנו!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeScreen;
