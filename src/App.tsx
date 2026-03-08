import { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import InstructionsScreen from "./components/InstructionsScreen";
import ChallengeStation from "./components/ChallengeStation";
import SuccessScreen from "./components/SuccessScreen";
import MusicPlayer from "./components/MusicPlayer";
import { stations } from "./components/stationsData";

type Screen = "home" | "instructions" | "success" | number;

const App = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [collected, setCollected] = useState<{ [key: number]: string }>({});

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
    <div className="min-h-screen">
      <MusicPlayer />
      {screen === "home" && <HomeScreen onStart={() => setScreen("instructions")} />}
      {screen === "instructions" && <InstructionsScreen onContinue={() => setScreen(0)} />}
      {typeof screen === "number" && (
        <ChallengeStation
          key={screen}
          station={stations[screen]}
          stationIndex={screen}
          totalStations={stations.length}
          collected={collected}
          onComplete={(letter) => handleStationComplete(screen, letter)}
        />
      )}
      {screen === "success" && <SuccessScreen collected={collected} onRestart={handleRestart} />}
    </div>
  );
};

export default App;
