import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface CorrectEffectProps {
  show: boolean;
  onDone?: () => void;
}

const particles = [
  { emoji: "⭐", x: -40, y: -60, delay: 0 },
  { emoji: "✨", x: 50, y: -50, delay: 0.05 },
  { emoji: "🎉", x: -30, y: -80, delay: 0.1 },
  { emoji: "💫", x: 60, y: -70, delay: 0.08 },
  { emoji: "🌟", x: -50, y: -40, delay: 0.12 },
  { emoji: "✨", x: 40, y: -90, delay: 0.06 },
];

/** Celebratory particle burst + green flash overlay on correct answers */
const CorrectEffect = ({ show, onDone }: CorrectEffectProps) => {
  useEffect(() => {
    if (show && onDone) {
      const t = setTimeout(onDone, 1200);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Green flash overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[60] pointer-events-none bg-secondary"
          />

          {/* Particle burst from center */}
          <div className="fixed inset-0 z-[61] pointer-events-none flex items-center justify-center">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: [0, p.x * 0.5, p.x],
                  y: [0, p.y * 0.5, p.y],
                  scale: [0, 1.3, 0.8],
                }}
                transition={{
                  duration: 0.8,
                  delay: p.delay,
                  ease: "easeOut",
                }}
                className="absolute text-2xl"
              >
                {p.emoji}
              </motion.div>
            ))}

            {/* Central checkmark burst */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.7 }}
              className="absolute w-20 h-20 rounded-full bg-secondary/30 border-2 border-secondary flex items-center justify-center text-4xl shadow-xl shadow-secondary/30"
            >
              ✓
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CorrectEffect;
