import { motion } from "framer-motion";
import Inventory from "./Inventory";
import type { InventoryItem } from "./useGameState";
import { playClick, playError } from "../SoundEffects";
import GameNav from "./GameNav";

interface Props {
  completedStations: Set<number>;
  inventory: InventoryItem[];
  collectedLetters: { [key: number]: string };
  isStationUnlocked: (i: number) => boolean;
  canAccessFinal: boolean;
  onEnterStation: (i: number) => void;
  onEnterFinal: () => void;
  onOpenResearch: () => void;
  onGoHome: () => void;
}

const stationNodes = [
  { emoji: "🏜️", title: "שער אילת", subtitle: "הכניסה הדרומית", x: "20%", y: "70%", color: "station-3" },
  { emoji: "🌿", title: "אגמון החולה", subtitle: "תחנת התצפית", x: "78%", y: "20%", color: "station-1" },
  { emoji: "⚡", title: "שביל הסכנות", subtitle: "חקירת איומים", x: "20%", y: "24%", color: "station-2" },
  { emoji: "🧭", title: "מעבדת הניווט", subtitle: "טכנולוגיה ומדע", x: "78%", y: "64%", color: "station-4" },
  { emoji: "🏷️", title: "מרכז הטיבוע", subtitle: "מעקב ומדידה", x: "50%", y: "74%", color: "station-5" },
];

const pathSegments = [
  { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 0 },
];

const GameHub = ({
  completedStations, inventory, collectedLetters,
  isStationUnlocked, canAccessFinal,
  onEnterStation, onEnterFinal, onOpenResearch, onGoHome,
}: Props) => {

  const handleStationClick = (i: number) => {
    if (isStationUnlocked(i)) {
      playClick();
      onEnterStation(i);
    } else {
      playError();
    }
  };

  return (
    <div className="min-h-screen bg-adventure stars-bg p-4 flex flex-col">
      {/* Top bar */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GameNav onHome={onGoHome} backLabel="בית" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black text-primary">🗺️ מפת המשימה</h1>
              <p className="text-sm text-muted-foreground">בחרו תחנה כדי להתחיל חקירה</p>
            </div>
            <button
              onClick={() => { playClick(); onOpenResearch(); }}
              className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-2 border border-accent/20 hover:border-accent/40 transition-all hover:scale-105"
            >
              <span className="text-base">📚</span>
              <span className="text-sm font-bold text-accent">ארכיון</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full gap-3">
        {/* Map area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 glass-card rounded-2xl relative min-h-[460px] border border-border/30"
          style={{ paddingBottom: "2.5rem" }}
        >
          {/* Map background decoration */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-[15%] left-[40%] text-8xl">🌍</div>
            <div className="absolute bottom-[10%] right-[10%] text-6xl">🗺️</div>
          </div>

          {/* Dotted path connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {pathSegments.map(({ from, to }, idx) => {
              const f = stationNodes[from];
              const t = stationNodes[to];
              const completed = completedStations.has(from);
              return (
                <line
                  key={idx}
                  x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                  stroke={completed ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  strokeWidth="2"
                  strokeDasharray={completed ? "none" : "6 4"}
                  opacity={completed ? 0.5 : 0.2}
                  className="transition-all duration-700"
                />
              );
            })}
          </svg>

          {/* Station nodes */}
          {stationNodes.map((node, i) => {
            const unlocked = isStationUnlocked(i);
            const completed = completedStations.has(i);
            return (
              <motion.button
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 200 }}
                onClick={() => handleStationClick(i)}
                className="absolute z-10 flex flex-col items-center gap-1 group"
                style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all duration-300 shadow-lg ${
                  completed
                    ? `bg-${node.color}/20 border-${node.color} shadow-${node.color}/20`
                    : unlocked
                      ? `bg-muted/60 border-${node.color}/50 hover:border-${node.color} hover:scale-110 cursor-pointer animate-pulse-glow shadow-${node.color}/10`
                      : "bg-muted/30 border-border/30 opacity-40 cursor-not-allowed"
                }`}>
                  {completed ? "✅" : unlocked ? node.emoji : "🔒"}
                </div>
                <div className={`text-center transition-opacity ${unlocked ? "opacity-100" : "opacity-40"}`}>
                  <p className={`text-sm font-black ${completed ? `text-${node.color}` : "text-foreground/80"}`}>
                    {node.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{node.subtitle}</p>
                </div>
                {completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-${node.color} flex items-center justify-center text-xs text-background font-black shadow-md`}
                  >
                    {collectedLetters[i]}
                  </motion.div>
                )}
              </motion.button>
            );
          })}

          {/* Final puzzle node */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: canAccessFinal ? 1 : 0.6 }}
            transition={{ delay: 0.6, type: "spring" }}
            onClick={() => {
              if (canAccessFinal) { playClick(); onEnterFinal(); } else { playError(); }
            }}
            className="absolute z-10 flex flex-col items-center gap-1"
            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          >
            <div className={`w-18 h-18 rounded-full flex items-center justify-center text-3xl border-2 transition-all duration-500 ${
              canAccessFinal
                ? "bg-primary/20 border-primary shadow-xl shadow-primary/30 animate-pulse-glow cursor-pointer hover:scale-110"
                : "bg-muted/20 border-border/30 opacity-30 cursor-not-allowed"
            }`}>
              {canAccessFinal ? "🔐" : "🔒"}
            </div>
            <p className={`text-sm font-black ${canAccessFinal ? "text-primary" : "text-muted-foreground/40"}`}>
              {canAccessFinal ? "פצחו את הקוד!" : "השלימו הכל"}
            </p>
          </motion.button>
        </motion.div>

        {/* Bottom: Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Inventory items={inventory} collectedLetters={collectedLetters} />
        </motion.div>
      </div>
    </div>
  );
};

export default GameHub;
