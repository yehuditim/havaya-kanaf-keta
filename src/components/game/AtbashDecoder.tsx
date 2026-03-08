import { useState } from "react";
import { motion } from "framer-motion";
import { playClick, playSuccess, playError } from "../SoundEffects";

interface AtbashDecoderProps {
  /** The encoded message to display */
  encodedMessage: string;
  /** The correct decoded answer */
  correctAnswer: string;
  /** Explanation shown after solving */
  explanation?: string;
  /** Called when decoded */
  onDecode: () => void;
  className?: string;
}

/** Hebrew Atbash: א↔ת, ב↔ש, ג↔ר, etc. */
const ALEPH_BET = "אבגדהוזחטיכלמנסעפצקרשת";
const atbashEncode = (ch: string): string => {
  const idx = ALEPH_BET.indexOf(ch);
  if (idx === -1) return ch; // space, punctuation
  return ALEPH_BET[ALEPH_BET.length - 1 - idx];
};

export const encodeAtbash = (text: string): string =>
  text.split("").map(atbashEncode).join("");

/**
 * Atbash cipher decoder UI.
 * Shows the encoded message and an Atbash reference table.
 * Player types the decoded answer.
 */
const AtbashDecoder = ({
  encodedMessage,
  correctAnswer,
  explanation,
  onDecode,
  className = "",
}: AtbashDecoderProps) => {
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [decoded, setDecoded] = useState(false);

  const handleSubmit = () => {
    const clean = input.trim();
    if (clean === correctAnswer) {
      playSuccess();
      setDecoded(true);
      onDecode();
    } else {
      playError();
      setAttempts(a => a + 1);
      if (attempts >= 1) setShowTable(true);
    }
  };

  if (decoded) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`bg-primary/10 border border-primary/25 rounded-xl p-4 text-center ${className}`}>
        <p className="text-sm font-bold text-primary mb-1">🔓 פוענח: ״{correctAnswer}״</p>
        {explanation && <p className="text-xs text-foreground/70 leading-[1.8]">{explanation}</p>}
      </motion.div>
    );
  }

  return (
    <div className={`bg-muted/20 border border-border/25 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔐</span>
        <p className="text-xs font-bold">צופן אתב״ש</p>
      </div>

      {/* Encoded message */}
      <div className="bg-background/50 rounded-lg p-3 border border-accent/20 text-center mb-3">
        <p className="text-[10px] text-muted-foreground mb-1">ההודעה המוצפנת:</p>
        <p className="text-xl font-black tracking-[0.2em] text-accent" dir="rtl">{encodedMessage}</p>
      </div>

      {/* Atbash explanation */}
      <div className="bg-accent/5 rounded-lg p-2.5 border border-accent/15 text-right mb-3">
        <p className="text-[10px] text-accent/80">
          🔑 <strong>צופן אתב״ש:</strong> א↔ת, ב↔ש, ג↔ר, ד↔ק... כל אות מוחלפת ב״מראה״ שלה באל״ף-בי״ת
        </p>
        <button
          onClick={() => { playClick(); setShowTable(!showTable); }}
          className="text-[9px] text-accent/60 hover:text-accent mt-1 underline"
        >
          {showTable ? "הסתר טבלה" : "הצג טבלת המרה מלאה"}
        </button>
      </div>

      {/* Full conversion table */}
      {showTable && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mb-3 overflow-hidden">
          <div className="bg-muted/15 rounded-lg p-2 border border-border/15">
            <div className="grid grid-cols-11 gap-0.5 text-center text-[9px]">
              {ALEPH_BET.split("").map((ch, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-bold text-foreground/80">{ch}</span>
                  <span className="text-[8px] text-muted-foreground/40">↕</span>
                  <span className="font-bold text-accent">{ALEPH_BET[ALEPH_BET.length - 1 - i]}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="הקלידו את ההודעה המפוענחת..."
          className="flex-1 bg-muted/30 border border-border/25 rounded-lg px-3 py-2.5 text-sm text-right placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50"
          dir="rtl"
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
        <button onClick={handleSubmit} className="bg-accent/15 text-accent px-4 py-2.5 rounded-lg font-bold hover:bg-accent/25 transition-colors border border-accent/20">
          ✓
        </button>
      </div>

      {attempts > 0 && !decoded && (
        <p className="text-[10px] text-destructive/70 text-center mt-2">
          לא מדויק — נסו שוב! {attempts >= 2 && "פתחו את טבלת ההמרה למעלה"}
        </p>
      )}
    </div>
  );
};

export default AtbashDecoder;
