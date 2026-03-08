import { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import InstructionsScreen from "./components/InstructionsScreen";
import ChallengeStation from "./components/ChallengeStation";
import SuccessScreen from "./components/SuccessScreen";
import { stations } from "./components/stationsData";

type Screen = "home" | "instructions" | "success" | number;

const App = () => {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="min-h-screen">
      {screen === "home" && <HomeScreen onStart={() => setScreen("instructions")} />}
      {screen === "instructions" && <InstructionsScreen onContinue={() => setScreen(0)} />}
      {typeof screen === "number" && (
        <ChallengeStation
          key={screen}
          stationNumber={screen + 1}
          totalStations={stations.length}
          title={stations[screen].title}
          emoji={stations[screen].emoji}
          questions={stations[screen].questions}
          onComplete={() =>
            screen < stations.length - 1 ? setScreen(screen + 1) : setScreen("success")
          }
        />
      )}
      {screen === "success" && <SuccessScreen onRestart={() => setScreen("home")} />}
    </div>
  );
};

export default App;
