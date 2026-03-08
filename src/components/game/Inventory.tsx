import type { InventoryItem } from "./useGameState";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  items: InventoryItem[];
  collectedLetters: { [key: number]: string };
}

const Inventory = ({ items, collectedLetters }: Props) => (
  <div className="glass-card rounded-2xl p-4 border border-primary/15">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base">🎒</span>
      <h3 className="text-xs font-black text-primary">תיק המשימה</h3>
      <span className="text-[10px] text-muted-foreground mr-auto">{items.length}/4 פריטים</span>
    </div>

    {/* Collected items */}
    <div className="grid grid-cols-4 gap-2 mb-3">
      {[0, 1, 2, 3].map(i => {
        const item = items.find(it => it.stationIndex === i);
        return (
          <AnimatePresence key={i}>
            {item ? (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="aspect-square rounded-xl bg-primary/10 border border-primary/25 flex flex-col items-center justify-center gap-1 p-1 shadow-sm shadow-primary/10"
                title={item.description}
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-[8px] font-bold text-primary/70 truncate w-full text-center">{item.name}</span>
              </motion.div>
            ) : (
              <div className="aspect-square rounded-xl bg-muted/20 border border-border/20 flex items-center justify-center">
                <span className="text-muted-foreground/20 text-lg">?</span>
              </div>
            )}
          </AnimatePresence>
        );
      })}
    </div>

    {/* Code letters */}
    <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/15">
      <span className="text-[10px] text-muted-foreground">🔐</span>
      <div className="flex gap-1.5" style={{ direction: "ltr" }}>
        {["נ", "ד", "י", "ד"].map((_, i) => {
          const letter = collectedLetters[i];
          return (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border-2 transition-all duration-500 ${
                letter
                  ? "border-primary bg-primary/20 text-primary shadow-sm shadow-primary/20"
                  : "border-border/30 bg-muted/20 text-muted-foreground/20"
              }`}
            >
              {letter || "?"}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default Inventory;
