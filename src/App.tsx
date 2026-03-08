import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HomeScreen from "./components/HomeScreen";
import InstructionsScreen from "./components/InstructionsScreen";
import SuccessScreen from "./components/SuccessScreen";
import SFXToggle, { SFXProvider, useSFX } from "./components/MusicPlayer";
import { setSFXMuted } from "./components/SoundEffects";
import ResearchCenter from "./components/ResearchCenter";
import GameHub from "./components/game/GameHub";
import Station1Eilat from "./components/game/Station1Eilat";
import Station2Hula from "./components/game/Station2Hula";
import Station3Dangers from "./components/game/Station3Dangers";
import Station4Lab from "./components/game/Station4Lab";
import FinalPuzzle from "./components/game/FinalPuzzle";
import { useGameState } from "./components/game/useGameState";
import { useState } from "react";

const pageVariants = {
  initial: { opacity: 0, scale: 0.97, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -12 },
};
const pageTransition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

const overlayVariants = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const drawerVariants = { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };

/** Syncs SFX context mute state to the SoundEffects module */
const SFXSync = () => {
  const { muted } = useSFX();
  useEffect(() => { setSFXMuted(muted); }, [muted]);
  return null;
};

const App = () => {
  const game = useGameState();
  const [showResearch, setShowResearch] = useState(false);

  const handleStationComplete = useCallback((stationIndex: number, letter: string) => {
    game.completeStation(stationIndex, letter);
    game.setScreen("hub");
  }, [game]);

  const screenKey = typeof game.screen === "number" ? `station-${game.screen}` : game.screen;

  const stationComponents = [
    (props: { onComplete: (l: string) => void; onOpenResearch: () => void }) => <Station1Eilat {...props} />,
    (props: { onComplete: (l: string) => void; onOpenResearch: () => void }) => <Station2Hula {...props} />,
    (props: { onComplete: (l: string) => void; onOpenResearch: () => void }) => <Station3Dangers {...props} />,
    (props: { onComplete: (l: string) => void; onOpenResearch: () => void }) => <Station4Lab {...props} />,
  ];

  return (
    <SFXProvider>
      <SFXSync />
      <div className="min-h-screen relative overflow-hidden">
        <SFXToggle />

        {/* Research Center overlay */}
        <AnimatePresence>
          {showResearch && (
            <>
              <motion.div key="ro" variants={overlayVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowResearch(false)} />
              <motion.div key="rd" variants={drawerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }} className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl">
                <ResearchCenter onClose={() => setShowResearch(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page transitions */}
        <AnimatePresence mode="wait">
          <motion.div key={screenKey} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="min-h-screen">
            {game.screen === "home" && (
              <HomeScreen onStart={() => game.setScreen("instructions")} onOpenResearch={() => setShowResearch(true)} />
            )}
            {game.screen === "instructions" && (
              <InstructionsScreen onContinue={() => game.setScreen("hub")} />
            )}
            {game.screen === "hub" && (
              <GameHub
                completedStations={game.completedStations}
                inventory={game.inventory}
                collectedLetters={game.collectedLetters}
                isStationUnlocked={game.isStationUnlocked}
                canAccessFinal={game.canAccessFinal}
                onEnterStation={(i) => game.setScreen(i)}
                onEnterFinal={() => game.setScreen("final")}
                onOpenResearch={() => setShowResearch(true)}
              />
            )}
            {typeof game.screen === "number" && stationComponents[game.screen] && (
              stationComponents[game.screen]({
                onComplete: (letter) => handleStationComplete(game.screen as number, letter),
                onOpenResearch: () => setShowResearch(true),
              })
            )}
            {game.screen === "final" && (
              <FinalPuzzle
                inventory={game.inventory}
                collectedLetters={game.collectedLetters}
                onSuccess={() => game.setScreen("success")}
              />
            )}
            {game.screen === "success" && (
              <SuccessScreen collected={game.collectedLetters} onRestart={game.restart} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </SFXProvider>
  );
};

export default App;
