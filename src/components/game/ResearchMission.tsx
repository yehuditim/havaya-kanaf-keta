import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playReveal } from "../SoundEffects";

interface KnowledgeCard {
  id: string;
  title: string;
  emoji: string;
  content: string;
  /** Hidden clue embedded in the card content */
  hiddenClue?: string;
}

interface ResearchMissionProps {
  /** Mission prompt */
  prompt: string;
  /** Cards to search through */
  cards: KnowledgeCard[];
  /** The ID of the card containing the answer */
  targetCardId: string;
  /** Question to answer after finding the card */
  question: string;
  /** Correct answer text (free-text input) */
  correctAnswer: string | string[]; // can accept multiple valid answers
  /** Called when mission complete */
  onComplete: () => void;
  /** Open the full Research Center */
  onOpenResearch?: () => void;
  className?: string;
}

/**
 * A mission that requires searching through knowledge cards to find information.
 * Players must read cards, find the relevant one, then answer a question.
 */
const ResearchMission = ({
  prompt,
  cards,
  targetCardId,
  question,
  correctAnswer,
  onComplete,
  onOpenResearch,
  className = "",
}: ResearchMissionProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [foundTarget, setFoundTarget] = useState(false);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);

  const handleCardClick = (id: string) => {
    playClick();
    setExpandedCard(expandedCard === id ? null : id);
    if (id === targetCardId && !foundTarget) {
      playReveal();
      setFoundTarget(true);
    }
  };

  const handleSubmit = () => {
    const clean = answer.trim();
    const answers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    if (answers.some(a => clean === a || clean.includes(a))) {
      playReveal();
      setSolved(true);
      onComplete();
    } else {
      setAttempts(a => a + 1);
    }
  };

  if (solved) {
    return (
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={`bg-primary/10 border border-primary/25 rounded-xl p-4 text-center ${className}`}>
        <span className="text-2xl block mb-1">✅</span>
        <p className="text-sm font-bold text-primary">משימת החקר הושלמה!</p>
      </motion.div>
    );
  }

  return (
    <div className={`rounded-xl border border-border/25 overflow-hidden ${className}`}>
      {/* Mission header */}
      <div className="bg-accent/8 p-3 border-b border-accent/15">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🔬</span>
          <span className="text-xs font-bold text-accent">משימת חקר</span>
        </div>
        <p className="text-[12px] text-foreground/80 text-right leading-[1.8]">{prompt}</p>
        {onOpenResearch && (
          <button
            onClick={() => { playClick(); onOpenResearch(); }}
            className="mt-2 text-[10px] text-accent/70 hover:text-accent transition-colors underline"
          >
            📚 פתחו את ארכיון המחקר המלא
          </button>
        )}
      </div>

      {/* Mini knowledge cards */}
      <div className="p-3 space-y-2 max-h-60 overflow-auto">
        {cards.map(card => (
          <div key={card.id}>
            <button
              onClick={() => handleCardClick(card.id)}
              className={`w-full text-right p-2.5 rounded-lg border transition-all text-xs ${
                expandedCard === card.id
                  ? "bg-accent/10 border-accent/25"
                  : card.id === targetCardId && foundTarget
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/15 border-border/15 hover:border-accent/20"
              }`}
            >
              <span className="font-bold">{card.emoji} {card.title}</span>
              {card.id === targetCardId && foundTarget && <span className="text-primary mr-1">🔑</span>}
            </button>
            <AnimatePresence>
              {expandedCard === card.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-2.5 bg-muted/10 rounded-b-lg border-x border-b border-border/10">
                    <p className="text-[11px] text-foreground/70 leading-[1.9]">{card.content}</p>
                    {card.hiddenClue && foundTarget && card.id === targetCardId && (
                      <p className="text-[10px] text-primary mt-1 font-bold">🔑 {card.hiddenClue}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Answer input — only shown after finding target card */}
      {foundTarget && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 border-t border-border/15 bg-muted/10">
          <p className="text-xs font-bold text-right mb-2">{question}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="הקלידו את התשובה..."
              className="flex-1 bg-muted/30 border border-border/25 rounded-lg px-3 py-2 text-sm text-right placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50"
              dir="rtl"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            <button onClick={handleSubmit} className="bg-accent/15 text-accent px-4 py-2 rounded-lg font-bold hover:bg-accent/25 transition-colors border border-accent/20">
              ✓
            </button>
          </div>
          {attempts > 0 && (
            <p className="text-[10px] text-destructive/70 text-center mt-1">
              לא מדויק — קראו שוב את כרטיס המידע! {attempts >= 2 && "חפשו את המספר או השם המדויק"}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ResearchMission;
