import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HomeScreen from "./components/HomeScreen";
import InstructionsScreen from "./components/InstructionsScreen";
import ChallengeStation from "./components/ChallengeStation";
import SuccessScreen from "./components/SuccessScreen";
import MusicPlayer from "./components/MusicPlayer";
import ResearchCenter from "./components/ResearchCenter";
import { stations } from "./components/stationsData";

type Screen = "home" | "instructions" | "success" | number;

const pageVariants = {
  initial: { opacity: 0, scale: 0.97, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -12 },
};

const pageTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
};

const screenKey = (screen: Screen) =>
  typeof screen === "number" ? `station-${screen}` : screen;

const App = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [collected, setCollected] = useState<{ [key: number]: string }>({});
  const [showResearch, setShowResearch] = useState(false);

  const handleStationComplete = (stationIndex: number, codeLetter: string) => {
    const next = { ...collected, [stationIndex]: codeLetter };
    setCollected(next);
    if (stationIndex < stations.length - 1) {
      setScreen(stationIndex + 1);
    } else {
      setScreen("success");
    }
  };

  const handleRestart = () => {
    setCollected({});
    setScreen("home");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MusicPlayer />

      {/* Research Center overlay */}
      <AnimatePresence>
        {showResearch && (
          <>
            <motion.div
              key="research-overlay"
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowResearch(false)}
            />
            <motion.div
              key="research-drawer"
              variants={drawerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl"
            >
              <ResearchCenter onClose={() => setShowResearch(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={screenKey(screen)}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="min-h-screen"
        >
          {screen === "home" && (
            <HomeScreen
              onStart={() => setScreen("instructions")}
              onOpenResearch={() => setShowResearch(true)}
            />
          )}
          {screen === "instructions" && <InstructionsScreen onContinue={() => setScreen(0)} />}
          {typeof screen === "number" && (
            <ChallengeStation
              station={stations[screen]}
              stationIndex={screen}
              totalStations={stations.length}
              collected={collected}
              onComplete={(letter) => handleStationComplete(screen, letter)}
              onOpenResearch={() => setShowResearch(true)}
            />
          )}
          {screen === "success" && <SuccessScreen collected={collected} onRestart={handleRestart} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;
